import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import {
    type BreadcrumbItem,
    type Jenjang,
    type Kelas,
    type QuizStudentAccess,
    type QuizTeacherAccess,
    type SharedData,
    type User,
} from '@/types';
import { type Quiz } from '@/types/quiz';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCircle2,
    Eye,
    GraduationCap,
    Pencil,
    School,
    Shield,
    Trash2,
    UserPlus,
    Users,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

interface Props {
    quiz: Quiz;
    teachers: User[];
    students: User[];
    teacherAccess: QuizTeacherAccess[];
    studentAccess: QuizStudentAccess[];
    jenjangs: Jenjang[];
    kelases: Kelas[];
}

export default function QuizAccess({
    quiz,
    teachers,
    students,
    teacherAccess,
    studentAccess,
    jenjangs,
    kelases,
}: Props) {
    const { flash } = usePage<SharedData>().props;
    const [selectedTeacher, setSelectedTeacher] = useState<string>('');
    const [teacherPermission, setTeacherPermission] = useState<string>('edit');
    const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
    const [selectedJenjang, setSelectedJenjang] = useState<string>('');
    const [studentSearchTerm, setStudentSearchTerm] = useState('');
    const [teacherJenjangFilter, setTeacherJenjangFilter] =
        useState<string>('all');
    const [teacherKelasFilter, setTeacherKelasFilter] = useState<string>('all');
    const [studentJenjangFilter, setStudentJenjangFilter] =
        useState<string>('all');
    const [studentKelasFilter, setStudentKelasFilter] = useState<string>('all');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Koleksi', href: '#' },
        { title: 'Semua Kuis', href: '/library/quizzes' },
        { title: quiz.title, href: `/library/quizzes/${quiz.id}/edit` },
        { title: 'Pengaturan Akses', href: '#' },
    ];

    // Filter students not already having access
    const availableStudents = students.filter(
        (s) => !studentAccess.find((sa) => sa.user_id === s.id),
    );

    // Filter students by search term
    let filteredStudents = availableStudents.filter(
        (s) =>
            s.name.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
            s.email.toLowerCase().includes(studentSearchTerm.toLowerCase()),
    );

    // Filter students by jenjang and kelas
    if (studentJenjangFilter !== 'all') {
        filteredStudents = filteredStudents.filter(
            (s) => s.jenjang_id?.toString() === studentJenjangFilter,
        );
    }
    if (studentKelasFilter !== 'all') {
        filteredStudents = filteredStudents.filter(
            (s) => s.kelas_id?.toString() === studentKelasFilter,
        );
    }

    // Filter teachers not already having access
    let availableTeachers = teachers.filter(
        (t) => !teacherAccess.find((ta) => ta.user_id === t.id),
    );

    // Filter teachers by jenjang and kelas
    if (teacherJenjangFilter !== 'all') {
        availableTeachers = availableTeachers.filter(
            (t) => t.jenjang_id?.toString() === teacherJenjangFilter,
        );
    }
    if (teacherKelasFilter !== 'all') {
        availableTeachers = availableTeachers.filter(
            (t) => t.kelas_id?.toString() === teacherKelasFilter,
        );
    }

    const handleGrantTeacherAccess = () => {
        if (!selectedTeacher) return;
        router.post(
            route('library.quizzes.access.teacher.grant', quiz.id),
            {
                user_id: selectedTeacher,
                permission: teacherPermission,
            },
            {
                onSuccess: () => {
                    setSelectedTeacher('');
                    setTeacherPermission('edit');
                },
            },
        );
    };

    const handleRevokeTeacherAccess = (userId: number) => {
        if (confirm('Apakah Anda yakin ingin mencabut akses guru ini?')) {
            router.delete(
                route('library.quizzes.access.teacher.revoke', [
                    quiz.id,
                    userId,
                ]),
            );
        }
    };

    const handleGrantStudentAccess = () => {
        if (selectedStudents.length === 0) return;
        router.post(
            route('library.quizzes.access.student.grant', quiz.id),
            {
                user_ids: selectedStudents.map(Number),
            },
            {
                onSuccess: () => {
                    setSelectedStudents([]);
                },
            },
        );
    };

    const handleRevokeStudentAccess = (userId: number) => {
        if (confirm('Apakah Anda yakin ingin mencabut akses siswa ini?')) {
            router.delete(
                route('library.quizzes.access.student.revoke', [
                    quiz.id,
                    userId,
                ]),
            );
        }
    };

    const handleGrantByJenjang = () => {
        if (!selectedJenjang) return;
        router.post(
            route('library.quizzes.access.student.jenjang', quiz.id),
            {
                jenjang_id: selectedJenjang,
            },
            {
                onSuccess: () => {
                    setSelectedJenjang('');
                },
            },
        );
    };

    const toggleStudentSelection = (studentId: string) => {
        setSelectedStudents((prev) =>
            prev.includes(studentId)
                ? prev.filter((id) => id !== studentId)
                : [...prev, studentId],
        );
    };

    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title={`Pengaturan Akses - ${quiz.title}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Pengaturan Akses
                        </h1>
                        <p className="text-muted-foreground">
                            Kelola siapa saja yang dapat mengakses quiz "
                            {quiz.title}"
                        </p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href={route('library.quizzes.edit', quiz.id)}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali
                        </Link>
                    </Button>
                </div>

                {/* Flash Messages */}
                {flash.success && (
                    <Alert
                        variant="default"
                        className="border-green-200 bg-green-50 text-green-900"
                    >
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertTitle>Berhasil</AlertTitle>
                        <AlertDescription>{flash.success}</AlertDescription>
                    </Alert>
                )}

                {flash.error && (
                    <Alert variant="destructive">
                        <XCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{flash.error}</AlertDescription>
                    </Alert>
                )}

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Teacher Access Section */}
                    <div className="rounded-xl border border-sidebar-border bg-sidebar p-6 shadow-sm">
                        <div className="mb-4 flex items-center gap-2">
                            <Shield className="h-5 w-5 text-blue-600" />
                            <h2 className="text-lg font-semibold">
                                Akses Guru
                            </h2>
                        </div>
                        <p className="mb-4 text-sm text-muted-foreground">
                            Berikan akses kepada guru lain untuk melihat atau
                            mengedit quiz ini.
                        </p>

                        {/* Add Teacher Form */}
                        <div className="mb-6 space-y-4 rounded-lg bg-muted/50 p-4">
                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                    <Label className="text-xs">
                                        Filter Jenjang
                                    </Label>
                                    <Select
                                        value={teacherJenjangFilter}
                                        onValueChange={setTeacherJenjangFilter}
                                    >
                                        <SelectTrigger className="h-8">
                                            <SelectValue placeholder="Semua Jenjang" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                Semua Jenjang
                                            </SelectItem>
                                            {jenjangs.map((j) => (
                                                <SelectItem
                                                    key={j.id}
                                                    value={j.id.toString()}
                                                >
                                                    {j.jenjang} -{' '}
                                                    {j.nama_sekolah}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">
                                        Filter Kelas
                                    </Label>
                                    <Select
                                        value={teacherKelasFilter}
                                        onValueChange={setTeacherKelasFilter}
                                    >
                                        <SelectTrigger className="h-8">
                                            <SelectValue placeholder="Semua Kelas" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                Semua Kelas
                                            </SelectItem>
                                            {kelases.map((k) => (
                                                <SelectItem
                                                    key={k.id}
                                                    value={k.id.toString()}
                                                >
                                                    {k.nama_kelas}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Pilih Guru</Label>
                                <Select
                                    value={selectedTeacher}
                                    onValueChange={setSelectedTeacher}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih guru..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableTeachers.map((teacher) => (
                                            <SelectItem
                                                key={teacher.id}
                                                value={teacher.id.toString()}
                                            >
                                                {teacher.name} (
                                                {teacher.roles?.[0]?.name ||
                                                    'No Role'}
                                                )
                                                {teacher.kelas
                                                    ? ` - ${teacher.kelas.nama_kelas}`
                                                    : ''}
                                                {teacher.jenjang
                                                    ? ` (${teacher.jenjang.jenjang})`
                                                    : ''}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Permission</Label>
                                <Select
                                    value={teacherPermission}
                                    onValueChange={setTeacherPermission}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="view">
                                            <div className="flex items-center gap-2">
                                                <Eye className="h-4 w-4" />
                                                <span>View Only</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="edit">
                                            <div className="flex items-center gap-2">
                                                <Pencil className="h-4 w-4" />
                                                <span>Edit</span>
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button
                                onClick={handleGrantTeacherAccess}
                                disabled={!selectedTeacher}
                                className="w-full"
                            >
                                <UserPlus className="mr-2 h-4 w-4" />
                                Tambah Akses Guru
                            </Button>
                        </div>

                        {/* Teacher Access List */}
                        <div className="space-y-2">
                            <Label className="text-sm text-muted-foreground">
                                Guru dengan akses ({teacherAccess.length})
                            </Label>
                            {teacherAccess.length === 0 ? (
                                <p className="py-4 text-center text-sm text-muted-foreground italic">
                                    Belum ada guru yang diberi akses
                                </p>
                            ) : (
                                <div className="max-h-64 space-y-2 overflow-y-auto">
                                    {teacherAccess.map((access) => (
                                        <div
                                            key={access.id}
                                            className="flex items-center justify-between rounded-lg border bg-background p-3"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                                                    <Shield className="h-4 w-4 text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">
                                                        {access.user?.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {access.user?.email}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={`rounded px-2 py-1 text-xs ${
                                                        access.permission ===
                                                        'edit'
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-gray-100 text-gray-700'
                                                    }`}
                                                >
                                                    {access.permission ===
                                                    'edit'
                                                        ? 'Edit'
                                                        : 'View'}
                                                </span>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive hover:text-destructive"
                                                    onClick={() =>
                                                        handleRevokeTeacherAccess(
                                                            access.user_id,
                                                        )
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Student Access Section */}
                    <div className="rounded-xl border border-sidebar-border bg-sidebar p-6 shadow-sm">
                        <div className="mb-4 flex items-center gap-2">
                            <GraduationCap className="h-5 w-5 text-green-600" />
                            <h2 className="text-lg font-semibold">
                                Akses Siswa
                            </h2>
                        </div>
                        <p className="mb-4 text-sm text-muted-foreground">
                            Berikan akses kepada siswa untuk mengerjakan quiz
                            ini.
                        </p>

                        {/* Add by Jenjang */}
                        <div className="mb-4 space-y-4 rounded-lg bg-muted/50 p-4">
                            <div className="mb-2 flex items-center gap-2">
                                <School className="h-4 w-4" />
                                <Label className="font-medium">
                                    Tambah Berdasarkan Jenjang
                                </Label>
                            </div>
                            <div className="flex gap-2">
                                <Select
                                    value={selectedJenjang}
                                    onValueChange={setSelectedJenjang}
                                >
                                    <SelectTrigger className="flex-1">
                                        <SelectValue placeholder="Pilih jenjang..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {jenjangs.map((jenjang) => (
                                            <SelectItem
                                                key={jenjang.id}
                                                value={jenjang.id.toString()}
                                            >
                                                {jenjang.jenjang} -{' '}
                                                {jenjang.nama_sekolah}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button
                                    onClick={handleGrantByJenjang}
                                    disabled={!selectedJenjang}
                                >
                                    Tambah
                                </Button>
                            </div>
                        </div>

                        {/* Add Individual Students */}
                        <div className="mb-6 space-y-4 rounded-lg bg-muted/50 p-4">
                            <div className="mb-2 flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                <Label className="font-medium">
                                    Tambah Siswa Individual
                                </Label>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                    <Label className="text-xs">
                                        Filter Jenjang
                                    </Label>
                                    <Select
                                        value={studentJenjangFilter}
                                        onValueChange={setStudentJenjangFilter}
                                    >
                                        <SelectTrigger className="h-8">
                                            <SelectValue placeholder="Semua Jenjang" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                Semua Jenjang
                                            </SelectItem>
                                            {jenjangs.map((j) => (
                                                <SelectItem
                                                    key={j.id}
                                                    value={j.id.toString()}
                                                >
                                                    {j.jenjang} -{' '}
                                                    {j.nama_sekolah}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">
                                        Filter Kelas
                                    </Label>
                                    <Select
                                        value={studentKelasFilter}
                                        onValueChange={setStudentKelasFilter}
                                    >
                                        <SelectTrigger className="h-8">
                                            <SelectValue placeholder="Semua Kelas" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                Semua Kelas
                                            </SelectItem>
                                            {kelases.map((k) => (
                                                <SelectItem
                                                    key={k.id}
                                                    value={k.id.toString()}
                                                >
                                                    {k.nama_kelas}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <Input
                                placeholder="Cari siswa..."
                                value={studentSearchTerm}
                                onChange={(e) =>
                                    setStudentSearchTerm(e.target.value)
                                }
                            />

                            <div className="max-h-40 space-y-1 overflow-y-auto rounded-lg border p-2">
                                {filteredStudents.length === 0 ? (
                                    <p className="py-2 text-center text-sm text-muted-foreground">
                                        Tidak ada siswa ditemukan
                                    </p>
                                ) : (
                                    filteredStudents
                                        .slice(0, 20)
                                        .map((student) => (
                                            <label
                                                key={student.id}
                                                className="flex cursor-pointer items-center gap-2 rounded p-2 hover:bg-muted"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedStudents.includes(
                                                        student.id.toString(),
                                                    )}
                                                    onChange={() =>
                                                        toggleStudentSelection(
                                                            student.id.toString(),
                                                        )
                                                    }
                                                    className="rounded"
                                                />
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium">
                                                        {student.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {student.email}
                                                        {student.jenjang &&
                                                            ` • ${student.jenjang.jenjang}`}
                                                        {student.kelas &&
                                                            ` • ${student.kelas.nama_kelas}`}
                                                    </p>
                                                </div>
                                            </label>
                                        ))
                                )}
                            </div>

                            {selectedStudents.length > 0 && (
                                <Button
                                    onClick={handleGrantStudentAccess}
                                    className="w-full"
                                >
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    Tambah {selectedStudents.length} Siswa
                                </Button>
                            )}
                        </div>

                        {/* Student Access List */}
                        <div className="space-y-2">
                            <Label className="text-sm text-muted-foreground">
                                Siswa dengan akses ({studentAccess.length})
                            </Label>
                            {studentAccess.length === 0 ? (
                                <p className="py-4 text-center text-sm text-muted-foreground italic">
                                    Belum ada siswa yang diberi akses
                                </p>
                            ) : (
                                <div className="max-h-64 space-y-2 overflow-y-auto">
                                    {studentAccess.map((access) => (
                                        <div
                                            key={access.id}
                                            className="flex items-center justify-between rounded-lg border bg-background p-3"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                                                    <GraduationCap className="h-4 w-4 text-green-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium">
                                                        {access.user?.name}
                                                    </p>
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <span>
                                                            {access.user?.email}
                                                        </span>
                                                        {access.user
                                                            ?.jenjang && (
                                                            <>
                                                                <span>•</span>
                                                                <span>
                                                                    {
                                                                        access
                                                                            .user
                                                                            .jenjang
                                                                            .jenjang
                                                                    }{' '}
                                                                    -{' '}
                                                                    {
                                                                        access
                                                                            .user
                                                                            .jenjang
                                                                            .nama_sekolah
                                                                    }
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {access.attempt_count > 0 && (
                                                    <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-700">
                                                        {access.attempt_count}x
                                                        dikerjakan
                                                    </span>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive hover:text-destructive"
                                                    onClick={() =>
                                                        handleRevokeStudentAccess(
                                                            access.user_id,
                                                        )
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppSidebarLayout>
    );
}
