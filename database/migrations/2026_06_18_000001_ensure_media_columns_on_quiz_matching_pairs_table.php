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
        if (! Schema::hasTable('quiz_matching_pairs')) {
            return;
        }

        if (! Schema::hasColumn('quiz_matching_pairs', 'left_media_path')) {
            Schema::table('quiz_matching_pairs', function (Blueprint $table) {
                $table->string('left_media_path')->nullable()->after('right_text');
            });
        }

        if (! Schema::hasColumn('quiz_matching_pairs', 'right_media_path')) {
            Schema::table('quiz_matching_pairs', function (Blueprint $table) {
                $afterColumn = Schema::hasColumn('quiz_matching_pairs', 'left_media_path')
                    ? 'left_media_path'
                    : 'right_text';

                $table->string('right_media_path')->nullable()->after($afterColumn);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Fresh installs already get these columns from the original table migration.
    }
};
