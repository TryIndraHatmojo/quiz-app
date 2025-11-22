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
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // Nama peran, misal: Admin, Guru, Siswa
            $table->string('slug')->unique(); // Slug yang konsisten untuk internal, misal: admin, teacher, student
            $table->string('guard_name')->default('web'); // Untuk kompatibilitas jika pakai multi guard / paket role
            $table->text('description')->nullable(); // Deskripsi peran (opsional)
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('roles');
    }
};
