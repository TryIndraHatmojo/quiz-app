# Cara Menggunakan Custom Authentication

## Pilihan 1: Menggunakan Laravel Fortify (Sudah Ada - RECOMMENDED)

Sistem login **sudah siap digunakan** dengan Laravel Fortify:

```bash
# 1. Jalankan migration
php artisan migrate

# 2. Akses halaman login
http://localhost:8000/login
```

**Tidak perlu konfigurasi tambahan!** Fortify sudah menangani:
- ✅ Login/Logout
- ✅ Registration
- ✅ Password Reset
- ✅ Email Verification
- ✅ Two-Factor Authentication

## Pilihan 2: Menggunakan Custom Controller (Opsional)

Jika Anda ingin custom logic atau bahasa Indonesia, gunakan custom controller yang sudah dibuat:

### 1. Aktifkan Custom Routes

Edit `routes/web.php` dan tambahkan di bagian bawah:

```php
// Di bagian paling bawah file
require __DIR__.'/custom-auth.php';
```

### 2. Akses Custom Login

Custom login tersedia di:
```
http://localhost:8000/custom/login
```

### 3. Update Navigation (Opsional)

Jika ingin menggunakan custom login sebagai default, ubah link di navigation:

**resources/js/components/navigation.tsx** (atau file navigation Anda):
```typescript
// Ubah dari:
<Link href="/login">Login</Link>

// Menjadi:
<Link href="/custom/login">Login</Link>
```

## File yang Sudah Dibuat

### Backend (Laravel)
1. **Controller**: `app/Http/Controllers/Auth/CustomAuthController.php`
   - Method: `showLoginForm()`, `login()`, `logout()`, `check()`
   - Sudah include rate limiting dan security features

2. **Request**: `app/Http/Requests/Auth/LoginRequest.php`
   - Validasi email & password
   - Rate limiting (5 attempts per minute)
   - Error messages dalam Bahasa Indonesia

3. **Routes**: `routes/custom-auth.php`
   - `GET /custom/login` - Tampilkan form login
   - `POST /custom/login` - Proses login
   - `POST /custom/logout` - Logout
   - `GET /custom/auth/check` - Check authentication status

### Frontend (React)
4. **View**: `resources/js/pages/auth/custom-login.tsx`
   - Form login dengan UI modern
   - Teks dalam Bahasa Indonesia
   - Error handling
   - Loading states

## Testing Custom Login

### 1. Buat User untuk Testing

```bash
php artisan tinker
```

Kemudian di tinker:
```php
use App\Models\User;

User::create([
    'name' => 'Admin',
    'email' => 'admin@example.com',
    'password' => bcrypt('password'),
    'email_verified_at' => now(),
]);
```

### 2. Test Login

1. Buka `http://localhost:8000/custom/login`
2. Masukkan credentials:
   - Email: `admin@example.com`
   - Password: `password`
3. Klik "Masuk"
4. Seharusnya redirect ke `/dashboard`

### 3. Test Logout

```bash
# Via browser console atau Postman
POST http://localhost:8000/custom/logout
```

### 4. Test Auth Check

```bash
# Via API
GET http://localhost:8000/custom/auth/check
```

Response:
```json
{
    "authenticated": true,
    "user": {
        "id": 1,
        "name": "Admin",
        "email": "admin@example.com"
    }
}
```

## Perbedaan Fortify vs Custom

| Feature | Fortify (Built-in) | Custom Controller |
|---------|-------------------|-------------------|
| **Path** | `/login` | `/custom/login` |
| **Bahasa** | English | Indonesia |
| **Customisasi** | Via Service Provider | Full control |
| **Maintenance** | Auto-update dengan Laravel | Manual |
| **Features** | Login, Register, 2FA, dll | Hanya yang Anda buat |

## Rekomendasi

**Gunakan Fortify** kecuali Anda benar-benar butuh custom logic yang tidak bisa dicapai dengan Fortify hooks/events.

### Kapan Pakai Custom Controller?
- ✅ Butuh custom authentication logic (e.g., login dengan username)
- ✅ Integrasi dengan external auth service
- ✅ Custom rate limiting rules
- ✅ Logging atau analytics khusus
- ✅ Multi-tenant authentication

### Kapan Pakai Fortify? (RECOMMENDED)
- ✅ Standard authentication (email + password)
- ✅ Butuh fitur lengkap (2FA, email verification, dll)
- ✅ Ingin code yang maintainable
- ✅ Mengikuti Laravel best practices

## Menambahkan Custom Logic ke Fortify

Jika hanya butuh custom logic tanpa override Fortify, gunakan events:

**app/Providers/EventServiceProvider.php**:
```php
use Laravel\Fortify\Events\Login;
use Illuminate\Support\Facades\Event;

Event::listen(function (Login $event) {
    // Custom logic setelah login
    activity()
        ->causedBy($event->user)
        ->log('User logged in');
});
```

Ini cara terbaik untuk menambahkan custom logic tanpa replace Fortify!

## Troubleshooting

### Error: "Class 'activity' not found"
Hapus/comment baris `activity()` di CustomAuthController atau install package:
```bash
composer require spatie/laravel-activitylog
```

### Error: "Route not found"
Pastikan sudah menambahkan `require __DIR__.'/custom-auth.php';` di `web.php`

### Custom login tidak tampil
Pastikan sudah build frontend:
```bash
npm run dev
# atau
npm run build
```

### CSRF Token Mismatch
Pastikan form ada `@csrf` token atau gunakan Inertia Form (sudah auto-handle).
