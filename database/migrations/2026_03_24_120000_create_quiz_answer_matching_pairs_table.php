<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('quiz_answer_matching_pairs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quiz_answer_id')->constrained('quiz_answers')->cascadeOnDelete();
            $table->foreignId('quiz_attempt_id')->constrained('quiz_attempts')->cascadeOnDelete();
            $table->foreignId('quiz_question_id')->constrained('quiz_questions')->cascadeOnDelete();
            $table->foreignId('left_quiz_matching_pair_id')
                ->nullable()
                ->constrained('quiz_matching_pairs', 'id', 'qamp_left_pair_fk')
                ->nullOnDelete();
            $table->foreignId('selected_right_quiz_matching_pair_id')
                ->nullable()
                ->constrained('quiz_matching_pairs', 'id', 'qamp_right_pair_fk')
                ->nullOnDelete();
            $table->boolean('is_correct')->default(false);
            $table->integer('awarded_points')->default(0);
            $table->timestamp('answered_at')->nullable();
            $table->timestamps();

            $table->unique(['quiz_attempt_id', 'left_quiz_matching_pair_id'], 'qamp_attempt_left_unique');
            $table->unique(
                ['quiz_attempt_id', 'quiz_question_id', 'selected_right_quiz_matching_pair_id'],
                'qamp_attempt_question_right_unique'
            );
            $table->index(['quiz_answer_id']);
            $table->index(['quiz_question_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quiz_answer_matching_pairs');
    }
};
