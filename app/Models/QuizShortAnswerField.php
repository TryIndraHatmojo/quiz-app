<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuizShortAnswerField extends Model
{
    protected $table = 'quiz_short_answer_fields';

    protected $fillable = [
        'quiz_question_id',
        'label',
        'placeholder',
        'character_limit',
        'expected_answer',
        'case_sensitive',
        'trim_whitespace',
        'order',
    ];

    protected $casts = [
        'character_limit' => 'integer',
        'case_sensitive' => 'boolean',
        'trim_whitespace' => 'boolean',
        'order' => 'integer',
    ];

    public function quizQuestion(): BelongsTo
    {
        return $this->belongsTo(QuizQuestion::class);
    }
}
