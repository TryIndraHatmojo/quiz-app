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
        // Get guru mata pelajaran users
        $guruIds = DB::table('users')
            ->join('role_user', 'users.id', '=', 'role_user.user_id')
            ->join('roles', 'role_user.role_id', '=', 'roles.id')
            ->where('roles.slug', 'guru-mata-pelajaran')
            ->pluck('users.id')
            ->toArray();

        // Get category IDs
        $mathCategoryId = DB::table('quiz_categories')->where('slug', 'mathematics')->value('id');
        $scienceCategoryId = DB::table('quiz_categories')->where('slug', 'science')->value('id');
        $englishCategoryId = DB::table('quiz_categories')->where('slug', 'english')->value('id');
        $arabicCategoryId = DB::table('quiz_categories')->where('slug', 'bahasa-arab')->value('id');

        $quizzes = [
            [
                'user_id' => $guruIds[0] ?? 1,
                'quiz_category_id' => $mathCategoryId,
                'title' => 'Matematika Dasar Kelas 7',
                'slug' => Str::slug('Matematika Dasar Kelas 7'),
                'join_code' => 'MATH001',
                'description' => 'Quiz matematika untuk siswa kelas 7 mencakup aljabar dasar dan geometri',
                'status' => 'live',
                'is_public' => true,
                'time_per_question' => 45,
                'starts_at' => now()->subDays(1),
                'ends_at' => now()->addDays(7),
                'settings' => json_encode(['random_order' => true, 'show_rank' => true]),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => $guruIds[1] ?? 1,
                'quiz_category_id' => $scienceCategoryId,
                'title' => 'Sains dan Biologi',
                'slug' => Str::slug('Sains dan Biologi'),
                'join_code' => 'SCI002',
                'description' => 'Quiz tentang sistem tubuh manusia dan ekosistem',
                'status' => 'live',
                'is_public' => true,
                'time_per_question' => 60,
                'starts_at' => now()->subDays(2),
                'ends_at' => now()->addDays(5),
                'settings' => json_encode(['random_order' => false, 'show_rank' => true]),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => $guruIds[0] ?? 1,
                'quiz_category_id' => $englishCategoryId,
                'title' => 'English Grammar Test',
                'slug' => Str::slug('English Grammar Test'),
                'join_code' => 'ENG003',
                'description' => 'Test your knowledge of English grammar and vocabulary',
                'status' => 'draft',
                'is_public' => false,
                'time_per_question' => 30,
                'starts_at' => null,
                'ends_at' => null,
                'settings' => json_encode(['random_order' => true, 'show_rank' => false]),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => $guruIds[2] ?? 1,
                'quiz_category_id' => $arabicCategoryId,
                'title' => 'Bahasa Arab Tingkat Pemula',
                'slug' => Str::slug('Bahasa Arab Tingkat Pemula'),
                'join_code' => 'ARB004',
                'description' => 'Quiz bahasa Arab untuk pemula mencakup kosakata dan tata bahasa dasar',
                'status' => 'live',
                'is_public' => true,
                'time_per_question' => 40,
                'starts_at' => now(),
                'ends_at' => now()->addDays(14),
                'settings' => json_encode(['random_order' => false, 'show_rank' => true]),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => $guruIds[1] ?? 1,
                'quiz_category_id' => $mathCategoryId,
                'title' => 'Aljabar Lanjutan',
                'slug' => Str::slug('Aljabar Lanjutan'),
                'join_code' => 'MATH005',
                'description' => 'Quiz aljabar lanjutan untuk siswa kelas 9',
                'status' => 'draft',
                'is_public' => false,
                'time_per_question' => 60,
                'starts_at' => null,
                'ends_at' => null,
                'settings' => json_encode(['random_order' => true, 'show_rank' => true]),
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('quizzes')->insert($quizzes);
    }
}
