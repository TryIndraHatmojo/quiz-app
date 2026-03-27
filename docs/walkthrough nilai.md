# Walkthrough: Rombak Halaman Nilai

## Summary
Complete overhaul of the Nilai (Grades) pages with summary cards, quiz-grouped layout, filters, KKM (minimum passing score), and exam scheduling fields.

## Changes Made

### 1. Database Migration
#### [NEW] [2026_03_28_000001_add_exam_dates_and_passing_score_to_quizzes_table.php](file:///c:/xampp/htdocs/quiz-app/database/migrations/2026_03_28_000001_add_exam_dates_and_passing_score_to_quizzes_table.php)
- Adds `starts_at` (timestamp, nullable) — exam start date
- Adds `ends_at` (timestamp, nullable) — exam end date
- Adds `passing_score` (unsigned tinyint, default 70) — KKM percentage

---

### 2. Models

#### [MODIFY] [Quiz.php](file:///c:/xampp/htdocs/quiz-app/app/Models/Quiz.php)
```diff:Quiz.php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Quiz extends Model
{
    use HasFactory;

    public const TIME_MODE_PER_QUESTION = 'per_question';
    public const TIME_MODE_TOTAL = 'total';

    public const TIME_MODES = [
        self::TIME_MODE_PER_QUESTION,
        self::TIME_MODE_TOTAL,
    ];

    protected $fillable = [
        'user_id',
        'quiz_category_id',
        'jenjang_id',
        'kelas_id',
        'title',
        'slug',
        'join_code',
        'description',
        'status',
        'time_mode',
        'duration',
        'quiz_background_id',
    ];

    protected $casts = [
        'duration' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(QuizCategory::class, 'quiz_category_id');
    }

    public function questions(): HasMany
    {
        return $this->hasMany(QuizQuestion::class)->orderBy('order');
    }

    public function attempts(): HasMany
    {
        return $this->hasMany(QuizAttempt::class);
    }

    public function background(): BelongsTo
    {
        return $this->belongsTo(QuizBackground::class, 'quiz_background_id');
    }

    public function jenjang(): BelongsTo
    {
        return $this->belongsTo(Jenjang::class);
    }

    public function kelas(): BelongsTo
    {
        return $this->belongsTo(Kelas::class);
    }

    /**
     * Get teachers who have access to this quiz.
     */
    public function teacherAccess(): HasMany
    {
        return $this->hasMany(QuizTeacherAccess::class);
    }

    /**
     * Get teachers who can edit this quiz.
     */
    public function teachersWithAccess()
    {
        return $this->belongsToMany(User::class, 'quiz_teacher_access')
            ->withPivot(['permission', 'granted_at', 'granted_by'])
            ->withTimestamps();
    }

    /**
     * Get students who have access to this quiz.
     */
    public function studentAccess(): HasMany
    {
        return $this->hasMany(QuizStudentAccess::class);
    }

    /**
     * Get students who can work on this quiz.
     */
    public function studentsWithAccess()
    {
        return $this->belongsToMany(User::class, 'quiz_student_access')
            ->withPivot(['granted_at', 'granted_by', 'accessed_at', 'attempt_count'])
            ->withTimestamps();
    }

    /**
     * Check if a teacher has access to edit this quiz.
     */
    public function hasTeacherAccess(int $userId, string $permission = 'edit'): bool
    {
        return $this->teacherAccess()
            ->where('user_id', $userId)
            ->where('permission', $permission)
            ->exists();
    }

    /**
     * Check if a student has access to this quiz.
     */
    public function hasStudentAccess(int $userId): bool
    {
        return $this->studentAccess()
            ->where('user_id', $userId)
            ->exists();
    }

    /**
     * Grant teacher access to this quiz.
     */
    public function grantTeacherAccess(int $userId, string $permission = 'edit', ?int $grantedBy = null): void
    {
        QuizTeacherAccess::updateOrCreate(
            ['quiz_id' => $this->id, 'user_id' => $userId],
            [
                'permission' => $permission,
                'granted_by' => $grantedBy ?? auth()->id(),
                'granted_at' => now(),
            ]
        );
    }

    /**
     * Grant student access to this quiz.
     */
    public function grantStudentAccess(int $userId, ?int $grantedBy = null): void
    {
        QuizStudentAccess::updateOrCreate(
            ['quiz_id' => $this->id, 'user_id' => $userId],
            [
                'granted_by' => $grantedBy ?? auth()->id(),
                'granted_at' => now(),
            ]
        );
    }
}
===
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Quiz extends Model
{
    use HasFactory;

    public const TIME_MODE_PER_QUESTION = 'per_question';
    public const TIME_MODE_TOTAL = 'total';

    public const TIME_MODES = [
        self::TIME_MODE_PER_QUESTION,
        self::TIME_MODE_TOTAL,
    ];

    protected $fillable = [
        'user_id',
        'quiz_category_id',
        'jenjang_id',
        'kelas_id',
        'title',
        'slug',
        'join_code',
        'description',
        'status',
        'time_mode',
        'duration',
        'starts_at',
        'ends_at',
        'passing_score',
        'quiz_background_id',
    ];

    protected $casts = [
        'duration' => 'integer',
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'passing_score' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(QuizCategory::class, 'quiz_category_id');
    }

    public function questions(): HasMany
    {
        return $this->hasMany(QuizQuestion::class)->orderBy('order');
    }

    public function attempts(): HasMany
    {
        return $this->hasMany(QuizAttempt::class);
    }

    public function background(): BelongsTo
    {
        return $this->belongsTo(QuizBackground::class, 'quiz_background_id');
    }

    public function jenjang(): BelongsTo
    {
        return $this->belongsTo(Jenjang::class);
    }

    public function kelas(): BelongsTo
    {
        return $this->belongsTo(Kelas::class);
    }

    /**
     * Get teachers who have access to this quiz.
     */
    public function teacherAccess(): HasMany
    {
        return $this->hasMany(QuizTeacherAccess::class);
    }

    /**
     * Get teachers who can edit this quiz.
     */
    public function teachersWithAccess()
    {
        return $this->belongsToMany(User::class, 'quiz_teacher_access')
            ->withPivot(['permission', 'granted_at', 'granted_by'])
            ->withTimestamps();
    }

    /**
     * Get students who have access to this quiz.
     */
    public function studentAccess(): HasMany
    {
        return $this->hasMany(QuizStudentAccess::class);
    }

    /**
     * Get students who can work on this quiz.
     */
    public function studentsWithAccess()
    {
        return $this->belongsToMany(User::class, 'quiz_student_access')
            ->withPivot(['granted_at', 'granted_by', 'accessed_at', 'attempt_count'])
            ->withTimestamps();
    }

    /**
     * Check if a teacher has access to edit this quiz.
     */
    public function hasTeacherAccess(int $userId, string $permission = 'edit'): bool
    {
        return $this->teacherAccess()
            ->where('user_id', $userId)
            ->where('permission', $permission)
            ->exists();
    }

    /**
     * Check if a student has access to this quiz.
     */
    public function hasStudentAccess(int $userId): bool
    {
        return $this->studentAccess()
            ->where('user_id', $userId)
            ->exists();
    }

    /**
     * Grant teacher access to this quiz.
     */
    public function grantTeacherAccess(int $userId, string $permission = 'edit', ?int $grantedBy = null): void
    {
        QuizTeacherAccess::updateOrCreate(
            ['quiz_id' => $this->id, 'user_id' => $userId],
            [
                'permission' => $permission,
                'granted_by' => $grantedBy ?? auth()->id(),
                'granted_at' => now(),
            ]
        );
    }

    /**
     * Grant student access to this quiz.
     */
    public function grantStudentAccess(int $userId, ?int $grantedBy = null): void
    {
        QuizStudentAccess::updateOrCreate(
            ['quiz_id' => $this->id, 'user_id' => $userId],
            [
                'granted_by' => $grantedBy ?? auth()->id(),
                'granted_at' => now(),
            ]
        );
    }
}
```

#### [MODIFY] [QuizAttempt.php](file:///c:/xampp/htdocs/quiz-app/app/Models/QuizAttempt.php)
```diff:QuizAttempt.php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class QuizAttempt extends Model
{
    protected $fillable = [
        'quiz_id',
        'user_id',
        'started_at',
        'completed_at',
        'total_points',
        'correct_count',
        'wrong_count',
        'duration_seconds',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'total_points' => 'integer',
        'correct_count' => 'integer',
        'wrong_count' => 'integer',
        'duration_seconds' => 'integer',
    ];

    /**
     * Get the quiz that this attempt is for.
     */
    public function quiz(): BelongsTo
    {
        return $this->belongsTo(Quiz::class);
    }

    /**
     * Get the user who made this attempt.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get all answers for this attempt.
     */
    public function answers(): HasMany
    {
        return $this->hasMany(QuizAnswer::class);
    }

    /**
     * Get all matching-pair detail answers in this attempt.
     */
    public function matchingPairAnswers(): HasMany
    {
        return $this->hasMany(QuizAnswerMatchingPair::class);
    }

    /**
     * Check if this attempt is completed.
     */
    public function isCompleted(): bool
    {
        return $this->completed_at !== null;
    }

    /**
     * Calculate score percentage.
     */
    public function getScorePercentageAttribute(): float
    {
        $quiz = $this->quiz()->with('questions')->first();
        if (!$quiz || !$quiz->questions) return 0;
        
        $maxPoints = $quiz->questions->sum('points');
        if ($maxPoints === 0) return 0;
        
        return round(($this->total_points / $maxPoints) * 100, 2);
    }

    /**
     * Complete the attempt and calculate scores.
     */
    public function complete(): void
    {
        $this->completed_at = now();
        
        // Calculate duration
        if ($this->started_at) {
            $this->duration_seconds = $this->started_at->diffInSeconds(now());
        }
        
        // Calculate scores from non-matching answers and matching detail answers.
        $answers = $this->answers()->with('question')->get();
        $matchingDetailAnswers = $this->matchingPairAnswers;

        $nonMatchingAnswers = $answers->filter(function (QuizAnswer $answer) {
            return $answer->question?->question_type !== QuizQuestion::TYPE_MATCHING_PAIRS;
        });

        $this->correct_count = $nonMatchingAnswers->where('is_correct', true)->count()
            + $matchingDetailAnswers->where('is_correct', true)->count();

        $this->wrong_count = $nonMatchingAnswers->where('is_correct', false)->count()
            + $matchingDetailAnswers->where('is_correct', false)->count();

        $this->total_points = (int) $nonMatchingAnswers->sum('awarded_points')
            + (int) $matchingDetailAnswers->sum('awarded_points');
        
        $this->save();
    }
}
===
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class QuizAttempt extends Model
{
    protected $fillable = [
        'quiz_id',
        'user_id',
        'started_at',
        'completed_at',
        'total_points',
        'correct_count',
        'wrong_count',
        'duration_seconds',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'total_points' => 'integer',
        'correct_count' => 'integer',
        'wrong_count' => 'integer',
        'duration_seconds' => 'integer',
    ];

    /**
     * Get the quiz that this attempt is for.
     */
    public function quiz(): BelongsTo
    {
        return $this->belongsTo(Quiz::class);
    }

    /**
     * Get the user who made this attempt.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get all answers for this attempt.
     */
    public function answers(): HasMany
    {
        return $this->hasMany(QuizAnswer::class);
    }

    /**
     * Get all matching-pair detail answers in this attempt.
     */
    public function matchingPairAnswers(): HasMany
    {
        return $this->hasMany(QuizAnswerMatchingPair::class);
    }

    /**
     * Check if this attempt is completed.
     */
    public function isCompleted(): bool
    {
        return $this->completed_at !== null;
    }

    /**
     * Calculate score percentage.
     */
    public function getScorePercentageAttribute(): float
    {
        $quiz = $this->quiz()->with('questions')->first();
        if (!$quiz || !$quiz->questions) return 0;
        
        $maxPoints = $quiz->questions->sum('points');
        if ($maxPoints === 0) return 0;
        
        return round(($this->total_points / $maxPoints) * 100, 2);
    }

    /**
     * Check if attempt passes the given KKM threshold.
     */
    public function isPassed(int $passingScore, int $maxPoints): bool
    {
        if ($maxPoints <= 0) {
            return false;
        }

        $percentage = round(($this->total_points / $maxPoints) * 100, 2);

        return $percentage >= $passingScore;
    }

    /**
     * Complete the attempt and calculate scores.
     */
    public function complete(): void
    {
        $this->completed_at = now();
        
        // Calculate duration
        if ($this->started_at) {
            $this->duration_seconds = $this->started_at->diffInSeconds(now());
        }
        
        // Calculate scores from non-matching answers and matching detail answers.
        $answers = $this->answers()->with('question')->get();
        $matchingDetailAnswers = $this->matchingPairAnswers;

        $nonMatchingAnswers = $answers->filter(function (QuizAnswer $answer) {
            return $answer->question?->question_type !== QuizQuestion::TYPE_MATCHING_PAIRS;
        });

        $this->correct_count = $nonMatchingAnswers->where('is_correct', true)->count()
            + $matchingDetailAnswers->where('is_correct', true)->count();

        $this->wrong_count = $nonMatchingAnswers->where('is_correct', false)->count()
            + $matchingDetailAnswers->where('is_correct', false)->count();

        $this->total_points = (int) $nonMatchingAnswers->sum('awarded_points')
            + (int) $matchingDetailAnswers->sum('awarded_points');
        
        $this->save();
    }
}
```

---

### 3. Seeders

#### [MODIFY] [QuizSeeder.php](file:///c:/xampp/htdocs/quiz-app/database/seeders/QuizSeeder.php)
- Added `starts_at`, `ends_at`, `passing_score` to all 5 quiz entries

#### [NEW] [QuizAttemptSeeder.php](file:///c:/xampp/htdocs/quiz-app/database/seeders/QuizAttemptSeeder.php)
- Creates realistic quiz attempt data for live quizzes
- Generates varied scores (30%-100%) for a mix of pass/fail results
- Creates quiz_answers for each question in each attempt

#### [MODIFY] [DatabaseSeeder.php](file:///c:/xampp/htdocs/quiz-app/database/seeders/DatabaseSeeder.php)
```diff:DatabaseSeeder.php
<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Call seeders in dependency order
        $this->call([
            RoleSeeder::class,           // First - no dependencies
            JenjangSeeder::class,         // No dependencies
            KelasSeeder::class,           // Depends on jenjangs
            UserSeeder::class,            // Depends on roles and jenjangs
            QuizCategorySeeder::class,    // No dependencies
            QuizSeeder::class,            // Depends on users and categories
            QuizQuestionSeeder::class,    // Depends on quizzes
            QuizQuestionOptionSeeder::class, // Depends on questions
        ]);
    }
}
===
<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Call seeders in dependency order
        $this->call([
            RoleSeeder::class,           // First - no dependencies
            JenjangSeeder::class,         // No dependencies
            KelasSeeder::class,           // Depends on jenjangs
            UserSeeder::class,            // Depends on roles and jenjangs
            QuizCategorySeeder::class,    // No dependencies
            QuizSeeder::class,            // Depends on users and categories
            QuizQuestionSeeder::class,    // Depends on quizzes
            QuizQuestionOptionSeeder::class, // Depends on questions
            QuizAttemptSeeder::class,     // Depends on quizzes, questions, and users
        ]);
    }
}
```

---

### 4. Quiz CRUD

#### [MODIFY] [QuizController.php](file:///c:/xampp/htdocs/quiz-app/app/Http/Controllers/Library/QuizController.php)
- `store()`, `update()`: Added validation/persistence for `starts_at`, `ends_at`, `passing_score`
- `index()`: Added these fields to the response data

#### [MODIFY] [quiz.d.ts](file:///c:/xampp/htdocs/quiz-app/resources/js/types/quiz.d.ts)
```diff:quiz.d.ts
import { QuizBackground } from './index';

export interface QuizQuestionOption {
    id?: number;
    quiz_question_id?: number;
    option_text: string;
    is_correct: boolean;
    order: number;
}

export interface QuizMatchingPair {
    id?: number;
    quiz_question_id?: number;
    left_text: string;
    right_text: string;
    left_media_path?: string | null;
    right_media_path?: string | null;
    order: number;
}

export interface QuizShortAnswerField {
    id?: number;
    quiz_question_id?: number;
    label?: string | null;
    placeholder?: string | null;
    character_limit?: number | null;
    expected_answer: string;
    case_sensitive: boolean;
    trim_whitespace: boolean;
    order: number;
}

export interface QuizQuestion {
    id?: number;
    quiz_id?: number;
    question_type:
        | 'multiple_choice'
        | 'long_answer'
        | 'short_answer'
        | 'matching_pairs'
        | 'true_false';
    question_text: string;
    media_path?: string | null;
    time_limit: number;
    points: number;
    order: number;
    options: QuizQuestionOption[];
    matching_pairs?: QuizMatchingPair[];
    short_answer_fields?: QuizShortAnswerField[];
}

export type TimeMode = 'per_question' | 'total';

export interface Quiz {
    id: number;
    title: string;
    description: string;
    quiz_category_id: number;
    status: string;
    time_mode: TimeMode;
    duration: number | null;
    jenjang_id?: number | null;
    kelas_id?: number | null;
    quiz_background_id?: number | null;
    background?: QuizBackground;
    questions?: QuizQuestion[];
}
===
import { QuizBackground } from './index';

export interface QuizQuestionOption {
    id?: number;
    quiz_question_id?: number;
    option_text: string;
    is_correct: boolean;
    order: number;
}

export interface QuizMatchingPair {
    id?: number;
    quiz_question_id?: number;
    left_text: string;
    right_text: string;
    left_media_path?: string | null;
    right_media_path?: string | null;
    order: number;
}

export interface QuizShortAnswerField {
    id?: number;
    quiz_question_id?: number;
    label?: string | null;
    placeholder?: string | null;
    character_limit?: number | null;
    expected_answer: string;
    case_sensitive: boolean;
    trim_whitespace: boolean;
    order: number;
}

export interface QuizQuestion {
    id?: number;
    quiz_id?: number;
    question_type:
        | 'multiple_choice'
        | 'long_answer'
        | 'short_answer'
        | 'matching_pairs'
        | 'true_false';
    question_text: string;
    media_path?: string | null;
    time_limit: number;
    points: number;
    order: number;
    options: QuizQuestionOption[];
    matching_pairs?: QuizMatchingPair[];
    short_answer_fields?: QuizShortAnswerField[];
}

export type TimeMode = 'per_question' | 'total';

export interface Quiz {
    id: number;
    title: string;
    description: string;
    quiz_category_id: number;
    status: string;
    time_mode: TimeMode;
    duration: number | null;
    starts_at?: string | null;
    ends_at?: string | null;
    passing_score?: number;
    jenjang_id?: number | null;
    kelas_id?: number | null;
    quiz_background_id?: number | null;
    background?: QuizBackground;
    questions?: QuizQuestion[];
}
```

#### [MODIFY] [create.tsx](file:///c:/xampp/htdocs/quiz-app/resources/js/pages/library/quizzes/create.tsx)
- Added "Jadwal & Batas Nilai" section with datetime-local pickers and KKM input

#### [MODIFY] [edit.tsx](file:///c:/xampp/htdocs/quiz-app/resources/js/pages/library/quizzes/edit.tsx)
- Same as create.tsx + proper datetime formatting for existing values

---

### 5. Nilai Controller

#### [MODIFY] [NilaiController.php](file:///c:/xampp/htdocs/quiz-app/app/Http/Controllers/Nilai/NilaiController.php)
Major rewrite of `index()`:
- **Summary stats**: Calculates rata-rata, total_selesai, lulus, remedial
- **Filters**: search (quiz title/student name), jenjang_id, date_from, date_to
- **KKM integration**: Pass/fail determined by quiz's passing_score
- **Enhanced data**: Includes quiz.jenjang, quiz.kelas, quiz.starts_at, quiz.passing_score, is_passed

`show()` changes:
- Added `passing_score` and `is_passed` to response

---

### 6. New Frontend Components

#### [NEW] [summary-card.tsx](file:///c:/xampp/htdocs/quiz-app/resources/js/components/nilai/summary-card.tsx)
- Reusable card with gradient bg, watermark icon, 4 color schemes (blue/green/amber/purple)
- Hover scale animation

#### [NEW] [nilai-filter-bar.tsx](file:///c:/xampp/htdocs/quiz-app/resources/js/components/nilai/nilai-filter-bar.tsx)
- Search input, jenjang dropdown, date range pickers, reset button
- Uses Inertia router.get() for server-side filtering

---

### 7. Nilai Pages

#### [MODIFY] [index.tsx](file:///c:/xampp/htdocs/quiz-app/resources/js/pages/nilai/index.tsx) — **Complete Rewrite**
New layout:
1. **4 Summary Cards** in responsive grid
2. **Filter bar** with search, jenjang, date range
3. **Quiz-grouped cards** with collapsible student tables
4. Pass/fail badges (✅ Lulus / 🔄 Remedial) with color coding
5. Pagination at bottom

#### [MODIFY] [show.tsx](file:///c:/xampp/htdocs/quiz-app/resources/js/pages/nilai/show.tsx) — **Enhanced**
New features:
1. **Score summary card** (5 columns: Total, %, KKM, Benar/Salah, Status)  
2. **Pass/fail badge** with Trophy/RefreshCw icons
3. Improved table styling with hover effects
4. Better responsive design

---

## Validation Results

| Check | Result |
|-------|--------|
| TypeScript (`tsc --noEmit`) | ✅ Pass — 0 errors |
| Production Build (`npm run build`) | ✅ Pass — built in ~1m44s |
| Migration | ⏳ Pending — DB not running |
| Seeder | ⏳ Pending — DB not running |

## Next Steps (Manual)
1. Start XAMPP MySQL
2. Run `php artisan migrate`
3. Run `php artisan db:seed --class=QuizAttemptSeeder` (or full `php artisan migrate:fresh --seed`)
4. Run `npm run dev` and visit `/nilai`
