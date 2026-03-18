<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Quiz extends Model
{
    use HasFactory;

    public const TIME_MODE_PER_QUESTION = 'per_question';
    public const TIME_MODE_TOTAL = 'total';

    public const TIME_MODES = [
        self::TIME_MODE_PER_QUESTION,
        self::TIME_MODE_TOTAL,
    ];

    protected $fillable = [
        'user_id',
        'quiz_category_id',
        'jenjang_id',
        'kelas_id',
        'title',
        'slug',
        'join_code',
        'description',
        'status',
        'time_mode',
        'duration',
        'quiz_background_id',
    ];

    protected $casts = [
        'duration' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(QuizCategory::class, 'quiz_category_id');
    }

    public function questions(): HasMany
    {
        return $this->hasMany(QuizQuestion::class)->orderBy('order');
    }

    public function attempts(): HasMany
    {
        return $this->hasMany(QuizAttempt::class);
    }

    public function background(): BelongsTo
    {
        return $this->belongsTo(QuizBackground::class, 'quiz_background_id');
    }

    public function jenjang(): BelongsTo
    {
        return $this->belongsTo(Jenjang::class);
    }

    public function kelas(): BelongsTo
    {
        return $this->belongsTo(Kelas::class);
    }

    /**
     * Get teachers who have access to this quiz.
     */
    public function teacherAccess(): HasMany
    {
        return $this->hasMany(QuizTeacherAccess::class);
    }

    /**
     * Get teachers who can edit this quiz.
     */
    public function teachersWithAccess()
    {
        return $this->belongsToMany(User::class, 'quiz_teacher_access')
            ->withPivot(['permission', 'granted_at', 'granted_by'])
            ->withTimestamps();
    }

    /**
     * Get students who have access to this quiz.
     */
    public function studentAccess(): HasMany
    {
        return $this->hasMany(QuizStudentAccess::class);
    }

    /**
     * Get students who can work on this quiz.
     */
    public function studentsWithAccess()
    {
        return $this->belongsToMany(User::class, 'quiz_student_access')
            ->withPivot(['granted_at', 'granted_by', 'accessed_at', 'attempt_count'])
            ->withTimestamps();
    }

    /**
     * Check if a teacher has access to edit this quiz.
     */
    public function hasTeacherAccess(int $userId, string $permission = 'edit'): bool
    {
        return $this->teacherAccess()
            ->where('user_id', $userId)
            ->where('permission', $permission)
            ->exists();
    }

    /**
     * Check if a student has access to this quiz.
     */
    public function hasStudentAccess(int $userId): bool
    {
        return $this->studentAccess()
            ->where('user_id', $userId)
            ->exists();
    }

    /**
     * Grant teacher access to this quiz.
     */
    public function grantTeacherAccess(int $userId, string $permission = 'edit', ?int $grantedBy = null): void
    {
        QuizTeacherAccess::updateOrCreate(
            ['quiz_id' => $this->id, 'user_id' => $userId],
            [
                'permission' => $permission,
                'granted_by' => $grantedBy ?? auth()->id(),
                'granted_at' => now(),
            ]
        );
    }

    /**
     * Grant student access to this quiz.
     */
    public function grantStudentAccess(int $userId, ?int $grantedBy = null): void
    {
        QuizStudentAccess::updateOrCreate(
            ['quiz_id' => $this->id, 'user_id' => $userId],
            [
                'granted_by' => $grantedBy ?? auth()->id(),
                'granted_at' => now(),
            ]
        );
    }
}
