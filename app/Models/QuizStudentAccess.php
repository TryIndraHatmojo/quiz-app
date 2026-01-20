<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuizStudentAccess extends Model
{
    use HasFactory;

    protected $table = 'quiz_student_access';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'quiz_id',
        'user_id',
        'granted_at',
        'granted_by',
        'accessed_at',
        'attempt_count',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'granted_at' => 'datetime',
        'accessed_at' => 'datetime',
    ];

    /**
     * Get the quiz that this access belongs to.
     */
    public function quiz(): BelongsTo
    {
        return $this->belongsTo(Quiz::class);
    }

    /**
     * Get the student/user who has access.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the user who granted this access.
     */
    public function grantedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'granted_by');
    }

    /**
     * Increment the attempt count.
     */
    public function incrementAttempt(): void
    {
        $this->increment('attempt_count');
        
        if (!$this->accessed_at) {
            $this->update(['accessed_at' => now()]);
        }
    }
}
