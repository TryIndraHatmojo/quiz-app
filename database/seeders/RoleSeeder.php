<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            [
                'name' => 'Admin',
                'slug' => 'admin',
                'guard_name' => 'web',
                'description' => 'Administrator dengan akses penuh ke seluruh sistem',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Guru Telaah Soal',
                'slug' => 'guru-telaah-soal',
                'guard_name' => 'web',
                'description' => 'Guru yang bertugas menelaah dan memverifikasi soal-soal quiz',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Guru Mata Pelajaran',
                'slug' => 'guru-mata-pelajaran',
                'guard_name' => 'web',
                'description' => 'Guru yang dapat membuat dan mengelola quiz untuk mata pelajaran',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Siswa',
                'slug' => 'siswa',
                'guard_name' => 'web',
                'description' => 'Siswa yang dapat mengikuti quiz',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Orang Tua',
                'slug' => 'orang-tua',
                'guard_name' => 'web',
                'description' => 'Orang tua yang dapat melihat hasil quiz anaknya',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('roles')->insert($roles);
    }
}
