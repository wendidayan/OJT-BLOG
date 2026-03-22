FROM php:8.2-cli

# Install system deps
RUN apt-get update && apt-get install -y \
    git unzip libpq-dev libzip-dev curl ca-certificates gnupg \
  && docker-php-ext-install pdo pdo_pgsql mbstring zip \
  && rm -rf /var/lib/apt/lists/*

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Install Node
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
  && apt-get update && apt-get install -y nodejs \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /var/www/html

# Copy source
COPY . .

# Install PHP deps and build assets
RUN composer install --no-dev --optimize-autoloader \
  && npm ci \
  && npm run build

# Create storage link and set permissions
RUN php artisan storage:link \
  && chown -R www-data:www-data storage bootstrap/cache \
  && chmod -R 775 storage bootstrap/cache

# Generate APP_KEY
RUN php artisan key:generate --force

EXPOSE 10000

# Start Laravel
CMD php artisan serve --host=0.0.0.0 --port=${PORT:-10000}
