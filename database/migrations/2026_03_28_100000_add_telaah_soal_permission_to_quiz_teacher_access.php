<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Update the enum column to include 'telaah_soal'
        DB::statement("ALTER TABLE quiz_teacher_access MODIFY COLUMN permission ENUM('view', 'edit', 'telaah_soal') NOT NULL DEFAULT 'edit'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove entries with 'telaah_soal' first to avoid data loss
        DB::table('quiz_teacher_access')->where('permission', 'telaah_soal')->delete();
        DB::statement("ALTER TABLE quiz_teacher_access MODIFY COLUMN permission ENUM('view', 'edit') NOT NULL DEFAULT 'edit'");
    }
};
