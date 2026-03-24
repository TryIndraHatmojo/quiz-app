<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class QuizMatchingPair extends Model
{
    protected $fillable = [
        'quiz_question_id',
        'left_text',
        'right_text',
        'left_media_path',
        'right_media_path',
        'order',
    ];

    /**
     * Get the question that owns this matching pair.
     */
    public function question(): BelongsTo
    {
        return $this->belongsTo(QuizQuestion::class, 'quiz_question_id');
    }

    /**
     * Detail answers where this pair is used as the left item.
     */
    public function asLeftInAnswers(): HasMany
    {
        return $this->hasMany(QuizAnswerMatchingPair::class, 'left_quiz_matching_pair_id');
    }

    /**
     * Detail answers where this pair is selected as the right item.
     */
    public function asSelectedRightInAnswers(): HasMany
    {
        return $this->hasMany(QuizAnswerMatchingPair::class, 'selected_right_quiz_matching_pair_id');
    }
}
