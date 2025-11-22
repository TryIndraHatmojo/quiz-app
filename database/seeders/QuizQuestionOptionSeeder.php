<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class QuizQuestionOptionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $options = [];

        // Get all multiple choice questions
        $questions = DB::table('quiz_questions')
            ->where('question_type', 'multiple_choice')
            ->get();

        foreach ($questions as $question) {
            $questionOptions = $this->getOptionsForQuestion($question);
            $options = array_merge($options, $questionOptions);
        }

        DB::table('quiz_question_options')->insert($options);
    }

    private function getOptionsForQuestion($question)
    {
        $questionText = $question->question_text;

        // Math Quiz Options
        if (strpos($questionText, '15 + 27') !== false) {
            return [
                ['quiz_question_id' => $question->id, 'option_text' => '42', 'is_correct' => true, 'order' => 1, 'created_at' => now(), 'updated_at' => now()],
                ['quiz_question_id' => $question->id, 'option_text' => '40', 'is_correct' => false, 'order' => 2, 'created_at' => now(), 'updated_at' => now()],
                ['quiz_question_id' => $question->id, 'option_text' => '32', 'is_correct' => false, 'order' => 3, 'created_at' => now(), 'updated_at' => now()],
                ['quiz_question_id' => $question->id, 'option_text' => '52', 'is_correct' => false, 'order' => 4, 'created_at' => now(), 'updated_at' => now()],
            ];
        }

        if (strpos($questionText, '2x + 5 = 15') !== false) {
            return [
                ['quiz_question_id' => $question->id, 'option_text' => '5', 'is_correct' => true, 'order' => 1, 'created_at' => now(), 'updated_at' => now()],
                ['quiz_question_id' => $question->id, 'option_text' => '10', 'is_correct' => false, 'order' => 2, 'created_at' => now(), 'updated_at' => now()],
                ['quiz_question_id' => $question->id, 'option_text' => '7', 'is_correct' => false, 'order' => 3, 'created_at' => now(), 'updated_at' => now()],
                ['quiz_question_id' => $question->id, 'option_text' => '3', 'is_correct' => false, 'order' => 4, 'created_at' => now(), 'updated_at' => now()],
            ];
        }

        if (strpos($questionText, 'keliling') !== false) {
            return [
                ['quiz_question_id' => $question->id, 'option_text' => '26 cm', 'is_correct' => true, 'order' => 1, 'created_at' => now(), 'updated_at' => now()],
                ['quiz_question_id' => $question->id, 'option_text' => '40 cm', 'is_correct' => false, 'order' => 2, 'created_at' => now(), 'updated_at' => now()],
                ['quiz_question_id' => $question->id, 'option_text' => '13 cm', 'is_correct' => false, 'order' => 3, 'created_at' => now(), 'updated_at' => now()],
                ['quiz_question_id' => $question->id, 'option_text' => '18 cm', 'is_correct' => false, 'order' => 4, 'created_at' => now(), 'updated_at' => now()],
            ];
        }

        if (strpos($questionText, '(-3) × (-4)') !== false) {
            return [
                ['quiz_question_id' => $question->id, 'option_text' => '12', 'is_correct' => true, 'order' => 1, 'created_at' => now(), 'updated_at' => now()],
                ['quiz_question_id' => $question->id, 'option_text' => '-12', 'is_correct' => false, 'order' => 2, 'created_at' => now(), 'updated_at' => now()],
                ['quiz_question_id' => $question->id, 'option_text' => '7', 'is_correct' => false, 'order' => 3, 'created_at' => now(), 'updated_at' => now()],
                ['quiz_question_id' => $question->id, 'option_text' => '-7', 'is_correct' => false, 'order' => 4, 'created_at' => now(), 'updated_at' => now()],
            ];
        }

        // Science Quiz Options
        if (strpos($questionText, 'memompa darah') !== false) {
            return [
                ['quiz_question_id' => $question->id, 'option_text' => 'Jantung', 'is_correct' => true, 'order' => 1, 'created_at' => now(), 'updated_at' => now()],
                ['quiz_question_id' => $question->id, 'option_text' => 'Paru-paru', 'is_correct' => false, 'order' => 2, 'created_at' => now(), 'updated_at' => now()],
                ['quiz_question_id' => $question->id, 'option_text' => 'Hati', 'is_correct' => false, 'order' => 3, 'created_at' => now(), 'updated_at' => now()],
                ['quiz_question_id' => $question->id, 'option_text' => 'Ginjal', 'is_correct' => false, 'order' => 4, 'created_at' => now(), 'updated_at' => now()],
            ];
        }

        if (strpos($questionText, 'fotosintesis') !== false) {
            return [
                ['quiz_question_id' => $question->id, 'option_text' => 'Kloroplas', 'is_correct' => true, 'order' => 1, 'created_at' => now(), 'updated_at' => now()],
                ['quiz_question_id' => $question->id, 'option_text' => 'Mitokondria', 'is_correct' => false, 'order' => 2, 'created_at' => now(), 'updated_at' => now()],
                ['quiz_question_id' => $question->id, 'option_text' => 'Ribosom', 'is_correct' => false, 'order' => 3, 'created_at' => now(), 'updated_at' => now()],
                ['quiz_question_id' => $question->id, 'option_text' => 'Nukleus', 'is_correct' => false, 'order' => 4, 'created_at' => now(), 'updated_at' => now()],
            ];
        }

        if (strpos($questionText, 'dua alam') !== false) {
            return [
                ['quiz_question_id' => $question->id, 'option_text' => 'Amfibi', 'is_correct' => true, 'order' => 1, 'created_at' => now(), 'updated_at' => now()],
                ['quiz_question_id' => $question->id, 'option_text' => 'Reptil', 'is_correct' => false, 'order' => 2, 'created_at' => now(), 'updated_at' => now()],
                ['quiz_question_id' => $question->id, 'option_text' => 'Mamalia', 'is_correct' => false, 'order' => 3, 'created_at' => now(), 'updated_at' => now()],
                ['quiz_question_id' => $question->id, 'option_text' => 'Aves', 'is_correct' => false, 'order' => 4, 'created_at' => now(), 'updated_at' => now()],
            ];
        }

        // English Quiz Options
        if (strpos($questionText, 'past tense of "go"') !== false) {
            return [
                ['quiz_question_id' => $question->id, 'option_text' => 'went', 'is_correct' => true, 'order' => 1, 'created_at' => now(), 'updated_at' => now()],
                ['quiz_question_id' => $question->id, 'option_text' => 'goed', 'is_correct' => false, 'order' => 2, 'created_at' => now(), 'updated_at' => now()],
                ['quiz_question_id' => $question->id, 'option_text' => 'gone', 'is_correct' => false, 'order' => 3, 'created_at' => now(), 'updated_at' => now()],
                ['quiz_question_id' => $question->id, 'option_text' => 'going', 'is_correct' => false, 'order' => 4, 'created_at' => now(), 'updated_at' => now()],
            ];
        }

        if (strpos($questionText, 'apple a day') !== false) {
            return [
                ['quiz_question_id' => $question->id, 'option_text' => 'An', 'is_correct' => true, 'order' => 1, 'created_at' => now(), 'updated_at' => now()],
                ['quiz_question_id' => $question->id, 'option_text' => 'A', 'is_correct' => false, 'order' => 2, 'created_at' => now(), 'updated_at' => now()],
                ['quiz_question_id' => $question->id, 'option_text' => 'The', 'is_correct' => false, 'order' => 3, 'created_at' => now(), 'updated_at' => now()],
                ['quiz_question_id' => $question->id, 'option_text' => 'Some', 'is_correct' => false, 'order' => 4, 'created_at' => now(), 'updated_at' => now()],
            ];
        }

        // Arabic Quiz Options
        if (strpos($questionText, 'مدرسة') !== false) {
            return [
                ['quiz_question_id' => $question->id, 'option_text' => 'Sekolah', 'is_correct' => true, 'order' => 1, 'created_at' => now(), 'updated_at' => now()],
                ['quiz_question_id' => $question->id, 'option_text' => 'Rumah', 'is_correct' => false, 'order' => 2, 'created_at' => now(), 'updated_at' => now()],
                ['quiz_question_id' => $question->id, 'option_text' => 'Masjid', 'is_correct' => false, 'order' => 3, 'created_at' => now(), 'updated_at' => now()],
                ['quiz_question_id' => $question->id, 'option_text' => 'Pasar', 'is_correct' => false, 'order' => 4, 'created_at' => now(), 'updated_at' => now()],
            ];
        }

        if (strpos($questionText, 'Terima kasih') !== false) {
            return [
                ['quiz_question_id' => $question->id, 'option_text' => 'Shukran', 'is_correct' => true, 'order' => 1, 'created_at' => now(), 'updated_at' => now()],
                ['quiz_question_id' => $question->id, 'option_text' => 'Afwan', 'is_correct' => false, 'order' => 2, 'created_at' => now(), 'updated_at' => now()],
                ['quiz_question_id' => $question->id, 'option_text' => 'Marhaban', 'is_correct' => false, 'order' => 3, 'created_at' => now(), 'updated_at' => now()],
                ['quiz_question_id' => $question->id, 'option_text' => 'Assalamu\'alaikum', 'is_correct' => false, 'order' => 4, 'created_at' => now(), 'updated_at' => now()],
            ];
        }

        return [];
    }
}
