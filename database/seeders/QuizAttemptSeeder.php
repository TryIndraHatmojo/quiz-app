<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class QuizAttemptSeeder extends Seeder
{
    /**
     * Seed quiz_attempts and quiz_answers for testing nilai pages.
     */
    public function run(): void
    {
        // Get quiz IDs
        $quizzes = DB::table('quizzes')->get();
        if ($quizzes->isEmpty()) {
            $this->command->warn('No quizzes found. Skipping QuizAttemptSeeder.');
            return;
        }

        // Get student user IDs (users with siswa role)
        $siswaRoleId = DB::table('roles')->where('slug', 'siswa')->value('id');
        if (!$siswaRoleId) {
            $this->command->warn('Siswa role not found. Skipping QuizAttemptSeeder.');
            return;
        }

        $studentIds = DB::table('role_user')
            ->where('role_id', $siswaRoleId)
            ->pluck('user_id')
            ->toArray();

        if (empty($studentIds)) {
            $this->command->warn('No students found. Skipping QuizAttemptSeeder.');
            return;
        }

        // Only process live quizzes
        $liveQuizzes = $quizzes->where('status', 'live');

        foreach ($liveQuizzes as $quiz) {
            $questions = DB::table('quiz_questions')
                ->where('quiz_id', $quiz->id)
                ->get();

            if ($questions->isEmpty()) {
                continue;
            }

            $maxPoints = $questions->sum('points');

            // Create attempts for a random subset of students
            $participatingStudents = collect($studentIds)->shuffle()->take(rand(3, count($studentIds)));

            foreach ($participatingStudents as $studentId) {
                // Randomize score: mix of passing and failing
                $scoreRatio = $this->randomScoreRatio();
                $totalPoints = (int) round($maxPoints * $scoreRatio);
                $totalQuestions = $questions->count();
                $correctCount = (int) round($totalQuestions * $scoreRatio);
                $wrongCount = $totalQuestions - $correctCount;

                $startedAt = Carbon::now()->subDays(rand(1, 14))->subHours(rand(0, 12));
                $completedAt = (clone $startedAt)->addMinutes(rand(5, 45));
                $durationSeconds = $startedAt->diffInSeconds($completedAt);

                $attemptId = DB::table('quiz_attempts')->insertGetId([
                    'quiz_id' => $quiz->id,
                    'user_id' => $studentId,
                    'started_at' => $startedAt,
                    'completed_at' => $completedAt,
                    'total_points' => $totalPoints,
                    'correct_count' => $correctCount,
                    'wrong_count' => $wrongCount,
                    'duration_seconds' => $durationSeconds,
                    'created_at' => $startedAt,
                    'updated_at' => $completedAt,
                ]);

                // Create answers for each question
                $pointsRemaining = $totalPoints;
                $questionsArr = $questions->values()->all();

                foreach ($questionsArr as $index => $question) {
                    $isLast = ($index === count($questionsArr) - 1);
                    $qMaxPoints = (int) $question->points;

                    if ($isLast) {
                        $awardedPoints = max(0, min($qMaxPoints, $pointsRemaining));
                    } else {
                        // Distribute points somewhat realistically
                        $awardedPoints = rand(0, 1) === 1 ? $qMaxPoints : (int) round($qMaxPoints * $scoreRatio);
                        $awardedPoints = min($awardedPoints, $pointsRemaining);
                    }

                    $pointsRemaining -= $awardedPoints;
                    $isCorrect = ($awardedPoints >= $qMaxPoints);

                    // Get correct option (if multiple choice / true_false)
                    $selectedOptionId = null;
                    if (in_array($question->question_type, ['multiple_choice', 'true_false'])) {
                        if ($isCorrect) {
                            $selectedOptionId = DB::table('quiz_question_options')
                                ->where('quiz_question_id', $question->id)
                                ->where('is_correct', true)
                                ->value('id');
                        } else {
                            $selectedOptionId = DB::table('quiz_question_options')
                                ->where('quiz_question_id', $question->id)
                                ->where('is_correct', false)
                                ->value('id');
                        }
                    }

                    DB::table('quiz_answers')->insert([
                        'quiz_attempt_id' => $attemptId,
                        'quiz_question_id' => $question->id,
                        'quiz_question_option_id' => $selectedOptionId,
                        'answer_text' => in_array($question->question_type, ['short_answer', 'long_answer']) ? 'Jawaban siswa contoh' : null,
                        'is_correct' => $isCorrect,
                        'awarded_points' => $awardedPoints,
                        'answered_at' => $completedAt,
                        'created_at' => $completedAt,
                        'updated_at' => $completedAt,
                    ]);
                }
            }
        }

        $totalAttempts = DB::table('quiz_attempts')->count();
        $this->command->info("QuizAttemptSeeder: Created {$totalAttempts} attempts.");
    }

    /**
     * Generate a realistic score ratio (0.0 - 1.0).
     * Biased toward middle-high to create a realistic distribution.
     */
    private function randomScoreRatio(): float
    {
        $distributions = [
            0.30, 0.40, 0.45, 0.50, 0.55,  // Low scores (remedial)
            0.60, 0.65, 0.70, 0.72, 0.75,  // Border scores
            0.78, 0.80, 0.82, 0.85, 0.88,  // Good scores (passing)
            0.90, 0.92, 0.95, 0.98, 1.00,  // Excellent scores
        ];

        return $distributions[array_rand($distributions)];
    }
}
