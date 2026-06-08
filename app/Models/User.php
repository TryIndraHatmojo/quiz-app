<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    public const ROLE_ADMIN = 'admin';

    public const ROLE_GURU_TELAAH_SOAL = 'guru-telaah-soal';

    public const ROLE_GURU_MATA_PELAJARAN = 'guru-mata-pelajaran';

    public const ROLE_SISWA = 'siswa';

    public const ROLE_ORANG_TUA = 'orang-tua';

    public const ROLE_GURU_TAMU = 'guru-tamu';

    public const ROLE_SISWA_TAMU = 'siswa-tamu';

    public const REGULAR_TEACHER_ROLE_SLUGS = [
        self::ROLE_GURU_TELAAH_SOAL,
        self::ROLE_GURU_MATA_PELAJARAN,
    ];

    public const GUEST_TEACHER_ROLE_SLUGS = [
        self::ROLE_GURU_TAMU,
    ];

    public const TEACHER_ROLE_SLUGS = [
        self::ROLE_GURU_TELAAH_SOAL,
        self::ROLE_GURU_MATA_PELAJARAN,
        self::ROLE_GURU_TAMU,
    ];

    public const REGULAR_STUDENT_ROLE_SLUGS = [
        self::ROLE_SISWA,
    ];

    public const GUEST_STUDENT_ROLE_SLUGS = [
        self::ROLE_SISWA_TAMU,
    ];

    public const STUDENT_ROLE_SLUGS = [
        self::ROLE_SISWA,
        self::ROLE_SISWA_TAMU,
    ];

    public const GUEST_ROLE_SLUGS = [
        self::ROLE_GURU_TAMU,
        self::ROLE_SISWA_TAMU,
    ];

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'nomor_induk_siswa',
        'password',
        'jenjang_id',
        'kelas_id',
        'orang_tua_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    public function roles()
    {
        return $this->belongsToMany(Role::class);
    }

    public function hasRoleSlug(string|array $slugs): bool
    {
        $slugs = is_array($slugs) ? $slugs : [$slugs];

        if ($this->relationLoaded('roles')) {
            return $this->roles->contains(
                fn (Role $role) => in_array($role->slug, $slugs, true)
            );
        }

        return $this->roles()->whereIn('slug', $slugs)->exists();
    }

    public function isAdmin(): bool
    {
        return $this->hasRoleSlug(self::ROLE_ADMIN);
    }

    public function isTeacher(): bool
    {
        return $this->hasRoleSlug(self::TEACHER_ROLE_SLUGS);
    }

    public function isRegularTeacher(): bool
    {
        return $this->hasRoleSlug(self::REGULAR_TEACHER_ROLE_SLUGS);
    }

    public function isGuestTeacher(): bool
    {
        return $this->hasRoleSlug(self::GUEST_TEACHER_ROLE_SLUGS);
    }

    public function isStudent(): bool
    {
        return $this->hasRoleSlug(self::STUDENT_ROLE_SLUGS);
    }

    public function isRegularStudent(): bool
    {
        return $this->hasRoleSlug(self::REGULAR_STUDENT_ROLE_SLUGS);
    }

    public function isGuestStudent(): bool
    {
        return $this->hasRoleSlug(self::GUEST_STUDENT_ROLE_SLUGS);
    }

    public function isGuest(): bool
    {
        return $this->hasRoleSlug(self::GUEST_ROLE_SLUGS);
    }

    public function quizAudience(): string
    {
        return $this->isGuest() ? Quiz::AUDIENCE_GUEST : Quiz::AUDIENCE_REGULAR;
    }

    public function jenjang()
    {
        return $this->belongsTo(Jenjang::class);
    }

    public function kelas()
    {
        return $this->belongsTo(Kelas::class);
    }

    public function orangTua()
    {
        return $this->belongsTo(User::class, 'orang_tua_id');
    }

    public function anak()
    {
        return $this->hasMany(User::class, 'orang_tua_id');
    }

    public function passwordResetRequests()
    {
        return $this->hasMany(PasswordResetRequest::class);
    }

    /**
     * Get quizzes where this user has teacher access.
     */
    public function quizzesAsTeacher()
    {
        return $this->belongsToMany(Quiz::class, 'quiz_teacher_access')
            ->withPivot(['permission', 'granted_at', 'granted_by'])
            ->withTimestamps();
    }

    /**
     * Get quizzes where this user has student access.
     */
    public function quizzesAsStudent()
    {
        return $this->belongsToMany(Quiz::class, 'quiz_student_access')
            ->withPivot(['granted_at', 'granted_by', 'accessed_at', 'attempt_count'])
            ->withTimestamps();
    }
}
