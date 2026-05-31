<?php

namespace Database\Seeders;

use App\Models\Quiz;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class QuizSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $mathCategoryId = DB::table('quiz_categories')->where('slug', 'mathematics')->value('id');
        $scienceCategoryId = DB::table('quiz_categories')->where('slug', 'science')->value('id');
        $englishCategoryId = DB::table('quiz_categories')->where('slug', 'english')->value('id');
        $arabicCategoryId = DB::table('quiz_categories')->where('slug', 'bahasa-arab')->value('id');

        $adminId = DB::table('users')->where('email', 'admin@example.com')->value('id') ?? 1;
        $guestTeacherId = DB::table('users')->where('email', 'tamu.guru@example.com')->value('id') ?? $adminId;
        $guestStudentId = DB::table('users')->where('email', 'tamu.siswa@example.com')->value('id');

        $smkId = DB::table('jenjangs')->where('jenjang', 'SMK')->value('id');
        $smaId = DB::table('jenjangs')->where('jenjang', 'SMA')->value('id');
        $smpId = DB::table('jenjangs')->where('jenjang', 'SMP')->value('id');

        $kelasXFarmasi1Id = DB::table('kelas')->where('nama_kelas', 'X Farmasi 1')->value('id');
        $kelasXMipa1Id = DB::table('kelas')->where('nama_kelas', 'X MIPA 1')->value('id');
        $kelas7AId = DB::table('kelas')->where('nama_kelas', '7A')->value('id');
        $kelas9AId = DB::table('kelas')->where('nama_kelas', '9A')->value('id');

        $quizzes = [
            [
                'user_id' => $adminId,
                'quiz_category_id' => $mathCategoryId,
                'jenjang_id' => $smpId,
                'kelas_id' => $kelas7AId,
                'title' => 'Matematika Dasar Kelas 7',
                'slug' => Str::slug('Matematika Dasar Kelas 7').'-'.Str::random(6),
                'join_code' => 'MATH001',
                'description' => 'Quiz matematika untuk siswa kelas 7 mencakup aljabar dasar dan geometri',
                'status' => 'live',
                'audience' => Quiz::AUDIENCE_REGULAR,
                'duration' => 30,
                'starts_at' => now()->subDays(7),
                'ends_at' => now()->addDays(7),
                'passing_score' => 70,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => $adminId,
                'quiz_category_id' => $scienceCategoryId,
                'jenjang_id' => $smkId,
                'kelas_id' => $kelasXFarmasi1Id,
                'title' => 'Sains dan Biologi',
                'slug' => Str::slug('Sains dan Biologi').'-'.Str::random(6),
                'join_code' => 'SCI002',
                'description' => 'Quiz tentang sistem tubuh manusia dan ekosistem',
                'status' => 'live',
                'audience' => Quiz::AUDIENCE_REGULAR,
                'duration' => 15,
                'starts_at' => now()->subDays(3),
                'ends_at' => now()->addDays(14),
                'passing_score' => 75,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => $adminId,
                'quiz_category_id' => $englishCategoryId,
                'jenjang_id' => $smaId,
                'kelas_id' => $kelasXMipa1Id,
                'title' => 'English Grammar Test',
                'slug' => Str::slug('English Grammar Test').'-'.Str::random(6),
                'join_code' => 'ENG003',
                'description' => 'Test your knowledge of English grammar and vocabulary',
                'status' => 'draft',
                'audience' => Quiz::AUDIENCE_REGULAR,
                'duration' => 45,
                'starts_at' => now()->addDays(5),
                'ends_at' => now()->addDays(20),
                'passing_score' => 65,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => $adminId,
                'quiz_category_id' => $arabicCategoryId,
                'jenjang_id' => null,
                'kelas_id' => null,
                'title' => 'Bahasa Arab Tingkat Pemula',
                'slug' => Str::slug('Bahasa Arab Tingkat Pemula').'-'.Str::random(6),
                'join_code' => 'ARB004',
                'description' => 'Quiz bahasa Arab untuk pemula mencakup kosakata dan tata bahasa dasar',
                'status' => 'live',
                'audience' => Quiz::AUDIENCE_REGULAR,
                'duration' => 40,
                'starts_at' => now()->subDays(14),
                'ends_at' => now()->subDays(1),
                'passing_score' => 60,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => $adminId,
                'quiz_category_id' => $mathCategoryId,
                'jenjang_id' => $smpId,
                'kelas_id' => $kelas9AId,
                'title' => 'Aljabar Lanjutan',
                'slug' => Str::slug('Aljabar Lanjutan').'-'.Str::random(6),
                'join_code' => 'MATH005',
                'description' => 'Quiz aljabar lanjutan untuk siswa kelas 9',
                'status' => 'draft',
                'audience' => Quiz::AUDIENCE_REGULAR,
                'duration' => 30,
                'starts_at' => null,
                'ends_at' => null,
                'passing_score' => 70,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => $guestTeacherId,
                'quiz_category_id' => $mathCategoryId,
                'jenjang_id' => $smpId,
                'kelas_id' => $kelas7AId,
                'title' => 'Latihan Tamu Matematika',
                'slug' => Str::slug('Latihan Tamu Matematika').'-'.Str::random(6),
                'join_code' => 'GST001',
                'description' => 'Kuis contoh khusus siswa tamu.',
                'status' => 'live',
                'audience' => Quiz::AUDIENCE_GUEST,
                'duration' => 20,
                'starts_at' => now()->subDay(),
                'ends_at' => now()->addDays(14),
                'passing_score' => 70,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($quizzes as $quiz) {
            DB::table('quizzes')->updateOrInsert(
                ['join_code' => $quiz['join_code']],
                $quiz
            );
        }

        $guestQuizId = DB::table('quizzes')->where('join_code', 'GST001')->value('id');
        if ($guestQuizId && $guestStudentId) {
            DB::table('quiz_student_access')->updateOrInsert(
                [
                    'quiz_id' => $guestQuizId,
                    'user_id' => $guestStudentId,
                ],
                [
                    'granted_by' => $guestTeacherId,
                    'granted_at' => now(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }
    }
}
