<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuizAnswerMatchingPair extends Model
{
    protected $fillable = [
        'quiz_answer_id',
        'quiz_attempt_id',
        'quiz_question_id',
        'left_quiz_matching_pair_id',
        'selected_right_quiz_matching_pair_id',
        'is_correct',
        'awarded_points',
        'answered_at',
    ];

    protected $casts = [
        'is_correct' => 'boolean',
        'awarded_points' => 'integer',
        'answered_at' => 'datetime',
    ];

    public function answer(): BelongsTo
    {
        return $this->belongsTo(QuizAnswer::class, 'quiz_answer_id');
    }

    public function attempt(): BelongsTo
    {
        return $this->belongsTo(QuizAttempt::class, 'quiz_attempt_id');
    }

    public function question(): BelongsTo
    {
        return $this->belongsTo(QuizQuestion::class, 'quiz_question_id');
    }

    public function leftPair(): BelongsTo
    {
        return $this->belongsTo(QuizMatchingPair::class, 'left_quiz_matching_pair_id');
    }

    public function selectedRightPair(): BelongsTo
    {
        return $this->belongsTo(QuizMatchingPair::class, 'selected_right_quiz_matching_pair_id');
    }
}
