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
            $attempt = QuizAttempt::create([
                'quiz_id' => $quiz->id,
                'user_id' => $user->id,
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
        
        // Get existing answers for this attempt
        $existingAnswers = $attempt->answers()
            ->with('selectedOption', 'selectedMatchingPair')
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
                $field = $question->shortAnswerFields()->first();
                if ($field && $request->answer_text) {
                    $expectedAnswer = $field->case_sensitive 
                        ? $field->expected_answer 
                        : strtolower($field->expected_answer);
                    $givenAnswer = $field->case_sensitive 
                        ? $request->answer_text 
                        : strtolower($request->answer_text);
                        
                    if ($field->trim_whitespace) {
                        $expectedAnswer = trim($expectedAnswer);
                        $givenAnswer = trim($givenAnswer);
                    }
                    
                    $isCorrect = $expectedAnswer === $givenAnswer;
                    $awardedPoints = $isCorrect ? $question->points : 0;
                    
                    Log::info('saveAnswer: Short answer processed', [
                        'expected_answer' => $expectedAnswer,
                        'given_answer' => $givenAnswer,
                        'is_correct' => $isCorrect,
                        'awarded_points' => $awardedPoints
                    ]);
                }
                break;
                
            case 'matching_pairs':
                if ($request->quiz_matching_pair_id && $request->answer_text) {
                    $pair = $question->matchingPairs()->find($request->quiz_matching_pair_id);
                    // For matching pairs, answer_text contains the selected right_text
                    $isCorrect = $pair && $pair->right_text === $request->answer_text;
                    // Points are awarded per pair, divide by number of pairs
                    $pairsCount = $question->matchingPairs()->count();
                    $awardedPoints = $isCorrect ? round($question->points / $pairsCount) : 0;
                    
                    Log::info('saveAnswer: Matching pairs processed', [
                        'pair_id' => $request->quiz_matching_pair_id,
                        'selected_answer' => $request->answer_text,
                        'is_correct' => $isCorrect,
                        'pairs_count' => $pairsCount,
                        'awarded_points' => $awardedPoints
                    ]);
                }
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
                'is_correct' => $isCorrect,
                'awarded_points' => $awardedPoints,
                'answered_at' => now(),
            ]
        );
        
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
        ]);
        
        Log::info('result: Data loaded for result page', [
            'quiz_id' => $attempt->quiz->id,
            'total_score' => $attempt->total_score,
            'answers_count' => $attempt->answers->count()
        ]);
        
        return Inertia::render('quiz/result', [
            'attempt' => $attempt,
        ]);
    }
}
