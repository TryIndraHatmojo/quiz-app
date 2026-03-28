<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CatatanTelaahSoal extends Model
{
    protected $table = 'catatan_telaah_soals';

    protected $fillable = [
        'quiz_question_id',
        'user_id',
        'catatan',
        'status',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Konstanta status
     */
    public const STATUS_BUTUH_REVIEW = 'butuh_review';
    public const STATUS_SELESAI = 'selesai';

    /**
     * Get the question this note belongs to.
     */
    public function question(): BelongsTo
    {
        return $this->belongsTo(QuizQuestion::class, 'quiz_question_id');
    }

    /**
     * Get the user (reviewer) who created this note.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
