<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuizAnswer extends Model
{
    protected $fillable = [
        'quiz_attempt_id',
        'quiz_question_id',
        'quiz_question_option_id',
        'quiz_matching_pair_id',
        'answer_text',
        'is_correct',
        'awarded_points',
        'answered_at',
    ];

    protected $casts = [
        'is_correct' => 'boolean',
        'awarded_points' => 'integer',
        'answered_at' => 'datetime',
    ];

    /**
     * Get the attempt that owns this answer.
     */
    public function attempt(): BelongsTo
    {
        return $this->belongsTo(QuizAttempt::class, 'quiz_attempt_id');
    }

    /**
     * Get the question that this answer is for.
     */
    public function question(): BelongsTo
    {
        return $this->belongsTo(QuizQuestion::class, 'quiz_question_id');
    }

    /**
     * Get the selected option (for multiple choice questions).
     */
    public function selectedOption(): BelongsTo
    {
        return $this->belongsTo(QuizQuestionOption::class, 'quiz_question_option_id');
    }

    /**
     * Get the selected matching pair (for matching questions).
     */
    public function selectedMatchingPair(): BelongsTo
    {
        return $this->belongsTo(QuizMatchingPair::class, 'quiz_matching_pair_id');
    }
}
