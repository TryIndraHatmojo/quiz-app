import Pagination from '@/components/pagination';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData, type User } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { CheckCircle2, Pencil, Plus, Trash2, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Data Master',
        href: '#',
    },
    {
        title: 'Pengguna',
        href: '/master/users',
    },
];

interface Props {
    users: {
        data: User[];
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
    };
    filters?: {
        name?: string;
        email?: string;
        role?: string;
        jenjang?: string;
        kelas?: string;
        orangTua?: string;
    };
}

export default function UserIndex({ users, filters }: Props) {
    const { flash } = usePage<SharedData>().props;

    const [searchFilters, setSearchFilters] = useState({
        name: filters?.name || '',
        email: filters?.email || '',
        role: filters?.role || '',
        jenjang: filters?.jenjang || '',
        kelas: filters?.kelas || '',
        orangTua: filters?.orangTua || '',
    });

    useEffect(() => {
        const timeout = setTimeout(() => {
            router.get(route('master.users.index'), searchFilters as any, {
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
        if (confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) {
            router.delete(route('master.users.destroy', id));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Data Pengguna" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-foreground">
                        Data Pengguna
                    </h1>
                    <Button asChild>
                        <Link href={route('master.users.create')}>
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Pengguna
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
                                    <div className="mb-2">Email</div>
                                    <Input
                                        type="text"
                                        name="email"
                                        value={searchFilters.email}
                                        onChange={handleFilterChange}
                                        placeholder="Cari..."
                                        className="h-8 max-w-[150px] text-xs font-normal"
                                    />
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    <div className="mb-2">Peran</div>
                                    <Input
                                        type="text"
                                        name="role"
                                        value={searchFilters.role}
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
                                <th scope="col" className="px-6 py-3">
                                    <div className="mb-2">Kelas</div>
                                    <Input
                                        type="text"
                                        name="kelas"
                                        value={searchFilters.kelas}
                                        onChange={handleFilterChange}
                                        placeholder="Cari..."
                                        className="h-8 max-w-[150px] text-xs font-normal"
                                    />
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    <div className="mb-2">Orang Tua</div>
                                    <Input
                                        type="text"
                                        name="orangTua"
                                        value={searchFilters.orangTua}
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
                            {users.data.map((user) => (
                                <tr
                                    key={user.id}
                                    className="border-b border-sidebar-border bg-background hover:bg-sidebar/50"
                                >
                                    <td className="px-6 py-4 font-medium text-foreground">
                                        {user.name}
                                    </td>
                                    <td className="px-6 py-4">{user.email}</td>
                                    <td className="px-6 py-4">
                                        {user.roles?.map((role) => (
                                            <span
                                                key={role.id}
                                                className="mr-2 rounded bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                                            >
                                                {role.name}
                                            </span>
                                        ))}
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.jenjang ? (
                                            <span className="text-sm">
                                                {user.jenjang.jenjang} -{' '}
                                                {user.jenjang.nama_sekolah}
                                            </span>
                                        ) : (
                                            <span className="text-sm text-muted-foreground">
                                                -
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.kelas ? (
                                            <span className="text-sm">
                                                {user.kelas.nama_kelas}
                                            </span>
                                        ) : (
                                            <span className="text-sm text-muted-foreground">
                                                -
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.orang_tua ? (
                                            <span className="text-sm">
                                                {user.orang_tua.name}
                                            </span>
                                        ) : (
                                            <span className="text-sm text-muted-foreground">
                                                -
                                            </span>
                                        )}
                                    </td>
                                    {/* <td className="px-6 py-4">
                                        {new Date(user.created_at).toLocaleDateString('id-ID')}
                                    </td> */}
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                asChild
                                            >
                                                <Link
                                                    href={route(
                                                        'master.users.edit',
                                                        user.id,
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
                                                    handleDelete(user.id)
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

                <Pagination links={users.links} />
            </div>
        </AppLayout>
    );
}
