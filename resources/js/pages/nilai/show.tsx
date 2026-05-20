import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Award,
    CheckCircle2,
    Eye,
    Medal,
    PencilLine,
    RefreshCw,
    RotateCcw,
    Save,
    Trophy,
    XCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';

interface AttemptDetail {
    id: number;
    attempt_number: number;
    is_graded: boolean;
    total_attempts: number;
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
    answer_explanation: string | null;
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

const clampScoreInput = (rawValue: string, maxPoints: number): string => {
    const digitsOnly = rawValue.replace(/\D/g, '');

    if (digitsOnly === '') {
        return '';
    }

    const value = Number.parseInt(digitsOnly, 10);
    const safeMax = Math.max(0, maxPoints);

    return Math.min(value, safeMax).toString();
};

export default function NilaiShow({
    attempt,
    questionScores,
    permissions,
}: Props) {
    const { flash } = usePage<SharedData>().props;
    const [scoreDrafts, setScoreDrafts] = useState<Record<number, string>>({});
    const [isManualStatsModalOpen, setIsManualStatsModalOpen] = useState(false);

    const manualStatsForm = useForm({
        correct_count: attempt.correct_count.toString(),
        wrong_count: attempt.wrong_count.toString(),
    });

    const handleManualStatsSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        manualStatsForm.patch(route('nilai.manual-stats.update', attempt.id), {
            onSuccess: () => {
                setIsManualStatsModalOpen(false);
            },
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Nilai', href: '/nilai' },
        { title: `Detail #${attempt.id}`, href: `/nilai/${attempt.id}` },
    ];

    const ungradedCount = useMemo(() => {
        return questionScores.filter(
            (q) =>
                (q.question_type === 'short_answer' ||
                    q.question_type === 'long_answer') &&
                q.awarded_points === 0,
        ).length;
    }, [questionScores]);

    const titleText = useMemo(() => {
        if (permissions.isSiswa) return 'Detail Nilai Saya';
        if (permissions.isOrangTua) return 'Detail Nilai Anak';
        return permissions.canEdit
            ? 'Atur Nilai Per Soal'
            : 'Detail Nilai Per Soal';
    }, [permissions.canEdit, permissions.isOrangTua, permissions.isSiswa]);
    const showActionColumn = !permissions.isSiswa;

    const submitScore = (item: QuestionScoreItem) => {
        const raw =
            scoreDrafts[item.question_id] ?? item.awarded_points.toString();
        const value = Number.parseInt(raw, 10);

        if (Number.isNaN(value) || value < 0) {
            alert('Nilai per soal harus berupa angka 0 atau lebih besar.');
            return;
        }

        if (value > item.max_points) {
            alert(`Nilai per soal tidak boleh melebihi ${item.max_points}.`);
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
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium">
                                <RotateCcw className="h-3 w-3" />
                                Percobaan ke-{attempt.attempt_number}
                            </span>
                            {attempt.is_graded ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                                    <Medal className="h-3 w-3" />
                                    Nilai Resmi
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                                    <Award className="h-3 w-3" />
                                    Latihan
                                </span>
                            )}
                            {attempt.total_attempts > 1 && (
                                <span className="text-xs text-muted-foreground">
                                    ({attempt.total_attempts} total attempt)
                                </span>
                            )}
                        </div>
                    </div>

                    <Button variant="outline" asChild>
                        <Link href={route('nilai.index')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali ke daftar
                        </Link>
                    </Button>
                </div>

                {/* Graded Info Banner */}
                {attempt.is_graded && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300">
                        <div className="flex items-center gap-2">
                            <Medal className="h-4 w-4 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
                            <span>
                                Ini adalah <strong>nilai resmi</strong>{' '}
                                (percobaan pertama) yang masuk ke penilaian.
                            </span>
                        </div>
                    </div>
                )}

                {!attempt.is_graded && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
                        <div className="flex items-center gap-2">
                            <Award className="h-4 w-4 flex-shrink-0 text-amber-600 dark:text-amber-400" />
                            <span>
                                Percobaan ini{' '}
                                <strong>tidak masuk penilaian resmi</strong>.
                                Hanya percobaan pertama yang menjadi nilai
                                resmi.
                            </span>
                        </div>
                    </div>
                )}

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

                        {/* Correct / Wrong / Ungraded */}
                        <div className="p-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                                <p className="text-xs font-medium text-muted-foreground">
                                    Benar / Salah / Belum Dinilai
                                </p>
                                {permissions.canEdit && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            manualStatsForm.setData({
                                                correct_count:
                                                    attempt.correct_count.toString(),
                                                wrong_count:
                                                    attempt.wrong_count.toString(),
                                            });
                                            setIsManualStatsModalOpen(true);
                                        }}
                                        className="rounded-full p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                                        title="Atur Benar/Salah Manual"
                                    >
                                        <PencilLine className="h-3 w-3" />
                                    </button>
                                )}
                            </div>
                            <p className="mt-1 text-2xl font-bold">
                                <span
                                    className="text-emerald-600"
                                    title="Benar"
                                >
                                    {attempt.correct_count}
                                </span>
                                {' / '}
                                <span className="text-red-500" title="Salah">
                                    {attempt.wrong_count}
                                </span>
                                {' / '}
                                <span
                                    className="text-orange-500"
                                    title="Belum Dinilai"
                                >
                                    {ungradedCount}
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
                                    {showActionColumn && (
                                        <th className="px-4 py-3 font-medium">
                                            Aksi
                                        </th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {questionScores.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={showActionColumn ? 8 : 7}
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
                                                <p className="line-clamp-3">
                                                    {item.answer_preview}
                                                </p>
                                                {item.question_type ===
                                                    'true_false' &&
                                                    item.answer_explanation && (
                                                        <div className="mt-2 rounded-md border border-sidebar-border bg-background p-2">
                                                            <span className="mb-1 block text-[11px] font-semibold text-foreground uppercase">
                                                                Keterangan
                                                            </span>
                                                            <p className="whitespace-pre-wrap">
                                                                {
                                                                    item.answer_explanation
                                                                }
                                                            </p>
                                                        </div>
                                                    )}
                                            </td>
                                            <td className="max-w-[200px] px-4 py-3 text-xs text-muted-foreground">
                                                <p className="line-clamp-3">
                                                    {item.answer_key}
                                                </p>
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
                                                                            clampScoreInput(
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                                item.max_points,
                                                                            ),
                                                                    }),
                                                                );
                                                            }}
                                                        />
                                                        <span className="text-xs text-muted-foreground">
                                                            / {item.max_points}
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
                                            {showActionColumn && (
                                                <td className="px-4 py-3">
                                                    {isEditable ? (
                                                        <Button
                                                            size="sm"
                                                            className="h-8"
                                                            onClick={() =>
                                                                submitScore(
                                                                    item,
                                                                )
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
                                            )}
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
                            Guru dengan izin edit atau telaah soal dapat
                            mengatur skor setiap soal. Total nilai akan
                            diperbarui otomatis.
                        </span>
                    ) : (
                        <span>
                            Halaman ini menampilkan detail nilai per soal untuk
                            transparansi penilaian.
                        </span>
                    )}
                </div>
            </div>

            {/* Manual Stats Modal */}
            <Dialog
                open={isManualStatsModalOpen}
                onOpenChange={setIsManualStatsModalOpen}
            >
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Atur Benar/Salah Manual</DialogTitle>
                        <DialogDescription>
                            Ubah jumlah benar dan salah secara manual untuk{' '}
                            {attempt.student.name}. Poin total akan tetap, hanya
                            statistik benar/salah yang diubah.
                        </DialogDescription>
                    </DialogHeader>
                    <form
                        onSubmit={handleManualStatsSubmit}
                        className="space-y-4 py-4"
                    >
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="correct_count"
                                    className="text-emerald-600"
                                >
                                    Benar
                                </Label>
                                <Input
                                    id="correct_count"
                                    type="number"
                                    min="0"
                                    value={manualStatsForm.data.correct_count}
                                    onChange={(e) =>
                                        manualStatsForm.setData(
                                            'correct_count',
                                            e.target.value,
                                        )
                                    }
                                    required
                                />
                                {manualStatsForm.errors.correct_count && (
                                    <p className="text-xs text-red-500">
                                        {manualStatsForm.errors.correct_count}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label
                                    htmlFor="wrong_count"
                                    className="text-red-500"
                                >
                                    Salah
                                </Label>
                                <Input
                                    id="wrong_count"
                                    type="number"
                                    min="0"
                                    value={manualStatsForm.data.wrong_count}
                                    onChange={(e) =>
                                        manualStatsForm.setData(
                                            'wrong_count',
                                            e.target.value,
                                        )
                                    }
                                    required
                                />
                                {manualStatsForm.errors.wrong_count && (
                                    <p className="text-xs text-red-500">
                                        {manualStatsForm.errors.wrong_count}
                                    </p>
                                )}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsManualStatsModalOpen(false)}
                                disabled={manualStatsForm.processing}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={manualStatsForm.processing}
                            >
                                {manualStatsForm.processing
                                    ? 'Menyimpan...'
                                    : 'Simpan Perubahan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppSidebarLayout>
    );
}
