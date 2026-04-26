<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class QuizAttempt extends Model
{
    protected $fillable = [
        'quiz_id',
        'user_id',
        'started_at',
        'completed_at',
        'total_points',
        'correct_count',
        'wrong_count',
        'duration_seconds',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'total_points' => 'integer',
        'correct_count' => 'integer',
        'wrong_count' => 'integer',
        'duration_seconds' => 'integer',
    ];

    /**
     * Get the quiz that this attempt is for.
     */
    public function quiz(): BelongsTo
    {
        return $this->belongsTo(Quiz::class);
    }

    /**
     * Get the user who made this attempt.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get all answers for this attempt.
     */
    public function answers(): HasMany
    {
        return $this->hasMany(QuizAnswer::class);
    }

    /**
     * Get all matching-pair detail answers in this attempt.
     */
    public function matchingPairAnswers(): HasMany
    {
        return $this->hasMany(QuizAnswerMatchingPair::class);
    }

    /**
     * Check if this attempt is completed.
     */
    public function isCompleted(): bool
    {
        return $this->completed_at !== null;
    }

    /**
     * Calculate score percentage.
     */
    public function getScorePercentageAttribute(): float
    {
        $quiz = $this->quiz()->with('questions')->first();
        if (!$quiz || !$quiz->questions) return 0;
        
        $maxPoints = $quiz->questions->sum('points');
        if ($maxPoints === 0) return 0;
        
        return round(($this->total_points / $maxPoints) * 100, 2);
    }

    /**
     * Check if attempt passes the given KKM threshold.
     */
    public function isPassed(int $passingScore, int $maxPoints): bool
    {
        if ($maxPoints <= 0) {
            return false;
        }

        $percentage = round(($this->total_points / $maxPoints) * 100, 2);

        return $percentage >= $passingScore;
    }

    /**
     * Complete the attempt and calculate scores.
     */
    public function complete(): void
    {
        $this->completed_at = now();
        
        // Calculate duration
        if ($this->started_at) {
            $this->duration_seconds = $this->started_at->diffInSeconds(now());
        }
        
        // Calculate scores from answers
        $answers = $this->answers()->get();

        $this->correct_count = $answers->where('is_correct', true)->count();
        $this->wrong_count = $answers->where('is_correct', false)->count();
        $this->total_points = (int) $answers->sum('awarded_points');
        
        $this->save();
    }
}
