<?php

namespace App\Http\Controllers;

use App\Models\Quiz;
use App\Models\QuizStudentAccess;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        
        // Check if user is a student (role_id = 4)
        $isStudent = $user->roles()->where('roles.id', 4)->exists();
        
        $studentQuizzes = [];
        
        if ($isStudent) {
            // Get quizzes that the student has access to
            $studentQuizzes = Quiz::whereHas('studentAccess', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })
            ->with(['category', 'background', 'questions'])
            ->withCount('questions')
            ->get()
            ->map(function ($quiz) use ($user) {
                // Get student's access record for attempt count
                $access = QuizStudentAccess::where('quiz_id', $quiz->id)
                    ->where('user_id', $user->id)
                    ->first();
                
                return [
                    'id' => $quiz->id,
                    'title' => $quiz->title,
                    'description' => $quiz->description,
                    'status' => $quiz->status,
                    'time_mode' => $quiz->time_mode,
                    'duration' => $quiz->duration,
                    'category' => $quiz->category,
                    'background' => $quiz->background,
                    'questions_count' => $quiz->questions_count,
                    'attempt_count' => $access ? $access->attempt_count : 0,
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
