<?php

use App\Models\Quiz;
use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Str;

function createUserWithRole(string $roleSlug): User
{
    $role = Role::query()->firstOrCreate(
        ['slug' => $roleSlug],
        [
            'name' => str($roleSlug)->replace('-', ' ')->title()->toString(),
            'guard_name' => 'web',
        ]
    );

    $user = User::factory()->create();
    $user->roles()->attach($role);

    return $user->load('roles');
}

function createGuestQuizFor(User $guestTeacher): Quiz
{
    return Quiz::query()->create([
        'user_id' => $guestTeacher->id,
        'title' => 'Kuis Tamu',
        'slug' => 'kuis-tamu-'.Str::random(6),
        'join_code' => 'GST'.Str::upper(Str::random(6)),
        'description' => 'Kuis khusus tamu.',
        'status' => 'live',
        'audience' => Quiz::AUDIENCE_GUEST,
    ]);
}

test('regular teacher cannot access a guest quiz even with teacher access pivot', function () {
    $regularTeacher = createUserWithRole(User::ROLE_GURU_MATA_PELAJARAN);
    $guestTeacher = createUserWithRole(User::ROLE_GURU_TAMU);
    $guestQuiz = createGuestQuizFor($guestTeacher);

    $guestQuiz->grantTeacherAccess($regularTeacher->id, 'edit', $guestTeacher->id);

    $this->actingAs($regularTeacher)
        ->get(route('library.quizzes.edit', $guestQuiz))
        ->assertForbidden();
});

test('regular student cannot start a guest quiz even with student access pivot', function () {
    $guestTeacher = createUserWithRole(User::ROLE_GURU_TAMU);
    $regularStudent = createUserWithRole(User::ROLE_SISWA);
    $guestStudent = createUserWithRole(User::ROLE_SISWA_TAMU);
    $guestQuiz = createGuestQuizFor($guestTeacher);

    $guestQuiz->grantStudentAccess($regularStudent->id, $guestTeacher->id);
    $guestQuiz->grantStudentAccess($guestStudent->id, $guestTeacher->id);

    $this->actingAs($regularStudent)
        ->get(route('quiz.start', $guestQuiz))
        ->assertForbidden();

    $this->actingAs($guestStudent)
        ->get(route('quiz.start', $guestQuiz))
        ->assertOk();
});

test('admin can open guest quiz edit page', function () {
    $admin = createUserWithRole(User::ROLE_ADMIN);
    $guestTeacher = createUserWithRole(User::ROLE_GURU_TAMU);
    $guestQuiz = createGuestQuizFor($guestTeacher);

    $this->actingAs($admin)
        ->get(route('library.quizzes.edit', $guestQuiz))
        ->assertOk();
});
