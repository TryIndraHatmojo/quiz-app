<?php

namespace Database\Seeders;

use App\Models\QuizCategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class QuizCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Matematika',
                'slug' => 'Matematika',
                'description' => 'Kuis dan penilaian matematika',
            ],
            [
                'name' => 'Ilmu Pengetahuan Alam',
                'slug' => 'Ilmu Pengetahuan Alam',
                'description' => 'Kuis IPA mencakup fisika, kimia, dan biologi',
            ],
            [
                'name' => 'Bahasa Inggris',
                'slug' => 'Bahasa Inggris',
                'description' => 'Kuis bahasa dan sastra Inggris',
            ],
            [
                'name' => 'Sejarah',
                'slug' => 'Sejarah',
                'description' => 'Kejadian dan fakta sejarah',
            ],
            [
                'name' => 'Pengetahuan Umum',
                'slug' => 'general-knowledge',
                'description' => 'Pengetahuan umum dan trivia',
            ],
        ];

        foreach ($categories as $category) {
            QuizCategory::create($category);
        }
    }
}
