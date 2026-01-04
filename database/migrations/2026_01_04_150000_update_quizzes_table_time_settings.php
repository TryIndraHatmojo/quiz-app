<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('quizzes', function (Blueprint $table) {
            // Add new time mode columns
            $table->enum('time_mode', ['per_question', 'total'])->default('per_question')->after('status');
            $table->integer('duration')->nullable()->after('time_mode'); // Duration in minutes (for total mode) or seconds per question (for per_question mode)
            
            // Drop unused columns
            $table->dropColumn(['is_public', 'time_per_question', 'starts_at', 'ends_at', 'settings']);
        });
    }

    public function down(): void
    {
        Schema::table('quizzes', function (Blueprint $table) {
            // Restore removed columns
            $table->boolean('is_public')->default(false);
            $table->integer('time_per_question')->nullable();
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->json('settings')->nullable();
            
            // Remove new columns
            $table->dropColumn(['time_mode', 'duration']);
        });
    }
};
