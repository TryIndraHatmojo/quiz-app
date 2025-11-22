<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = [
            // Admin
            [
                'name' => 'Admin System',
                'email' => 'admin@example.com',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Guru Telaah Soal
            [
                'name' => 'Budi Santoso',
                'email' => 'budi.telaah@example.com',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Siti Nurhaliza',
                'email' => 'siti.telaah@example.com',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Guru Mata Pelajaran
            [
                'name' => 'Ahmad Hidayat',
                'email' => 'ahmad.guru@example.com',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Dewi Lestari',
                'email' => 'dewi.guru@example.com',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Rina Wijaya',
                'email' => 'rina.guru@example.com',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Siswa
            [
                'name' => 'Andi Pratama',
                'email' => 'andi.siswa@example.com',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Lina Marlina',
                'email' => 'lina.siswa@example.com',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Rudi Hermawan',
                'email' => 'rudi.siswa@example.com',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Maya Sari',
                'email' => 'maya.siswa@example.com',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Doni Setiawan',
                'email' => 'doni.siswa@example.com',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Orang Tua
            [
                'name' => 'Bapak Andi (Orang Tua)',
                'email' => 'ortu.andi@example.com',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Ibu Lina (Orang Tua)',
                'email' => 'ortu.lina@example.com',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($users as $index => $user) {
            $userId = DB::table('users')->insertGetId($user);
            
            // Assign roles
            $roleId = null;
            if ($index === 0) {
                // Admin
                $roleId = DB::table('roles')->where('slug', 'admin')->value('id');
            } elseif ($index >= 1 && $index <= 2) {
                // Guru Telaah Soal
                $roleId = DB::table('roles')->where('slug', 'guru-telaah-soal')->value('id');
            } elseif ($index >= 3 && $index <= 5) {
                // Guru Mata Pelajaran
                $roleId = DB::table('roles')->where('slug', 'guru-mata-pelajaran')->value('id');
            } elseif ($index >= 6 && $index <= 10) {
                // Siswa
                $roleId = DB::table('roles')->where('slug', 'siswa')->value('id');
            } else {
                // Orang Tua
                $roleId = DB::table('roles')->where('slug', 'orang-tua')->value('id');
            }
            
            if ($roleId) {
                DB::table('role_user')->insert([
                    'role_id' => $roleId,
                    'user_id' => $userId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}
