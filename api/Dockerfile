FROM alpine:3.20

# Install Nginx, PHP 8.3 + ekstensi, dan utilitas tambahan
RUN apk --no-cache --update add \
   apache2-utils \
   bash \
   curl \
   file \
   nano \
   nginx \
   php83 \
   php83-ctype \
   php83-curl \
   php83-dom \
   php83-fileinfo \
   php83-fpm \
   php83-iconv \
   php83-intl \
   php83-mbstring \
   php83-opcache \
   php83-openssl \
   php83-pdo_pgsql \
   php83-pecl-redis \
   php83-pgsql \
   php83-phar \
   php83-session \
   php83-tokenizer \
   postgresql-client \
   tzdata

# Set timezone
ENV TZ=Asia/Jakarta

# Direktori kerja default
WORKDIR /var/www/html

# Link binary php agar bisa dipanggil langsung
RUN rm -f /usr/bin/php && ln -s /usr/bin/php83 /usr/bin/php

# Salin konfigurasi Nginx
COPY ./nginx.conf /etc/nginx/http.d/default.conf

# Salin konfigurasi PHP-FPM tambahan (opsional tuning)
COPY ./php-fpm.conf /etc/php83/php-fpm.conf
COPY ./opcache.ini /etc/php83/conf.d/opcache.ini

# Salin entrypoint
COPY ./entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 80

ENTRYPOINT ["sh", "/usr/local/bin/entrypoint.sh"]