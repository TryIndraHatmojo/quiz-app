<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('quiz_attempts', function (Blueprint $table) {
            $table->unsignedInteger('attempt_number')->default(1)->after('user_id');
            $table->boolean('is_graded')->default(false)->after('duration_seconds');
        });

        // Mark existing completed attempts as graded (first attempt per user+quiz)
        $completedAttempts = DB::table('quiz_attempts')
            ->whereNotNull('completed_at')
            ->orderBy('completed_at', 'asc')
            ->get();

        $gradedPairs = [];
        foreach ($completedAttempts as $attempt) {
            $key = $attempt->quiz_id . '-' . $attempt->user_id;
            if (!isset($gradedPairs[$key])) {
                $gradedPairs[$key] = true;
                DB::table('quiz_attempts')
                    ->where('id', $attempt->id)
                    ->update(['is_graded' => true, 'attempt_number' => 1]);
            }
        }

        // Set attempt_number for all attempts per user+quiz
        $allAttempts = DB::table('quiz_attempts')
            ->orderBy('created_at', 'asc')
            ->get()
            ->groupBy(function ($item) {
                return $item->quiz_id . '-' . $item->user_id;
            });

        foreach ($allAttempts as $group) {
            $number = 1;
            foreach ($group as $attempt) {
                DB::table('quiz_attempts')
                    ->where('id', $attempt->id)
                    ->update(['attempt_number' => $number]);
                $number++;
            }
        }
    }

    public function down(): void
    {
        Schema::table('quiz_attempts', function (Blueprint $table) {
            $table->dropColumn(['attempt_number', 'is_graded']);
        });
    }
};
