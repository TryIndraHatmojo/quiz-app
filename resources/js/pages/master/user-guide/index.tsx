import InputError from '@/components/input-error';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    BookMarked,
    CheckCircle2,
    Download,
    FileText,
    Trash2,
    Upload,
} from 'lucide-react';
import { type FormEvent, useRef } from 'react';

interface Guide {
    id: number;
    title: string;
    original_name: string;
    mime_type: string;
    size: number;
    updated_at: string;
    uploader: { id: number; name: string } | null;
}

interface Props {
    guide: Guide | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Data Master', href: '#' },
    { title: 'Kelola Buku Panduan', href: '/master/user-guide' },
];

function formatBytes(bytes: number): string {
    if (!bytes) return '0 KB';

    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export default function UserGuideManagement({ guide }: Props) {
    const { flash } = usePage<SharedData>().props;
    const fileInput = useRef<HTMLInputElement>(null);
    const { data, setData, post, processing, errors, reset } = useForm({
        title: guide?.title ?? 'Buku Panduan Pengguna',
        file: null as File | null,
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();

        post(route('master.user-guide.store'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                reset('file');
                if (fileInput.current) fileInput.current.value = '';
            },
        });
    };

    const removeGuide = () => {
        if (confirm('Hapus buku panduan yang sedang aktif?')) {
            router.delete(route('master.user-guide.destroy'), {
                preserveScroll: true,
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kelola Buku Panduan" />

            <div className="flex flex-1 flex-col gap-6 rounded-xl p-4">
                <div>
                    <h1 className="text-2xl font-bold">Kelola Buku Panduan</h1>
                    <p className="text-sm text-muted-foreground">
                        Unggah dokumen tutorial yang dapat diunduh oleh
                        pengguna.
                    </p>
                </div>

                {flash.success && (
                    <Alert className="border-green-200 bg-green-50 text-green-900">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertTitle>Berhasil</AlertTitle>
                        <AlertDescription>{flash.success}</AlertDescription>
                    </Alert>
                )}

                {guide && (
                    <div className="max-w-3xl rounded-xl border bg-card p-5 shadow-sm">
                        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                            <div className="flex min-w-0 items-center gap-4">
                                <div className="rounded-lg bg-primary/10 p-3 text-primary">
                                    <FileText className="h-7 w-7" />
                                </div>
                                <div className="min-w-0">
                                    <h2 className="font-semibold">
                                        {guide.title}
                                    </h2>
                                    <p className="truncate text-sm text-muted-foreground">
                                        {guide.original_name} ·{' '}
                                        {formatBytes(guide.size)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Diperbarui oleh{' '}
                                        {guide.uploader?.name ?? 'Pengguna'}{' '}
                                        pada{' '}
                                        {new Date(
                                            guide.updated_at,
                                        ).toLocaleString('id-ID')}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" asChild>
                                    <a href={route('user-guide.download')}>
                                        <Download className="mr-2 h-4 w-4" />
                                        Unduh
                                    </a>
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={removeGuide}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Hapus
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="max-w-3xl rounded-xl border bg-card p-6 shadow-sm">
                    <div className="mb-5 flex items-center gap-3">
                        <BookMarked className="h-6 w-6 text-primary" />
                        <div>
                            <h2 className="font-semibold">
                                {guide
                                    ? 'Ganti Buku Panduan'
                                    : 'Unggah Buku Panduan'}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Format PDF, DOC, atau DOCX. Maksimal 20 MB.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={submit} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="title">Judul</Label>
                            <Input
                                id="title"
                                value={data.title}
                                onChange={(event) =>
                                    setData('title', event.target.value)
                                }
                                required
                            />
                            <InputError message={errors.title} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="file">File Buku Panduan</Label>
                            <Input
                                ref={fileInput}
                                id="file"
                                type="file"
                                accept=".pdf,.doc,.docx"
                                onChange={(event) =>
                                    setData(
                                        'file',
                                        event.target.files?.[0] ?? null,
                                    )
                                }
                                required
                            />
                            <InputError message={errors.file} />
                        </div>

                        <Button type="submit" disabled={processing}>
                            {guide ? (
                                <Upload className="mr-2 h-4 w-4" />
                            ) : (
                                <BookMarked className="mr-2 h-4 w-4" />
                            )}
                            {processing
                                ? 'Mengunggah...'
                                : guide
                                  ? 'Unggah Pengganti'
                                  : 'Simpan Buku Panduan'}
                        </Button>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
