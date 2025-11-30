import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, Gallery } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ChevronLeft, Save } from 'lucide-react';
import { FormEventHandler } from 'react';
import { FileUploader } from '@/components/file-uploader';

interface Props {
    gallery: Gallery;
}

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
        title: 'Edit',
        href: '#',
    },
];

export default function GalleryEdit({ gallery }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        title: gallery.title || '',
        file: null as File | null,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('master.galleries.update', gallery.id));
    };

    const handleFileSelect = (file: File | null) => {
        setData('file', file);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Galeri" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-foreground">Edit Galeri</h1>
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
                            <Label htmlFor="title">Judul</Label>
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
                            <Label>File (Biarkan kosong jika tidak ingin mengubah)</Label>
                            <FileUploader
                                onFileSelect={handleFileSelect}
                                accept={{ 
                                    'image/*': [],
                                    'video/*': []
                                }}
                                currentFile={gallery.file_path}
                                label="Ganti File"
                                description="Format: JPG, PNG, GIF, MP4, WEBM. Maksimal 10MB."
                                maxSize={10 * 1024 * 1024}
                                fileType={gallery.file_type as 'image' | 'video'}
                            />
                            {errors.file && (
                                <p className="text-sm text-destructive">{errors.file}</p>
                            )}
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit" disabled={processing}>
                                <Save className="mr-2 h-4 w-4" />
                                Simpan Perubahan
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
