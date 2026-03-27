import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { NilaiFilterBar } from '@/components/nilai/nilai-filter-bar';
import { SummaryCard } from '@/components/nilai/summary-card';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    ClipboardCheck,
    Eye,
    GraduationCap,
    PencilLine,
    RefreshCw,
    Trophy,
    XCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';

interface JenjangInfo {
    id: number;
    jenjang: string;
    nama_sekolah: string;
}

interface AttemptItem {
    id: number;
    quiz: {
        id: number;
        title: string;
        passing_score: number;
        starts_at: string | null;
        jenjang: JenjangInfo | null;
        kelas: { nama_kelas: string } | null;
    };
    student: {
        id: number;
        name: string;
        email: string;
        jenjang: string | null;
        nama_sekolah: string | null;
        kelas: string | null;
    };
    total_points: number;
    max_points: number;
    score_percentage: number;
    correct_count: number;
    wrong_count: number;
    completed_at: string | null;
    can_edit: boolean;
    is_passed: boolean;
    detail_url: string;
}

interface PaginatedAttempts {
    data: AttemptItem[];
    current_page: number;
    last_page: number;
    total: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

interface Summary {
    rata_rata: number;
    total_selesai: number;
    lulus: number;
    remedial: number;
}

interface Filters {
    search?: string;
    jenjang_id?: string;
    date_from?: string;
    date_to?: string;
}

interface Props {
    attempts: PaginatedAttempts;
    summary: Summary;
    jenjangs: JenjangInfo[];
    filters: Filters;
    permissions: {
        canEditAny: boolean;
        isSiswa: boolean;
        isOrangTua: boolean;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Nilai',
        href: '/nilai',
    },
];

// Group attempts by quiz ID
function groupByQuiz(attempts: AttemptItem[]) {
    const groups: Record<
        number,
        {
            quizId: number;
            quizTitle: string;
            passingScore: number;
            startsAt: string | null;
            jenjang: JenjangInfo | null;
            kelas: { nama_kelas: string } | null;
            attempts: AttemptItem[];
        }
    > = {};

    for (const attempt of attempts) {
        const qId = attempt.quiz.id;
        if (!groups[qId]) {
            groups[qId] = {
                quizId: qId,
                quizTitle: attempt.quiz.title,
                passingScore: attempt.quiz.passing_score,
                startsAt: attempt.quiz.starts_at,
                jenjang: attempt.quiz.jenjang,
                kelas: attempt.quiz.kelas,
                attempts: [],
            };
        }
        groups[qId].attempts.push(attempt);
    }

    return Object.values(groups);
}

function formatDate(dateStr: string | null): string {
    if (!dateStr) return '-';
    try {
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    } catch {
        return dateStr;
    }
}

function QuizScoreCard({
    group,
    permissions,
}: {
    group: ReturnType<typeof groupByQuiz>[0];
    permissions: Props['permissions'];
}) {
    const [expanded, setExpanded] = useState(true);

    return (
        <div className="overflow-hidden rounded-xl border border-sidebar-border bg-sidebar shadow-sm transition-shadow hover:shadow-md">
            {/* Quiz Header */}
            <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-accent/50"
            >
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold tracking-tight">
                            {group.quizTitle}
                        </h3>
                        <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                            KKM: {group.passingScore}%
                        </span>
                        {group.jenjang && (
                            <span className="inline-flex items-center rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-600 dark:text-blue-400">
                                {group.jenjang.jenjang} - {group.jenjang.nama_sekolah}
                            </span>
                        )}
                        {group.kelas && (
                            <span className="inline-flex items-center rounded-full bg-purple-500/10 px-2 py-0.5 text-xs font-medium text-purple-600 dark:text-purple-400">
                                {group.kelas.nama_kelas}
                            </span>
                        )}
                    </div>
                    <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
                        {group.startsAt && (
                            <span>Mulai: {formatDate(group.startsAt)}</span>
                        )}
                        <span>{group.attempts.length} peserta</span>
                    </div>
                </div>
                {expanded ? (
                    <ChevronUp className="h-5 w-5 shrink-0 text-muted-foreground" />
                ) : (
                    <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground" />
                )}
            </button>

            {/* Attempts Table */}
            {expanded && (
                <div className="border-t border-sidebar-border">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="border-b border-sidebar-border/60 bg-accent/30 text-left">
                                    <th className="px-4 py-2.5 font-medium">
                                        Siswa
                                    </th>
                                    <th className="px-4 py-2.5 font-medium">
                                        Kelas
                                    </th>
                                    <th className="px-4 py-2.5 font-medium">
                                        Benar / Salah
                                    </th>
                                    <th className="px-4 py-2.5 font-medium">
                                        Skor
                                    </th>
                                    <th className="px-4 py-2.5 font-medium">
                                        %
                                    </th>
                                    <th className="px-4 py-2.5 font-medium">
                                        Status
                                    </th>
                                    <th className="px-4 py-2.5 font-medium">
                                        Selesai
                                    </th>
                                    <th className="px-4 py-2.5 font-medium">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {group.attempts.map((attempt) => {
                                    const canEditRow =
                                        permissions.canEditAny &&
                                        attempt.can_edit;

                                    return (
                                        <tr
                                            key={attempt.id}
                                            className="border-b border-sidebar-border/40 transition-colors hover:bg-accent/20"
                                        >
                                            <td className="px-4 py-2.5">
                                                <div className="font-medium">
                                                    {attempt.student.name}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {attempt.student.email}
                                                </div>
                                            </td>
                                            <td className="px-4 py-2.5">
                                                <div>
                                                    {[attempt.student.jenjang, attempt.student.nama_sekolah].filter(Boolean).join(' - ') || '-'}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {attempt.student.kelas ??
                                                        '-'}
                                                </div>
                                            </td>
                                            <td className="px-4 py-2.5">
                                                <span className="text-emerald-600">
                                                    {attempt.correct_count}
                                                </span>
                                                {' / '}
                                                <span className="text-red-500">
                                                    {attempt.wrong_count}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2.5">
                                                <span className="font-medium">
                                                    {attempt.total_points}
                                                </span>
                                                <span className="text-muted-foreground">
                                                    {' '}
                                                    / {attempt.max_points}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2.5">
                                                <span
                                                    className={`font-semibold ${attempt.is_passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}
                                                >
                                                    {attempt.score_percentage}%
                                                </span>
                                            </td>
                                            <td className="px-4 py-2.5">
                                                {attempt.is_passed ? (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                                                        <CheckCircle2 className="h-3 w-3" />
                                                        Lulus
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                                                        <RefreshCw className="h-3 w-3" />
                                                        Remedial
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-2.5 text-xs text-muted-foreground">
                                                {formatDate(
                                                    attempt.completed_at,
                                                )}
                                            </td>
                                            <td className="px-4 py-2.5">
                                                <Button
                                                    size="sm"
                                                    variant={
                                                        canEditRow
                                                            ? 'default'
                                                            : 'outline'
                                                    }
                                                    asChild
                                                    className="h-8"
                                                >
                                                    <Link
                                                        href={
                                                            attempt.detail_url
                                                        }
                                                    >
                                                        {canEditRow ? (
                                                            <>
                                                                <PencilLine className="mr-1.5 h-3.5 w-3.5" />
                                                                Atur Nilai
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Eye className="mr-1.5 h-3.5 w-3.5" />
                                                                Lihat
                                                            </>
                                                        )}
                                                    </Link>
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function NilaiIndex({
    attempts,
    summary,
    jenjangs,
    filters,
    permissions,
}: Props) {
    const { flash } = usePage<SharedData>().props;

    const titleText = useMemo(() => {
        if (permissions.isSiswa) return 'Nilai Saya';
        if (permissions.isOrangTua) return 'Nilai Anak';
        return 'Nilai Siswa';
    }, [permissions.isOrangTua, permissions.isSiswa]);

    const quizGroups = useMemo(
        () => groupByQuiz(attempts.data),
        [attempts.data],
    );

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

                {/* Page Header */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        {titleText}
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {permissions.canEditAny
                            ? 'Dashboard nilai siswa. Klik pada setiap baris untuk mengatur nilai per soal.'
                            : 'Daftar nilai berdasarkan kuis yang sudah diselesaikan.'}
                    </p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <SummaryCard
                        title="Rata-rata Nilai"
                        value={`${summary.rata_rata}%`}
                        subtitle="Persentase rata-rata semua ujian"
                        icon={BarChart3}
                        colorScheme="blue"
                    />
                    <SummaryCard
                        title="Total Ujian Selesai"
                        value={summary.total_selesai}
                        subtitle="Jumlah ujian yang telah dikerjakan"
                        icon={ClipboardCheck}
                        colorScheme="purple"
                    />
                    <SummaryCard
                        title="Lulus"
                        value={summary.lulus}
                        subtitle="Memenuhi batas KKM"
                        icon={Trophy}
                        colorScheme="green"
                    />
                    <SummaryCard
                        title="Remedial"
                        value={summary.remedial}
                        subtitle="Perlu perbaikan nilai"
                        icon={GraduationCap}
                        colorScheme="amber"
                    />
                </div>

                {/* Filter Bar */}
                <NilaiFilterBar jenjangs={jenjangs} filters={filters} />

                {/* Quiz Score Cards */}
                {quizGroups.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-sidebar-border py-16">
                        <ClipboardCheck className="mb-4 h-12 w-12 text-muted-foreground/50" />
                        <h3 className="text-lg font-medium text-muted-foreground">
                            Belum Ada Data Nilai
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground/70">
                            Belum ada ujian yang diselesaikan
                            {filters.search ||
                            filters.jenjang_id ||
                            filters.date_from ||
                            filters.date_to
                                ? ' dengan filter yang dipilih.'
                                : '.'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {quizGroups.map((group) => (
                            <QuizScoreCard
                                key={group.quizId}
                                group={group}
                                permissions={permissions}
                            />
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {attempts.links.length > 3 && (
                    <div className="flex flex-wrap items-center justify-center gap-1.5">
                        {attempts.links.map((link, index) => (
                            <Button
                                key={`${link.label}-${index}`}
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                disabled={!link.url}
                                asChild={!!link.url}
                                className="h-8 min-w-[2rem]"
                            >
                                {link.url ? (
                                    <Link href={link.url} preserveScroll>
                                        <span
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    </Link>
                                ) : (
                                    <span
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                )}
                            </Button>
                        ))}
                    </div>
                )}
            </div>
        </AppSidebarLayout>
    );
}
