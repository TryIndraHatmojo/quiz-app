<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quiz_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quiz_id')->constrained('quizzes')->cascadeOnDelete();
            $table->enum('question_type', ['multiple_choice', 'long_answer', 'short_answer', 'matching_pairs', 'true_false'])->default('multiple_choice');
            $table->text('question_text');
            $table->string('media_path')->nullable(); // path gambar/audio/video
            $table->integer('time_limit')->default(30); // detik
            $table->integer('points')->default(100);
            $table->smallInteger('order')->default(0);
            $table->timestamps();
            $table->index(['quiz_id', 'order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quiz_questions');
    }
};
