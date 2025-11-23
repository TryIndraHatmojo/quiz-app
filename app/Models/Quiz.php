<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Quiz extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'quiz_category_id',
        'title',
        'slug',
        'join_code',
        'description',
        'status',
        'is_public',
        'time_per_question',
        'starts_at',
        'ends_at',
        'settings',
    ];

    protected $casts = [
        'is_public' => 'boolean',
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'settings' => 'array',
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
}
