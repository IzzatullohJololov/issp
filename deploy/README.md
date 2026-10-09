# Развёртывание на VPS (Ubuntu 22.04 / 24.04, Debian 12)

Требования: чистый сервер с root-доступом по SSH, минимум 1 ГБ ОЗУ (2 ГБ для сборки
фронтенда комфортнее), домен, A-запись которого указывает на IP сервера.

## 1. Первичная установка (один раз)

Подключитесь к серверу по SSH и выполните:

```bash
curl -fsSL https://raw.githubusercontent.com/IzzatullohJololov/issp/main/deploy/setup-server.sh -o setup-server.sh
sudo bash setup-server.sh ваш-домен.ru admin@ваш-домен.ru
```

Скрипт установит Nginx, PHP 8.4, MariaDB, Composer, Node.js 22, склонирует репозиторий
в `/var/www/issp`, создаст базу данных, соберёт фронтенд, применит миграции с демо-данными,
настроит HTTPS через Let's Encrypt, очередь (`systemd`) и планировщик (`cron`).

В конце скрипт выведет пароль базы данных и адрес панели управления.
Переменные можно переопределить перед запуском:

```bash
BRANCH=feature/issp-site-rebuild APP_DIR=/var/www/issp sudo -E bash setup-server.sh домен email
```

## 2. После установки

1. Войдите в панель `https://домен/admin` (`admin@issp.local` / `password`) и смените пароль в разделе «Профиль».
2. В «Настройках» укажите реальные контакты, телефон, e-mail, карту и получателей формы обратной связи.
3. В `/var/www/issp/.env` заполните `MAIL_*` (SMTP), затем `php artisan config:cache`.
4. Замените демо-сотрудников, новости и публикации через панель.

## 3. Обновление сайта

После каждого изменения в репозитории:

```bash
cd /var/www/issp && sudo bash deploy/deploy.sh
```

Скрипт включает режим обслуживания, забирает код из git, ставит зависимости,
собирает фронтенд, применяет миграции, обновляет кеши и перезапускает очередь.

## 4. Полезные команды

| Задача | Команда |
|---|---|
| Логи приложения | `tail -f /var/www/issp/storage/logs/laravel-$(date +%F).log` |
| Логи Nginx | `tail -f /var/log/nginx/issp.error.log` |
| Статус очереди | `systemctl status issp-queue` |
| Перевыпуск сертификата | `certbot renew` (автоматически по таймеру) |
| Резервная копия БД | `mysqldump issp \| gzip > /root/issp-$(date +%F).sql.gz` |
| Файлы пользователей | `/var/www/issp/storage/app/public` (бэкапьте вместе с БД) |

## 5. Бэкапы

Минимум раз в сутки сохраняйте дамп базы и папку `storage/app/public`. Пример cron
(`sudo crontab -e`):

```
30 3 * * * mysqldump issp | gzip > /root/backups/issp-$(date +\%F).sql.gz && tar -czf /root/backups/issp-files-$(date +\%F).tar.gz -C /var/www/issp/storage/app public
```
