import Pagination from '@/components/pagination';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { CheckCircle2, Pencil, Plus, Trash2, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Data Master',
        href: '#',
    },
    {
        title: 'Mata Pelajaran',
        href: '/master/categories',
    },
];

interface QuizCategory {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    created_at: string;
}

interface Props {
    categories: {
        data: QuizCategory[];
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
    };
    filters?: {
        name?: string;
    };
}

export default function CategoryIndex({ categories, filters }: Props) {
    const { flash } = usePage<SharedData>().props;

    const [searchFilters, setSearchFilters] = useState({
        name: filters?.name || '',
    });

    useEffect(() => {
        const timeout = setTimeout(() => {
            router.get(route('master.categories.index'), searchFilters as any, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 500);
        return () => clearTimeout(timeout);
    }, [searchFilters]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchFilters((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus mata pelajaran ini?')) {
            router.delete(route('master.categories.destroy', id));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mata Pelajaran" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-foreground">
                        Mata Pelajaran
                    </h1>
                    <Button asChild>
                        <Link href={route('master.categories.create')}>
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Mata Pelajaran
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
                                    <div className="mb-2">Mata Pelajaran</div>
                                    <Input
                                        type="text"
                                        name="name"
                                        value={searchFilters.name}
                                        onChange={handleFilterChange}
                                        placeholder="Cari..."
                                        className="h-8 max-w-[200px] text-xs font-normal"
                                    />
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Slug
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Deskripsi
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Dibuat
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
                            {categories.data.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-6 py-4 text-center text-muted-foreground"
                                    >
                                        Belum ada data mata pelajaran.
                                    </td>
                                </tr>
                            ) : (
                                categories.data.map((category) => (
                                    <tr
                                        key={category.id}
                                        className="border-b border-sidebar-border bg-background hover:bg-sidebar/50"
                                    >
                                        <td className="px-6 py-4 font-medium text-foreground">
                                            {category.name}
                                        </td>
                                        <td className="px-6 py-4">
                                            {category.slug}
                                        </td>
                                        <td className="px-6 py-4">
                                            {category.description || '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            {new Date(
                                                category.created_at,
                                            ).toLocaleDateString('id-ID')}
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
                                                            'master.categories.edit',
                                                            category.id,
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
                                                        handleDelete(
                                                            category.id,
                                                        )
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

                <Pagination links={categories.links} />
            </div>
        </AppLayout>
    );
}
