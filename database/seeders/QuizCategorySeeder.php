<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class QuizCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Mathematics',
                'slug' => 'mathematics',
                'description' => 'Kategori untuk quiz matematika',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Science',
                'slug' => 'science',
                'description' => 'Kategori untuk quiz sains dan IPA',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'History',
                'slug' => 'history',
                'description' => 'Kategori untuk quiz sejarah',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'English',
                'slug' => 'english',
                'description' => 'Kategori untuk quiz bahasa Inggris',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Bahasa Arab',
                'slug' => 'bahasa-arab',
                'description' => 'Kategori untuk quiz bahasa Arab',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('quiz_categories')->insert($categories);
    }
}
