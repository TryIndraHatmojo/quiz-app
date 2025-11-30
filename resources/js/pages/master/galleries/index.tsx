import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, SharedData, Gallery } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { CheckCircle2, Pencil, Plus, Trash2, XCircle, FileVideo, FileImage } from 'lucide-react';

interface Props {
    galleries: {
        data: Gallery[];
        links: any[];
    };
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
];

export default function GalleryIndex({ galleries }: Props) {
    const { flash } = usePage<SharedData>().props;

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus item galeri ini?')) {
            router.delete(route('master.galleries.destroy', id));
        }
    };

    const formatBytes = (bytes: number, decimals = 2) => {
        if (!+bytes) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Data Galeri" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-foreground">Data Galeri</h1>
                    <Button asChild>
                        <Link href={route('master.galleries.create')}>
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Galeri
                        </Link>
                    </Button>
                </div>

                {flash.success && (
                    <Alert variant="default" className="bg-green-50 text-green-900 border-green-200">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
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

                <div className="relative overflow-x-auto rounded-lg border border-sidebar-border">
                    <table className="w-full text-left text-sm text-foreground">
                        <thead className="bg-sidebar text-xs uppercase text-sidebar-foreground">
                            <tr>
                                <th scope="col" className="px-6 py-3">
                                    Preview
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Judul
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Tipe
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Ukuran
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Diunggah Oleh
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Dibuat
                                </th>
                                <th scope="col" className="px-6 py-3 text-right">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {galleries.data.map((item) => (
                                <tr
                                    key={item.id}
                                    className="border-b border-sidebar-border bg-background hover:bg-sidebar/50"
                                >
                                    <td className="px-6 py-4">
                                        {item.file_type === 'image' ? (
                                            <img 
                                                src={item.file_path} 
                                                alt={item.title} 
                                                className="h-16 w-24 object-cover rounded-md border"
                                            />
                                        ) : (
                                            <div className="flex h-16 w-24 items-center justify-center rounded-md border bg-gray-100">
                                                <FileVideo className="h-8 w-8 text-gray-400" />
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-foreground">
                                        {item.title}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {item.file_type === 'image' ? <FileImage className="h-4 w-4" /> : <FileVideo className="h-4 w-4" />}
                                            <span className="capitalize">{item.file_type}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {formatBytes(item.size)}
                                    </td>
                                    <td className="px-6 py-4">{item.user?.name}</td>
                                    <td className="px-6 py-4">
                                        {new Date(item.created_at).toLocaleDateString('id-ID')}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" asChild>
                                                <Link href={route('master.galleries.edit', item.id)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive hover:text-destructive"
                                                onClick={() => handleDelete(item.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
