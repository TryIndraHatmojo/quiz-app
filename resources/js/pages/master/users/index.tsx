import InputError from '@/components/input-error';
import Pagination from '@/components/pagination';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData, type User } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    CheckCircle2,
    Download,
    FileSpreadsheet,
    Pencil,
    Plus,
    Trash2,
    UploadCloud,
    XCircle,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

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
    const isFirstRender = useRef(true);
    const hasInteractedWithFilters = useRef(false);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const importErrors = flash.import_errors || [];
    const importForm = useForm<{ file: File | null }>({
        file: null,
    });

    const [searchFilters, setSearchFilters] = useState({
        name: filters?.name || '',
        email: filters?.email || '',
        role: filters?.role || '',
        jenjang: filters?.jenjang || '',
        kelas: filters?.kelas || '',
        orangTua: filters?.orangTua || '',
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
            router.get(route('master.users.index'), searchFilters as any, {
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
        if (confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) {
            router.delete(route('master.users.destroy', id));
        }
    };

    const handleImportDialogChange = (open: boolean) => {
        setIsImportOpen(open);

        if (!open) {
            importForm.reset();
            importForm.clearErrors();
        }
    };

    const handleImportSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        importForm.post(route('master.users.import'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                importForm.reset();
                setIsImportOpen(false);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Data Pengguna" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-2xl font-bold text-foreground">
                        Data Pengguna
                    </h1>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" asChild>
                            <a href={route('master.users.import-template')}>
                                <Download className="mr-2 h-4 w-4" />
                                Download Format
                            </a>
                        </Button>
                        <Dialog
                            open={isImportOpen}
                            onOpenChange={handleImportDialogChange}
                        >
                            <DialogTrigger asChild>
                                <Button variant="secondary">
                                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                                    Import Excel
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>
                                        Import Pengguna Excel
                                    </DialogTitle>
                                    <DialogDescription>
                                        Tambahkan banyak user sekaligus dari
                                        file .xlsx, .xls, atau .csv.
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-3 rounded-lg border border-sidebar-border bg-sidebar/50 p-4">
                                    <div className="flex flex-wrap gap-2">
                                        {[
                                            'nama',
                                            'email',
                                            'password',
                                            'peran',
                                        ].map((column) => (
                                            <Badge
                                                key={column}
                                                variant="secondary"
                                            >
                                                {column}
                                            </Badge>
                                        ))}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Untuk siswa, isi orang_tua_id untuk
                                        orang tua yang sudah ada, atau isi
                                        orang_tua_nama, orang_tua_email, dan
                                        orang_tua_password untuk membuat orang
                                        tua baru.
                                    </p>
                                </div>

                                <form
                                    onSubmit={handleImportSubmit}
                                    className="space-y-4"
                                >
                                    <div className="space-y-2">
                                        <Label htmlFor="user-import-file">
                                            File Excel
                                        </Label>
                                        <Input
                                            id="user-import-file"
                                            type="file"
                                            accept=".xlsx,.xls,.csv"
                                            onChange={(e) =>
                                                importForm.setData(
                                                    'file',
                                                    e.target.files?.[0] || null,
                                                )
                                            }
                                        />
                                        <InputError
                                            message={importForm.errors.file}
                                        />
                                        {importForm.data.file && (
                                            <p className="text-xs text-muted-foreground">
                                                {importForm.data.file.name}
                                            </p>
                                        )}
                                    </div>

                                    <DialogFooter>
                                        <Button variant="outline" asChild>
                                            <a
                                                href={route(
                                                    'master.users.import-template',
                                                )}
                                            >
                                                <Download className="mr-2 h-4 w-4" />
                                                Format
                                            </a>
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={
                                                importForm.processing ||
                                                !importForm.data.file
                                            }
                                        >
                                            <UploadCloud className="mr-2 h-4 w-4" />
                                            Import
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                        <Button asChild>
                            <Link href={route('master.users.create')}>
                                <Plus className="mr-2 h-4 w-4" />
                                Tambah Pengguna
                            </Link>
                        </Button>
                    </div>
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

                {importErrors.length > 0 && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Detail Kesalahan Import</AlertTitle>
                        <AlertDescription>
                            <ul className="list-inside list-disc space-y-1">
                                {importErrors.map((error, index) => (
                                    <li key={index}>{error}</li>
                                ))}
                            </ul>
                        </AlertDescription>
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
                            {users.data.length === 0 && (
                                <tr className="border-b border-sidebar-border bg-background">
                                    <td
                                        colSpan={7}
                                        className="px-6 py-8 text-center text-sm text-muted-foreground"
                                    >
                                        Tidak ada data pengguna.
                                    </td>
                                </tr>
                            )}

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
