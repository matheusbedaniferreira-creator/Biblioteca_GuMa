#!/bin/sh
set -eu
if [ ! -f vendor/autoload.php ]; then
  echo 'Instalando Laravel e dependencias PHP...'
  composer install --no-interaction --prefer-dist --no-progress
fi
if [ ! -f .env ]; then
  echo 'ERRO: copie backend/.env.example para backend/.env e configure o Supabase.' >&2
  exit 1
fi
if ! grep -q '^APP_KEY=base64:' .env; then
  php artisan key:generate --force --no-interaction
fi
mkdir -p storage/logs storage/framework/cache/data storage/framework/sessions storage/framework/views
exec php artisan serve --host=0.0.0.0 --port=8000
