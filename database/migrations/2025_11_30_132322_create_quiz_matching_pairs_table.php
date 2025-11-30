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
        Schema::create('quiz_matching_pairs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quiz_question_id')->constrained('quiz_questions')->cascadeOnDelete();
            $table->text('left_text'); // Item on the left side
            $table->text('right_text'); // Item on the right side that matches
            $table->string('left_media_path')->nullable(); // Optional image for left item
            $table->string('right_media_path')->nullable(); // Optional image for right item
            $table->smallInteger('order')->default(0); // Display order
            $table->timestamps();
            $table->index(['quiz_question_id', 'order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quiz_matching_pairs');
    }
};
