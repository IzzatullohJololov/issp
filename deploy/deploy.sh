#!/usr/bin/env bash
#
# Обновление уже развёрнутого сайта: забирает изменения из git,
# ставит зависимости, собирает фронтенд, применяет миграции и сбрасывает кеши.
#
#   cd /var/www/issp && bash deploy/deploy.sh [ветка]
#
set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BRANCH="${1:-$(git -C "$APP_DIR" rev-parse --abbrev-ref HEAD)}"

cd "$APP_DIR"

echo "==> git pull ($BRANCH)"
git fetch origin "$BRANCH"
git checkout "$BRANCH"
git reset --hard "origin/$BRANCH"

echo "==> Включаем режим обслуживания"
php artisan down --retry=30 || true

echo "==> Composer"
composer install --no-dev --optimize-autoloader --no-interaction

echo "==> Frontend"
npm ci
npm run build

echo "==> Миграции и кеши"
php artisan migrate --force
php artisan optimize:clear
php artisan optimize
php artisan storage:link >/dev/null 2>&1 || true

echo "==> Права"
chown -R www-data:www-data storage bootstrap/cache public/build
chmod -R 775 storage bootstrap/cache

echo "==> Перезапуск очереди"
systemctl restart issp-queue 2>/dev/null || true

php artisan up
echo "Готово: $(git rev-parse --short HEAD)"
