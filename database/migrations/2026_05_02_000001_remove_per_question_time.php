<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Remove time_limit from quiz_questions (no longer per-question timer)
        if (Schema::hasColumn('quiz_questions', 'time_limit')) {
            Schema::table('quiz_questions', function (Blueprint $table) {
                $table->dropColumn('time_limit');
            });
        }

        // Remove time_mode and time_per_question from quizzes, keep only duration (total minutes)
        Schema::table('quizzes', function (Blueprint $table) {
            if (Schema::hasColumn('quizzes', 'time_mode')) {
                $table->dropColumn('time_mode');
            }
            if (Schema::hasColumn('quizzes', 'time_per_question')) {
                $table->dropColumn('time_per_question');
            }
        });
    }

    public function down(): void
    {
        Schema::table('quiz_questions', function (Blueprint $table) {
            $table->integer('time_limit')->default(30)->after('media_path');
        });

        Schema::table('quizzes', function (Blueprint $table) {
            $table->string('time_mode')->default('per_question')->after('status');
        });
    }
};
