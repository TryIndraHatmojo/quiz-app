import Pagination from '@/components/pagination';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Role, type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { CheckCircle2, Pencil, Plus, Trash2, XCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Data Master',
        href: '#',
    },
    {
        title: 'Peran',
        href: '/master/roles',
    },
];

interface Props {
    roles: {
        data: Role[];
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

export default function RoleIndex({ roles, filters }: Props) {
    const { flash } = usePage<SharedData>().props;
    const isFirstRender = useRef(true);
    const hasInteractedWithFilters = useRef(false);

    const [searchFilters, setSearchFilters] = useState({
        name: filters?.name || '',
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
            router.get(route('master.roles.index'), searchFilters as any, {
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
        if (confirm('Apakah Anda yakin ingin menghapus peran ini?')) {
            router.delete(route('master.roles.destroy', id));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Data Peran" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-foreground">
                        Data Peran
                    </h1>
                    <Button asChild>
                        <Link href={route('master.roles.create')}>
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Peran
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
                                    <div className="mb-2">Nama</div>
                                    <Input
                                        type="text"
                                        name="name"
                                        value={searchFilters.name}
                                        onChange={handleFilterChange}
                                        placeholder="Cari..."
                                        className="h-8 max-w-[150px] text-xs font-normal"
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
                            {roles.data.map((role) => (
                                <tr
                                    key={role.id}
                                    className="border-b border-sidebar-border bg-background hover:bg-sidebar/50"
                                >
                                    <td className="px-6 py-4 font-medium text-foreground">
                                        {role.name}
                                    </td>
                                    <td className="px-6 py-4">{role.slug}</td>
                                    <td className="px-6 py-4">
                                        {role.description}
                                    </td>
                                    <td className="px-6 py-4">
                                        {new Date(
                                            role.created_at,
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
                                                        'master.roles.edit',
                                                        role.id,
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
                                                    handleDelete(role.id)
                                                }
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

                <Pagination links={roles.links} />
            </div>
        </AppLayout>
    );
}
