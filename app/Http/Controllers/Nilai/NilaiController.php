<?php

namespace App\Http\Controllers\Nilai;

use App\Http\Controllers\Controller;
use App\Models\Jenjang;
use App\Models\Quiz;
use App\Models\QuizAnswer;
use App\Models\QuizAttempt;
use App\Models\QuizQuestion;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NilaiController extends Controller
{
    public function index(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user();
        $roles = $this->resolveRoles($user);

        if (!$roles['admin'] && !$roles['guru'] && !$roles['siswa'] && !$roles['orang_tua']) {
            abort(403, 'Anda tidak memiliki akses ke halaman nilai.');
        }

        // -------------------------------------------------------
        // Base query: completed attempts with eager loads
        // -------------------------------------------------------
        $query = QuizAttempt::query()
            ->whereNotNull('completed_at')
            ->with([
                'quiz:id,title,user_id,jenjang_id,kelas_id,passing_score,starts_at',
                'quiz.questions:id,quiz_id,points',
                'quiz.teacherAccess:id,quiz_id,user_id,permission',
                'quiz.jenjang:id,jenjang,nama_sekolah',
                'quiz.kelas:id,nama_kelas',
                'user:id,name,email,jenjang_id,kelas_id,orang_tua_id',
                'user.jenjang:id,jenjang,nama_sekolah',
                'user.kelas:id,nama_kelas',
            ])
            ->orderByDesc('completed_at');

        // -------------------------------------------------------
        // Role-based scope
        // -------------------------------------------------------
        if (!$roles['admin']) {
            if ($roles['guru']) {
                $query->whereHas('quiz', function ($quizQuery) use ($user) {
                    $quizQuery->where('user_id', $user->id)
                        ->orWhereHas('teacherAccess', function ($accessQuery) use ($user) {
                            $accessQuery->where('user_id', $user->id);
                        });
                });
            } elseif ($roles['siswa']) {
                $query->where('user_id', $user->id);
            } elseif ($roles['orang_tua']) {
                $childIds = User::query()
                    ->where('orang_tua_id', $user->id)
                    ->pluck('id');
                $query->whereIn('user_id', $childIds);
            }
        }

        // -------------------------------------------------------
        // Filters
        // -------------------------------------------------------

        // Filter: search by quiz title or student name
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('quiz', function ($quizQ) use ($search) {
                    $quizQ->where('title', 'like', "%{$search}%");
                })->orWhereHas('user', function ($userQ) use ($search) {
                    $userQ->where('name', 'like', "%{$search}%");
                });
            });
        }

        // Filter: jenjang (quiz's jenjang)
        if ($request->filled('jenjang_id')) {
            $query->whereHas('quiz', function ($q) use ($request) {
                $q->where('jenjang_id', $request->jenjang_id);
            });
        }

        // Filter: date range (quiz starts_at)
        if ($request->filled('date_from')) {
            $query->whereHas('quiz', function ($q) use ($request) {
                $q->whereNotNull('starts_at')
                    ->whereDate('starts_at', '>=', $request->date_from);
            });
        }

        if ($request->filled('date_to')) {
            $query->whereHas('quiz', function ($q) use ($request) {
                $q->whereNotNull('starts_at')
                    ->whereDate('starts_at', '<=', $request->date_to);
            });
        }

        // -------------------------------------------------------
        // Clone query for summary stats (before pagination)
        // -------------------------------------------------------
        $statsQuery = clone $query;
        $allAttemptsForStats = $statsQuery->get();

        $totalSelesai = $allAttemptsForStats->count();
        $lulusCount = 0;
        $remedialCount = 0;
        $totalPercentage = 0;

        foreach ($allAttemptsForStats as $attempt) {
            $quiz = $attempt->quiz;
            $maxPoints = $quiz ? (int) $quiz->questions->sum('points') : 0;
            $passingScore = $quiz ? ((int) $quiz->passing_score ?: 70) : 70;
            $scorePercentage = $maxPoints > 0
                ? round(((int) $attempt->total_points / $maxPoints) * 100, 2)
                : 0;

            $totalPercentage += $scorePercentage;

            if ($maxPoints > 0 && $scorePercentage >= $passingScore) {
                $lulusCount++;
            } else {
                $remedialCount++;
            }
        }

        $rataRata = $totalSelesai > 0 ? round($totalPercentage / $totalSelesai, 1) : 0;

        // -------------------------------------------------------
        // Paginate & transform
        // -------------------------------------------------------
        $attempts = $query->paginate(20)->withQueryString();

        $attempts->through(function (QuizAttempt $attempt) use ($user, $roles) {
            $quiz = $attempt->quiz;
            $maxPoints = $quiz ? (int) $quiz->questions->sum('points') : 0;
            $passingScore = $quiz ? ((int) $quiz->passing_score ?: 70) : 70;
            $teacherAccess = $quiz
                ? $quiz->teacherAccess->firstWhere('user_id', $user->id)
                : null;

            $canEdit = $roles['admin']
                || ($roles['guru'] && $quiz && (
                    (int) $quiz->user_id === (int) $user->id
                    || ($teacherAccess && $teacherAccess->permission === 'edit')
                ));

            $scorePercentage = $maxPoints > 0
                ? round(((int) $attempt->total_points / $maxPoints) * 100, 2)
                : 0;

            $isPassed = $maxPoints > 0 && $scorePercentage >= $passingScore;

            return [
                'id' => $attempt->id,
                'quiz' => [
                    'id' => $quiz?->id,
                    'title' => $quiz?->title,
                    'passing_score' => $passingScore,
                    'starts_at' => $quiz?->starts_at?->toDateTimeString(),
                    'jenjang' => $quiz?->jenjang ? [
                        'id' => $quiz->jenjang->id,
                        'jenjang' => $quiz->jenjang->jenjang,
                        'nama_sekolah' => $quiz->jenjang->nama_sekolah,
                    ] : null,
                    'kelas' => $quiz?->kelas ? [
                        'nama_kelas' => $quiz->kelas->nama_kelas,
                    ] : null,
                ],
                'student' => [
                    'id' => $attempt->user?->id,
                    'name' => $attempt->user?->name,
                    'email' => $attempt->user?->email,
                    'jenjang' => $attempt->user?->jenjang?->jenjang,
                    'nama_sekolah' => $quiz?->jenjang?->nama_sekolah,
                    'kelas' => $attempt->user?->kelas?->nama_kelas,
                ],
                'total_points' => (int) $attempt->total_points,
                'max_points' => $maxPoints,
                'score_percentage' => $scorePercentage,
                'correct_count' => (int) $attempt->correct_count,
                'wrong_count' => (int) $attempt->wrong_count,
                'completed_at' => optional($attempt->completed_at)?->toDateTimeString(),
                'can_edit' => $canEdit,
                'is_passed' => $isPassed,
                'detail_url' => route('nilai.show', $attempt->id),
            ];
        });

        return Inertia::render('nilai/index', [
            'attempts' => $attempts,
            'summary' => [
                'rata_rata' => $rataRata,
                'total_selesai' => $totalSelesai,
                'lulus' => $lulusCount,
                'remedial' => $remedialCount,
            ],
            'jenjangs' => Jenjang::orderBy('jenjang')->get(['id', 'jenjang', 'nama_sekolah']),
            'filters' => $request->only(['search', 'jenjang_id', 'date_from', 'date_to']),
            'permissions' => [
                'canEditAny' => $roles['admin'] || $roles['guru'],
                'isSiswa' => $roles['siswa'],
                'isOrangTua' => $roles['orang_tua'],
            ],
        ]);
    }

    public function show(Request $request, QuizAttempt $attempt): Response
    {
        /** @var User $user */
        $user = $request->user();
        $roles = $this->resolveRoles($user);

        $attempt->load([
            'quiz:id,title,user_id,passing_score',
            'quiz.questions:id,quiz_id,question_text,question_type,points,order',
            'quiz.questions.options:id,quiz_question_id,option_text,is_correct,order',
            'quiz.questions.matchingPairs:id,quiz_question_id,left_text,right_text,order',
            'quiz.questions.shortAnswerFields:id,quiz_question_id,expected_answer,order',
            'quiz.teacherAccess:id,quiz_id,user_id,permission',
            'user:id,name,email,jenjang_id,kelas_id,orang_tua_id',
            'user.jenjang:id,jenjang,nama_sekolah',
            'user.kelas:id,nama_kelas',
            'answers:id,quiz_attempt_id,quiz_question_id,quiz_question_option_id,answer_text,is_correct,awarded_points',
            'answers.selectedOption:id,option_text',
            'answers.matchingPairAnswers:id,quiz_answer_id,left_quiz_matching_pair_id,selected_right_quiz_matching_pair_id,is_correct,awarded_points',
            'answers.matchingPairAnswers.leftPair:id,left_text',
            'answers.matchingPairAnswers.selectedRightPair:id,right_text',
        ]);

        if (!$this->canViewAttempt($user, $roles, $attempt)) {
            abort(403, 'Anda tidak memiliki akses untuk melihat detail nilai ini.');
        }

        $canEdit = $this->canEditAttempt($user, $roles, $attempt);
        $answersByQuestionId = $attempt->answers->keyBy('quiz_question_id');
        $questions = $attempt->quiz->questions->sortBy('order')->values();

        $questionScores = $questions->map(function (QuizQuestion $question, int $index) use ($answersByQuestionId) {
            /** @var QuizAnswer|null $answer */
            $answer = $answersByQuestionId->get($question->id);
            $awardedPoints = (int) ($answer?->awarded_points ?? 0);
            $maxPoints = (int) $question->points;

            $answerPreview = '-';
            if ($answer) {
                if (in_array($question->question_type, [QuizQuestion::TYPE_MULTIPLE_CHOICE, QuizQuestion::TYPE_TRUE_FALSE], true)) {
                    $answerPreview = $answer->selectedOption?->option_text ?? '-';
                } elseif (in_array($question->question_type, [QuizQuestion::TYPE_SHORT_ANSWER, QuizQuestion::TYPE_LONG_ANSWER], true)) {
                    $answerPreview = $answer->answer_text ?: '-';
                } elseif ($question->question_type === QuizQuestion::TYPE_MATCHING_PAIRS) {
                    $pairs = $answer->matchingPairAnswers
                        ->map(function ($pair) {
                            $left = $pair->leftPair?->left_text ?? '-';
                            $right = $pair->selectedRightPair?->right_text ?? '-';
                            return $left . ' => ' . $right;
                        })
                        ->implode('; ');

                    $answerPreview = $pairs !== '' ? $pairs : '-';
                }
            }

            return [
                'question_id' => $question->id,
                'order' => $index + 1,
                'question_text' => $question->question_text,
                'question_type' => $question->question_type,
                'answer_preview' => $answerPreview,
                'answer_key' => $this->formatAnswerKey($question),
                'awarded_points' => $awardedPoints,
                'max_points' => $maxPoints,
                'is_correct' => $maxPoints > 0 ? $awardedPoints >= $maxPoints : false,
            ];
        });

        $maxPoints = (int) $questions->sum('points');
        $passingScore = (int) ($attempt->quiz->passing_score ?? 70);
        $scorePercentage = $maxPoints > 0
            ? round(((int) $attempt->total_points / $maxPoints) * 100, 2)
            : 0;
        $isPassed = $maxPoints > 0 && $scorePercentage >= $passingScore;

        return Inertia::render('nilai/show', [
            'attempt' => [
                'id' => $attempt->id,
                'quiz' => [
                    'id' => $attempt->quiz->id,
                    'title' => $attempt->quiz->title,
                    'passing_score' => $passingScore,
                ],
                'student' => [
                    'id' => $attempt->user?->id,
                    'name' => $attempt->user?->name,
                    'email' => $attempt->user?->email,
                    'jenjang' => $attempt->user?->jenjang?->jenjang,
                    'kelas' => $attempt->user?->kelas?->nama_kelas,
                ],
                'total_points' => (int) $attempt->total_points,
                'max_points' => $maxPoints,
                'score_percentage' => $scorePercentage,
                'correct_count' => (int) $attempt->correct_count,
                'wrong_count' => (int) $attempt->wrong_count,
                'completed_at' => optional($attempt->completed_at)?->toDateTimeString(),
                'is_passed' => $isPassed,
            ],
            'questionScores' => $questionScores,
            'permissions' => [
                'canEdit' => $canEdit,
                'isSiswa' => $roles['siswa'],
                'isOrangTua' => $roles['orang_tua'],
            ],
        ]);
    }

    public function updateQuestionScore(Request $request, QuizAttempt $attempt): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();
        $roles = $this->resolveRoles($user);

        if (!$roles['admin'] && !$roles['guru']) {
            abort(403, 'Hanya guru yang dapat mengubah nilai.');
        }

        $attempt->load([
            'quiz:id,title,user_id',
            'quiz.questions:id,quiz_id,points',
            'quiz.teacherAccess:id,quiz_id,user_id,permission',
        ]);

        if (!$this->canEditAttempt($user, $roles, $attempt)) {
            abort(403, 'Anda tidak memiliki izin untuk mengedit nilai ini.');
        }

        $validated = $request->validate([
            'quiz_question_id' => ['required', 'integer', 'exists:quiz_questions,id'],
            'awarded_points' => ['required', 'integer', 'min:0'],
        ]);

        /** @var QuizQuestion|null $question */
        $question = QuizQuestion::query()
            ->where('id', (int) $validated['quiz_question_id'])
            ->where('quiz_id', $attempt->quiz_id)
            ->first();

        if (!$question) {
            return back()->with('error', 'Soal tidak ditemukan pada attempt ini.');
        }

        $awardedPoints = (int) $validated['awarded_points'];
        $maxPoints = (int) $question->points;

        if ($awardedPoints > $maxPoints) {
            $awardedPoints = $maxPoints;
        }

        QuizAnswer::query()->updateOrCreate(
            [
                'quiz_attempt_id' => $attempt->id,
                'quiz_question_id' => $question->id,
            ],
            [
                'is_correct' => $maxPoints > 0 ? $awardedPoints >= $maxPoints : false,
                'awarded_points' => $awardedPoints,
                'answered_at' => now(),
            ]
        );

        $this->recalculateAttemptTotals($attempt);

        return back()->with('success', 'Nilai per soal berhasil diperbarui.');
    }

    private function recalculateAttemptTotals(QuizAttempt $attempt): void
    {
        $attempt->loadMissing([
            'quiz.questions:id,quiz_id,points',
            'answers:id,quiz_attempt_id,quiz_question_id,awarded_points',
        ]);

        $answersByQuestionId = $attempt->answers->keyBy('quiz_question_id');

        $totalPoints = 0;
        $correctCount = 0;
        $wrongCount = 0;

        foreach ($attempt->quiz->questions as $question) {
            $questionPoints = (int) $question->points;
            $awardedPoints = (int) ($answersByQuestionId->get($question->id)?->awarded_points ?? 0);

            $totalPoints += $awardedPoints;

            if ($questionPoints > 0 && $awardedPoints >= $questionPoints) {
                $correctCount++;
            } else {
                $wrongCount++;
            }
        }

        $attempt->update([
            'total_points' => $totalPoints,
            'correct_count' => $correctCount,
            'wrong_count' => $wrongCount,
        ]);
    }

    private function canViewAttempt(User $user, array $roles, QuizAttempt $attempt): bool
    {
        if ($roles['admin']) {
            return true;
        }

        $attempt->loadMissing([
            'quiz:id,user_id',
            'quiz.teacherAccess:id,quiz_id,user_id,permission',
            'user:id,orang_tua_id',
        ]);

        if ($roles['guru']) {
            return (int) $attempt->quiz->user_id === (int) $user->id
                || $attempt->quiz->teacherAccess
                    ->where('user_id', $user->id)
                    ->whereIn('permission', ['view', 'edit'])
                    ->isNotEmpty();
        }

        if ($roles['siswa']) {
            return (int) $attempt->user_id === (int) $user->id;
        }

        if ($roles['orang_tua']) {
            return (int) $attempt->user?->orang_tua_id === (int) $user->id;
        }

        return false;
    }

    private function canEditAttempt(User $user, array $roles, QuizAttempt $attempt): bool
    {
        if ($roles['admin']) {
            return true;
        }

        if (!$roles['guru']) {
            return false;
        }

        $attempt->loadMissing([
            'quiz:id,user_id',
            'quiz.teacherAccess:id,quiz_id,user_id,permission',
        ]);

        return (int) $attempt->quiz->user_id === (int) $user->id
            || $attempt->quiz->teacherAccess
                ->where('user_id', $user->id)
                ->where('permission', 'edit')
                ->isNotEmpty();
    }

    private function formatAnswerKey(QuizQuestion $question): string
    {
        if (in_array($question->question_type, [QuizQuestion::TYPE_MULTIPLE_CHOICE, QuizQuestion::TYPE_TRUE_FALSE], true)) {
            $correctOptions = $question->options
                ->where('is_correct', true)
                ->pluck('option_text')
                ->filter()
                ->values();

            return $correctOptions->isNotEmpty()
                ? $correctOptions->implode(', ')
                : '-';
        }

        if ($question->question_type === QuizQuestion::TYPE_SHORT_ANSWER) {
            $answers = $question->shortAnswerFields
                ->pluck('expected_answer')
                ->filter(fn ($value) => is_string($value) && trim($value) !== '')
                ->values();

            return $answers->isNotEmpty()
                ? $answers->implode(', ')
                : '-';
        }

        if ($question->question_type === QuizQuestion::TYPE_MATCHING_PAIRS) {
            $pairs = $question->matchingPairs
                ->sortBy('order')
                ->map(function ($pair) {
                    $left = trim((string) $pair->left_text);
                    $right = trim((string) $pair->right_text);

                    if ($left === '' && $right === '') {
                        return null;
                    }

                    return ($left !== '' ? $left : '-') . ' => ' . ($right !== '' ? $right : '-');
                })
                ->filter()
                ->values();

            return $pairs->isNotEmpty()
                ? $pairs->implode('; ')
                : '-';
        }

        if ($question->question_type === QuizQuestion::TYPE_LONG_ANSWER) {
            return 'Jawaban esai (dinilai manual oleh guru)';
        }

        return '-';
    }

    private function resolveRoles(User $user): array
    {
        $roleSlugs = $user->roles()->pluck('slug')->all();

        return [
            'admin' => in_array('admin', $roleSlugs, true),
            'guru' => in_array('guru-telaah-soal', $roleSlugs, true)
                || in_array('guru-mata-pelajaran', $roleSlugs, true),
            'siswa' => in_array('siswa', $roleSlugs, true),
            'orang_tua' => in_array('orang-tua', $roleSlugs, true),
        ];
    }
}
