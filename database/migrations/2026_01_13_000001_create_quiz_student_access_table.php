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
        Schema::create('quiz_student_access', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quiz_id')->constrained('quizzes')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->timestamp('granted_at')->useCurrent();
            $table->foreignId('granted_by')->nullable()->constrained('users')->onDelete('set null'); // guru/admin yang memberi akses
            $table->timestamp('accessed_at')->nullable(); // kapan siswa pertama kali akses quiz
            $table->integer('attempt_count')->default(0); // berapa kali siswa sudah mengerjakan
            $table->timestamps();

            // Pastikan satu siswa tidak memiliki duplikat akses ke quiz yang sama
            $table->unique(['quiz_id', 'user_id']);
            
            // Index untuk performa query
            $table->index(['quiz_id']);
            $table->index(['user_id']);
            $table->index(['granted_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quiz_student_access');
    }
};
