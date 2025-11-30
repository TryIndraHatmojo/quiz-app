import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ChevronLeft, Save, Upload } from 'lucide-react';
import { FormEventHandler, useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { FileUploader } from '@/components/file-uploader';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Data Master',
        href: '#',
    },
    {
        title: 'Latar Belakang Kuis',
        href: '/master/backgrounds',
    },
    {
        title: 'Tambah',
        href: '/master/backgrounds/create',
    },
];

export default function BackgroundCreate() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        image: null as File | null,
        is_public: false,
    });
    const [preview, setPreview] = useState<string | null>(null);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('master.backgrounds.store'));
    };

    const handleFileSelect = (file: File | null) => {
        setData('image', file);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah Latar Belakang" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-foreground">Tambah Latar Belakang</h1>
                    <Button variant="ghost" asChild>
                        <Link href={route('master.backgrounds.index')}>
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Kembali
                        </Link>
                    </Button>
                </div>

                <div className="max-w-2xl rounded-xl border border-sidebar-border bg-sidebar p-6 shadow-sm">
                    <form onSubmit={submit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nama Latar Belakang</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Contoh: Tema Luar Angkasa"
                                required
                            />
                            {errors.name && (
                                <p className="text-sm text-destructive">{errors.name}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="image">Gambar</Label>
                            <FileUploader
                                onFileSelect={handleFileSelect}
                                accept={{ 'image/*': [] }}
                                label="Unggah Gambar Background"
                                description="Format: JPG, PNG, GIF. Maksimal 2MB."
                                maxSize={2 * 1024 * 1024}
                                fileType="image"
                            />
                            {errors.image && (
                                <p className="text-sm text-destructive">{errors.image}</p>
                            )}
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox 
                                id="is_public" 
                                checked={data.is_public}
                                onCheckedChange={(checked) => setData('is_public', checked as boolean)}
                            />
                            <Label htmlFor="is_public" className="cursor-pointer">
                                Publik (Dapat digunakan oleh semua pengguna)
                            </Label>
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
