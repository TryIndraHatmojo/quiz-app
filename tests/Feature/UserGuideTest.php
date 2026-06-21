<?php

use App\Models\Role;
use App\Models\User;
use App\Models\UserGuide;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

function createUserGuideUser(string $roleSlug, string $roleName): User
{
    $role = Role::query()->firstOrCreate(
        ['slug' => $roleSlug],
        ['name' => $roleName, 'guard_name' => 'web']
    );

    $user = User::factory()->create();
    $user->roles()->attach($role);

    return $user->load('roles');
}

test('admin can upload and replace the active user guide', function () {
    Storage::fake('local');
    $admin = createUserGuideUser(User::ROLE_ADMIN, 'Admin');

    $this->actingAs($admin)
        ->post(route('master.user-guide.store'), [
            'title' => 'Panduan Versi 1',
            'file' => UploadedFile::fake()->create(
                'panduan-v1.pdf',
                100,
                'application/pdf'
            ),
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $firstPath = UserGuide::query()->firstOrFail()->file_path;
    Storage::disk('local')->assertExists($firstPath);

    $this->actingAs($admin)
        ->post(route('master.user-guide.store'), [
            'title' => 'Panduan Versi 2',
            'file' => UploadedFile::fake()->create(
                'panduan-v2.pdf',
                100,
                'application/pdf'
            ),
        ])
        ->assertRedirect();

    $guide = UserGuide::query()->firstOrFail();
    expect(UserGuide::query()->count())->toBe(1)
        ->and($guide->title)->toBe('Panduan Versi 2')
        ->and($guide->original_name)->toBe('panduan-v2.pdf');

    Storage::disk('local')->assertMissing($firstPath);
    Storage::disk('local')->assertExists($guide->file_path);
});

test('non admin cannot upload a user guide', function () {
    Storage::fake('local');
    $student = createUserGuideUser(User::ROLE_SISWA, 'Siswa');

    $this->actingAs($student)
        ->post(route('master.user-guide.store'), [
            'title' => 'Panduan',
            'file' => UploadedFile::fake()->create(
                'panduan.pdf',
                100,
                'application/pdf'
            ),
        ])
        ->assertForbidden();

    expect(UserGuide::query()->count())->toBe(0);
});

test('authenticated user can download the active user guide', function () {
    Storage::fake('local');
    $student = createUserGuideUser(User::ROLE_SISWA, 'Siswa');
    Storage::disk('local')->put('user-guides/panduan.pdf', 'guide-content');

    UserGuide::query()->create([
        'title' => 'Buku Panduan',
        'file_path' => 'user-guides/panduan.pdf',
        'original_name' => 'buku-panduan.pdf',
        'mime_type' => 'application/pdf',
        'size' => 13,
        'uploaded_by' => $student->id,
    ]);

    $this->actingAs($student)
        ->get(route('user-guide.download'))
        ->assertOk()
        ->assertDownload('buku-panduan.pdf');
});
