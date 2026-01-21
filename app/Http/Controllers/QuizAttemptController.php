<?php

namespace App\Http\Controllers;

use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\QuizAnswer;
use App\Models\QuizStudentAccess;
use Illuminate\Http\Request;
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
        $user = auth()->user();
        
        // Verify attempt ownership
        if ($attempt->user_id !== $user->id) {
            abort(403);
        }
        
        // Verify attempt is not completed
        if ($attempt->isCompleted()) {
            return response()->json(['error' => 'Attempt sudah selesai.'], 400);
        }
        
        $request->validate([
            'quiz_question_id' => 'required|exists:quiz_questions,id',
            'quiz_question_option_id' => 'nullable|exists:quiz_question_options,id',
            'quiz_matching_pair_id' => 'nullable|exists:quiz_matching_pairs,id',
            'answer_text' => 'nullable|string',
        ]);
        
        // Get the question to check correct answer
        $question = $attempt->quiz->questions()->find($request->quiz_question_id);
        if (!$question) {
            return response()->json(['error' => 'Question not found.'], 404);
        }
        
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
                }
                break;
                
            case 'long_answer':
                // Long answers need manual grading
                $isCorrect = false;
                $awardedPoints = 0;
                break;
        }
        
        // Save or update answer
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
        $user = auth()->user();
        
        // Verify attempt ownership
        if ($attempt->user_id !== $user->id) {
            abort(403);
        }
        
        // Verify attempt is not already completed
        if ($attempt->isCompleted()) {
            return redirect()->route('quiz.result', $attempt->id);
        }
        
        // Complete the attempt
        $attempt->complete();
        
        return redirect()->route('quiz.result', $attempt->id);
    }
    
    /**
     * Show quiz result.
     */
    public function result(QuizAttempt $attempt)
    {
        $user = auth()->user();
        
        // Verify attempt ownership
        if ($attempt->user_id !== $user->id) {
            abort(403);
        }
        
        $attempt->load([
            'quiz.questions.options',
            'quiz.questions.matchingPairs',
            'quiz.questions.shortAnswerFields',
            'quiz.background',
            'answers.selectedOption',
        ]);
        
        return Inertia::render('quiz/result', [
            'attempt' => $attempt,
        ]);
    }
}
