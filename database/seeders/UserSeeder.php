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
        $smkId = DB::table('jenjangs')->where('jenjang', 'SMK')->value('id');
        $smaId = DB::table('jenjangs')->where('jenjang', 'SMA')->value('id');
        $smpId = DB::table('jenjangs')->where('jenjang', 'SMP')->value('id');

        $kelasXFarmasi1Id = DB::table('kelas')->where('nama_kelas', 'X Farmasi 1')->value('id');
        $kelasXFarmasi2Id = DB::table('kelas')->where('nama_kelas', 'X Farmasi 2')->value('id');
        $kelasXIMipa1Id = DB::table('kelas')->where('nama_kelas', 'XI MIPA 1')->value('id');
        $kelasXIIIps1Id = DB::table('kelas')->where('nama_kelas', 'XII IPS 1')->value('id');
        $kelas7AId = DB::table('kelas')->where('nama_kelas', '7A')->value('id');
        $kelas8AId = DB::table('kelas')->where('nama_kelas', '8A')->value('id');
        $kelas9AId = DB::table('kelas')->where('nama_kelas', '9A')->value('id');

        $users = [
            // Admin
            [
                'name' => 'Admin Sistem',
                'email' => 'admin@example.com',
                'password' => Hash::make('password'),
                'jenjang_id' => $smkId,
                'kelas_id' => $kelasXFarmasi1Id,
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Guru Telaah Soal
            [
                'name' => 'Budi Santoso',
                'email' => 'budi.telaah@example.com',
                'password' => Hash::make('password'),
                'jenjang_id' => $smaId,
                'kelas_id' => $kelasXIMipa1Id,
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Siti Nurhaliza',
                'email' => 'siti.telaah@example.com',
                'password' => Hash::make('password'),
                'jenjang_id' => $smaId,
                'kelas_id' => $kelasXIIIps1Id,
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Guru Mata Pelajaran
            [
                'name' => 'Ahmad Hidayat',
                'email' => 'ahmad.guru@example.com',
                'password' => Hash::make('password'),
                'jenjang_id' => $smkId,
                'kelas_id' => $kelasXFarmasi1Id,
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Dewi Lestari',
                'email' => 'dewi.guru@example.com',
                'password' => Hash::make('password'),
                'jenjang_id' => $smkId,
                'kelas_id' => $kelasXFarmasi2Id,
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Rina Wijaya',
                'email' => 'rina.guru@example.com',
                'password' => Hash::make('password'),
                'jenjang_id' => $smpId,
                'kelas_id' => $kelas9AId,
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Siswa
            [
                'name' => 'Andi Pratama',
                'email' => 'andi.siswa@example.com',
                'password' => Hash::make('password'),
                'jenjang_id' => $smkId,
                'kelas_id' => $kelasXFarmasi1Id,
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Lina Marlina',
                'email' => 'lina.siswa@example.com',
                'password' => Hash::make('password'),
                'jenjang_id' => $smaId,
                'kelas_id' => $kelasXIIIps1Id,
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Rudi Hermawan',
                'email' => 'rudi.siswa@example.com',
                'password' => Hash::make('password'),
                'jenjang_id' => $smpId,
                'kelas_id' => $kelas7AId,
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Maya Sari',
                'email' => 'maya.siswa@example.com',
                'password' => Hash::make('password'),
                'jenjang_id' => $smpId,
                'kelas_id' => $kelas8AId,
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Doni Setiawan',
                'email' => 'doni.siswa@example.com',
                'password' => Hash::make('password'),
                'jenjang_id' => $smpId,
                'kelas_id' => $kelas9AId,
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Orang Tua
            [
                'name' => 'Bapak Andi (Orang Tua)',
                'email' => 'ortu.andi@example.com',
                'password' => Hash::make('password'),
                'jenjang_id' => $smkId,
                'kelas_id' => $kelasXFarmasi1Id,
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Ibu Lina (Orang Tua)',
                'email' => 'ortu.lina@example.com',
                'password' => Hash::make('password'),
                'jenjang_id' => $smaId,
                'kelas_id' => $kelasXIIIps1Id,
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

        // Hubungkan Siswa dengan Orang Tua
        $bapakAndi = DB::table('users')->where('email', 'ortu.andi@example.com')->first();
        if ($bapakAndi) {
            DB::table('users')->where('email', 'andi.siswa@example.com')->update(['orang_tua_id' => $bapakAndi->id]);
        }

        $ibuLina = DB::table('users')->where('email', 'ortu.lina@example.com')->first();
        if ($ibuLina) {
            DB::table('users')->where('email', 'lina.siswa@example.com')->update(['orang_tua_id' => $ibuLina->id]);
        }
    }
}
