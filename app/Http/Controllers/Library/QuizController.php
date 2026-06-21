<?php

namespace App\Http\Controllers\Library;

use App\Http\Controllers\Controller;
use App\Models\CatatanTelaahSoal;
use App\Models\Gallery;
use App\Models\Jenjang;
use App\Models\Kelas;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\QuizBackground;
use App\Models\QuizCategory;
use App\Models\QuizStudentAccess;
use App\Models\QuizTeacherAccess;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;

class QuizController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $userId = $user?->id;
        $isAdmin = $user?->isAdmin() ?? false;

        $query = Quiz::with(['category', 'jenjang', 'kelas', 'user:id,name']);

        if (! $isAdmin && $user) {
            $query->forUserAudience($user);

            $query->where(function ($q) use ($userId) {
                $q->where('user_id', $userId)
                    ->orWhereHas('teacherAccess', function ($teacherAccess) use ($userId) {
                        $teacherAccess->where('user_id', $userId);
                    })
                    ->orWhereHas('studentAccess', function ($studentAccess) use ($userId) {
                        $studentAccess->where('user_id', $userId);
                    });
            });
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        } else {
            $query->where('status', '!=', 'archived');
        }

        // Filter by category
        if ($request->filled('category')) {
            $query->where('quiz_category_id', $request->category);
        }

        // Filter by jenjang
        if ($request->filled('jenjang_id')) {
            $query->where('jenjang_id', $request->jenjang_id);
        }

        // Filter by kelas
        if ($request->filled('kelas_id')) {
            $query->where('kelas_id', $request->kelas_id);
        }

        // Search
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', '%'.$request->search.'%')
                    ->orWhere('description', 'like', '%'.$request->search.'%')
                    ->orWhere('join_code', 'like', '%'.$request->search.'%');
            });
        }

        $quizzes = $query->latest()->paginate(12)
            ->through(function (Quiz $quiz) use ($userId, $isAdmin) {
                $canEdit = $isAdmin || $quiz->user_id === $userId || $quiz->hasTeacherAccess($userId, 'edit');
                $canPreview = $isAdmin
                    || $quiz->user_id === $userId
                    || $quiz->teacherAccess()
                        ->where('user_id', $userId)
                        ->whereIn('permission', ['view', 'edit', 'telaah_soal'])
                        ->exists();
                $canReview = $isAdmin || $quiz->hasTeacherAccess($userId, 'telaah_soal');

                // Hitung catatan telaah yang masih butuh review pada quiz ini
                $catatanButuhReviewCount = 0;
                if ($canEdit || $canReview) {
                    $catatanButuhReviewCount = CatatanTelaahSoal::whereHas('question', function ($q) use ($quiz) {
                        $q->where('quiz_id', $quiz->id);
                    })->where('status', 'butuh_review')->count();
                }

                return [
                    'id' => $quiz->id,
                    'title' => $quiz->title,
                    'slug' => $quiz->slug,
                    'join_code' => $quiz->join_code,
                    'description' => $quiz->description,
                    'status' => $quiz->status,
                    'audience' => $quiz->audience ?: Quiz::AUDIENCE_REGULAR,
                    'duration' => $quiz->duration,
                    'starts_at' => $quiz->starts_at?->toIso8601String(),
                    'ends_at' => $quiz->ends_at?->toIso8601String(),
                    'passing_score' => $quiz->passing_score ?? 70,
                    'category' => $quiz->category,
                    'jenjang' => $quiz->jenjang,
                    'kelas' => $quiz->kelas,
                    'creator' => $quiz->user ? [
                        'id' => $quiz->user->id,
                        'name' => $quiz->user->name,
                    ] : null,
                    'created_at' => $quiz->created_at,
                    'can_edit' => $canEdit,
                    'can_preview' => $canPreview,
                    'can_manage_questions' => $canEdit,
                    'can_delete' => $isAdmin || $quiz->user_id === $userId,
                    'can_review' => $canReview,
                    'can_manage_access' => $isAdmin || $quiz->user_id === $userId,
                    'catatan_butuh_review_count' => $catatanButuhReviewCount,
                ];
            });
        $categories = QuizCategory::all();

        return Inertia::render('library/quizzes/index', [
            'quizzes' => $quizzes,
            'categories' => $categories,
            'jenjangs' => Jenjang::all(),
            'kelases' => Kelas::all(),
            'filters' => $request->only(['status', 'category', 'jenjang_id', 'kelas_id', 'search']),
        ]);
    }

    public function create()
    {
        if (! $this->canCreateQuiz()) {
            abort(403);
        }

        $categories = QuizCategory::all();
        $backgrounds = QuizBackground::where('is_public', true)
            ->orWhere('user_id', auth()->id())
            ->latest()
            ->get();

        return Inertia::render('library/quizzes/create', [
            'categories' => $categories,
            'backgrounds' => $backgrounds,
            'jenjangs' => Jenjang::all(),
            'kelases' => Kelas::all(),
        ]);
    }

    public function store(Request $request)
    {
        if (! $this->canCreateQuiz()) {
            abort(403);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'quiz_category_id' => 'required|exists:quiz_categories,id',
            'jenjang_id' => 'nullable|exists:jenjangs,id',
            'kelas_id' => 'nullable|exists:kelas,id',
            'quiz_background_id' => 'nullable|exists:quiz_backgrounds,id',
            'background_file' => 'nullable|file|mimes:jpeg,png,jpg,gif|max:10240',
            'duration' => 'nullable|integer|min:1',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date|after_or_equal:starts_at',
            'passing_score' => 'nullable|integer|min:0|max:100',
        ]);

        $backgroundId = $request->quiz_background_id;

        if ($request->hasFile('background_file')) {
            $file = $request->file('background_file');
            $fileName = time().'_'.Str::slug($request->title).'_bg.'.$file->getClientOriginalExtension();

            $destinationPath = public_path('uploads/backgrounds');
            if (! File::exists($destinationPath)) {
                File::makeDirectory($destinationPath, 0755, true);
            }

            $file->move($destinationPath, $fileName);
            $filePath = '/uploads/backgrounds/'.$fileName;

            $background = QuizBackground::create([
                'user_id' => auth()->id(),
                'name' => 'Background for '.$request->title,
                'image_path' => $filePath,
                'is_public' => false,
            ]);

            $backgroundId = $background->id;
        }

        $quiz = Quiz::create([
            'user_id' => auth()->id(),
            'title' => $request->title,
            'slug' => Str::slug($request->title).'-'.Str::random(6),
            'join_code' => strtoupper(Str::random(6)),
            'description' => $request->description,
            'quiz_category_id' => $request->quiz_category_id,
            'audience' => $request->user()->quizAudience(),
            'jenjang_id' => $request->jenjang_id,
            'kelas_id' => $request->kelas_id,
            'quiz_background_id' => $backgroundId,
            'duration' => $request->duration,
            'starts_at' => $request->starts_at,
            'ends_at' => $request->ends_at,
            'passing_score' => $request->passing_score ?? 70,
            'status' => 'draft',
        ]);

        return redirect()->route('library.quizzes.access', $quiz->id)
            ->with('success', 'Kuis berhasil dibuat, silakan atur akses kuis ini.');
    }

    public function edit(Quiz $quiz)
    {
        if (! $this->canEditQuiz($quiz)) {
            abort(403);
        }

        $categories = QuizCategory::all();
        $backgrounds = QuizBackground::where('is_public', true)
            ->orWhere('user_id', auth()->id())
            ->latest()
            ->get();

        return Inertia::render('library/quizzes/edit', [
            'quiz' => $quiz->load(['category', 'background', 'jenjang', 'kelas']),
            'categories' => $categories,
            'backgrounds' => $backgrounds,
            'jenjangs' => Jenjang::all(),
            'kelases' => Kelas::all(),
            'canManageAccess' => $this->canManageAccess($quiz),
        ]);
    }

    public function update(Request $request, Quiz $quiz)
    {
        if (! $this->canEditQuiz($quiz)) {
            abort(403);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'quiz_category_id' => 'nullable|exists:quiz_categories,id',
            'jenjang_id' => 'nullable|exists:jenjangs,id',
            'kelas_id' => 'nullable|exists:kelas,id',
            'quiz_background_id' => 'nullable|exists:quiz_backgrounds,id',
            'background_file' => 'nullable|file|mimes:jpeg,png,jpg,gif|max:10240',
            'status' => 'required|in:draft,live,finished,archived',
            'duration' => 'nullable|integer|min:1',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date|after_or_equal:starts_at',
            'passing_score' => 'nullable|integer|min:0|max:100',
        ]);

        $backgroundId = $request->quiz_background_id;

        if ($request->hasFile('background_file')) {
            $file = $request->file('background_file');
            $fileName = time().'_'.Str::slug($request->title).'_bg.'.$file->getClientOriginalExtension();

            $destinationPath = public_path('uploads/backgrounds');
            if (! File::exists($destinationPath)) {
                File::makeDirectory($destinationPath, 0755, true);
            }

            $file->move($destinationPath, $fileName);
            $filePath = '/uploads/backgrounds/'.$fileName;

            $background = QuizBackground::create([
                'user_id' => auth()->id(),
                'name' => 'Background for '.$request->title,
                'image_path' => $filePath,
                'is_public' => false,
            ]);

            $backgroundId = $background->id;
        }

        $quiz->update([
            'title' => $request->title,
            'description' => $request->description,
            'quiz_category_id' => $request->quiz_category_id,
            'jenjang_id' => $request->jenjang_id,
            'kelas_id' => $request->kelas_id,
            'quiz_background_id' => $backgroundId,
            'duration' => $request->duration,
            'starts_at' => $request->starts_at,
            'ends_at' => $request->ends_at,
            'passing_score' => $request->passing_score ?? 70,
            'status' => $request->status,
        ]);

        return redirect()->route('library.quizzes.index')
            ->with('success', 'Kuis berhasil diperbarui.');
    }

    public function updateStatus(Request $request, Quiz $quiz)
    {
        if (! $this->canEditQuiz($quiz) && ! $this->canReviewQuiz($quiz)) {
            abort(403);
        }

        $request->validate([
            'status' => 'required|in:draft,live,finished,archived',
        ]);

        $quiz->update(['status' => $request->status]);

        if ($request->query('redirect_to_index')) {
            return redirect()->route('library.quizzes.index')
                ->with('success', 'Status kuis berhasil diperbarui.');
        }

        return back()->with('success', 'Status kuis berhasil diperbarui.');
    }

    public function destroy(Quiz $quiz)
    {
        if (! $this->canManageAccess($quiz)) {
            abort(403);
        }

        $quiz->update(['status' => 'archived']);

        return redirect()->route('library.quizzes.index')
            ->with('success', 'Kuis berhasil diarsipkan.');
    }

    public function questions(Quiz $quiz)
    {
        if (! $this->canEditQuiz($quiz)) {
            abort(403);
        }

        $galleries = $this->visibleGalleriesQuery()->latest()->get();

        // Load catatan telaah untuk ditampilkan di editor soal
        $quiz->load([
            'questions.options',
            'questions.matchingPairs',
            'questions.shortAnswerFields',
            'questions.catatanTelaah.user',
        ]);

        // Tambahkan count catatan yang butuh review per question
        $quiz->questions->each(function ($question) {
            $question->catatan_telaah_count = $question->catatanTelaah
                ->where('status', 'butuh_review')
                ->count();
        });

        return Inertia::render('library/quizzes/questions', [
            'quiz' => $quiz,
            'galleries' => $galleries,
        ]);
    }

    public function downloadQuestionsPdf(Quiz $quiz)
    {
        if (! $this->canPreviewQuiz($quiz)) {
            abort(403);
        }

        $quiz->load([
            'category',
            'jenjang',
            'kelas',
            'questions.options',
            'questions.matchingPairs',
            'questions.shortAnswerFields',
        ]);

        $quiz->questions->each(function ($question) {
            $question->setAttribute(
                'pdf_media_src',
                $this->pdfImageDataUri($question->media_path)
            );

            $question->matchingPairs->each(function ($pair) {
                $pair->setAttribute(
                    'pdf_left_media_src',
                    $this->pdfImageDataUri($pair->left_media_path)
                );
                $pair->setAttribute(
                    'pdf_right_media_src',
                    $this->pdfImageDataUri($pair->right_media_path)
                );
            });
        });

        $pdf = Pdf::loadView('pdf.quiz-questions', [
            'quiz' => $quiz,
            'logoSrc' => $this->pdfImageDataUri('/images/Logo-SMP-Al-Falah-Terbaru-24-25.png'),
            'generatedAt' => now(),
        ])->setPaper('a4', 'portrait');

        return $pdf->download(Str::slug($quiz->title).'-soal.pdf');
    }

    public function preview(Quiz $quiz)
    {
        if (! $this->canPreviewQuiz($quiz)) {
            abort(403);
        }

        $quiz->load(['questions.options', 'questions.matchingPairs', 'questions.shortAnswerFields', 'background']);

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

        return Inertia::render('library/quizzes/preview', [
            'quiz' => $quiz,
            'canManageQuestions' => $this->canEditQuiz($quiz),
        ]);
    }

    /**
     * Halaman Telaah Soal — untuk user dengan akses telaah_soal.
     */
    public function telaahSoal(Quiz $quiz)
    {
        if (! $this->canReviewQuiz($quiz)) {
            abort(403);
        }

        $quiz->load([
            'questions.options',
            'questions.matchingPairs',
            'questions.shortAnswerFields',
            'questions.catatanTelaah.user',
            'background',
            'category',
            'jenjang',
            'kelas',
        ]);

        // Tambahkan count catatan butuh_review per question
        $quiz->questions->each(function ($question) {
            $question->catatan_telaah_count = $question->catatanTelaah
                ->where('status', 'butuh_review')
                ->count();
        });

        return Inertia::render('library/quizzes/telaah-soal', [
            'quiz' => $quiz,
        ]);
    }

    public function storeQuestions(Request $request, Quiz $quiz)
    {
        if (! $this->canEditQuiz($quiz)) {
            abort(403);
        }

        Log::info('storeQuestions called: ', $request->all());

        $request->validate([
            'questions' => 'array',
            'questions.*.id' => 'nullable|integer',
            'questions.*.question_text' => 'required|string',
            'questions.*.question_type' => 'required|in:multiple_choice,long_answer,short_answer,matching_pairs,true_false',
            'questions.*.media_path' => 'nullable|string',
            'questions.*.explanation' => 'nullable|string',
            'questions.*.points' => 'required|integer',
            'questions.*.options' => 'nullable|array',
            'questions.*.options.*.option_text' => 'nullable|string',
            'questions.*.options.*.is_correct' => 'boolean',
            'questions.*.matching_pairs' => 'nullable|array',
            'questions.*.matching_pairs.*.left_text' => 'nullable|string',
            'questions.*.matching_pairs.*.right_text' => 'nullable|string',
            'questions.*.matching_pairs.*.left_media_path' => 'nullable|string',
            'questions.*.matching_pairs.*.right_media_path' => 'nullable|string',
            'questions.*.short_answer_fields' => 'nullable|array',
            'questions.*.short_answer_fields.*.label' => 'nullable|string',
            'questions.*.short_answer_fields.*.placeholder' => 'nullable|string',
            'questions.*.short_answer_fields.*.character_limit' => 'nullable|integer',
            'questions.*.short_answer_fields.*.expected_answer' => 'nullable|string',
            'questions.*.short_answer_fields.*.case_sensitive' => 'boolean',
            'questions.*.short_answer_fields.*.trim_whitespace' => 'boolean',
        ]);

        $existingQuestionIds = collect($request->questions)->pluck('id')->filter()->toArray();
        $quiz->questions()->whereNotIn('id', $existingQuestionIds)->delete();

        foreach ($request->questions as $index => $qData) {
            $question = $quiz->questions()->updateOrCreate(
                ['id' => $qData['id'] ?? null],
                [
                    'question_text' => $qData['question_text'],
                    'question_type' => $qData['question_type'],
                    'media_path' => $qData['media_path'] ?? null,
                    'explanation' => $qData['explanation'] ?? null,
                    'points' => $qData['points'],
                    'order' => $index,
                ]
            );

            // Clear existing related data
            $question->options()->delete();
            $question->matchingPairs()->delete();
            $question->shortAnswerFields()->delete();

            // Handle options for multiple_choice and true_false
            if (in_array($qData['question_type'], ['multiple_choice', 'true_false'])) {
                $options = $qData['options'] ?? [];
                foreach ($options as $oIndex => $oData) {
                    if (! empty($oData['option_text'])) {
                        $question->options()->create([
                            'option_text' => $oData['option_text'],
                            'is_correct' => filter_var($oData['is_correct'] ?? false, FILTER_VALIDATE_BOOLEAN),
                            'order' => $oIndex,
                        ]);
                    }
                }
            }

            // Handle matching pairs
            if ($qData['question_type'] === 'matching_pairs') {
                $pairs = $qData['matching_pairs'] ?? [];
                foreach ($pairs as $pIndex => $pData) {
                    $hasLeftContent = filled($pData['left_text'] ?? null)
                        || filled($pData['left_media_path'] ?? null);
                    $hasRightContent = filled($pData['right_text'] ?? null)
                        || filled($pData['right_media_path'] ?? null);

                    if ($hasLeftContent && $hasRightContent) {
                        $question->matchingPairs()->create([
                            'left_text' => $pData['left_text'] ?? '',
                            'right_text' => $pData['right_text'] ?? '',
                            'left_media_path' => $pData['left_media_path'] ?? null,
                            'right_media_path' => $pData['right_media_path'] ?? null,
                            'order' => $pIndex,
                        ]);
                    }
                }
            }

            // Handle short answer fields
            if (in_array($qData['question_type'], ['short_answer', 'long_answer'])) {
                $fields = $qData['short_answer_fields'] ?? [];
                foreach ($fields as $fIndex => $fData) {
                    $question->shortAnswerFields()->create([
                        'label' => $fData['label'] ?? null,
                        'placeholder' => $fData['placeholder'] ?? null,
                        'character_limit' => $fData['character_limit'] ?? null,
                        'expected_answer' => $fData['expected_answer'] ?? '',
                        'case_sensitive' => $fData['case_sensitive'] ?? false,
                        'trim_whitespace' => $fData['trim_whitespace'] ?? true,
                        'order' => $fIndex,
                    ]);
                }
            }
        }

        if ($request->query('redirect_to_index')) {
            return redirect()->route('library.quizzes.index')
                ->with('success', 'Pertanyaan berhasil disimpan.');
        }

        return back()->with('success', 'Pertanyaan berhasil disimpan.');
    }

    /**
     * Show quiz access management page.
     */
    public function access(Quiz $quiz)
    {
        if (! $this->canManageAccess($quiz)) {
            abort(403);
        }

        $quiz->load([
            'user:id,name,email,jenjang_id,kelas_id',
            'user.roles:id,name,slug',
            'user.jenjang',
            'user.kelas',
            'teacherAccess.user.roles',
            'studentAccess.user.jenjang',
            'studentAccess.user.kelas',
            'studentAccess.user.orangTua',
        ]);

        $teacherRoleSlugs = $this->teacherRoleSlugsForQuiz($quiz);
        $studentRoleSlugs = $this->studentRoleSlugsForQuiz($quiz);

        $teachers = User::whereHas('roles', function ($q) use ($teacherRoleSlugs) {
            $q->whereIn('roles.slug', $teacherRoleSlugs);
        })
            ->where('id', '!=', auth()->id())
            ->with(['roles', 'jenjang', 'kelas'])
            ->get();

        $students = User::whereHas('roles', function ($q) use ($studentRoleSlugs) {
            $q->whereIn('roles.slug', $studentRoleSlugs);
        })
            ->with(['jenjang', 'kelas', 'orangTua'])
            ->get();

        // Get all jenjangs for bulk student access
        $jenjangs = Jenjang::orderBy('jenjang')->get();
        // Get all kelas for filtering
        $kelases = Kelas::orderBy('nama_kelas')->get();

        // Ensure studentAccess has user.jenjang loaded
        $studentAccessList = $quiz->studentAccess()->with(['user.jenjang', 'user.kelas', 'user.orangTua'])->get();
        $teacherAccessList = $quiz->teacherAccess()->with(['user.roles', 'user.jenjang', 'user.kelas'])->get();

        $completedAttemptCounts = QuizAttempt::query()
            ->where('quiz_id', $quiz->id)
            ->whereIn('user_id', $studentAccessList->pluck('user_id'))
            ->whereNotNull('completed_at')
            ->selectRaw('user_id, COUNT(*) as total')
            ->groupBy('user_id')
            ->pluck('total', 'user_id');

        $studentAccessList->each(function ($access) use ($completedAttemptCounts) {
            $access->setAttribute('attempt_count', (int) ($completedAttemptCounts[$access->user_id] ?? 0));
        });

        return Inertia::render('library/quizzes/access', [
            'quiz' => $quiz,
            'teachers' => $teachers,
            'students' => $students,
            'teacherAccess' => $teacherAccessList,
            'studentAccess' => $studentAccessList,
            'jenjangs' => $jenjangs,
            'kelases' => $kelases,
        ]);
    }

    /**
     * Grant teacher access to quiz.
     */
    public function grantTeacherAccess(Request $request, Quiz $quiz)
    {
        if (! $this->canManageAccess($quiz)) {
            abort(403);
        }

        $request->validate([
            'user_id' => 'required|exists:users,id',
            'permission' => 'required|in:view,edit,telaah_soal',
        ]);

        $teacher = User::findOrFail($request->user_id);
        if (! $this->canReceiveTeacherAccess($quiz, $teacher)) {
            return back()->with('error', 'Guru yang dipilih tidak sesuai dengan mode kuis ini.');
        }

        QuizTeacherAccess::updateOrCreate(
            ['quiz_id' => $quiz->id, 'user_id' => $request->user_id],
            [
                'permission' => $request->permission,
                'granted_by' => auth()->id(),
                'granted_at' => now(),
            ]
        );

        return back()->with('success', 'Akses guru berhasil diberikan.');
    }

    /**
     * Revoke teacher access from quiz.
     */
    public function revokeTeacherAccess(Quiz $quiz, $userId)
    {
        if (! $this->canManageAccess($quiz)) {
            abort(403);
        }

        QuizTeacherAccess::where('quiz_id', $quiz->id)
            ->where('user_id', $userId)
            ->delete();

        return back()->with('success', 'Akses guru berhasil dicabut.');
    }

    /**
     * Grant student access to quiz.
     */
    public function grantStudentAccess(Request $request, Quiz $quiz)
    {
        if (! $this->canManageAccess($quiz)) {
            abort(403);
        }

        $request->validate([
            'user_ids' => 'required|array',
            'user_ids.*' => 'exists:users,id',
        ]);

        $requestedUserIds = collect($request->user_ids)
            ->map(fn ($userId) => (int) $userId)
            ->unique()
            ->values();

        $allowedStudentIds = User::whereIn('id', $requestedUserIds)
            ->whereHas('roles', function ($q) use ($quiz) {
                $q->whereIn('roles.slug', $this->studentRoleSlugsForQuiz($quiz));
            })
            ->pluck('id');

        if ($allowedStudentIds->count() !== $requestedUserIds->count()) {
            return back()->with('error', 'Ada siswa yang tidak sesuai dengan mode kuis ini.');
        }

        foreach ($allowedStudentIds as $userId) {
            QuizStudentAccess::updateOrCreate(
                ['quiz_id' => $quiz->id, 'user_id' => $userId],
                [
                    'granted_by' => auth()->id(),
                    'granted_at' => now(),
                ]
            );
        }

        return back()->with('success', 'Akses siswa berhasil diberikan.');
    }

    /**
     * Revoke student access from quiz.
     */
    public function revokeStudentAccess(Quiz $quiz, $userId)
    {
        if (! $this->canManageAccess($quiz)) {
            abort(403);
        }

        QuizStudentAccess::where('quiz_id', $quiz->id)
            ->where('user_id', $userId)
            ->delete();

        return back()->with('success', 'Akses siswa berhasil dicabut.');
    }

    /**
     * Grant student access by jenjang.
     */
    public function grantStudentAccessByJenjang(Request $request, Quiz $quiz)
    {
        if (! $this->canManageAccess($quiz)) {
            abort(403);
        }

        $request->validate([
            'jenjang_id' => 'required|exists:jenjangs,id',
        ]);

        $studentRoleSlugs = $this->studentRoleSlugsForQuiz($quiz);
        $students = User::whereHas('roles', function ($q) use ($studentRoleSlugs) {
            $q->whereIn('roles.slug', $studentRoleSlugs);
        })->where('jenjang_id', $request->jenjang_id)->get();

        foreach ($students as $student) {
            QuizStudentAccess::updateOrCreate(
                ['quiz_id' => $quiz->id, 'user_id' => $student->id],
                [
                    'granted_by' => auth()->id(),
                    'granted_at' => now(),
                ]
            );
        }

        return back()->with('success', 'Akses berhasil diberikan ke '.$students->count().' siswa.');
    }

    private function canEditQuiz(Quiz $quiz): bool
    {
        $user = auth()->user();
        if (! $user) {
            return false;
        }

        if ($user->isAdmin()) {
            return true;
        }

        if (! $quiz->isInUserAudience($user)) {
            return false;
        }

        return $quiz->user_id === $user->id
            || $quiz->hasTeacherAccess($user->id, 'edit');
    }

    private function canPreviewQuiz(Quiz $quiz): bool
    {
        $user = auth()->user();
        if (! $user) {
            return false;
        }

        if ($user->isAdmin()) {
            return true;
        }

        if (! $quiz->isInUserAudience($user)) {
            return false;
        }

        return $quiz->user_id === $user->id
            || $quiz->teacherAccess()
                ->where('user_id', $user->id)
                ->whereIn('permission', ['view', 'edit', 'telaah_soal'])
                ->exists();
    }

    private function canReviewQuiz(Quiz $quiz): bool
    {
        $user = auth()->user();
        if (! $user) {
            return false;
        }

        if ($user->isAdmin()) {
            return true;
        }

        if (! $quiz->isInUserAudience($user)) {
            return false;
        }

        return $quiz->hasTeacherAccess($user->id, 'telaah_soal');
    }

    private function canManageAccess(Quiz $quiz): bool
    {
        $user = auth()->user();

        if (! $user) {
            return false;
        }

        if ($user->isAdmin()) {
            return true;
        }

        return $quiz->isInUserAudience($user)
            && $quiz->user_id === $user->id;
    }

    private function canCreateQuiz(): bool
    {
        $user = auth()->user();

        return $user && ($user->isAdmin() || $user->isTeacher());
    }

    private function teacherRoleSlugsForQuiz(Quiz $quiz): array
    {
        return $quiz->isGuestAudience()
            ? User::GUEST_TEACHER_ROLE_SLUGS
            : User::REGULAR_TEACHER_ROLE_SLUGS;
    }

    private function studentRoleSlugsForQuiz(Quiz $quiz): array
    {
        return $quiz->isGuestAudience()
            ? User::GUEST_STUDENT_ROLE_SLUGS
            : User::REGULAR_STUDENT_ROLE_SLUGS;
    }

    private function canReceiveTeacherAccess(Quiz $quiz, User $teacher): bool
    {
        return $teacher->hasRoleSlug($this->teacherRoleSlugsForQuiz($quiz));
    }

    private function visibleGalleriesQuery()
    {
        $user = auth()->user();
        $query = Gallery::query();

        if (! $user || $user->isAdmin()) {
            return $query;
        }

        return $query->where(function ($visibilityQuery) use ($user) {
            if ($user->isGuest()) {
                $visibilityQuery->whereHas('user.roles', function ($rolesQuery) {
                    $rolesQuery->whereIn('roles.slug', User::GUEST_ROLE_SLUGS);
                });

                return;
            }

            $visibilityQuery
                ->whereDoesntHave('user.roles', function ($rolesQuery) {
                    $rolesQuery->whereIn('roles.slug', User::GUEST_ROLE_SLUGS);
                })
                ->orWhereNull('user_id');
        });
    }

    private function pdfImageDataUri(?string $mediaPath): ?string
    {
        if (! filled($mediaPath)) {
            return null;
        }

        if (str_starts_with($mediaPath, 'data:image/')) {
            return $mediaPath;
        }

        $urlPath = parse_url($mediaPath, PHP_URL_PATH);
        if (! is_string($urlPath) || $urlPath === '') {
            return null;
        }

        $publicDirectory = realpath(public_path());
        $filePath = realpath(public_path(ltrim($urlPath, '/\\')));

        if (! $publicDirectory || ! $filePath || ! is_file($filePath)) {
            return null;
        }

        $publicPrefix = strtolower($publicDirectory.DIRECTORY_SEPARATOR);
        if (! str_starts_with(strtolower($filePath), $publicPrefix)) {
            return null;
        }

        $mimeType = mime_content_type($filePath);
        if (! is_string($mimeType) || ! str_starts_with($mimeType, 'image/')) {
            return null;
        }

        $contents = file_get_contents($filePath);
        if ($contents === false) {
            return null;
        }

        return 'data:'.$mimeType.';base64,'.base64_encode($contents);
    }
}
