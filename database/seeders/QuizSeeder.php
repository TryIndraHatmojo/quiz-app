<?php

namespace Database\Seeders;

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
        // Get category IDs
        $mathCategoryId = DB::table('quiz_categories')->where('slug', 'mathematics')->value('id');
        $scienceCategoryId = DB::table('quiz_categories')->where('slug', 'science')->value('id');
        $englishCategoryId = DB::table('quiz_categories')->where('slug', 'english')->value('id');
        $arabicCategoryId = DB::table('quiz_categories')->where('slug', 'bahasa-arab')->value('id');

        $quizzes = [
            [
                'user_id' => 1,
                'quiz_category_id' => $mathCategoryId,
                'jenjang_id' => 3, // SMP
                'kelas_id' => 8, // 7A
                'title' => 'Matematika Dasar Kelas 7',
                'slug' => Str::slug('Matematika Dasar Kelas 7') . '-' . Str::random(6),
                'join_code' => 'MATH001',
                'description' => 'Quiz matematika untuk siswa kelas 7 mencakup aljabar dasar dan geometri',
                'status' => 'live',
                'time_mode' => 'per_question',
                'duration' => 30,
                'starts_at' => now()->subDays(7),
                'ends_at' => now()->addDays(7),
                'passing_score' => 70,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => 1,
                'quiz_category_id' => $scienceCategoryId,
                'jenjang_id' => 1, // SMK
                'kelas_id' => 1, // X Farmasi 1
                'title' => 'Sains dan Biologi',
                'slug' => Str::slug('Sains dan Biologi') . '-' . Str::random(6),
                'join_code' => 'SCI002',
                'description' => 'Quiz tentang sistem tubuh manusia dan ekosistem',
                'status' => 'live',
                'time_mode' => 'total',
                'duration' => 15,
                'starts_at' => now()->subDays(3),
                'ends_at' => now()->addDays(14),
                'passing_score' => 75,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => 1,
                'quiz_category_id' => $englishCategoryId,
                'jenjang_id' => 2, // SMA
                'kelas_id' => 5, // X MIPA 1
                'title' => 'English Grammar Test',
                'slug' => Str::slug('English Grammar Test') . '-' . Str::random(6),
                'join_code' => 'ENG003',
                'description' => 'Test your knowledge of English grammar and vocabulary',
                'status' => 'draft',
                'time_mode' => 'per_question',
                'duration' => 45,
                'starts_at' => now()->addDays(5),
                'ends_at' => now()->addDays(20),
                'passing_score' => 65,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => 1,
                'quiz_category_id' => $arabicCategoryId,
                'jenjang_id' => null,
                'kelas_id' => null,
                'title' => 'Bahasa Arab Tingkat Pemula',
                'slug' => Str::slug('Bahasa Arab Tingkat Pemula') . '-' . Str::random(6),
                'join_code' => 'ARB004',
                'description' => 'Quiz bahasa Arab untuk pemula mencakup kosakata dan tata bahasa dasar',
                'status' => 'live',
                'time_mode' => 'per_question',
                'duration' => 40,
                'starts_at' => now()->subDays(14),
                'ends_at' => now()->subDays(1),
                'passing_score' => 60,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => 1,
                'quiz_category_id' => $mathCategoryId,
                'jenjang_id' => 3, // SMP
                'kelas_id' => 10, // 9A
                'title' => 'Aljabar Lanjutan',
                'slug' => Str::slug('Aljabar Lanjutan') . '-' . Str::random(6),
                'join_code' => 'MATH005',
                'description' => 'Quiz aljabar lanjutan untuk siswa kelas 9',
                'status' => 'draft',
                'time_mode' => 'total',
                'duration' => 30,
                'starts_at' => null,
                'ends_at' => null,
                'passing_score' => 70,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('quizzes')->insert($quizzes);
    }
}
