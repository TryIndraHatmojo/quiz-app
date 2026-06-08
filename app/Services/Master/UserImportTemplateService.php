<?php

namespace App\Services\Master;

use App\Models\Jenjang;
use App\Models\Kelas;
use App\Models\Role;
use App\Models\User;
use PhpOffice\PhpSpreadsheet\Cell\DataValidation;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class UserImportTemplateService
{
    private const IMPORT_HEADERS = [
        'nama',
        'email',
        'nomor_induk_siswa',
        'password',
        'peran',
        'jenjang_id',
        'kelas_id',
        'orang_tua_id',
        'orang_tua_nama',
        'orang_tua_email',
        'orang_tua_password',
    ];

    public function download(): StreamedResponse
    {
        $spreadsheet = new Spreadsheet;

        $this->fillImportSheet($spreadsheet->getActiveSheet());
        $this->fillCurrentUsersSheet($spreadsheet->createSheet());
        $this->fillRolesSheet($spreadsheet->createSheet());
        $this->fillJenjangSheet($spreadsheet->createSheet());
        $this->fillKelasSheet($spreadsheet->createSheet());
        $this->fillParentsSheet($spreadsheet->createSheet());
        $this->fillGuideSheet($spreadsheet->createSheet());

        $spreadsheet->setActiveSheetIndex(0);

        $fileName = 'format-import-pengguna-'.now()->format('Ymd-His').'.xlsx';

        return response()->streamDownload(function () use ($spreadsheet) {
            (new Xlsx($spreadsheet))->save('php://output');
            $spreadsheet->disconnectWorksheets();
        }, $fileName, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }

    private function fillImportSheet(Worksheet $sheet): void
    {
        $sheet->setTitle('Import Pengguna');
        $sheet->fromArray(self::IMPORT_HEADERS, null, 'A1');
        $sheet->freezePane('A2');
        $sheet->setAutoFilter('A1:K1');
        $sheet->getStyle('A1:K1')->getFont()->setBold(true);
        $sheet->getStyle('A1:K1')->getFill()
            ->setFillType(Fill::FILL_SOLID)
            ->getStartColor()
            ->setARGB('FFE2E8F0');
        $sheet->getStyle('A1:K1')->getBorders()->getBottom()->setBorderStyle(Border::BORDER_THIN);
        $sheet->getStyle('A1:K1')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        $this->applyDropdown($sheet, 'E2:E500', "'Referensi Role'!\$C\$2:\$C\$200");
        $this->applyDropdown($sheet, 'F2:F500', "'Referensi Jenjang'!\$A\$2:\$A\$500");
        $this->applyDropdown($sheet, 'G2:G500', "'Referensi Kelas'!\$A\$2:\$A\$1000");
        $this->applyDropdown($sheet, 'H2:H500', "'Referensi Orang Tua'!\$A\$2:\$A\$1000");

        $widths = [
            'A' => 28,
            'B' => 34,
            'C' => 20,
            'D' => 18,
            'E' => 22,
            'F' => 12,
            'G' => 12,
            'H' => 14,
            'I' => 28,
            'J' => 34,
            'K' => 22,
        ];

        foreach ($widths as $column => $width) {
            $sheet->getColumnDimension($column)->setWidth($width);
        }
    }

    private function fillCurrentUsersSheet(Worksheet $sheet): void
    {
        $sheet->setTitle('Data Saat Ini');

        $headers = [
            'id',
            'nama',
            'email',
            'nomor_induk_siswa',
            'peran',
            'jenjang_id',
            'jenjang',
            'kelas_id',
            'kelas',
            'orang_tua_id',
            'orang_tua_email',
            'orang_tua_nama',
        ];

        $rows = User::query()
            ->with('roles', 'jenjang', 'kelas', 'orangTua')
            ->orderBy('name')
            ->get()
            ->map(fn (User $user) => [
                $user->id,
                $user->name,
                $user->email,
                $user->nomor_induk_siswa,
                $user->roles->pluck('slug')->implode(', '),
                $user->jenjang_id,
                $user->jenjang ? "{$user->jenjang->jenjang} - {$user->jenjang->nama_sekolah}" : null,
                $user->kelas_id,
                $user->kelas?->nama_kelas,
                $user->orang_tua_id,
                $user->orangTua?->email,
                $user->orangTua?->name,
            ])
            ->all();

        $sheet->fromArray([$headers, ...$rows], null, 'A1');
        $this->styleReferenceSheet($sheet, count($headers));
    }

    private function fillRolesSheet(Worksheet $sheet): void
    {
        $sheet->setTitle('Referensi Role');

        $rows = Role::query()
            ->orderBy('name')
            ->get(['id', 'name', 'slug'])
            ->map(fn (Role $role) => [$role->id, $role->name, $role->slug])
            ->all();

        $sheet->fromArray([
            ['id', 'nama', 'slug'],
            ...$rows,
        ], null, 'A1');

        $this->styleReferenceSheet($sheet, 3);
    }

    private function fillJenjangSheet(Worksheet $sheet): void
    {
        $sheet->setTitle('Referensi Jenjang');

        $rows = Jenjang::query()
            ->orderBy('jenjang')
            ->orderBy('nama_sekolah')
            ->get(['id', 'jenjang', 'nama_sekolah'])
            ->map(fn (Jenjang $jenjang) => [$jenjang->id, $jenjang->jenjang, $jenjang->nama_sekolah])
            ->all();

        $sheet->fromArray([
            ['id', 'jenjang', 'nama_sekolah'],
            ...$rows,
        ], null, 'A1');

        $this->styleReferenceSheet($sheet, 3);
    }

    private function fillKelasSheet(Worksheet $sheet): void
    {
        $sheet->setTitle('Referensi Kelas');

        $rows = Kelas::query()
            ->with('jenjang')
            ->orderBy('nama_kelas')
            ->get()
            ->map(fn (Kelas $kelas) => [
                $kelas->id,
                $kelas->jenjang_id,
                $kelas->nama_kelas,
                $kelas->jenjang?->jenjang,
                $kelas->jenjang?->nama_sekolah,
            ])
            ->all();

        $sheet->fromArray([
            ['id', 'jenjang_id', 'nama_kelas', 'jenjang', 'nama_sekolah'],
            ...$rows,
        ], null, 'A1');

        $this->styleReferenceSheet($sheet, 5);
    }

    private function fillParentsSheet(Worksheet $sheet): void
    {
        $sheet->setTitle('Referensi Orang Tua');

        $rows = User::query()
            ->whereHas('roles', fn ($query) => $query->where('slug', User::ROLE_ORANG_TUA))
            ->orderBy('name')
            ->get(['id', 'name', 'email'])
            ->map(fn (User $user) => [$user->id, $user->name, $user->email])
            ->all();

        $sheet->fromArray([
            ['id', 'nama', 'email'],
            ...$rows,
        ], null, 'A1');

        $this->styleReferenceSheet($sheet, 3);
    }

    private function fillGuideSheet(Worksheet $sheet): void
    {
        $sheet->setTitle('Panduan');

        $rows = [
            ['Format Import Pengguna'],
            ['Kolom wajib', 'nama, email, password, peran'],
            ['Nomor induk siswa', 'Isi nomor_induk_siswa bila user adalah siswa dan ingin mengizinkan login/reset password memakai NIS. Kolom ini opsional dan harus unik.'],
            ['Peran', 'Gunakan slug dari sheet Referensi Role, contoh: siswa atau orang-tua.'],
            ['Jenjang dan kelas', 'Isi jenjang_id dan kelas_id dari sheet referensi. Jika hanya kelas_id diisi, jenjang_id akan mengikuti data kelas.'],
            ['Orang tua existing', 'Isi orang_tua_id dari sheet Referensi Orang Tua.'],
            ['Orang tua baru', 'Isi orang_tua_nama, orang_tua_email, dan orang_tua_password pada baris siswa. Sistem akan membuat user Orang Tua dan langsung menautkannya.'],
            ['Relasi dalam file', 'Boleh membuat baris user Orang Tua lebih dulu, lalu isi orang_tua_email pada baris siswa dengan email yang sama.'],
            ['Catatan', 'Sheet Data Saat Ini hanya referensi dari data user yang ada saat template diunduh.'],
        ];

        $sheet->fromArray($rows, null, 'A1');
        $sheet->mergeCells('A1:B1');
        $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(14);
        $sheet->getStyle('A2:A9')->getFont()->setBold(true);
        $sheet->getColumnDimension('A')->setWidth(24);
        $sheet->getColumnDimension('B')->setWidth(120);
        $sheet->getStyle('B1:B9')->getAlignment()->setWrapText(true);
    }

    private function styleReferenceSheet(Worksheet $sheet, int $columnCount): void
    {
        $highestColumn = $this->columnName($columnCount);
        $sheet->freezePane('A2');
        $sheet->setAutoFilter("A1:{$highestColumn}1");
        $sheet->getStyle("A1:{$highestColumn}1")->getFont()->setBold(true);
        $sheet->getStyle("A1:{$highestColumn}1")->getFill()
            ->setFillType(Fill::FILL_SOLID)
            ->getStartColor()
            ->setARGB('FFE2E8F0');
        $sheet->getStyle("A1:{$highestColumn}1")->getBorders()->getBottom()->setBorderStyle(Border::BORDER_THIN);

        for ($column = 1; $column <= $columnCount; $column++) {
            $sheet->getColumnDimension($this->columnName($column))->setAutoSize(true);
        }
    }

    private function applyDropdown(Worksheet $sheet, string $range, string $formula): void
    {
        foreach ($sheet->rangeToArray($range, null, true, false, true) as $rowNumber => $columns) {
            foreach ($columns as $column => $_) {
                $validation = $sheet->getCell("{$column}{$rowNumber}")->getDataValidation();
                $validation->setType(DataValidation::TYPE_LIST);
                $validation->setErrorStyle(DataValidation::STYLE_STOP);
                $validation->setAllowBlank(true);
                $validation->setShowInputMessage(true);
                $validation->setShowErrorMessage(true);
                $validation->setShowDropDown(true);
                $validation->setFormula1($formula);
            }
        }
    }

    private function columnName(int $columnNumber): string
    {
        $name = '';

        while ($columnNumber > 0) {
            $columnNumber--;
            $name = chr(65 + ($columnNumber % 26)).$name;
            $columnNumber = intdiv($columnNumber, 26);
        }

        return $name;
    }
}
