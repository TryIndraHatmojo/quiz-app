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
}
