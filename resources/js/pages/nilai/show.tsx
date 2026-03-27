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
    RefreshCw,
    Save,
    Trophy,
    XCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';

interface AttemptDetail {
    id: number;
    quiz: {
        id: number;
        title: string;
        passing_score: number;
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
    is_passed: boolean;
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

            <div className="flex h-full flex-1 flex-col gap-5 p-4 md:p-6">
                {/* Flash Messages */}
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

                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            {titleText}
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Quiz: {attempt.quiz.title} | Siswa:{' '}
                            {attempt.student.name}
                        </p>
                    </div>

                    <Button variant="outline" asChild>
                        <Link href={route('nilai.index')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali ke daftar
                        </Link>
                    </Button>
                </div>

                {/* Score Summary Card */}
                <div className="overflow-hidden rounded-xl border border-sidebar-border bg-sidebar">
                    <div className="grid grid-cols-1 divide-y divide-sidebar-border sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-5">
                        {/* Total Score */}
                        <div className="p-4 text-center">
                            <p className="text-xs font-medium text-muted-foreground">
                                Total Skor
                            </p>
                            <p className="mt-1 text-2xl font-bold">
                                {attempt.total_points}{' '}
                                <span className="text-sm font-normal text-muted-foreground">
                                    / {attempt.max_points}
                                </span>
                            </p>
                        </div>

                        {/* Percentage */}
                        <div className="p-4 text-center">
                            <p className="text-xs font-medium text-muted-foreground">
                                Persentase
                            </p>
                            <p
                                className={`mt-1 text-2xl font-bold ${attempt.is_passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}
                            >
                                {attempt.score_percentage}%
                            </p>
                        </div>

                        {/* KKM */}
                        <div className="p-4 text-center">
                            <p className="text-xs font-medium text-muted-foreground">
                                KKM
                            </p>
                            <p className="mt-1 text-2xl font-bold text-primary">
                                {attempt.quiz.passing_score}%
                            </p>
                        </div>

                        {/* Correct / Wrong */}
                        <div className="p-4 text-center">
                            <p className="text-xs font-medium text-muted-foreground">
                                Benar / Salah
                            </p>
                            <p className="mt-1 text-2xl font-bold">
                                <span className="text-emerald-600">
                                    {attempt.correct_count}
                                </span>
                                {' / '}
                                <span className="text-red-500">
                                    {attempt.wrong_count}
                                </span>
                            </p>
                        </div>

                        {/* Status */}
                        <div className="flex flex-col items-center justify-center p-4">
                            <p className="text-xs font-medium text-muted-foreground">
                                Status
                            </p>
                            {attempt.is_passed ? (
                                <div className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                                    <Trophy className="h-4 w-4" />
                                    Lulus
                                </div>
                            ) : (
                                <div className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-sm font-semibold text-amber-700 dark:text-amber-400">
                                    <RefreshCw className="h-4 w-4" />
                                    Remedial
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Question Scores Table */}
                <div className="overflow-hidden rounded-xl border border-sidebar-border bg-sidebar">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="border-b border-sidebar-border bg-accent/30 text-left">
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
                                            className="border-b border-sidebar-border/40 align-top transition-colors hover:bg-accent/20"
                                        >
                                            <td className="px-4 py-3">
                                                {item.order}
                                            </td>
                                            <td className="max-w-xs px-4 py-3">
                                                <p className="line-clamp-2">
                                                    {item.question_text}
                                                </p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="inline-flex rounded-full bg-accent px-2 py-0.5 text-xs font-medium">
                                                    {item.question_type}
                                                </span>
                                            </td>
                                            <td className="max-w-[200px] px-4 py-3 text-xs text-muted-foreground">
                                                <p className="line-clamp-3">{item.answer_preview}</p>
                                            </td>
                                            <td className="max-w-[200px] px-4 py-3 text-xs text-muted-foreground">
                                                <p className="line-clamp-3">{item.answer_key}</p>
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
                                                            className="h-8 w-20"
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
                                                        <span className="text-xs text-muted-foreground">
                                                            /{' '}
                                                            {item.max_points}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="font-medium">
                                                        {item.awarded_points}{' '}
                                                        <span className="font-normal text-muted-foreground">
                                                            / {item.max_points}
                                                        </span>
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {item.is_correct ? (
                                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                                        Benar
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                                                        <XCircle className="h-3.5 w-3.5" />
                                                        Belum penuh
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {isEditable ? (
                                                    <Button
                                                        size="sm"
                                                        className="h-8"
                                                        onClick={() =>
                                                            submitScore(item)
                                                        }
                                                    >
                                                        <Save className="mr-1.5 h-3.5 w-3.5" />
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

                {/* Footer Info */}
                <div className="rounded-xl border border-sidebar-border bg-sidebar p-4 text-xs text-muted-foreground">
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
