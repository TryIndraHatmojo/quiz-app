import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ChevronLeft, Save } from 'lucide-react';
import { FormEventHandler, useState } from 'react';
import { FileUploader } from '@/components/file-uploader';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Data Master',
        href: '#',
    },
    {
        title: 'Galeri',
        href: '/master/galleries',
    },
    {
        title: 'Tambah',
        href: '/master/galleries/create',
    },
];

export default function GalleryCreate() {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        file: null as File | null,
    });
    const [preview, setPreview] = useState<string | null>(null);
    const [fileType, setFileType] = useState<'image' | 'video' | null>(null);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('master.galleries.store'));
    };

    const handleFileSelect = (file: File | null) => {
        setData('file', file);
        if (file) {
            const type = file.type.startsWith('video/') ? 'video' : 'image';
            setFileType(type);
        } else {
            setFileType(null);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah Galeri" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-foreground">Tambah Galeri</h1>
                    <Button variant="ghost" asChild>
                        <Link href={route('master.galleries.index')}>
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Kembali
                        </Link>
                    </Button>
                </div>

                <div className="max-w-2xl rounded-xl border border-sidebar-border bg-sidebar p-6 shadow-sm">
                    <form onSubmit={submit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Judul (Opsional)</Label>
                            <Input
                                id="title"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                placeholder="Contoh: Video Pembelajaran Matematika"
                            />
                            {errors.title && (
                                <p className="text-sm text-destructive">{errors.title}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="file">File (Gambar atau Video)</Label>
                            <FileUploader
                                onFileSelect={handleFileSelect}
                                accept={{ 
                                    'image/*': [],
                                    'video/*': []
                                }}
                                label="Unggah Gambar atau Video"
                                description="Format: JPG, PNG, GIF, MP4, WEBM. Maksimal 10MB."
                                maxSize={10 * 1024 * 1024}
                                fileType={fileType || 'any'}
                            />
                            {errors.file && (
                                <p className="text-sm text-destructive">{errors.file}</p>
                            )}
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit" disabled={processing}>
                                <Save className="mr-2 h-4 w-4" />
                                Simpan
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
