#!/usr/bin/env bash
#
# Первичная настройка чистого сервера Ubuntu 22.04/24.04 (или Debian 12)
# под сайт ИФТТ РАН: Nginx, PHP 8.4-FPM, MariaDB, Composer, Node.js 22,
# Certbot (HTTPS), systemd-сервис очереди и cron для планировщика.
#
# Использование (от root):
#   curl -fsSL https://raw.githubusercontent.com/IzzatullohJololov/issp/main/deploy/setup-server.sh -o setup-server.sh
#   bash setup-server.sh issp.example.ru admin@example.ru
#
set -euo pipefail

DOMAIN="${1:-}"
EMAIL="${2:-}"
REPO="${REPO:-https://github.com/IzzatullohJololov/issp.git}"
BRANCH="${BRANCH:-main}"
APP_DIR="${APP_DIR:-/var/www/issp}"
PHP_VERSION="${PHP_VERSION:-8.4}"
DB_NAME="${DB_NAME:-issp}"
DB_USER="${DB_USER:-issp}"
DB_PASS="${DB_PASS:-$(tr -dc 'A-Za-z0-9' </dev/urandom | head -c 24)}"

if [[ -z "$DOMAIN" || -z "$EMAIL" ]]; then
    echo "Использование: bash setup-server.sh <домен> <email для Let's Encrypt>"
    exit 1
fi

if [[ $EUID -ne 0 ]]; then
    echo "Запустите скрипт от root (sudo bash setup-server.sh ...)."
    exit 1
fi

export DEBIAN_FRONTEND=noninteractive

echo "==> Обновление системы"
apt-get update -y
apt-get upgrade -y
apt-get install -y curl git unzip ca-certificates gnupg lsb-release software-properties-common ufw

echo "==> PHP ${PHP_VERSION}"
if [[ "$(lsb_release -is)" == "Ubuntu" ]]; then
    add-apt-repository -y ppa:ondrej/php
else
    curl -fsSL https://packages.sury.org/php/apt.gpg -o /etc/apt/trusted.gpg.d/php.gpg
    echo "deb https://packages.sury.org/php/ $(lsb_release -sc) main" >/etc/apt/sources.list.d/php.list
fi
apt-get update -y
apt-get install -y \
    php${PHP_VERSION}-fpm php${PHP_VERSION}-cli php${PHP_VERSION}-mysql php${PHP_VERSION}-sqlite3 \
    php${PHP_VERSION}-mbstring php${PHP_VERSION}-xml php${PHP_VERSION}-curl php${PHP_VERSION}-zip \
    php${PHP_VERSION}-gd php${PHP_VERSION}-intl php${PHP_VERSION}-bcmath php${PHP_VERSION}-opcache

# Лимиты загрузки файлов (медиатека принимает до 40 МБ)
PHP_INI="/etc/php/${PHP_VERSION}/fpm/php.ini"
sed -i 's/^upload_max_filesize.*/upload_max_filesize = 64M/' "$PHP_INI"
sed -i 's/^post_max_size.*/post_max_size = 64M/' "$PHP_INI"
sed -i 's/^memory_limit.*/memory_limit = 256M/' "$PHP_INI"
sed -i 's/^;opcache.enable=.*/opcache.enable=1/' "$PHP_INI"
systemctl enable --now php${PHP_VERSION}-fpm

echo "==> Composer"
if ! command -v composer >/dev/null; then
    curl -fsSL https://getcomposer.org/installer -o /tmp/composer-setup.php
    php /tmp/composer-setup.php --install-dir=/usr/local/bin --filename=composer
    rm -f /tmp/composer-setup.php
fi

echo "==> Node.js 22"
if ! command -v node >/dev/null || [[ "$(node -v | cut -d. -f1 | tr -d v)" -lt 22 ]]; then
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
    apt-get install -y nodejs
fi

echo "==> MariaDB"
apt-get install -y mariadb-server
systemctl enable --now mariadb
mysql -e "CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -e "CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASS}';"
mysql -e "ALTER USER '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASS}';"
mysql -e "GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'localhost'; FLUSH PRIVILEGES;"

echo "==> Nginx"
apt-get install -y nginx
systemctl enable --now nginx

echo "==> Код приложения"
if [[ ! -d "$APP_DIR/.git" ]]; then
    git clone --branch "$BRANCH" "$REPO" "$APP_DIR"
fi
cd "$APP_DIR"

if [[ ! -f .env ]]; then
    cp deploy/.env.production.example .env
    sed -i "s#^APP_URL=.*#APP_URL=https://${DOMAIN}#" .env
    sed -i "s#^DB_DATABASE=.*#DB_DATABASE=${DB_NAME}#" .env
    sed -i "s#^DB_USERNAME=.*#DB_USERNAME=${DB_USER}#" .env
    sed -i "s#^DB_PASSWORD=.*#DB_PASSWORD=${DB_PASS}#" .env
fi

composer install --no-dev --optimize-autoloader --no-interaction
php artisan key:generate --force
npm ci
npm run build
php artisan migrate --force
php artisan db:seed --force
php artisan storage:link
php artisan optimize

chown -R www-data:www-data "$APP_DIR"
find "$APP_DIR" -type d -exec chmod 755 {} \;
find "$APP_DIR" -type f -exec chmod 644 {} \;
chmod -R 775 "$APP_DIR/storage" "$APP_DIR/bootstrap/cache"

echo "==> Nginx: виртуальный хост"
sed -e "s#__DOMAIN__#${DOMAIN}#g" -e "s#__APP_DIR__#${APP_DIR}#g" -e "s#__PHP_VERSION__#${PHP_VERSION}#g" \
    deploy/nginx.conf >/etc/nginx/sites-available/issp.conf
ln -sf /etc/nginx/sites-available/issp.conf /etc/nginx/sites-enabled/issp.conf
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

echo "==> Очередь и планировщик"
sed -e "s#__APP_DIR__#${APP_DIR}#g" deploy/issp-queue.service >/etc/systemd/system/issp-queue.service
systemctl daemon-reload
systemctl enable --now issp-queue
( crontab -u www-data -l 2>/dev/null | grep -v 'artisan schedule:run' ; echo "* * * * * cd ${APP_DIR} && php artisan schedule:run >> /dev/null 2>&1" ) | crontab -u www-data -

echo "==> Firewall"
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

echo "==> HTTPS (Let's Encrypt)"
apt-get install -y certbot python3-certbot-nginx
certbot --nginx -d "$DOMAIN" -d "www.${DOMAIN}" --non-interactive --agree-tos -m "$EMAIL" --redirect || \
    certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m "$EMAIL" --redirect || \
    echo "!! Не удалось выпустить сертификат. Проверьте, что DNS домена указывает на этот сервер, и выполните: certbot --nginx -d ${DOMAIN}"

cat <<EOF

================================================================
Готово. Сайт: https://${DOMAIN}
Панель управления: https://${DOMAIN}/admin
  логин:  admin@issp.local
  пароль: password   (смените сразу после входа)

База данных: ${DB_NAME}, пользователь ${DB_USER}, пароль ${DB_PASS}
Параметры сохранены в ${APP_DIR}/.env

Обновление сайта после изменений в репозитории:
  cd ${APP_DIR} && bash deploy/deploy.sh
================================================================
EOF
