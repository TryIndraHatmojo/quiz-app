import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { CheckCircle2, Eye, PencilLine, XCircle } from 'lucide-react';
import { useMemo } from 'react';

interface AttemptItem {
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
    can_edit: boolean;
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

interface Props {
    attempts: PaginatedAttempts;
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

export default function NilaiIndex({ attempts, permissions }: Props) {
    const { flash } = usePage<SharedData>().props;

    const titleText = useMemo(() => {
        if (permissions.isSiswa) return 'Nilai Saya';
        if (permissions.isOrangTua) return 'Nilai Anak';
        return 'Nilai Siswa';
    }, [permissions.isOrangTua, permissions.isSiswa]);

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

                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        {titleText}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {permissions.canEditAny
                            ? 'Guru dapat membuka detail untuk mengatur nilai per soal.'
                            : 'Daftar nilai berdasarkan kuis yang sudah diselesaikan.'}
                    </p>
                </div>

                <div className="overflow-hidden rounded-xl border border-sidebar-border bg-sidebar">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="border-b border-sidebar-border text-left">
                                    <th className="px-4 py-3 font-medium">
                                        Quiz
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Siswa
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Kelas
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Benar/Salah
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Nilai
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Persentase
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Selesai
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {attempts.data.length === 0 && (
                                    <tr>
                                        <td
                                            className="px-4 py-6 text-center text-muted-foreground"
                                            colSpan={8}
                                        >
                                            Belum ada data nilai.
                                        </td>
                                    </tr>
                                )}

                                {attempts.data.map((attempt) => {
                                    const canEditRow =
                                        permissions.canEditAny &&
                                        attempt.can_edit;

                                    return (
                                        <tr
                                            key={attempt.id}
                                            className="border-b border-sidebar-border/70"
                                        >
                                            <td className="px-4 py-3">
                                                {attempt.quiz.title}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="font-medium">
                                                    {attempt.student.name}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {attempt.student.email}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div>
                                                    {attempt.student.jenjang ??
                                                        '-'}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {attempt.student.kelas ??
                                                        '-'}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                {attempt.correct_count} /{' '}
                                                {attempt.wrong_count}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span>
                                                    {attempt.total_points} /{' '}
                                                    {attempt.max_points}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {attempt.score_percentage}%
                                            </td>
                                            <td className="px-4 py-3 text-xs text-muted-foreground">
                                                {attempt.completed_at ?? '-'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <Button
                                                    size="sm"
                                                    variant={
                                                        canEditRow
                                                            ? 'default'
                                                            : 'outline'
                                                    }
                                                    asChild
                                                >
                                                    <Link
                                                        href={
                                                            attempt.detail_url
                                                        }
                                                    >
                                                        {canEditRow ? (
                                                            <>
                                                                <PencilLine className="mr-2 h-4 w-4" />
                                                                Atur Per Soal
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                Lihat Detail
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

                {attempts.links.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {attempts.links.map((link, index) => (
                            <Button
                                key={`${link.label}-${index}`}
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                disabled={!link.url}
                                asChild={!!link.url}
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
