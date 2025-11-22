<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Call seeders in dependency order
        $this->call([
            RoleSeeder::class,           // First - no dependencies
            UserSeeder::class,            // Depends on roles
            QuizCategorySeeder::class,    // No dependencies
            QuizSeeder::class,            // Depends on users and categories
            QuizQuestionSeeder::class,    // Depends on quizzes
            QuizQuestionOptionSeeder::class, // Depends on questions
        ]);
    }
}
