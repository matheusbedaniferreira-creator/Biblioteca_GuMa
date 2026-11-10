FROM php:8.3-cli-bookworm
RUN apt-get update \
 && apt-get install -y --no-install-recommends git unzip libpq-dev libzip-dev libicu-dev libonig-dev libcurl4-openssl-dev \
 && docker-php-ext-install pdo_pgsql zip intl mbstring bcmath curl \
 && rm -rf /var/lib/apt/lists/*
COPY --from=composer:2 /usr/bin/composer /usr/local/bin/composer
WORKDIR /app
EXPOSE 8000
