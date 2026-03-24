import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCircle2,
    Eye,
    PencilLine,
    Save,
    XCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';

interface AttemptDetail {
    id: number;
    quiz: {
        id: number;
        title: string;
    };
    student: {
        id: number;
        name: string;
        email: string;
        jenjang: string | null;
        kelas: string | null;
    };
    total_points: number;
    max_points: number;
    score_percentage: number;
    correct_count: number;
    wrong_count: number;
    completed_at: string | null;
}

interface QuestionScoreItem {
    question_id: number;
    order: number;
    question_text: string;
    question_type: string;
    answer_preview: string;
    answer_key: string;
    awarded_points: number;
    max_points: number;
    is_correct: boolean;
}

interface Props {
    attempt: AttemptDetail;
    questionScores: QuestionScoreItem[];
    permissions: {
        canEdit: boolean;
        isSiswa: boolean;
        isOrangTua: boolean;
    };
}

export default function NilaiShow({
    attempt,
    questionScores,
    permissions,
}: Props) {
    const { flash } = usePage<SharedData>().props;
    const [scoreDrafts, setScoreDrafts] = useState<Record<number, string>>({});

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Nilai', href: '/nilai' },
        { title: `Detail #${attempt.id}`, href: `/nilai/${attempt.id}` },
    ];

    const titleText = useMemo(() => {
        if (permissions.isSiswa) return 'Detail Nilai Saya';
        if (permissions.isOrangTua) return 'Detail Nilai Anak';
        return permissions.canEdit
            ? 'Atur Nilai Per Soal'
            : 'Detail Nilai Per Soal';
    }, [permissions.canEdit, permissions.isOrangTua, permissions.isSiswa]);

    const submitScore = (item: QuestionScoreItem) => {
        const raw =
            scoreDrafts[item.question_id] ?? item.awarded_points.toString();
        const value = Number.parseInt(raw, 10);

        if (Number.isNaN(value) || value < 0) {
            alert('Nilai per soal harus berupa angka 0 atau lebih besar.');
            return;
        }

        router.patch(
            route('nilai.question-score.update', attempt.id),
            {
                quiz_question_id: item.question_id,
                awarded_points: value,
            },
            {
                preserveScroll: true,
            },
        );
    };

    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title={titleText} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                {flash.success && (
                    <Alert
                        variant="default"
                        className="border-green-500 bg-green-50 text-green-900 dark:bg-green-900/20 dark:text-green-300"
                    >
                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
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

                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            {titleText}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Quiz: {attempt.quiz.title} | Siswa:{' '}
                            {attempt.student.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Total: {attempt.total_points} / {attempt.max_points}{' '}
                            ({attempt.score_percentage}%)
                        </p>
                    </div>

                    <Button variant="outline" asChild>
                        <Link href={route('nilai.index')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali ke daftar
                        </Link>
                    </Button>
                </div>

                <div className="overflow-hidden rounded-xl border border-sidebar-border bg-sidebar">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="border-b border-sidebar-border text-left">
                                    <th className="px-4 py-3 font-medium">
                                        No
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Soal
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Tipe
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Jawaban Siswa
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Kunci Jawaban
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Skor Soal
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {questionScores.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="px-4 py-6 text-center text-muted-foreground"
                                        >
                                            Belum ada detail soal pada attempt
                                            ini.
                                        </td>
                                    </tr>
                                )}

                                {questionScores.map((item) => {
                                    const isEditable = permissions.canEdit;
                                    const displayedScore =
                                        scoreDrafts[item.question_id] ??
                                        item.awarded_points.toString();

                                    return (
                                        <tr
                                            key={item.question_id}
                                            className="border-b border-sidebar-border/70 align-top"
                                        >
                                            <td className="px-4 py-3">
                                                {item.order}
                                            </td>
                                            <td className="px-4 py-3">
                                                {item.question_text}
                                            </td>
                                            <td className="px-4 py-3">
                                                {item.question_type}
                                            </td>
                                            <td className="max-w-md px-4 py-3 text-xs text-muted-foreground">
                                                {item.answer_preview}
                                            </td>
                                            <td className="max-w-md px-4 py-3 text-xs text-muted-foreground">
                                                {item.answer_key}
                                            </td>
                                            <td className="px-4 py-3">
                                                {isEditable ? (
                                                    <div className="flex items-center gap-2">
                                                        <Input
                                                            type="number"
                                                            min={0}
                                                            max={
                                                                item.max_points ||
                                                                undefined
                                                            }
                                                            className="h-8 w-24"
                                                            value={
                                                                displayedScore
                                                            }
                                                            onChange={(e) => {
                                                                setScoreDrafts(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        [item.question_id]:
                                                                            e
                                                                                .target
                                                                                .value,
                                                                    }),
                                                                );
                                                            }}
                                                        />
                                                        <span className="text-muted-foreground">
                                                            / {item.max_points}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span>
                                                        {item.awarded_points} /{' '}
                                                        {item.max_points}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {item.is_correct ? (
                                                    <span className="inline-flex items-center text-xs text-green-600">
                                                        <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                                                        Benar
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center text-xs text-amber-600">
                                                        <XCircle className="mr-1 h-3.5 w-3.5" />
                                                        Belum penuh
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {isEditable ? (
                                                    <Button
                                                        size="sm"
                                                        onClick={() =>
                                                            submitScore(item)
                                                        }
                                                    >
                                                        <Save className="mr-2 h-4 w-4" />
                                                        Simpan
                                                    </Button>
                                                ) : (
                                                    <span className="inline-flex items-center text-xs text-muted-foreground">
                                                        <Eye className="mr-1 h-3.5 w-3.5" />
                                                        Lihat saja
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="rounded-lg border border-sidebar-border bg-sidebar p-3 text-xs text-muted-foreground">
                    {permissions.canEdit ? (
                        <span className="inline-flex items-center">
                            <PencilLine className="mr-2 h-4 w-4" />
                            Guru dengan izin edit dapat mengatur skor setiap
                            soal. Total nilai akan diperbarui otomatis.
                        </span>
                    ) : (
                        <span>
                            Halaman ini menampilkan detail nilai per soal untuk
                            transparansi penilaian.
                        </span>
                    )}
                </div>
            </div>
        </AppSidebarLayout>
    );
}
