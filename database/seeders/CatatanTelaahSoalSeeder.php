<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CatatanTelaahSoalSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Cari user "Guru Telaah Soal" (Budi Santoso & Siti Nurhaliza)
        $budiId = DB::table('users')->where('email', 'budi.telaah@example.com')->value('id');
        $sitiId = DB::table('users')->where('email', 'siti.telaah@example.com')->value('id');

        if (!$budiId || !$sitiId) {
            return;
        }

        // Ambil quiz pertama yang dimiliki admin (quiz_id = 1 / Matematika Dasar Kelas 7)
        $quiz = DB::table('quizzes')->first();
        if (!$quiz) {
            return;
        }

        // Berikan akses telaah_soal ke Budi untuk quiz pertama
        DB::table('quiz_teacher_access')->updateOrInsert(
            ['quiz_id' => $quiz->id, 'user_id' => $budiId],
            [
                'permission' => 'telaah_soal',
                'granted_by' => 1, // admin
                'granted_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        // Berikan akses telaah_soal ke Siti untuk quiz pertama
        DB::table('quiz_teacher_access')->updateOrInsert(
            ['quiz_id' => $quiz->id, 'user_id' => $sitiId],
            [
                'permission' => 'telaah_soal',
                'granted_by' => 1, // admin
                'granted_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        // Ambil beberapa pertanyaan dari quiz pertama
        $questions = DB::table('quiz_questions')
            ->where('quiz_id', $quiz->id)
            ->orderBy('order')
            ->limit(3)
            ->get();

        if ($questions->isEmpty()) {
            return;
        }

        $catatanData = [
            [
                'catatan' => 'Soal ini perlu diperjelas. Kata "tentukan" sebaiknya diganti dengan "hitunglah" agar lebih spesifik dan sesuai tingkat kesulitan siswa kelas 7.',
                'status' => 'butuh_review',
            ],
            [
                'catatan' => 'Pilihan jawaban C dan D terlalu mirip, sehingga berpotensi membingungkan siswa. Mohon dibedakan lebih jelas.',
                'status' => 'butuh_review',
            ],
            [
                'catatan' => 'Tingkat kesulitan soal ini sudah baik dan sesuai dengan kompetensi dasar yang ditargetkan. Tidak ada revisi yang diperlukan.',
                'status' => 'selesai',
            ],
        ];

        foreach ($questions as $index => $question) {
            if (isset($catatanData[$index])) {
                $reviewer = $index % 2 === 0 ? $budiId : $sitiId;
                DB::table('catatan_telaah_soals')->insert([
                    'quiz_question_id' => $question->id,
                    'user_id' => $reviewer,
                    'catatan' => $catatanData[$index]['catatan'],
                    'status' => $catatanData[$index]['status'],
                    'created_at' => now()->subHours(rand(1, 48)),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}
