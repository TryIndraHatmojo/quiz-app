<?php

use App\Models\Quiz;
use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;

function createDashboardStudent(): User
{
    $role = Role::query()->firstOrCreate(
        ['slug' => User::ROLE_SISWA],
        ['name' => 'Siswa', 'guard_name' => 'web']
    );

    $student = User::factory()->create();
    $student->roles()->attach($role);

    return $student->load('roles');
}

function createDashboardQuiz(User $student, array $attributes = []): Quiz
{
    $quiz = Quiz::query()->create(array_merge([
        'user_id' => $student->id,
        'title' => 'Quiz Dashboard',
        'slug' => 'quiz-dashboard-'.Str::random(6),
        'join_code' => 'DSH'.Str::upper(Str::random(6)),
        'status' => 'live',
        'audience' => Quiz::AUDIENCE_REGULAR,
    ], $attributes));

    $quiz->grantStudentAccess($student->id, $student->id);

    return $quiz;
}

test('guests are redirected to the login page', function () {
    $this->get(route('dashboard'))->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    $this->actingAs($user = User::factory()->create());

    $this->get(route('dashboard'))->assertOk();
});

test('student dashboard only shows live quizzes within their schedule', function () {
    $now = Carbon::parse('2026-06-21 10:00:00');
    Carbon::setTestNow($now);

    try {
        $student = createDashboardStudent();
        $activeQuiz = createDashboardQuiz($student, [
            'starts_at' => $now->subHour(),
            'ends_at' => $now->addHour(),
        ]);
        createDashboardQuiz($student, [
            'title' => 'Belum Dimulai',
            'starts_at' => $now->addMinute(),
            'ends_at' => $now->addHour(),
        ]);
        createDashboardQuiz($student, [
            'title' => 'Sudah Berakhir',
            'starts_at' => $now->subHours(2),
            'ends_at' => $now->subMinute(),
        ]);

        $this->actingAs($student)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('dashboard')
                ->has('studentQuizzes', 1)
                ->where('studentQuizzes.0.id', $activeQuiz->id));
    } finally {
        Carbon::setTestNow();
    }
});

test('student cannot start a quiz outside its schedule', function () {
    $now = Carbon::parse('2026-06-21 10:00:00');
    Carbon::setTestNow($now);

    try {
        $student = createDashboardStudent();
        $futureQuiz = createDashboardQuiz($student, [
            'starts_at' => $now->addMinute(),
            'ends_at' => $now->addHour(),
        ]);
        $expiredQuiz = createDashboardQuiz($student, [
            'starts_at' => $now->subHours(2),
            'ends_at' => $now->subMinute(),
        ]);

        $this->actingAs($student)
            ->get(route('quiz.start', $futureQuiz))
            ->assertRedirect(route('dashboard'))
            ->assertSessionHas('error', 'Quiz belum dimulai.');

        $this->actingAs($student)
            ->get(route('quiz.start', $expiredQuiz))
            ->assertRedirect(route('dashboard'))
            ->assertSessionHas('error', 'Waktu pengerjaan quiz sudah berakhir.');
    } finally {
        Carbon::setTestNow();
    }
});
