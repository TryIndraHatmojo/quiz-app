<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
}
