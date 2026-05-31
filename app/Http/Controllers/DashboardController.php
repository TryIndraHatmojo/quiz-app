<?php

namespace App\Http\Controllers;

use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\QuizStudentAccess;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        $isStudent = $user->isStudent();

        $studentQuizzes = [];

        if ($isStudent) {
            // Get quizzes that the student has access to
            $studentQuizzes = Quiz::forUserAudience($user)
                ->whereHas('studentAccess', function ($q) use ($user) {
                    $q->where('user_id', $user->id);
                })
                ->where('status', 'live')
                ->orderByDesc('starts_at')
                ->orderByDesc('created_at')
                ->with(['category', 'background', 'questions'])
                ->withCount('questions')
                ->get();

            $completedAttemptCounts = QuizAttempt::query()
                ->where('user_id', $user->id)
                ->whereIn('quiz_id', $studentQuizzes->pluck('id'))
                ->whereNotNull('completed_at')
                ->selectRaw('quiz_id, COUNT(*) as total')
                ->groupBy('quiz_id')
                ->pluck('total', 'quiz_id');

            $studentQuizzes = $studentQuizzes->map(function ($quiz) use ($user, $completedAttemptCounts) {
                // Get student's access record for attempt count
                $access = QuizStudentAccess::where('quiz_id', $quiz->id)
                    ->where('user_id', $user->id)
                    ->first();

                return [
                    'id' => $quiz->id,
                    'title' => $quiz->title,
                    'description' => $quiz->description,
                    'status' => $quiz->status,
                    'duration' => $quiz->duration,
                    'starts_at' => $quiz->starts_at,
                    'category' => $quiz->category,
                    'background' => $quiz->background,
                    'questions_count' => $quiz->questions_count,
                    'attempt_count' => (int) ($completedAttemptCounts[$quiz->id] ?? 0),
                    'accessed_at' => $access ? $access->accessed_at : null,
                ];
            });
        }

        return Inertia::render('dashboard', [
            'isStudent' => $isStudent,
            'studentQuizzes' => $studentQuizzes,
        ]);
    }
}
