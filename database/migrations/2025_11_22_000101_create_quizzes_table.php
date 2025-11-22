<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quizzes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete(); // pembuat
            $table->foreignId('quiz_category_id')->nullable()->constrained('quiz_categories')->nullOnDelete();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('join_code', 12)->unique(); // kode untuk bergabung mirip kahoot pin
            $table->text('description')->nullable();
            $table->string('status')->default('draft'); // draft|live|finished|archived
            $table->boolean('is_public')->default(false);
            $table->integer('time_per_question')->nullable(); // override default
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->json('settings')->nullable(); // konfigurasi tambahan (random_order, show_rank, dsb)
            $table->timestamps();
            $table->index(['status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quizzes');
    }
};
