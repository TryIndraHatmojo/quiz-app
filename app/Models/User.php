<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
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
