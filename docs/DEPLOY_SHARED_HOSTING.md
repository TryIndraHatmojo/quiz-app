# Deploy ke Shared Hosting

Panduan lengkap untuk deploy aplikasi **Quiz App** (Laravel 12 + React/Inertia.js) ke shared hosting (cPanel/DirectAdmin).

---

## Persyaratan Hosting

| Kebutuhan     | Minimum                                         |
| ------------- | ----------------------------------------------- |
| PHP           | 8.2+                                            |
| MySQL/MariaDB | 5.7+ / 10.3+                                    |
| Disk Space    | ± 200 MB                                        |
| SSH Access    | Disarankan (opsional)                           |
| Composer      | Tersedia atau upload manual                     |
| Node.js       | **Tidak diperlukan di server** (build di lokal) |

### Ekstensi PHP yang Diperlukan

- `BCMath`, `Ctype`, `cURL`, `DOM`, `Fileinfo`, `JSON`, `Mbstring`, `OpenSSL`, `PCRE`, `PDO`, `PDO_MySQL`, `Tokenizer`, `XML`, `Zip`

---

## Langkah 1 — Persiapan di Lokal

### 1.1 Build Frontend (Wajib)

```bash
npm install
npm run build
```

Pastikan folder `public/build/` sudah terisi hasil build Vite.

### 1.2 Install Dependensi PHP (Production)

```bash
composer install --optimize-autoloader --no-dev
```

### 1.3 Bersihkan Cache Lama

```bash
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan cache:clear
```

---

## Langkah 2 — Siapkan File untuk Upload

### Struktur yang perlu di-upload:

```
quiz-app/
├── app/
├── bootstrap/
├── config/
├── database/
├── public/          ← isi folder ini nanti dipindah ke public_html
├── resources/
├── routes/
├── storage/
├── vendor/
├── artisan
├── composer.json
├── composer.lock
└── .env             ← dibuat di server
```

**JANGAN upload:**

- `node_modules/`
- `.git/`
- `tests/`
- `.env` (buat manual di server)

---

## Langkah 3 — Upload ke Hosting

### 3.1 Struktur Direktori di Hosting

Shared hosting biasanya memiliki struktur:

```
/home/username/
├── public_html/     ← document root (akses publik)
└── ...
```

Kita perlu memisahkan file publik dan file aplikasi:

```
/home/username/
├── public_html/     ← isi dari folder public/
├── quiz-app/        ← semua file aplikasi (di luar public_html)
│   ├── app/
│   ├── bootstrap/
│   ├── config/
│   ├── database/
│   ├── resources/
│   ├── routes/
│   ├── storage/
│   ├── vendor/
│   ├── artisan
│   └── .env
```

### 3.2 Upload File Aplikasi

1. **Compress** semua file project (kecuali `node_modules`, `.git`, `tests`) menjadi `.zip`
2. Upload ke `/home/username/` via **File Manager** atau **FTP**
3. **Extract** file zip di server
4. **Pindahkan** isi folder `public/` ke `public_html/`

### 3.3 Jika Menggunakan Subdomain/Subfolder

Jika aplikasi berjalan di subdomain, arahkan **Document Root** subdomain ke folder `public/` langsung di cPanel → **Subdomains**.

---

## Langkah 4 — Konfigurasi `index.php`

Edit file `public_html/index.php` agar mengarah ke lokasi aplikasi yang benar:

```php
<?php

use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Sesuaikan path ke folder aplikasi
$appPath = dirname(__DIR__) . '/quiz-app';

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = $appPath . '/storage/framework/maintenance.php')) {
    require $maintenance;
}

// Register the Composer autoloader...
require $appPath . '/vendor/autoload.php';

// Bootstrap Laravel and handle the request...
(require_once $appPath . '/bootstrap/app.php')
    ->handleRequest(Request::capture());
```

> **Catatan:** Sesuaikan `$appPath` dengan lokasi folder aplikasi Anda. Jika folder bernama berbeda, ubah `quiz-app` sesuai nama foldernya.

---

## Langkah 5 — Konfigurasi `.env`

Buat file `.env` di dalam folder aplikasi (`/home/username/quiz-app/.env`):

```env
APP_NAME="Quiz App"
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=https://namadomain.com

LOG_CHANNEL=single
LOG_LEVEL=error

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=nama_database
DB_USERNAME=user_database
DB_PASSWORD=password_database

SESSION_DRIVER=database
SESSION_LIFETIME=120

QUEUE_CONNECTION=database
CACHE_STORE=database
FILESYSTEM_DISK=local

MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=email@gmail.com
MAIL_PASSWORD=app_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=email@gmail.com
MAIL_FROM_NAME="${APP_NAME}"

VITE_APP_NAME="${APP_NAME}"
```

> **Penting:**
>
> - Ubah `APP_URL` sesuai domain
> - Ubah kredensial database sesuai yang dibuat di cPanel
> - Set `APP_DEBUG=false` untuk production
> - Konfigurasi MAIL sesuai layanan email yang digunakan

---

## Langkah 6 — Generate App Key

### Jika ada SSH Access:

```bash
cd ~/quiz-app
php artisan key:generate
```

### Jika tidak ada SSH:

1. Buka terminal di lokal, jalankan:
    ```bash
    php artisan key:generate --show
    ```
2. Copy hasilnya (format: `base64:xxxx...`)
3. Paste ke `.env` di server pada baris `APP_KEY=`

---

## Langkah 7 — Buat Database

1. Buka **cPanel → MySQL Databases**
2. Buat database baru (misal: `username_quiz_app`)
3. Buat user database baru
4. Assign user ke database dengan **ALL PRIVILEGES**
5. Update `.env` dengan kredensial database

---

## Langkah 8 — Migrasi Database

### Jika ada SSH Access:

```bash
cd ~/quiz-app
php artisan migrate --force
php artisan db:seed --force   # opsional, jika ada seeder
```

### Jika tidak ada SSH:

Buat file `migrate.php` sementara di `public_html/`:

```php
<?php
// HAPUS FILE INI SETELAH MIGRASI SELESAI!

$appPath = dirname(__DIR__) . '/quiz-app';
require $appPath . '/vendor/autoload.php';
$app = require_once $appPath . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->call('migrate', ['--force' => true]);
echo '<pre>' . $kernel->output() . '</pre>';

// Uncomment baris di bawah jika ingin menjalankan seeder
// $kernel->call('db:seed', ['--force' => true]);
// echo '<pre>' . $kernel->output() . '</pre>';
```

Akses `https://namadomain.com/migrate.php` di browser, lalu **HAPUS FILE INI** setelah selesai.

---

## Langkah 9 — Storage Link

### Jika ada SSH Access:

```bash
cd ~/quiz-app
php artisan storage:link
```

### Jika tidak ada SSH:

Buat symlink manual. Tambahkan file `storage-link.php` di `public_html/`:

```php
<?php
// HAPUS FILE INI SETELAH DIJALANKAN!

$target = dirname(__DIR__) . '/quiz-app/storage/app/public';
$link = __DIR__ . '/storage';

if (file_exists($link)) {
    echo 'Symlink sudah ada.';
} else {
    symlink($target, $link);
    echo 'Symlink berhasil dibuat.';
}
```

Akses di browser lalu **HAPUS FILE INI**.

> **Catatan:** Beberapa shared hosting tidak mendukung `symlink()`. Jika gagal, hubungi support hosting atau gunakan cara alternatif: salin file upload secara manual ke `public_html/storage/`.

---

## Langkah 10 — Permission & Cache

### Set Permission

```bash
chmod -R 775 storage/
chmod -R 775 bootstrap/cache/
```

Jika tidak ada SSH, set permission via **cPanel → File Manager** (klik kanan → Change Permissions).

### Optimize untuk Production

Jika ada SSH:

```bash
cd ~/quiz-app
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

---

## Langkah 11 — Konfigurasi Cron Job (Queue & Scheduler)

### Laravel Scheduler

Di cPanel → **Cron Jobs**, tambahkan:

```
* * * * * cd /home/username/quiz-app && php artisan schedule:run >> /dev/null 2>&1
```

### Queue Worker (Opsional)

Karena shared hosting tidak mendukung `queue:work` yang berjalan terus-menerus, gunakan salah satu opsi:

**Opsi A — Jalankan queue via scheduler:**

Tambahkan di `app/Console/Kernel.php` atau `routes/console.php`:

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('queue:work --stop-when-empty --tries=3')
    ->everyMinute()
    ->withoutOverlapping();
```

**Opsi B — Ubah ke sync driver:**

Di `.env`, ubah:

```env
QUEUE_CONNECTION=sync
```

Ini akan menjalankan semua job secara langsung (tanpa antrian). Cocok jika tidak ada proses berat di background.

---

## Langkah 12 — Konfigurasi .htaccess

File `.htaccess` biasanya sudah ada di folder `public/`. Pastikan tersalin ke `public_html/`. Isinya:

```apache
<IfModule mod_rewrite.c>
    <IfModule mod_negotiation.c>
        Options -MultiViews -Indexes
    </IfModule>

    RewriteEngine On

    # Handle Authorization Header
    RewriteCond %{HTTP:Authorization} .
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

    # Redirect Trailing Slashes If Not A Folder...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_URI} (.+)/$
    RewriteRule ^ %1 [L,R=301]

    # Send Requests To Front Controller...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>
```

### Force HTTPS (Tambahkan di atas):

```apache
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

---

## Troubleshooting

### 500 Internal Server Error

1. Cek `storage/logs/laravel.log` untuk detail error
2. Pastikan permission `storage/` dan `bootstrap/cache/` sudah `775`
3. Pastikan `.env` sudah benar dan `APP_KEY` sudah di-generate
4. Jalankan `php artisan config:clear` jika ada perubahan `.env`

### Halaman Blank / Tidak Muncul

1. Pastikan `public_html/index.php` sudah diedit dengan path yang benar
2. Pastikan folder `public/build/` (hasil Vite build) sudah ter-upload ke `public_html/build/`
3. Cek file `.htaccess` ada di `public_html/`

### CSS/JS Tidak Muncul

1. Pastikan `npm run build` sudah dijalankan di lokal sebelum upload
2. Pastikan folder `public_html/build/` berisi file hasil build
3. Cek `APP_URL` di `.env` sudah sesuai domain

### Upload File Gagal

1. Pastikan symlink `storage` sudah dibuat di `public_html/`
2. Cek permission folder `storage/app/public/` adalah `775`
3. Cek `php.ini` untuk `upload_max_filesize` dan `post_max_size`

### Error "Class Not Found"

```bash
composer dump-autoload --optimize
```

### Session / Login Tidak Berfungsi

1. Pastikan tabel `sessions` sudah ada di database (jalankan migrasi)
2. Cek `SESSION_DRIVER=database` di `.env`
3. Pastikan `APP_URL` sesuai dengan domain yang diakses

---

## Checklist Deploy

- [ ] `npm run build` berhasil di lokal
- [ ] `composer install --no-dev` berhasil di lokal
- [ ] File di-upload ke server (tanpa `node_modules`, `.git`, `tests`)
- [ ] Isi `public/` dipindah ke `public_html/`
- [ ] `public_html/index.php` diedit sesuai path aplikasi
- [ ] `.env` dibuat dengan konfigurasi production
- [ ] `APP_KEY` di-generate
- [ ] Database dibuat dan dikonfigurasi
- [ ] Migrasi database berhasil
- [ ] Storage link dibuat
- [ ] Permission `storage/` dan `bootstrap/cache/` = 775
- [ ] Cache di-optimize (`config:cache`, `route:cache`, `view:cache`)
- [ ] Cron job untuk scheduler ditambahkan
- [ ] HTTPS aktif
- [ ] `APP_DEBUG=false`
- [ ] Website bisa diakses dan berfungsi normal
