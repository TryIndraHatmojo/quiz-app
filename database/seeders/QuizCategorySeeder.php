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
                'name' => 'Mathematics',
                'slug' => 'mathematics',
                'description' => 'Math quizzes and assessments',
            ],
            [
                'name' => 'Science',
                'slug' => 'science',
                'description' => 'Science quizzes covering physics, chemistry, and biology',
            ],
            [
                'name' => 'English',
                'slug' => 'english',
                'description' => 'English language and literature quizzes',
            ],
            [
                'name' => 'History',
                'slug' => 'history',
                'description' => 'Historical events and facts',
            ],
            [
                'name' => 'General Knowledge',
                'slug' => 'general-knowledge',
                'description' => 'General knowledge and trivia',
            ],
        ];

        foreach ($categories as $category) {
            QuizCategory::create($category);
        }
    }
}
