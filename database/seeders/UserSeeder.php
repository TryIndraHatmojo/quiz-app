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
            [
                'name' => 'Admin Sistem',
                'email' => 'admin@example.com',
                'password' => Hash::make('password'),
                'jenjang_id' => $smkId,
                'kelas_id' => $kelasXFarmasi1Id,
                'role_slug' => 'admin',
            ],
            [
                'name' => 'Budi Santoso',
                'email' => 'budi.telaah@example.com',
                'password' => Hash::make('password'),
                'jenjang_id' => $smaId,
                'kelas_id' => $kelasXIMipa1Id,
                'role_slug' => 'guru-telaah-soal',
            ],
            [
                'name' => 'Siti Nurhaliza',
                'email' => 'siti.telaah@example.com',
                'password' => Hash::make('password'),
                'jenjang_id' => $smaId,
                'kelas_id' => $kelasXIIIps1Id,
                'role_slug' => 'guru-telaah-soal',
            ],
            [
                'name' => 'Ahmad Hidayat',
                'email' => 'ahmad.guru@example.com',
                'password' => Hash::make('password'),
                'jenjang_id' => $smkId,
                'kelas_id' => $kelasXFarmasi1Id,
                'role_slug' => 'guru-mata-pelajaran',
            ],
            [
                'name' => 'Dewi Lestari',
                'email' => 'dewi.guru@example.com',
                'password' => Hash::make('password'),
                'jenjang_id' => $smkId,
                'kelas_id' => $kelasXFarmasi2Id,
                'role_slug' => 'guru-mata-pelajaran',
            ],
            [
                'name' => 'Rina Wijaya',
                'email' => 'rina.guru@example.com',
                'password' => Hash::make('password'),
                'jenjang_id' => $smpId,
                'kelas_id' => $kelas9AId,
                'role_slug' => 'guru-mata-pelajaran',
            ],
            [
                'name' => 'Andi Pratama',
                'email' => 'andi.siswa@example.com',
                'nomor_induk_siswa' => 'SISWA-001',
                'password' => Hash::make('password'),
                'jenjang_id' => $smkId,
                'kelas_id' => $kelasXFarmasi1Id,
                'role_slug' => 'siswa',
            ],
            [
                'name' => 'Lina Marlina',
                'email' => 'lina.siswa@example.com',
                'nomor_induk_siswa' => 'SISWA-002',
                'password' => Hash::make('password'),
                'jenjang_id' => $smaId,
                'kelas_id' => $kelasXIIIps1Id,
                'role_slug' => 'siswa',
            ],
            [
                'name' => 'Rudi Hermawan',
                'email' => 'rudi.siswa@example.com',
                'nomor_induk_siswa' => 'SISWA-003',
                'password' => Hash::make('password'),
                'jenjang_id' => $smpId,
                'kelas_id' => $kelas7AId,
                'role_slug' => 'siswa',
            ],
            [
                'name' => 'Maya Sari',
                'email' => 'maya.siswa@example.com',
                'nomor_induk_siswa' => 'SISWA-004',
                'password' => Hash::make('password'),
                'jenjang_id' => $smpId,
                'kelas_id' => $kelas8AId,
                'role_slug' => 'siswa',
            ],
            [
                'name' => 'Doni Setiawan',
                'email' => 'doni.siswa@example.com',
                'nomor_induk_siswa' => 'SISWA-005',
                'password' => Hash::make('password'),
                'jenjang_id' => $smpId,
                'kelas_id' => $kelas9AId,
                'role_slug' => 'siswa',
            ],
            [
                'name' => 'Bapak Andi (Orang Tua)',
                'email' => 'ortu.andi@example.com',
                'password' => Hash::make('password'),
                'jenjang_id' => $smkId,
                'kelas_id' => $kelasXFarmasi1Id,
                'role_slug' => 'orang-tua',
            ],
            [
                'name' => 'Ibu Lina (Orang Tua)',
                'email' => 'ortu.lina@example.com',
                'password' => Hash::make('password'),
                'jenjang_id' => $smaId,
                'kelas_id' => $kelasXIIIps1Id,
                'role_slug' => 'orang-tua',
            ],
            [
                'name' => 'Tara Guru Tamu',
                'email' => 'tamu.guru@example.com',
                'password' => Hash::make('password'),
                'jenjang_id' => $smpId,
                'kelas_id' => $kelas7AId,
                'role_slug' => 'guru-tamu',
            ],
            [
                'name' => 'Nadia Siswa Tamu',
                'email' => 'tamu.siswa@example.com',
                'nomor_induk_siswa' => 'TAMU-SISWA-001',
                'password' => Hash::make('password'),
                'jenjang_id' => $smpId,
                'kelas_id' => $kelas7AId,
                'role_slug' => 'siswa-tamu',
            ],
        ];

        foreach ($users as $user) {
            $roleSlug = $user['role_slug'];
            unset($user['role_slug']);

            $user = array_merge([
                'orang_tua_id' => null,
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ], $user);

            DB::table('users')->updateOrInsert(
                ['email' => $user['email']],
                $user
            );

            $userId = DB::table('users')->where('email', $user['email'])->value('id');
            $roleId = DB::table('roles')->where('slug', $roleSlug)->value('id');

            if ($userId && $roleId) {
                DB::table('role_user')->updateOrInsert(
                    [
                        'role_id' => $roleId,
                        'user_id' => $userId,
                    ],
                    [
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]
                );
            }
        }

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
