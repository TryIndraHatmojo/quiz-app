<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Jenjang;

class KelasSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $smk = Jenjang::where('jenjang', 'SMK')->first();
        $sma = Jenjang::where('jenjang', 'SMA')->first();
        $smp = Jenjang::where('jenjang', 'SMP')->first();

        $kelasList = [];

        if ($smk) {
            $kelasList = array_merge($kelasList, [
                ['jenjang_id' => $smk->id, 'nama_kelas' => 'X Farmasi 1', 'created_at' => now(), 'updated_at' => now()],
                ['jenjang_id' => $smk->id, 'nama_kelas' => 'X Farmasi 2', 'created_at' => now(), 'updated_at' => now()],
                ['jenjang_id' => $smk->id, 'nama_kelas' => 'XI Farmasi 1', 'created_at' => now(), 'updated_at' => now()],
                ['jenjang_id' => $smk->id, 'nama_kelas' => 'XII Farmasi 1', 'created_at' => now(), 'updated_at' => now()],
            ]);
        }

        if ($sma) {
            $kelasList = array_merge($kelasList, [
                ['jenjang_id' => $sma->id, 'nama_kelas' => 'X MIPA 1', 'created_at' => now(), 'updated_at' => now()],
                ['jenjang_id' => $sma->id, 'nama_kelas' => 'XI MIPA 1', 'created_at' => now(), 'updated_at' => now()],
                ['jenjang_id' => $sma->id, 'nama_kelas' => 'XII IPS 1', 'created_at' => now(), 'updated_at' => now()],
            ]);
        }

        if ($smp) {
            $kelasList = array_merge($kelasList, [
                ['jenjang_id' => $smp->id, 'nama_kelas' => '7A', 'created_at' => now(), 'updated_at' => now()],
                ['jenjang_id' => $smp->id, 'nama_kelas' => '8A', 'created_at' => now(), 'updated_at' => now()],
                ['jenjang_id' => $smp->id, 'nama_kelas' => '9A', 'created_at' => now(), 'updated_at' => now()],
            ]);
        }

        DB::table('kelas')->insert($kelasList);
    }
}
