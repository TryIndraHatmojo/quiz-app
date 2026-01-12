<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class JenjangSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $jenjangs = [
            [
                'jenjang' => 'SMK',
                'nama_sekolah' => 'SMK Farmasi Surabaya',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'jenjang' => 'SMA',
                'nama_sekolah' => 'SMA Al Falah Ketintang Surabaya',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'jenjang' => 'SMP',
                'nama_sekolah' => 'SMP Al Falah Ketintang Surabaya',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'jenjang' => 'Akademi',
                'nama_sekolah' => 'Akademi Farmasi Surabaya',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('jenjangs')->insert($jenjangs);
    }
}
