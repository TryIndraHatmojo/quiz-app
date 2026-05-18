<?php

namespace App\Http\Controllers;

use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\QuizAnswer;
use App\Models\QuizStudentAccess;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class QuizAttemptController extends Controller
{
    /**
     * Start a new quiz attempt or continue existing one.
     * Students can attempt multiple times as long as quiz is live.
     */
    public function start(Quiz $quiz)
    {
        $user = auth()->user();
        
        // Check if user has access to this quiz
        $hasAccess = QuizStudentAccess::where('quiz_id', $quiz->id)
            ->where('user_id', $user->id)
            ->exists();
            
        if (!$hasAccess) {
            abort(403, 'Anda tidak memiliki akses ke quiz ini.');
        }
        
        // Check if quiz is live
        if ($quiz->status !== 'live') {
            return redirect()->route('dashboard')
                ->with('error', 'Quiz belum tersedia.');
        }
        
        // Check for existing incomplete attempt
        $attempt = QuizAttempt::where('quiz_id', $quiz->id)
            ->where('user_id', $user->id)
            ->whereNull('completed_at')
            ->first();
            
        // If no active attempt, create new one
        if (!$attempt) {
            $attemptNumber = QuizAttempt::getNextAttemptNumber($quiz->id, $user->id);
            
            $attempt = QuizAttempt::create([
                'quiz_id' => $quiz->id,
                'user_id' => $user->id,
                'attempt_number' => $attemptNumber,
                'started_at' => now(),
            ]);
            
            // Update student access attempt count
            QuizStudentAccess::where('quiz_id', $quiz->id)
                ->where('user_id', $user->id)
                ->increment('attempt_count');
                
            QuizStudentAccess::where('quiz_id', $quiz->id)
                ->where('user_id', $user->id)
                ->update(['accessed_at' => now()]);
        }
        
        // Load quiz with questions and answers
        $quiz->load([
            'questions.options',
            'questions.matchingPairs',
            'questions.shortAnswerFields',
            'background',
        ]);

        // Acak urutan soal
        if ($quiz->relationLoaded('questions')) {
            $quiz->setRelation('questions', $quiz->questions->shuffle()->values());
        }

        // Acak urutan opsi jawaban untuk soal pilihan ganda
        $quiz->questions->each(function ($question) {
            if ($question->question_type === 'multiple_choice' && $question->relationLoaded('options')) {
                $question->setRelation('options', $question->options->shuffle()->values());
            }
        });
        
        // Get existing answers for this attempt
        $existingAnswers = $attempt->answers()
            ->with('selectedOption', 'selectedMatchingPair', 'matchingPairAnswers')
            ->get()
            ->keyBy('quiz_question_id');
        
        return Inertia::render('quiz/attempt', [
            'quiz' => $quiz,
            'attempt' => $attempt,
            'existingAnswers' => $existingAnswers,
        ]);
    }
    
    /**
     * Save an answer for a question.
     */
    public function saveAnswer(Request $request, QuizAttempt $attempt)
    {
        Log::info('saveAnswer: Method called', [
            'attempt_id' => $attempt->id,
            'request_data' => $request->all()
        ]);
        
        $user = auth()->user();
        
        // Verify attempt ownership
        if ($attempt->user_id !== $user->id) {
            Log::warning('saveAnswer: Attempt ownership verification failed', [
                'attempt_user_id' => $attempt->user_id,
                'current_user_id' => $user->id
            ]);
            abort(403);
        }
        
        // Verify attempt is not completed
        if ($attempt->isCompleted()) {
            Log::warning('saveAnswer: Attempt already completed', ['attempt_id' => $attempt->id]);
            return response()->json(['error' => 'Attempt sudah selesai.'], 400);
        }
        
        $request->validate([
            'quiz_question_id' => 'required|exists:quiz_questions,id',
            'quiz_question_option_id' => 'nullable|exists:quiz_question_options,id',
            'quiz_matching_pair_id' => 'nullable|exists:quiz_matching_pairs,id',
            'answer_text' => 'nullable|string',
            'answer_explanation' => 'nullable|string',
            'matching_answers' => 'nullable|array',
            'matching_answers.*.left_quiz_matching_pair_id' => 'required_with:matching_answers|exists:quiz_matching_pairs,id',
            'matching_answers.*.selected_right_quiz_matching_pair_id' => 'required_with:matching_answers|exists:quiz_matching_pairs,id',
        ]);
        
        Log::info('saveAnswer: Validation passed');
        
        // Get the question to check correct answer
        $question = $attempt->quiz->questions()->find($request->quiz_question_id);
        if (!$question) {
            Log::error('saveAnswer: Question not found', ['quiz_question_id' => $request->quiz_question_id]);
            return response()->json(['error' => 'Pertanyaan tidak ditemukan.'], 404);
        }
        
        Log::info('saveAnswer: Question loaded', [
            'question_id' => $question->id,
            'question_type' => $question->question_type,
            'points' => $question->points
        ]);
        
        // Calculate if answer is correct and points
        $isCorrect = false;
        $awardedPoints = 0;
        $matchingDetailRows = [];
        
        switch ($question->question_type) {
            case 'multiple_choice':
            case 'true_false':
                if ($request->quiz_question_option_id) {
                    $selectedOption = $question->options()->find($request->quiz_question_option_id);
                    $isCorrect = $selectedOption && $selectedOption->is_correct;
                    $awardedPoints = $isCorrect ? $question->points : 0;
                    
                    Log::info('saveAnswer: Multiple choice/True-False answer processed', [
                        'selected_option_id' => $request->quiz_question_option_id,
                        'is_correct' => $isCorrect,
                        'awarded_points' => $awardedPoints
                    ]);
                }
                break;
                
            case 'short_answer':
                // Short answers need manual grading as per user request
                $isCorrect = false;
                $awardedPoints = 0;
                Log::info('saveAnswer: Short answer saved (needs manual grading)');
                break;
                
            case 'matching_pairs':
                $questionPairs = $question->matchingPairs()->get()->keyBy('id');
                $pairsCount = $questionPairs->count();
                $pointsPerPair = $pairsCount > 0 ? (int) round($question->points / $pairsCount) : 0;

                $submittedPairs = collect($request->input('matching_answers', []));

                // Backward compatibility with old single-pair payload.
                if ($submittedPairs->isEmpty() && $request->quiz_matching_pair_id && $request->answer_text) {
                    $leftPair = $questionPairs->get((int) $request->quiz_matching_pair_id);
                    $selectedRightPair = $questionPairs->firstWhere('right_text', $request->answer_text);

                    if ($leftPair && $selectedRightPair) {
                        $submittedPairs = collect([[
                            'left_quiz_matching_pair_id' => $leftPair->id,
                            'selected_right_quiz_matching_pair_id' => $selectedRightPair->id,
                        ]]);
                    }
                }

                $usedRightPairIds = [];

                foreach ($submittedPairs as $submittedPair) {
                    $leftPairId = (int) ($submittedPair['left_quiz_matching_pair_id'] ?? 0);
                    $selectedRightPairId = (int) ($submittedPair['selected_right_quiz_matching_pair_id'] ?? 0);

                    $leftPair = $questionPairs->get($leftPairId);
                    $selectedRightPair = $questionPairs->get($selectedRightPairId);

                    if (!$leftPair || !$selectedRightPair) {
                        continue;
                    }

                    // Right-side options should be unique; repeated choices are counted incorrect.
                    $isDuplicateRight = in_array($selectedRightPairId, $usedRightPairIds, true);
                    if (!$isDuplicateRight) {
                        $usedRightPairIds[] = $selectedRightPairId;
                    }

                    $pairCorrect = !$isDuplicateRight
                        && $leftPair->id === $selectedRightPair->id;

                    $matchingDetailRows[] = [
                        'quiz_attempt_id' => $attempt->id,
                        'quiz_question_id' => $question->id,
                        'left_quiz_matching_pair_id' => $leftPair->id,
                        'selected_right_quiz_matching_pair_id' => $selectedRightPair->id,
                        'is_correct' => $pairCorrect,
                        'awarded_points' => $pairCorrect ? $pointsPerPair : 0,
                        'answered_at' => now(),
                    ];
                }

                $correctPairsCount = collect($matchingDetailRows)->where('is_correct', true)->count();
                $isCorrect = $pairsCount > 0 && count($matchingDetailRows) === $pairsCount && $correctPairsCount === $pairsCount;
                $awardedPoints = $pairsCount > 0 ? (int) round(($correctPairsCount / $pairsCount) * $question->points) : 0;

                Log::info('saveAnswer: Matching pairs processed', [
                    'pairs_count' => $pairsCount,
                    'submitted_pairs_count' => count($matchingDetailRows),
                    'is_correct' => $isCorrect,
                    'awarded_points' => $awardedPoints,
                ]);
                break;
                
            case 'long_answer':
                // Long answers need manual grading
                $isCorrect = false;
                $awardedPoints = 0;
                Log::info('saveAnswer: Long answer saved (needs manual grading)');
                break;
        }
        
        // Save or update answer
        Log::info('saveAnswer: Saving answer to database', [
            'is_correct' => $isCorrect,
            'awarded_points' => $awardedPoints
        ]);
        
        $answer = QuizAnswer::updateOrCreate(
            [
                'quiz_attempt_id' => $attempt->id,
                'quiz_question_id' => $request->quiz_question_id,
            ],
            [
                'quiz_question_option_id' => $request->quiz_question_option_id,
                'quiz_matching_pair_id' => $request->quiz_matching_pair_id,
                'answer_text' => $request->answer_text,
                'answer_explanation' => $request->answer_explanation,
                'is_correct' => $isCorrect,
                'awarded_points' => $awardedPoints,
                'answered_at' => now(),
            ]
        );

        if ($question->question_type === 'matching_pairs') {
            $answer->matchingPairAnswers()->delete();

            if (!empty($matchingDetailRows)) {
                $answer->matchingPairAnswers()->createMany(
                    array_map(function (array $row) {
                        return array_merge($row, [
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                    }, $matchingDetailRows)
                );
            }
        } else {
            // Keep detail table clean if question type changes or payload is resent.
            $answer->matchingPairAnswers()->delete();
        }
        
        Log::info('saveAnswer: Answer saved successfully', ['answer_id' => $answer->id]);
        
        return response()->json([
            'success' => true,
            'answer' => $answer,
        ]);
    }
    
    /**
     * Complete the quiz attempt.
     */
    public function complete(QuizAttempt $attempt)
    {
        Log::info('complete: Completing quiz attempt', ['attempt_id' => $attempt->id]);
        
        $user = auth()->user();
        
        // Verify attempt ownership
        if ($attempt->user_id !== $user->id) {
            Log::warning('complete: Ownership verification failed', [
                'attempt_user_id' => $attempt->user_id,
                'current_user_id' => $user->id
            ]);
            abort(403);
        }
        
        // Verify attempt is not already completed
        if ($attempt->isCompleted()) {
            Log::info('complete: Attempt already completed, redirecting to result', ['attempt_id' => $attempt->id]);
            return redirect()->route('quiz.result', $attempt->id);
        }
        
        // Complete the attempt
        $attempt->complete();
        
        Log::info('complete: Attempt completed successfully', [
            'attempt_id' => $attempt->id,
            'attempt_number' => $attempt->attempt_number,
            'is_graded' => $attempt->is_graded,
            'completed_at' => $attempt->completed_at
        ]);
        
        return redirect()->route('quiz.result', $attempt->id);
    }
    
    /**
     * Show quiz result.
     */
    public function result(QuizAttempt $attempt)
    {
        Log::info('result: Displaying quiz result', ['attempt_id' => $attempt->id]);
        
        $user = auth()->user();
        
        // Verify attempt ownership
        if ($attempt->user_id !== $user->id) {
            Log::warning('result: Ownership verification failed', [
                'attempt_user_id' => $attempt->user_id,
                'current_user_id' => $user->id
            ]);
            abort(403);
        }
        
        $attempt->load([
            'quiz.questions.options',
            'quiz.questions.matchingPairs',
            'quiz.questions.shortAnswerFields',
            'quiz.background',
            'answers.selectedOption',
            'answers.matchingPairAnswers.leftPair',
            'answers.matchingPairAnswers.selectedRightPair',
        ]);
        
        // Get total attempts count for this user+quiz
        $totalAttempts = QuizAttempt::where('quiz_id', $attempt->quiz_id)
            ->where('user_id', $user->id)
            ->whereNotNull('completed_at')
            ->count();
        
        Log::info('result: Data loaded for result page', [
            'quiz_id' => $attempt->quiz->id,
            'total_score' => $attempt->total_score,
            'answers_count' => $attempt->answers->count()
        ]);
        
        return Inertia::render('quiz/result', [
            'attempt' => $attempt,
            'totalAttempts' => $totalAttempts,
            'quizIsLive' => $attempt->quiz->status === 'live',
        ]);
    }

    /**
     * Show attempt history for a quiz.
     */
    public function history(Quiz $quiz)
    {
        $user = auth()->user();

        // Check if user has access to this quiz
        $hasAccess = QuizStudentAccess::where('quiz_id', $quiz->id)
            ->where('user_id', $user->id)
            ->exists();

        if (!$hasAccess) {
            abort(403, 'Anda tidak memiliki akses ke quiz ini.');
        }

        $quiz->load(['background', 'questions']);

        $attempts = QuizAttempt::where('quiz_id', $quiz->id)
            ->where('user_id', $user->id)
            ->whereNotNull('completed_at')
            ->with([
                'answers:id,quiz_attempt_id,quiz_question_id,answer_text,answer_explanation,awarded_points,is_correct',
            ])
            ->orderBy('attempt_number', 'asc')
            ->get();

        $maxPoints = $quiz->questions->sum('points');
        $questionsCount = $quiz->questions->count();
        $passingScore = (int) ($quiz->passing_score ?: 70);
        $questionsById = $quiz->questions->keyBy('id');
        $questionNumbers = $quiz->questions
            ->sortBy('order')
            ->values()
            ->mapWithKeys(fn ($question, $index) => [$question->id => $index + 1]);

        $attemptsData = $attempts->map(function ($attempt) use ($maxPoints, $questionsCount, $passingScore, $questionsById, $questionNumbers) {
            $scorePercentage = $maxPoints > 0
                ? round(($attempt->total_points / $maxPoints) * 100, 2)
                : 0;

            $trueFalseAnswers = $attempt->answers
                ->filter(function ($answer) use ($questionsById) {
                    return $questionsById->get($answer->quiz_question_id)?->question_type === 'true_false';
                })
                ->map(function ($answer) use ($questionNumbers) {
                    return [
                        'question_id' => $answer->quiz_question_id,
                        'question_number' => (int) ($questionNumbers->get($answer->quiz_question_id) ?? 0),
                        'answer_text' => $answer->answer_text,
                        'answer_explanation' => $answer->answer_explanation,
                        'awarded_points' => (int) $answer->awarded_points,
                        'is_correct' => (bool) $answer->is_correct,
                    ];
                })
                ->values();

            return [
                'id' => $attempt->id,
                'attempt_number' => $attempt->attempt_number,
                'is_graded' => $attempt->is_graded,
                'total_points' => (int) $attempt->total_points,
                'max_points' => $maxPoints,
                'score_percentage' => $scorePercentage,
                'correct_count' => (int) $attempt->correct_count,
                'wrong_count' => (int) $attempt->wrong_count,
                'ungraded_count' => max(0, $questionsCount - ((int) $attempt->correct_count + (int) $attempt->wrong_count)),
                'duration_seconds' => $attempt->duration_seconds,
                'started_at' => $attempt->started_at?->toDateTimeString(),
                'completed_at' => $attempt->completed_at?->toDateTimeString(),
                'is_passed' => $maxPoints > 0 && $scorePercentage >= $passingScore,
                'true_false_answers' => $trueFalseAnswers,
            ];
        });

        return Inertia::render('quiz/history', [
            'quiz' => [
                'id' => $quiz->id,
                'title' => $quiz->title,
                'status' => $quiz->status,
                'passing_score' => $passingScore,
                'background' => $quiz->background,
            ],
            'attempts' => $attemptsData,
            'maxPoints' => $maxPoints,
        ]);
    }
}
