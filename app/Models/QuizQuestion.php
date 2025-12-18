<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class QuizQuestion extends Model
{
    public const TYPE_MULTIPLE_CHOICE = 'multiple_choice';
    public const TYPE_LONG_ANSWER = 'long_answer';
    public const TYPE_SHORT_ANSWER = 'short_answer';
    public const TYPE_MATCHING_PAIRS = 'matching_pairs';
    public const TYPE_TRUE_FALSE = 'true_false';

    public const TYPES = [
        self::TYPE_MULTIPLE_CHOICE,
        self::TYPE_LONG_ANSWER,
        self::TYPE_SHORT_ANSWER,
        self::TYPE_MATCHING_PAIRS,
        self::TYPE_TRUE_FALSE,
    ];

    protected $fillable = [
        'quiz_id',
        'question_type',
        'question_text',
        'media_path',
        'time_limit',
        'points',
        'order',
    ];

    protected $casts = [
        'time_limit' => 'integer',
        'points' => 'integer',
        'order' => 'integer',
    ];

    public function quiz(): BelongsTo
    {
        return $this->belongsTo(Quiz::class);
    }

    public function options(): HasMany
    {
        return $this->hasMany(QuizQuestionOption::class)->orderBy('order');
    }

    public function matchingPairs(): HasMany
    {
        return $this->hasMany(QuizMatchingPair::class)->orderBy('order');
    }

    public function shortAnswerFields(): HasMany
    {
        return $this->hasMany(QuizShortAnswerField::class)->orderBy('order');
    }
}
