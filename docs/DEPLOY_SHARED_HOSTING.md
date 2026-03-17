# Deploy ke Shared Hosting

Panduan lengkap untuk deploy aplikasi **Quiz App** (Laravel 12 + React/Inertia.js) ke shared hosting (cPanel/DirectAdmin).

Pada panduan ini, **semua file project ditaruh langsung di dalam `public_html`** dan menggunakan `.htaccess` untuk mengarahkan request ke folder `public/`.

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
├── public/
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

Semua file project ditaruh langsung di dalam `public_html`:

```
/home/username/
└── public_html/            ← document root & root project
    ├── app/
    ├── bootstrap/
    ├── config/
    ├── database/
    ├── public/              ← folder public Laravel (entry point)
    │   ├── build/
    │   ├── index.php
    │   ├── .htaccess
    │   └── ...
    ├── resources/
    ├── routes/
    ├── storage/
    ├── vendor/
    ├── artisan
    ├── .env
    └── .htaccess            ← BARU: redirect semua request ke public/
```

### 3.2 Upload File Aplikasi

1. **Compress** semua file project (kecuali `node_modules`, `.git`, `tests`) menjadi `.zip`
2. Upload file zip ke `public_html/` via **File Manager** atau **FTP**
3. **Extract** file zip di dalam `public_html/`
4. Pastikan semua folder (`app/`, `bootstrap/`, `public/`, dst.) langsung berada di dalam `public_html/`, **bukan** di dalam subfolder tambahan

> **Tips:** Jika setelah extract file ada di `public_html/quiz-app/`, pindahkan semua isinya ke `public_html/` lalu hapus folder `quiz-app/` yang kosong.

---

## Langkah 4 — Konfigurasi `.htaccess` (Root)

Buat file `.htaccess` **di root `public_html/`** (bukan yang di dalam `public/`) untuk mengarahkan semua request ke folder `public/`:

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On

    # Redirect semua request ke folder public/
    RewriteRule ^(.*)$ public/$1 [L]
</IfModule>
```

File ini akan membuat seolah-olah document root adalah folder `public/`.

### Proteksi File Sensitif

Tambahkan juga proteksi agar file sensitif di luar `public/` tidak bisa diakses langsung. Buat atau edit file `.htaccess` di `public_html/` menjadi:

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On

    # Blokir akses langsung ke file/folder sensitif
    RewriteRule ^\.env - [F,L]
    RewriteRule ^artisan$ - [F,L]
    RewriteRule ^composer\.(json|lock)$ - [F,L]
    RewriteRule ^package(-lock)?\.json$ - [F,L]
    RewriteRule ^phpunit\.xml$ - [F,L]
    RewriteRule ^storage/ - [F,L]
    RewriteRule ^app/ - [F,L]
    RewriteRule ^bootstrap/ - [F,L]
    RewriteRule ^config/ - [F,L]
    RewriteRule ^database/ - [F,L]
    RewriteRule ^resources/ - [F,L]
    RewriteRule ^routes/ - [F,L]
    RewriteRule ^vendor/ - [F,L]

    # Redirect semua request lainnya ke folder public/
    RewriteRule ^(.*)$ public/$1 [L]
</IfModule>
```

> **Penting:** Tanpa proteksi ini, orang bisa mengakses `.env`, source code, dan file konfigurasi secara langsung lewat browser!

### `.htaccess` di dalam `public/`

File `.htaccess` di dalam folder `public/` **tidak perlu diubah**. Biarkan tetap default bawaan Laravel:

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

### Force HTTPS

Tambahkan di bagian atas `.htaccess` root (`public_html/.htaccess`), sebelum rule lainnya:

```apache
# Force HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

---

## Langkah 5 — Konfigurasi `index.php`

File `public/index.php` **tidak perlu diubah** karena semua file project sudah berada di posisi yang benar relatif terhadap folder `public/`. Path default `__DIR__.'/../'` sudah otomatis mengarah ke `public_html/` (root project).

---

## Langkah 6 — Konfigurasi `.env`

Buat file `.env` di root project (`/home/username/public_html/.env`):

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
> - Pastikan `.htaccess` root sudah memblokir akses ke `.env`!

---

## Langkah 7 — Generate App Key

### Jika ada SSH Access:

```bash
cd ~/public_html
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

## Langkah 8 — Buat Database

1. Buka **cPanel → MySQL Databases**
2. Buat database baru (misal: `username_quiz_app`)
3. Buat user database baru
4. Assign user ke database dengan **ALL PRIVILEGES**
5. Update `.env` dengan kredensial database

---

## Langkah 9 — Migrasi Database

### Jika ada SSH Access:

```bash
cd ~/public_html
php artisan migrate --force
php artisan db:seed --force   # opsional, jika ada seeder
```

### Jika tidak ada SSH:

Buat file `migrate.php` sementara di `public_html/public/`:

```php
<?php
// HAPUS FILE INI SETELAH MIGRASI SELESAI!

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->call('migrate', ['--force' => true]);
echo '<pre>' . $kernel->output() . '</pre>';

// Uncomment baris di bawah jika ingin menjalankan seeder
// $kernel->call('db:seed', ['--force' => true]);
// echo '<pre>' . $kernel->output() . '</pre>';
```

Akses `https://namadomain.com/migrate.php` di browser, lalu **HAPUS FILE INI** setelah selesai.

---

## Langkah 10 — Storage Link

### Jika ada SSH Access:

```bash
cd ~/public_html
php artisan storage:link
```

### Jika tidak ada SSH:

Buat symlink manual. Tambahkan file `storage-link.php` di `public_html/public/`:

```php
<?php
// HAPUS FILE INI SETELAH DIJALANKAN!

$target = dirname(__DIR__) . '/storage/app/public';
$link = __DIR__ . '/storage';

if (file_exists($link)) {
    echo 'Symlink sudah ada.';
} else {
    symlink($target, $link);
    echo 'Symlink berhasil dibuat.';
}
```

Akses `https://namadomain.com/storage-link.php` di browser lalu **HAPUS FILE INI**.

> **Catatan:** Beberapa shared hosting tidak mendukung `symlink()`. Jika gagal, hubungi support hosting atau gunakan cara alternatif: salin file upload secara manual ke `public_html/public/storage/`.

---

## Langkah 11 — Permission & Cache

### Set Permission

```bash
chmod -R 775 storage/
chmod -R 775 bootstrap/cache/
```

Jika tidak ada SSH, set permission via **cPanel → File Manager** (klik kanan → Change Permissions).

### Optimize untuk Production

Jika ada SSH:

```bash
cd ~/public_html
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

---

## Langkah 12 — Konfigurasi Cron Job (Queue & Scheduler)

### Laravel Scheduler

Di cPanel → **Cron Jobs**, tambahkan:

```
* * * * * cd /home/username/public_html && php artisan schedule:run >> /dev/null 2>&1
```

### Queue Worker (Opsional)

Karena shared hosting tidak mendukung `queue:work` yang berjalan terus-menerus, gunakan salah satu opsi:

**Opsi A — Jalankan queue via scheduler:**

Tambahkan di `routes/console.php`:

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

## Troubleshooting

### 500 Internal Server Error

1. Cek `storage/logs/laravel.log` untuk detail error
2. Pastikan permission `storage/` dan `bootstrap/cache/` sudah `775`
3. Pastikan `.env` sudah benar dan `APP_KEY` sudah di-generate
4. Jalankan `php artisan config:clear` jika ada perubahan `.env`

### Halaman Blank / Tidak Muncul

1. Pastikan `.htaccess` di root `public_html/` sudah dibuat dan berisi redirect ke `public/`
2. Pastikan folder `public/build/` (hasil Vite build) sudah ter-upload
3. Cek file `.htaccess` juga ada di dalam folder `public/`

### CSS/JS Tidak Muncul

1. Pastikan `npm run build` sudah dijalankan di lokal sebelum upload
2. Pastikan folder `public/build/` berisi file hasil build
3. Cek `APP_URL` di `.env` sudah sesuai domain

### File Sensitif Bisa Diakses di Browser

1. Pastikan `.htaccess` di root `public_html/` sudah memblokir akses ke `.env`, `vendor/`, `app/`, dll.
2. Test dengan mengakses `https://namadomain.com/.env` — harus menampilkan **403 Forbidden**
3. Test juga `https://namadomain.com/vendor/autoload.php` — harus **403 Forbidden**

### Upload File Gagal

1. Pastikan symlink `storage` sudah dibuat di `public/`
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
- [ ] Semua file di-upload ke `public_html/` (tanpa `node_modules`, `.git`, `tests`)
- [ ] `.htaccess` di root `public_html/` dibuat (redirect ke `public/` + proteksi file sensitif)
- [ ] `.htaccess` di `public/` tetap default Laravel
- [ ] `public/index.php` tidak diubah (tetap default)
- [ ] `.env` dibuat dengan konfigurasi production
- [ ] `.env` tidak bisa diakses via browser (test: 403 Forbidden)
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
