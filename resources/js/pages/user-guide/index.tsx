import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { BookOpenCheck, Download, FileText } from 'lucide-react';

interface Guide {
    id: number;
    title: string;
    original_name: string;
    size: number;
    updated_at: string;
}

interface Props {
    guide: Guide | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Buku Panduan', href: '/user-guide' },
];

function formatBytes(bytes: number): string {
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export default function UserGuideDownload({ guide }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Buku Panduan" />

            <div className="flex flex-1 items-start justify-center p-4 pt-10">
                <div className="w-full max-w-2xl rounded-2xl border bg-card p-8 text-center shadow-sm">
                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <BookOpenCheck className="h-8 w-8" />
                    </div>
                    <h1 className="text-2xl font-bold">
                        Buku Panduan Pengguna
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                        Unduh panduan penggunaan aplikasi untuk mempelajari
                        fitur dan alur kerja yang tersedia.
                    </p>

                    {guide ? (
                        <div className="mt-8 rounded-xl border bg-muted/30 p-5 text-left">
                            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                                <div className="flex min-w-0 items-center gap-3">
                                    <FileText className="h-8 w-8 shrink-0 text-primary" />
                                    <div className="min-w-0">
                                        <h2 className="font-semibold">
                                            {guide.title}
                                        </h2>
                                        <p className="truncate text-sm text-muted-foreground">
                                            {guide.original_name} ·{' '}
                                            {formatBytes(guide.size)}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Diperbarui{' '}
                                            {new Date(
                                                guide.updated_at,
                                            ).toLocaleDateString('id-ID')}
                                        </p>
                                    </div>
                                </div>
                                <Button asChild>
                                    <a href={route('user-guide.download')}>
                                        <Download className="mr-2 h-4 w-4" />
                                        Unduh Buku Panduan
                                    </a>
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-8 rounded-xl border border-dashed p-8 text-muted-foreground">
                            Buku panduan belum tersedia. Silakan hubungi
                            administrator.
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
