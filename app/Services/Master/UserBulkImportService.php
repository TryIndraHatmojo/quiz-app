<?php

namespace App\Services\Master;

use App\Models\Jenjang;
use App\Models\Kelas;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Throwable;

class UserBulkImportService
{
    private const IMPORT_SHEET = 'Import Pengguna';

    private const REQUIRED_COLUMNS = [
        'name',
        'email',
        'password',
        'role',
    ];

    private const HEADER_ALIASES = [
        'nama' => 'name',
        'nama_lengkap' => 'name',
        'name' => 'name',
        'email' => 'email',
        'alamat_email' => 'email',
        'nis' => 'nomor_induk_siswa',
        'nomor_induk_siswa' => 'nomor_induk_siswa',
        'nomor_induk' => 'nomor_induk_siswa',
        'nomor_induk_siswa_nis' => 'nomor_induk_siswa',
        'password' => 'password',
        'kata_sandi' => 'password',
        'peran' => 'role',
        'role' => 'role',
        'role_id' => 'role',
        'role_slug' => 'role',
        'slug_peran' => 'role',
        'jenjang_id' => 'jenjang_id',
        'id_jenjang' => 'jenjang_id',
        'kelas_id' => 'kelas_id',
        'id_kelas' => 'kelas_id',
        'orang_tua_id' => 'parent_id',
        'id_orang_tua' => 'parent_id',
        'parent_id' => 'parent_id',
        'orang_tua_nama' => 'parent_name',
        'nama_orang_tua' => 'parent_name',
        'parent_name' => 'parent_name',
        'orang_tua_email' => 'parent_email',
        'email_orang_tua' => 'parent_email',
        'parent_email' => 'parent_email',
        'orang_tua_password' => 'parent_password',
        'password_orang_tua' => 'parent_password',
        'parent_password' => 'parent_password',
    ];

    public function import(UploadedFile $file): array
    {
        $readResult = $this->readRows($file);

        if (! $readResult['success']) {
            return $readResult;
        }

        $preparedResult = $this->prepareRows($readResult['rows']);

        if (! $preparedResult['success']) {
            return $preparedResult;
        }

        $summary = DB::transaction(function () use ($preparedResult) {
            return $this->persistRows(
                $preparedResult['rows'],
                $preparedResult['parent_creates'],
                $preparedResult['existing_users_by_email'],
                $preparedResult['parent_role'],
            );
        });

        return [
            'success' => true,
            ...$summary,
        ];
    }

    private function readRows(UploadedFile $file): array
    {
        try {
            $spreadsheet = IOFactory::load($file->getRealPath());
        } catch (Throwable $exception) {
            return $this->failed([
                'File Excel tidak dapat dibaca. Pastikan file memakai format .xlsx, .xls, atau .csv yang valid.',
            ]);
        }

        try {
            $worksheet = $spreadsheet->getSheetByName(self::IMPORT_SHEET)
                ?? $spreadsheet->getActiveSheet();

            $highestDataRow = $worksheet->getHighestDataRow();
            $highestDataColumn = $worksheet->getHighestDataColumn();

            if ($highestDataRow < 2) {
                return $this->failed([
                    'Sheet import belum memiliki data. Isi baris mulai dari baris ke-2.',
                ]);
            }

            $headerCells = $worksheet->rangeToArray("A1:{$highestDataColumn}1", null, true, true, true)[1] ?? [];
            $headers = [];

            foreach ($headerCells as $column => $value) {
                $key = $this->resolveHeaderKey($value);

                if ($key && ! isset($headers[$key])) {
                    $headers[$key] = $column;
                }
            }

            $missingColumns = array_values(array_filter(
                self::REQUIRED_COLUMNS,
                fn (string $column) => ! isset($headers[$column])
            ));

            if ($missingColumns !== []) {
                return $this->failed([
                    'Kolom wajib belum lengkap: '.implode(', ', $missingColumns).'.',
                ]);
            }

            $rows = [];

            for ($rowNumber = 2; $rowNumber <= $highestDataRow; $rowNumber++) {
                $rowCells = $worksheet->rangeToArray(
                    "A{$rowNumber}:{$highestDataColumn}{$rowNumber}",
                    null,
                    true,
                    true,
                    true
                )[$rowNumber] ?? [];

                $data = [];

                foreach ($headers as $key => $column) {
                    $data[$key] = $this->cellValue($rowCells[$column] ?? null);
                }

                if ($this->rowIsBlank($data)) {
                    continue;
                }

                $rows[] = [
                    'row' => $rowNumber,
                    'data' => $data,
                ];
            }

            if ($rows === []) {
                return $this->failed([
                    'Sheet import belum memiliki baris data yang bisa diproses.',
                ]);
            }

            return [
                'success' => true,
                'rows' => $rows,
            ];
        } finally {
            $spreadsheet->disconnectWorksheets();
        }
    }

    private function prepareRows(array $rawRows): array
    {
        $errors = [];
        $roles = Role::query()->get();
        $roleLookup = $this->buildRoleLookup($roles);
        $parentRole = $roles->firstWhere('slug', User::ROLE_ORANG_TUA);
        $jenjangs = Jenjang::query()->get()->keyBy('id');
        $kelases = Kelas::query()->get()->keyBy('id');
        $existingUsersByEmail = $this->existingUsersByEmail($rawRows);
        $existingUsersByNis = $this->existingUsersByNis($rawRows);
        $existingParentUsersById = $this->existingParentUsersById($rawRows);

        if (! $parentRole) {
            $errors[] = 'Role Orang Tua belum tersedia. Jalankan RoleSeeder terlebih dahulu.';
        }

        $preparedRows = [];
        $mainRowsByEmail = [];
        $seenNis = [];
        $seenEmails = [];

        foreach ($rawRows as $rawRow) {
            $rowNumber = $rawRow['row'];
            $data = $rawRow['data'];
            $rowErrorCount = count($errors);

            $name = $data['name'] ?? '';
            $email = $data['email'] ?? '';
            $nomorIndukSiswa = $data['nomor_induk_siswa'] ?? '';
            $password = $data['password'] ?? '';
            $roleInput = $data['role'] ?? '';
            $role = $this->resolveRole($roleInput, $roleLookup);

            if ($name === '') {
                $errors[] = "Baris {$rowNumber}: nama wajib diisi.";
            }

            if ($email === '') {
                $errors[] = "Baris {$rowNumber}: email wajib diisi.";
            } elseif (! filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $errors[] = "Baris {$rowNumber}: format email tidak valid.";
            }

            if ($password === '') {
                $errors[] = "Baris {$rowNumber}: password wajib diisi.";
            } elseif (mb_strlen($password) < 8) {
                $errors[] = "Baris {$rowNumber}: password minimal 8 karakter.";
            }

            if ($roleInput === '') {
                $errors[] = "Baris {$rowNumber}: peran wajib diisi.";
            } elseif (! $role) {
                $errors[] = "Baris {$rowNumber}: peran '{$roleInput}' tidak ditemukan.";
            }

            $emailKey = Str::lower($email);

            if ($email !== '' && isset($seenEmails[$emailKey])) {
                $errors[] = "Baris {$rowNumber}: email sudah dipakai di baris {$seenEmails[$emailKey]} pada file ini.";
            }

            if ($email !== '' && isset($existingUsersByEmail[$emailKey])) {
                $errors[] = "Baris {$rowNumber}: email sudah terdaftar di sistem.";
            }

            $seenEmails[$emailKey] = $rowNumber;

            $nomorIndukSiswaKey = Str::lower($nomorIndukSiswa);

            if ($nomorIndukSiswa !== '' && isset($seenNis[$nomorIndukSiswaKey])) {
                $errors[] = "Baris {$rowNumber}: nomor_induk_siswa sudah dipakai di baris {$seenNis[$nomorIndukSiswaKey]} pada file ini.";
            }

            if ($nomorIndukSiswa !== '' && isset($existingUsersByNis[$nomorIndukSiswaKey])) {
                $errors[] = "Baris {$rowNumber}: nomor_induk_siswa sudah terdaftar di sistem.";
            }

            if ($nomorIndukSiswa !== '') {
                $seenNis[$nomorIndukSiswaKey] = $rowNumber;
            }

            $jenjangId = $this->readOptionalId($data['jenjang_id'] ?? '', $rowNumber, 'jenjang_id', $errors);
            $kelasId = $this->readOptionalId($data['kelas_id'] ?? '', $rowNumber, 'kelas_id', $errors);
            $parentId = $this->readOptionalId($data['parent_id'] ?? '', $rowNumber, 'orang_tua_id', $errors);
            $parentName = $data['parent_name'] ?? '';
            $parentEmail = $data['parent_email'] ?? '';
            $parentPassword = $data['parent_password'] ?? '';

            if ($jenjangId && ! isset($jenjangs[$jenjangId])) {
                $errors[] = "Baris {$rowNumber}: jenjang_id {$jenjangId} tidak ditemukan.";
            }

            if ($kelasId && ! isset($kelases[$kelasId])) {
                $errors[] = "Baris {$rowNumber}: kelas_id {$kelasId} tidak ditemukan.";
            }

            if ($kelasId && isset($kelases[$kelasId])) {
                $kelasJenjangId = (int) $kelases[$kelasId]->jenjang_id;

                if ($jenjangId && $kelasJenjangId !== $jenjangId) {
                    $errors[] = "Baris {$rowNumber}: kelas_id {$kelasId} tidak sesuai dengan jenjang_id {$jenjangId}.";
                }

                if (! $jenjangId) {
                    $jenjangId = $kelasJenjangId;
                }
            }

            if ($parentEmail !== '' && ! filter_var($parentEmail, FILTER_VALIDATE_EMAIL)) {
                $errors[] = "Baris {$rowNumber}: format orang_tua_email tidak valid.";
            }

            if ($parentEmail !== '' && Str::lower($parentEmail) === $emailKey) {
                $errors[] = "Baris {$rowNumber}: email siswa dan orang tua tidak boleh sama.";
            }

            if ($parentId && ! isset($existingParentUsersById[$parentId])) {
                $errors[] = "Baris {$rowNumber}: orang_tua_id {$parentId} tidak ditemukan.";
            } elseif ($parentId && ! $this->userHasParentRole($existingParentUsersById[$parentId])) {
                $errors[] = "Baris {$rowNumber}: orang_tua_id {$parentId} bukan user dengan role Orang Tua.";
            }

            if ($parentId && $parentEmail !== '') {
                $parentEmailKey = Str::lower($parentEmail);
                $existingParentEmailKey = Str::lower($existingParentUsersById[$parentId]->email ?? '');

                if ($existingParentEmailKey !== $parentEmailKey) {
                    $errors[] = "Baris {$rowNumber}: orang_tua_id dan orang_tua_email mengarah ke user berbeda.";
                }
            }

            if (count($errors) > $rowErrorCount || ! $role) {
                continue;
            }

            $isStudent = in_array($role->slug, User::STUDENT_ROLE_SLUGS, true);
            $hasParentPayload = $parentId || $parentName !== '' || $parentEmail !== '' || $parentPassword !== '';

            if ($hasParentPayload && ! $isStudent) {
                $errors[] = "Baris {$rowNumber}: kolom orang tua hanya boleh diisi untuk peran Siswa atau Siswa Tamu.";

                continue;
            }

            $preparedRow = [
                'row' => $rowNumber,
                'name' => $name,
                'email' => $email,
                'email_key' => $emailKey,
                'nomor_induk_siswa' => $nomorIndukSiswa,
                'nomor_induk_siswa_key' => $nomorIndukSiswaKey,
                'password' => $password,
                'role' => $role,
                'jenjang_id' => $jenjangId,
                'kelas_id' => $kelasId,
                'parent_id' => $parentId,
                'parent_name' => $parentName,
                'parent_email' => $parentEmail,
                'parent_email_key' => $parentEmail !== '' ? Str::lower($parentEmail) : null,
                'parent_password' => $parentPassword,
                'is_student' => $isStudent,
            ];

            $preparedRows[] = $preparedRow;
            $mainRowsByEmail[$emailKey] = $preparedRow;
        }

        $parentCreates = $this->prepareParentCreates(
            $preparedRows,
            $mainRowsByEmail,
            $existingUsersByEmail,
            $errors
        );

        if ($errors !== []) {
            return $this->failed($errors);
        }

        return [
            'success' => true,
            'rows' => $preparedRows,
            'parent_creates' => $parentCreates,
            'existing_users_by_email' => $existingUsersByEmail,
            'parent_role' => $parentRole,
        ];
    }

    private function prepareParentCreates(array $rows, array $mainRowsByEmail, array $existingUsersByEmail, array &$errors): array
    {
        $parentCreates = [];

        foreach ($rows as $row) {
            if (! $row['is_student'] || $row['parent_id'] || ! $row['parent_email_key']) {
                continue;
            }

            $parentEmailKey = $row['parent_email_key'];

            if (isset($existingUsersByEmail[$parentEmailKey])) {
                if (! $this->userHasParentRole($existingUsersByEmail[$parentEmailKey])) {
                    $errors[] = "Baris {$row['row']}: orang_tua_email sudah ada, tetapi user tersebut bukan role Orang Tua.";
                }

                continue;
            }

            if (isset($mainRowsByEmail[$parentEmailKey])) {
                if ($mainRowsByEmail[$parentEmailKey]['role']->slug !== User::ROLE_ORANG_TUA) {
                    $errors[] = "Baris {$row['row']}: orang_tua_email mengarah ke user pada file ini, tetapi perannya bukan Orang Tua.";
                }

                continue;
            }

            if ($row['parent_name'] === '') {
                $errors[] = "Baris {$row['row']}: orang_tua_nama wajib diisi untuk membuat orang tua baru.";
            }

            if ($row['parent_password'] === '') {
                $errors[] = "Baris {$row['row']}: orang_tua_password wajib diisi untuk membuat orang tua baru.";
            } elseif (mb_strlen($row['parent_password']) < 8) {
                $errors[] = "Baris {$row['row']}: orang_tua_password minimal 8 karakter.";
            }

            if (isset($parentCreates[$parentEmailKey])) {
                $existing = $parentCreates[$parentEmailKey];

                if (
                    $existing['name'] !== $row['parent_name']
                    || $existing['password'] !== $row['parent_password']
                ) {
                    $errors[] = "Baris {$row['row']}: data orang tua untuk {$row['parent_email']} tidak konsisten dengan baris {$existing['source_row']}.";
                }

                continue;
            }

            $parentCreates[$parentEmailKey] = [
                'source_row' => $row['row'],
                'name' => $row['parent_name'],
                'email' => $row['parent_email'],
                'password' => $row['parent_password'],
                'jenjang_id' => $row['jenjang_id'],
                'kelas_id' => $row['kelas_id'],
            ];
        }

        return $parentCreates;
    }

    private function persistRows(array $rows, array $parentCreates, array $existingUsersByEmail, Role $parentRole): array
    {
        $createdUsersByEmail = [];
        $createdUsers = 0;
        $createdParents = 0;
        $linkedStudents = 0;

        foreach ($rows as $row) {
            $user = User::query()->create([
                'name' => $row['name'],
                'email' => $row['email'],
                'nomor_induk_siswa' => $row['nomor_induk_siswa'] ?: null,
                'password' => Hash::make($row['password']),
                'jenjang_id' => $row['jenjang_id'],
                'kelas_id' => $row['kelas_id'],
            ]);

            $user->roles()->attach($row['role']->id);

            $createdUsersByEmail[$row['email_key']] = $user;
            $createdUsers++;
        }

        foreach ($parentCreates as $parentEmailKey => $parent) {
            $parentUser = User::query()->create([
                'name' => $parent['name'],
                'email' => $parent['email'],
                'password' => Hash::make($parent['password']),
                'jenjang_id' => $parent['jenjang_id'],
                'kelas_id' => $parent['kelas_id'],
            ]);

            $parentUser->roles()->attach($parentRole->id);

            $createdUsersByEmail[$parentEmailKey] = $parentUser;
            $createdParents++;
        }

        foreach ($rows as $row) {
            if (! $row['is_student']) {
                continue;
            }

            $parentId = $row['parent_id'];

            if (! $parentId && $row['parent_email_key']) {
                $parent = $existingUsersByEmail[$row['parent_email_key']]
                    ?? $createdUsersByEmail[$row['parent_email_key']]
                    ?? null;

                $parentId = $parent?->id;
            }

            if (! $parentId) {
                continue;
            }

            $createdUsersByEmail[$row['email_key']]->forceFill([
                'orang_tua_id' => $parentId,
            ])->save();

            $linkedStudents++;
        }

        return [
            'created_users' => $createdUsers,
            'created_parents' => $createdParents,
            'linked_students' => $linkedStudents,
        ];
    }

    private function buildRoleLookup($roles): array
    {
        $lookup = [];

        foreach ($roles as $role) {
            $lookup[(string) $role->id] = $role;
            $lookup[$this->lookupKey($role->slug)] = $role;
            $lookup[$this->lookupKey($role->name)] = $role;
        }

        return $lookup;
    }

    private function resolveRole(string $value, array $roleLookup): ?Role
    {
        if ($value === '') {
            return null;
        }

        return $roleLookup[$value] ?? $roleLookup[$this->lookupKey($value)] ?? null;
    }

    private function existingUsersByEmail(array $rows): array
    {
        $emails = collect($rows)
            ->flatMap(fn (array $row) => [
                $row['data']['email'] ?? null,
                $row['data']['parent_email'] ?? null,
            ])
            ->filter()
            ->map(fn (string $email) => Str::lower($email))
            ->unique()
            ->values();

        if ($emails->isEmpty()) {
            return [];
        }

        return User::query()
            ->with('roles')
            ->whereIn(DB::raw('LOWER(email)'), $emails->all())
            ->get()
            ->keyBy(fn (User $user) => Str::lower($user->email))
            ->all();
    }

    private function existingUsersByNis(array $rows): array
    {
        $nisValues = collect($rows)
            ->map(fn (array $row) => $row['data']['nomor_induk_siswa'] ?? null)
            ->filter()
            ->map(fn (string $nis) => Str::lower($nis))
            ->unique()
            ->values();

        if ($nisValues->isEmpty()) {
            return [];
        }

        return User::query()
            ->whereIn(DB::raw('LOWER(nomor_induk_siswa)'), $nisValues->all())
            ->get()
            ->keyBy(fn (User $user) => Str::lower($user->nomor_induk_siswa ?? ''))
            ->all();
    }

    private function existingParentUsersById(array $rows): array
    {
        $ids = collect($rows)
            ->map(fn (array $row) => $row['data']['parent_id'] ?? null)
            ->filter()
            ->map(fn (string $id) => (int) $id)
            ->filter()
            ->unique()
            ->values();

        if ($ids->isEmpty()) {
            return [];
        }

        return User::query()
            ->with('roles')
            ->whereIn('id', $ids->all())
            ->get()
            ->keyBy('id')
            ->all();
    }

    private function readOptionalId(string $value, int $rowNumber, string $label, array &$errors): ?int
    {
        if ($value === '') {
            return null;
        }

        if (ctype_digit($value)) {
            return (int) $value;
        }

        if (is_numeric($value) && (float) $value === (float) ((int) $value) && (int) $value > 0) {
            return (int) $value;
        }

        $errors[] = "Baris {$rowNumber}: {$label} harus berupa angka ID.";

        return null;
    }

    private function userHasParentRole(User $user): bool
    {
        return $user->roles->contains('slug', User::ROLE_ORANG_TUA);
    }

    private function resolveHeaderKey(mixed $value): ?string
    {
        $header = $this->normalizeHeader($this->cellValue($value));

        return self::HEADER_ALIASES[$header] ?? null;
    }

    private function normalizeHeader(string $value): string
    {
        $value = Str::ascii(Str::lower(trim($value)));
        $value = preg_replace('/[^a-z0-9]+/', '_', $value) ?? $value;

        return trim($value, '_');
    }

    private function lookupKey(string $value): string
    {
        $value = Str::ascii(Str::lower(trim($value)));
        $value = preg_replace('/[^a-z0-9]+/', '-', $value) ?? $value;
        $value = preg_replace('/-+/', '-', $value) ?? $value;

        return trim($value, '-');
    }

    private function cellValue(mixed $value): string
    {
        if ($value === null) {
            return '';
        }

        if (is_bool($value)) {
            return $value ? '1' : '0';
        }

        return trim((string) $value);
    }

    private function rowIsBlank(array $data): bool
    {
        foreach ($data as $value) {
            if ($value !== '') {
                return false;
            }
        }

        return true;
    }

    private function failed(array $errors): array
    {
        $limitedErrors = array_slice($errors, 0, 50);
        $remaining = count($errors) - count($limitedErrors);

        if ($remaining > 0) {
            $limitedErrors[] = "...dan {$remaining} error lainnya.";
        }

        return [
            'success' => false,
            'errors' => $limitedErrors,
        ];
    }
}
