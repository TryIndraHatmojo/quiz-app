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
        Schema::table('quiz_answers', function (Blueprint $table) {
            $table->foreignId('quiz_matching_pair_id')
                ->nullable()
                ->after('quiz_question_option_id')
                ->constrained('quiz_matching_pairs')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('quiz_answers', function (Blueprint $table) {
            $table->dropForeign(['quiz_matching_pair_id']);
            $table->dropColumn('quiz_matching_pair_id');
        });
    }
};
