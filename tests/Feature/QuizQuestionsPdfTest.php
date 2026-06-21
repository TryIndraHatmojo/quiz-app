<?php

use App\Models\Quiz;
use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Str;

function createPdfTestUserWithRole(string $roleSlug): User
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

function createPdfTestQuiz(User $owner): Quiz
{
    return Quiz::query()->create([
        'user_id' => $owner->id,
        'title' => 'Kuis PDF Matematika',
        'slug' => 'kuis-pdf-'.Str::random(6),
        'join_code' => 'PDF'.Str::upper(Str::random(6)),
        'description' => 'Soal untuk menguji unduhan PDF.',
        'status' => 'draft',
        'audience' => Quiz::AUDIENCE_REGULAR,
    ]);
}

test('authorized user can download quiz questions as pdf', function () {
    $admin = createPdfTestUserWithRole(User::ROLE_ADMIN);
    $quiz = createPdfTestQuiz($admin);

    $multipleChoice = $quiz->questions()->create([
        'question_type' => 'multiple_choice',
        'question_text' => 'Berapakah hasil 2 + 2?',
        'points' => 10,
        'order' => 0,
    ]);
    $multipleChoice->options()->createMany([
        ['option_text' => '3', 'is_correct' => false, 'order' => 0],
        ['option_text' => '4', 'is_correct' => true, 'order' => 1],
    ]);

    $matching = $quiz->questions()->create([
        'question_type' => 'matching_pairs',
        'question_text' => 'Cocokkan bilangan dengan namanya.',
        'points' => 10,
        'order' => 1,
    ]);
    $matching->matchingPairs()->createMany([
        ['left_text' => '1', 'right_text' => 'Satu', 'order' => 0],
        ['left_text' => '2', 'right_text' => 'Dua', 'order' => 1],
    ]);

    $response = $this->actingAs($admin)
        ->get(route('library.quizzes.questions.pdf', $quiz));

    $response->assertOk();
    expect($response->headers->get('content-type'))->toBe('application/pdf');
    expect($response->headers->get('content-disposition'))
        ->toContain('attachment')
        ->toContain('kuis-pdf-matematika-soal.pdf');
    expect($response->getContent())->toStartWith('%PDF');
});

test('student without preview access cannot download quiz questions pdf', function () {
    $admin = createPdfTestUserWithRole(User::ROLE_ADMIN);
    $student = createPdfTestUserWithRole(User::ROLE_SISWA);
    $quiz = createPdfTestQuiz($admin);

    $this->actingAs($student)
        ->get(route('library.quizzes.questions.pdf', $quiz))
        ->assertForbidden();
});
