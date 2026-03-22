FROM php:8.2-cli

# System deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    git unzip libpq-dev libzip-dev libpng-dev libonig-dev libxml2-dev \
    curl ca-certificates gnupg \
  && docker-php-ext-install pdo pdo_pgsql mbstring zip \
  && rm -rf /var/lib/apt/lists/*

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Node (for Vite build)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
  && apt-get update && apt-get install -y --no-install-recommends nodejs \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /var/www/html

# Copy source
COPY . .

# Install deps + build assets
RUN composer install --no-dev --optimize-autoloader \
  && npm ci \
  && npm run build

EXPOSE 10000

# Start: cache config using runtime env vars, then migrate, then serve
CMD php artisan config:clear \
  && php artisan route:clear \
  && php artisan view:clear \
  && php artisan config:cache \
  && php artisan route:cache \
  && php artisan view:cache \
  && php artisan migrate --force \
  && php artisan serve --host=0.0.0.0 --port=${PORT:-10000}
