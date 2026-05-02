<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('quizzes', function (Blueprint $table) {
            // Add duration column for total quiz time (in minutes)
            $table->integer('duration')->nullable()->after('status');
            
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
            $table->dropColumn(['duration']);
        });
    }
};
