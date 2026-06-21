# Format Import Pengguna Excel

Fitur import pengguna membaca sheet bernama `Import Pengguna`. Baris pertama wajib berisi header, lalu data pengguna dimulai dari baris ke-2.

Template bisa diunduh dari halaman `Data Master > Pengguna` lewat tombol `Download Format`. File template berisi:

- `Import Pengguna`: sheet yang diunggah kembali untuk membuat user.
- `Data Saat Ini`: data user yang sudah ada saat template diunduh.
- `Referensi Role`: daftar role yang valid.
- `Referensi Jenjang`: daftar jenjang yang valid.
- `Referensi Kelas`: daftar kelas yang valid.
- `Referensi Orang Tua`: daftar user dengan role Orang Tua.
- `Panduan`: ringkasan aturan import.

## Kolom Sheet Import Pengguna

| Kolom | Wajib | Keterangan |
| --- | --- | --- |
| `nama` | Ya | Nama lengkap user. Masuk ke `users.name`. |
| `email` | Ya | Email unik. Masuk ke `users.email`. Tidak boleh sudah ada di database atau duplikat di file. |
| `nomor_induk_siswa` | Tidak | NIS unik. Masuk ke `users.nomor_induk_siswa` dan bisa dipakai untuk login/reset password jika diisi. |
| `password` | Ya | Minimal 8 karakter. Masuk ke `users.password` dalam bentuk hash. |
| `peran` | Ya | Role user. Disarankan memakai slug dari `Referensi Role`, misalnya `siswa`, `orang-tua`, `guru-mata-pelajaran`. Nama role dan ID role juga diterima. |
| `jenjang_id` | Tidak | ID dari `Referensi Jenjang`. Masuk ke `users.jenjang_id`. |
| `kelas_id` | Tidak | ID dari `Referensi Kelas`. Masuk ke `users.kelas_id`. Jika `jenjang_id` kosong, sistem memakai `jenjang_id` dari kelas tersebut. |
| `orang_tua_id` | Tidak | ID user Orang Tua yang sudah ada. Hanya boleh diisi untuk user berperan `siswa` atau `siswa-tamu`. |
| `orang_tua_nama` | Kondisional | Wajib jika ingin membuat orang tua baru lewat baris siswa dan `orang_tua_email` belum ada. |
| `orang_tua_email` | Kondisional | Email orang tua. Bisa mengarah ke user Orang Tua yang sudah ada, baris Orang Tua dalam file yang sama, atau orang tua baru. |
| `orang_tua_password` | Kondisional | Wajib minimal 8 karakter jika sistem perlu membuat user Orang Tua baru. |

## Contoh Baris

| nama | email | nomor_induk_siswa | password | peran | jenjang_id | kelas_id | orang_tua_id | orang_tua_nama | orang_tua_email | orang_tua_password |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Andi Baru | andi.baru@example.com | 20260001 | password123 | siswa | 1 | 1 | 12 |  |  |  |
| Sari Baru | sari.baru@example.com | 20260002 | password123 | siswa | 1 | 2 |  | Ibu Sari | ibu.sari@example.com | password123 |
| Bapak Rudi | bapak.rudi@example.com |  | password123 | orang-tua | 1 | 1 |  |  |  |  |
| Rudi Baru | rudi.baru@example.com | 20260003 | password123 | siswa | 1 | 1 |  |  | bapak.rudi@example.com |  |

## Aturan Import

- Import berjalan dalam transaksi. Jika ada satu baris error, seluruh import dibatalkan.
- `nomor_induk_siswa` opsional, tetapi jika diisi harus unik.
- `orang_tua_id` harus mengarah ke user yang sudah memiliki role `Orang Tua`.
- Kolom orang tua hanya boleh diisi pada baris siswa.
- Jika beberapa siswa memakai `orang_tua_email` baru yang sama, data `orang_tua_nama` dan `orang_tua_password` harus sama.
- Jika `kelas_id` dan `jenjang_id` diisi bersamaan, kelas harus berada pada jenjang tersebut.
- Password tidak pernah ditampilkan pada template `Data Saat Ini`.

## Dependency

Fitur ini memakai package Composer:

```bash
composer require phpoffice/phpspreadsheet:5.8
```

Package sudah tercatat di `composer.json` dan `composer.lock`, jadi pada server live cukup jalankan `composer install` dari lock file.

## Setup Server Live

1. Pastikan server memakai PHP 8.2 atau lebih baru.
2. Pastikan ekstensi PHP berikut aktif karena dibutuhkan `phpoffice/phpspreadsheet`: `ctype`, `dom`, `fileinfo`, `filter`, `gd`, `iconv`, `libxml`, `mbstring`, `simplexml`, `xml`, `xmlreader`, `xmlwriter`, `zip`, dan `zlib`.
3. Upload perubahan kode dan `composer.lock` ke server.
4. Jalankan:

```bash
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan db:seed --class=MenuSeeder
php artisan optimize:clear
npm ci
npm run build
```

5. Jika server memakai shared hosting tanpa akses `npm`, build asset di mesin lokal/CI lalu upload folder hasil build `public/build`.
6. Hindari menjalankan `composer update` langsung di live. Gunakan `composer install` agar versi dependency mengikuti `composer.lock`.
7. Pastikan batas upload PHP cukup untuk file Excel, misalnya `upload_max_filesize` dan `post_max_size` minimal `5M` atau lebih sesuai kebutuhan.
