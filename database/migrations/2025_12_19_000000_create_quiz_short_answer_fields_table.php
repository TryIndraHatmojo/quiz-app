<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quiz_short_answer_fields', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quiz_question_id')->constrained('quiz_questions')->cascadeOnDelete();
            $table->text('label')->nullable(); // label untuk input field (opsional)
            $table->text('placeholder')->nullable(); // placeholder text
            $table->integer('character_limit')->nullable(); // batas karakter input
            $table->text('expected_answer'); // jawaban yang diharapkan
            $table->boolean('case_sensitive')->default(false); // apakah case sensitive
            $table->boolean('trim_whitespace')->default(true); // hapus spasi di awal/akhir
            $table->smallInteger('order')->default(0); // urutan field
            $table->timestamps();
            $table->index(['quiz_question_id', 'order']);
            $table->unique(['quiz_question_id', 'order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quiz_short_answer_fields');
    }
};
