import Pagination from '@/components/pagination';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Jenjang, type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { CheckCircle2, Pencil, Plus, Trash2, XCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Data Master',
        href: '#',
    },
    {
        title: 'Kelas',
        href: '/master/kelas',
    },
];

interface KelasData {
    id: number;
    nama_kelas: string;
    jenjang_id: number;
    created_at: string;
    jenjang: Jenjang;
}

interface Props {
    kelases: {
        data: KelasData[];
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
    };
    filters?: {
        nama_kelas?: string;
        jenjang?: string;
    };
}

export default function KelasIndex({ kelases, filters }: Props) {
    const { flash } = usePage<SharedData>().props;
    const isFirstRender = useRef(true);
    const hasInteractedWithFilters = useRef(false);

    const [searchFilters, setSearchFilters] = useState({
        nama_kelas: filters?.nama_kelas || '',
        jenjang: filters?.jenjang || '',
    });

    useEffect(() => {
        if (!hasInteractedWithFilters.current) {
            return;
        }

        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timeout = setTimeout(() => {
            router.get(route('master.kelas.index'), searchFilters as any, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 500);
        return () => clearTimeout(timeout);
    }, [searchFilters]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        hasInteractedWithFilters.current = true;

        setSearchFilters((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus data kelas ini?')) {
            router.delete(route('master.kelas.destroy', id));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Data Kelas" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-foreground">
                        Data Kelas
                    </h1>
                    <Button asChild>
                        <Link href={route('master.kelas.create')}>
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Kelas
                        </Link>
                    </Button>
                </div>

                {flash.success && (
                    <Alert
                        variant="default"
                        className="border-green-200 bg-green-50 text-green-900"
                    >
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
                        <thead className="bg-sidebar text-xs text-sidebar-foreground uppercase">
                            <tr>
                                <th scope="col" className="px-6 py-3">
                                    <div className="mb-2">Nama Kelas</div>
                                    <Input
                                        type="text"
                                        name="nama_kelas"
                                        value={searchFilters.nama_kelas}
                                        onChange={handleFilterChange}
                                        placeholder="Cari..."
                                        className="h-8 max-w-[150px] text-xs font-normal"
                                    />
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    <div className="mb-2">Jenjang</div>
                                    <Input
                                        type="text"
                                        name="jenjang"
                                        value={searchFilters.jenjang}
                                        onChange={handleFilterChange}
                                        placeholder="Cari..."
                                        className="h-8 max-w-[150px] text-xs font-normal"
                                    />
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-right"
                                >
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {kelases.data.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={3}
                                        className="px-6 py-4 text-center text-muted-foreground"
                                    >
                                        Belum ada data kelas.
                                    </td>
                                </tr>
                            ) : (
                                kelases.data.map((kelas) => (
                                    <tr
                                        key={kelas.id}
                                        className="border-b border-sidebar-border bg-background hover:bg-sidebar/50"
                                    >
                                        <td className="px-6 py-4 font-medium text-foreground">
                                            {kelas.nama_kelas}
                                        </td>
                                        <td className="px-6 py-4">
                                            {kelas.jenjang?.jenjang} -{' '}
                                            {kelas.jenjang?.nama_sekolah}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    asChild
                                                >
                                                    <Link
                                                        href={route(
                                                            'master.kelas.edit',
                                                            kelas.id,
                                                        )}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive hover:text-destructive"
                                                    onClick={() =>
                                                        handleDelete(kelas.id)
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <Pagination links={kelases.links} />
            </div>
        </AppLayout>
    );
}
