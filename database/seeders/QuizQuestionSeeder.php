<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class QuizQuestionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get quiz IDs
        $mathQuizId = DB::table('quizzes')->where('join_code', 'MATH001')->value('id');
        $scienceQuizId = DB::table('quizzes')->where('join_code', 'SCI002')->value('id');
        $englishQuizId = DB::table('quizzes')->where('join_code', 'ENG003')->value('id');
        $arabicQuizId = DB::table('quizzes')->where('join_code', 'ARB004')->value('id');

        $questions = [];

        // Math Quiz Questions
        if ($mathQuizId) {
            $questions = array_merge($questions, [
                [
                    'quiz_id' => $mathQuizId,
                    'question_type' => 'multiple_choice',
                    'question_text' => 'Berapakah hasil dari 15 + 27?',
                    'media_path' => null,
                    'time_limit' => 30,
                    'points' => 100,
                    'order' => 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'quiz_id' => $mathQuizId,
                    'question_type' => 'multiple_choice',
                    'question_text' => 'Berapa nilai x dalam persamaan: 2x + 5 = 15?',
                    'media_path' => null,
                    'time_limit' => 45,
                    'points' => 200,
                    'order' => 2,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'quiz_id' => $mathQuizId,
                    'question_type' => 'true_false',
                    'question_text' => 'Luas segitiga adalah 1/2 × alas × tinggi. Benar atau Salah?',
                    'media_path' => null,
                    'time_limit' => 20,
                    'points' => 100,
                    'order' => 3,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'quiz_id' => $mathQuizId,
                    'question_type' => 'multiple_choice',
                    'question_text' => 'Jika sebuah persegi panjang memiliki panjang 8 cm dan lebar 5 cm, berapakah kelilingnya?',
                    'media_path' => null,
                    'time_limit' => 45,
                    'points' => 150,
                    'order' => 4,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'quiz_id' => $mathQuizId,
                    'question_type' => 'multiple_choice',
                    'question_text' => '(-3) × (-4) = ?',
                    'media_path' => null,
                    'time_limit' => 30,
                    'points' => 100,
                    'order' => 5,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ]);
        }

        // Science Quiz Questions
        if ($scienceQuizId) {
            $questions = array_merge($questions, [
                [
                    'quiz_id' => $scienceQuizId,
                    'question_type' => 'multiple_choice',
                    'question_text' => 'Organ mana yang berfungsi memompa darah ke seluruh tubuh?',
                    'media_path' => null,
                    'time_limit' => 30,
                    'points' => 100,
                    'order' => 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'quiz_id' => $scienceQuizId,
                    'question_type' => 'multiple_choice',
                    'question_text' => 'Proses fotosintesis terjadi pada bagian tumbuhan yang disebut?',
                    'media_path' => null,
                    'time_limit' => 40,
                    'points' => 150,
                    'order' => 2,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'quiz_id' => $scienceQuizId,
                    'question_type' => 'true_false',
                    'question_text' => 'Air (H2O) terdiri dari 2 atom hidrogen dan 1 atom oksigen. Benar atau Salah?',
                    'media_path' => null,
                    'time_limit' => 25,
                    'points' => 100,
                    'order' => 3,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'quiz_id' => $scienceQuizId,
                    'question_type' => 'multiple_choice',
                    'question_text' => 'Hewan yang hidup di dua alam (air dan darat) disebut?',
                    'media_path' => null,
                    'time_limit' => 35,
                    'points' => 100,
                    'order' => 4,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ]);
        }

        // English Quiz Questions
        if ($englishQuizId) {
            $questions = array_merge($questions, [
                [
                    'quiz_id' => $englishQuizId,
                    'question_type' => 'multiple_choice',
                    'question_text' => 'What is the past tense of "go"?',
                    'media_path' => null,
                    'time_limit' => 30,
                    'points' => 100,
                    'order' => 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'quiz_id' => $englishQuizId,
                    'question_type' => 'multiple_choice',
                    'question_text' => 'Choose the correct article: ___ apple a day keeps the doctor away.',
                    'media_path' => null,
                    'time_limit' => 25,
                    'points' => 100,
                    'order' => 2,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'quiz_id' => $englishQuizId,
                    'question_type' => 'true_false',
                    'question_text' => '"She don\'t like pizza" is grammatically correct. True or False?',
                    'media_path' => null,
                    'time_limit' => 30,
                    'points' => 150,
                    'order' => 3,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ]);
        }

        // Arabic Quiz Questions
        if ($arabicQuizId) {
            $questions = array_merge($questions, [
                [
                    'quiz_id' => $arabicQuizId,
                    'question_type' => 'multiple_choice',
                    'question_text' => 'Apa arti dari kata "مدرسة" (madrasah)?',
                    'media_path' => null,
                    'time_limit' => 35,
                    'points' => 100,
                    'order' => 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'quiz_id' => $arabicQuizId,
                    'question_type' => 'multiple_choice',
                    'question_text' => 'Bagaimana cara mengucapkan "Terima kasih" dalam bahasa Arab?',
                    'media_path' => null,
                    'time_limit' => 30,
                    'points' => 100,
                    'order' => 2,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'quiz_id' => $arabicQuizId,
                    'question_type' => 'true_false',
                    'question_text' => 'Huruf "ع" (ain) tidak ada padanannya dalam alfabet latin. Benar atau Salah?',
                    'media_path' => null,
                    'time_limit' => 25,
                    'points' => 150,
                    'order' => 3,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ]);
        }

        DB::table('quiz_questions')->insert($questions);
    }
}
