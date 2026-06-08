<?php

use App\Models\PasswordResetRequest;
use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

function createPasswordResetRole(string $slug, string $name): Role
{
    return Role::query()->create([
        'name' => $name,
        'slug' => $slug,
        'guard_name' => 'web',
    ]);
}

test('guest can submit reset password request using nomor induk siswa', function () {
    $user = User::factory()->create([
        'nomor_induk_siswa' => 'SISWA-20260002',
    ]);

    $this->post(route('password-reset-requests.store'), [
        'identifier' => 'siswa-20260002',
        'password' => 'password-baru',
        'password_confirmation' => 'password-baru',
    ])->assertRedirect()
        ->assertSessionHas('status');

    $request = PasswordResetRequest::query()->where('user_id', $user->id)->firstOrFail();

    expect($request->status)->toBe(PasswordResetRequest::STATUS_PENDING)
        ->and(Hash::check('password-baru', $request->password))->toBeTrue();
});

test('admin can approve reset password request and update user password', function () {
    $adminRole = createPasswordResetRole(User::ROLE_ADMIN, 'Admin');
    $admin = User::factory()->create();
    $admin->roles()->attach($adminRole);

    $user = User::factory()->create([
        'password' => Hash::make('password-lama'),
        'nomor_induk_siswa' => '20260003',
    ]);

    $resetRequest = PasswordResetRequest::query()->create([
        'user_id' => $user->id,
        'identifier' => '20260003',
        'password' => Hash::make('password-baru'),
        'status' => PasswordResetRequest::STATUS_PENDING,
    ]);

    $this->actingAs($admin)
        ->patch(route('admin.password-reset-requests.approve', $resetRequest))
        ->assertRedirect()
        ->assertSessionHas('success');

    $resetRequest->refresh();
    $user->refresh();

    expect($resetRequest->status)->toBe(PasswordResetRequest::STATUS_APPROVED)
        ->and($resetRequest->reviewed_by)->toBe($admin->id)
        ->and(Hash::check('password-baru', $user->password))->toBeTrue();
});

test('non admin cannot open reset password request admin page', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('admin.password-reset-requests.index'))
        ->assertForbidden();
});
