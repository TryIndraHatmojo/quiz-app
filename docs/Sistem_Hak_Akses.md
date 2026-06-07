# Dokumentasi Sistem Hak Akses (Role & Menu Permissions)

Dokumen ini menjelaskan alur kerja dan implementasi dari fitur Hak Akses Menu yang telah dibangun. Fitur ini memungkinkan aplikasi untuk mengatur menu mana saja yang dapat diakses oleh peran (role) tertentu secara dinamis.

## 1. Struktur Database

Fitur ini menggunakan dua tabel utama yang baru ditambahkan:
- **`menus`**: Menyimpan semua data menu (grup, judul, url, nama route, icon, hirarki parent-child, dan urutan).
- **`menu_role`**: Tabel *pivot* (penghubung) yang memetakan menu mana saja yang boleh diakses oleh `role_id` tertentu.

## 2. Models & Relasi

- **`App\Models\Menu`**: Merepresentasikan data di tabel `menus`. Memiliki relasi ke sesama menu untuk mendukung *parent-child* (jika ada sub-menu) melalui `parent()` dan `children()`. Juga memiliki relasi ke model `Role`.
- **`App\Models\Role`**: Telah dimodifikasi dengan penambahan relasi *Many-to-Many* ke `Menu` menggunakan kode berikut:
  ```php
  public function menus()
  {
      return $this->belongsToMany(Menu::class);
  }
  ```

## 3. Inisialisasi Data (Seeder)

**`Database\Seeders\MenuSeeder`** digunakan untuk menginisialisasi tabel `menus` berdasarkan daftar menu standar aplikasi.
- Seeder ini memasukkan data-data seperti "Dashboard", "Kuis", "Pengguna", dsb., dilengkapi dengan *route_name* masing-masing (misal: `master.roles.index`).
- Setelah data menu dibuat, seeder otomatis memberikan *semua* akses menu ini kepada peran "Admin" agar admin utama tetap memiliki akses penuh tanpa perlu dicentang manual.

## 4. Antarmuka Manajemen Hak Akses

- **Controller (`App\Http\Controllers\Master\RoleMenuController`)**:
  Menangani alur data untuk halaman pengaturan. Terdapat metode `index` untuk menampilkan menu apa saja yang saat ini dicentang oleh Role tertentu, dan metode `update` untuk menyimpan daftar menu terbaru (melalui `$role->menus()->sync(...)`).
- **Frontend (`resources/js/pages/master/roles/access.tsx`)**:
  Menyediakan *User Interface* (UI) berbasis React/Inertia. Menampilkan daftar seluruh menu yang dikelompokkan berdasarkan `group_name` (seperti Platform, Koleksi, Data Master). Di sini admin bisa mencentang/menghapus centang menu untuk Role yang sedang diedit.

## 5. Render Sidebar Dinamis

Sidebar aplikasi tidak lagi bergantung pada data *hardcode*, melainkan memuat menu yang diizinkan untuk pengguna (user) secara langsung dari *database*.
- **`HandleInertiaRequests.php` (Middleware)**:
  Berperan sebagai penyedia data global untuk Inertia. Saat pengguna login, middleware ini mengambil semua menu unik yang terkait dengan *roles* pengguna tersebut. Menu diformat ke dalam hirarki `navGroups` (beserta children/sub-menu jika ada).
- **`app-sidebar.tsx` (Komponen Frontend)**:
  Menerima `navGroups` dari props `usePage()`. Karena nama *icon* di database disimpan dalam format string (contoh: `"LayoutGrid"`), komponen ini memetakannya menjadi komponen *icon* secara dinamis menggunakan library `lucide-react`.

## 6. Proteksi Rute (Middleware)

Selain disembunyikan dari antarmuka sidebar, rute secara sistem juga diblokir bagi yang tidak memiliki akses menggunakan **`App\Http\Middleware\CheckMenuAccess`**.

**Cara Kerja Middleware:**
1. Mengambil nama route aktif, contohnya `master.roles.index`.
2. Mencari di tabel `menus` apakah route tersebut terdaftar.
   - *Jika tidak terdaftar (misal route API, penyimpanan data POST, atau halaman edit khusus)*, maka dibiarkan lolos. Asumsinya adalah fitur khusus tersebut diproteksi dengan mekanisme validasi yang lain.
3. Jika rute tersebut terdaftar sebagai menu, sistem memeriksa apakah *User* memiliki peran yang ditautkan ke menu tersebut.
4. **Bypass**: Jika User memiliki peran `Admin`, pengecekan langsung diloloskan.
5. Jika User tidak memiliki hak akses, sistem memberikan *response* HTTP 403 (untuk request JSON) atau melakukan *redirect* kembali ke dashboard disertai pesan error *flash*.

Middleware ini didaftarkan secara global pada *stack web middleware* di **`bootstrap/app.php`**, sehingga otomatis aktif melindungi setiap *request* yang masuk melalui antarmuka web.
