<?php

use App\Models\Jenjang;
use App\Models\Kelas;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

function makeUserImportFile(array $rows): UploadedFile
{
    $spreadsheet = new Spreadsheet;
    $sheet = $spreadsheet->getActiveSheet();
    $sheet->setTitle('Import Pengguna');
    $sheet->fromArray([
        [
            'nama',
            'email',
            'password',
            'peran',
            'jenjang_id',
            'kelas_id',
            'orang_tua_id',
            'orang_tua_nama',
            'orang_tua_email',
            'orang_tua_password',
        ],
        ...$rows,
    ], null, 'A1');

    $path = tempnam(sys_get_temp_dir(), 'user-import-').'.xlsx';
    (new Xlsx($spreadsheet))->save($path);
    $spreadsheet->disconnectWorksheets();

    return new UploadedFile(
        $path,
        'import-pengguna.xlsx',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        null,
        true
    );
}

function createImportRole(string $slug, string $name): Role
{
    return Role::query()->create([
        'name' => $name,
        'slug' => $slug,
        'guard_name' => 'web',
    ]);
}

test('admin can import a student and create a linked parent from excel', function () {
    createImportRole(User::ROLE_ADMIN, 'Admin');
    createImportRole(User::ROLE_SISWA, 'Siswa');
    createImportRole(User::ROLE_ORANG_TUA, 'Orang Tua');

    $admin = User::factory()->create();
    $admin->roles()->attach(Role::where('slug', User::ROLE_ADMIN)->value('id'));

    $jenjang = Jenjang::query()->create([
        'jenjang' => 'SMK',
        'nama_sekolah' => 'SMK Contoh',
    ]);
    $kelas = Kelas::query()->create([
        'jenjang_id' => $jenjang->id,
        'nama_kelas' => 'X Farmasi 1',
    ]);

    $file = makeUserImportFile([
        [
            'Siswa Baru',
            'siswa.baru@example.com',
            'password123',
            'siswa',
            $jenjang->id,
            $kelas->id,
            '',
            'Ibu Siswa Baru',
            'ibu.siswa.baru@example.com',
            'password123',
        ],
    ]);

    $this->actingAs($admin)
        ->post(route('master.users.import'), ['file' => $file])
        ->assertRedirect(route('master.users.index'))
        ->assertSessionHas('success');

    $student = User::query()
        ->with('orangTua', 'roles')
        ->where('email', 'siswa.baru@example.com')
        ->firstOrFail();
    $parent = User::query()
        ->with('roles')
        ->where('email', 'ibu.siswa.baru@example.com')
        ->firstOrFail();

    expect($student->roles->pluck('slug')->all())->toContain(User::ROLE_SISWA)
        ->and($student->orang_tua_id)->toBe($parent->id)
        ->and($student->orangTua->email)->toBe('ibu.siswa.baru@example.com')
        ->and($parent->roles->pluck('slug')->all())->toContain(User::ROLE_ORANG_TUA);
});

test('user import rolls back when an email already exists', function () {
    createImportRole(User::ROLE_ADMIN, 'Admin');
    createImportRole(User::ROLE_SISWA, 'Siswa');
    createImportRole(User::ROLE_ORANG_TUA, 'Orang Tua');

    $admin = User::factory()->create();
    $admin->roles()->attach(Role::where('slug', User::ROLE_ADMIN)->value('id'));
    User::factory()->create(['email' => 'sudah.ada@example.com']);

    $file = makeUserImportFile([
        [
            'Email Duplikat',
            'sudah.ada@example.com',
            'password123',
            'siswa',
            '',
            '',
            '',
            'Orang Tua Baru',
            'ortu.rollback@example.com',
            'password123',
        ],
    ]);

    $this->actingAs($admin)
        ->post(route('master.users.import'), ['file' => $file])
        ->assertRedirect()
        ->assertSessionHas('error')
        ->assertSessionHas('import_errors');

    expect(User::where('email', 'ortu.rollback@example.com')->exists())->toBeFalse();
});
