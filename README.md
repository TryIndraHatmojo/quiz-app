# Quiz App

Aplikasi Quiz berbasis web yang dibangun menggunakan Laravel 12 dan React (Inertia.js).

## Persyaratan Sistem

Pastikan sistem Anda sudah terinstall:
- PHP >= 8.2
- Composer
- Node.js & NPM

## Cara Setup Project (Setelah Clone)

Anda dapat menyiapkan project ini dengan mudah menggunakan perintah otomatis yang sudah disediakan di `composer.json`:

```bash
composer run setup
```

Perintah di atas akan melakukan langkah-langkah berikut secara otomatis:
1. Install dependensi PHP (`composer install`)
2. Membuat file `.env` dari `.env.example`
3. Generate application key (`php artisan key:generate`)
4. Menjalankan migrasi database (`php artisan migrate --force`)
5. Install dependensi Node.js (`npm install`)
6. Build aset frontend (`npm run build`)

### Setup Manual (Alternatif)

Jika setup otomatis gagal atau Anda ingin melakukannya langkah demi langkah:

1. **Install Dependensi PHP**
   ```bash
   composer install
   ```

2. **Konfigurasi Environment**
   Salin file contoh konfigurasi dan sesuaikan setting database Anda.
   ```bash
   cp .env.example .env
   ```
   *Edit file `.env` dan pastikan konfigurasi DB_DATABASE dll sudah sesuai.*

3. **Generate App Key**
   ```bash
   php artisan key:generate
   ```

4. **Migrasi Database**
   ```bash
   php artisan migrate
   ```

5. **Install & Build Frontend**
   ```bash
   npm install
   npm run build
   ```

6. **Seed Database (Data Dummy)**
   ```bash
   php artisan db:seed
   ```

## Cara Menjalankan Aplikasi

Untuk menjalankan aplikasi dalam mode development, gunakan perintah:

```bash
composer run dev
```

Perintah ini akan menjalankan service berikut secara bersamaan (concurrently):
- **Laravel Server**: `php artisan serve` (http://127.0.0.1:8000)
- **Queue Worker**: `php artisan queue:listen`
- **Vite Dev Server**: `npm run dev`

Buka browser Anda dan akses: [http://127.0.0.1:8000](http://127.0.0.1:8000)
