import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, SharedData, QuizBackground } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { CheckCircle2, Pencil, Plus, Trash2, XCircle } from 'lucide-react';



interface Props {
    backgrounds: {
        data: QuizBackground[];
        links: any[];
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Data Master',
        href: '#',
    },
    {
        title: 'Latar Belakang Kuis',
        href: '/master/backgrounds',
    },
];

export default function BackgroundIndex({ backgrounds }: Props) {
    const { flash } = usePage<SharedData>().props;

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus latar belakang ini?')) {
            router.delete(route('master.backgrounds.destroy', id));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Data Latar Belakang" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-foreground">Data Latar Belakang</h1>
                    <Button asChild>
                        <Link href={route('master.backgrounds.create')}>
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Latar Belakang
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
                                    Nama
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Status
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
                            {backgrounds.data.map((bg) => (
                                <tr
                                    key={bg.id}
                                    className="border-b border-sidebar-border bg-background hover:bg-sidebar/50"
                                >
                                    <td className="px-6 py-4">
                                        <img 
                                            src={bg.image_path} 
                                            alt={bg.name} 
                                            className="h-16 w-24 object-cover rounded-md border"
                                        />
                                    </td>
                                    <td className="px-6 py-4 font-medium text-foreground">
                                        {bg.name}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`rounded px-2.5 py-0.5 text-xs font-medium ${
                                            bg.is_public 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-gray-100 text-gray-800'
                                        }`}>
                                            {bg.is_public ? 'Publik' : 'Privat'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{bg.user?.name}</td>
                                    <td className="px-6 py-4">
                                        {new Date(bg.created_at).toLocaleDateString('id-ID')}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" asChild>
                                                <Link href={route('master.backgrounds.edit', bg.id)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive hover:text-destructive"
                                                onClick={() => handleDelete(bg.id)}
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
