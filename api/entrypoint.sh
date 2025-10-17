#!/bin/sh

echo "🚀 Memulai container PHP 8.3 + Nginx..."

# Pastikan folder cache tersedia dan bisa ditulis
mkdir -p /var/www/html/writable/cache
chmod -R 775 /var/www/html/writable/cache
chown -R nobody:nobody /var/www/html/writable

# Jalankan Nginx di background
nginx -g 'daemon on;'

# Jalankan PHP-FPM di foreground agar container tetap hidup
exec php-fpm83 -F
echo "✅ Container PHP 8.3 + Nginx siap digunakan!"