import Pagination from '@/components/pagination';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData, type User } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    CheckCircle2,
    CheckIcon,
    Clock3,
    KeyRound,
    XCircle,
    XIcon,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '#',
    },
    {
        title: 'Reset Password',
        href: '/admin/password-reset-requests',
    },
];

interface PasswordResetRequest {
    id: number;
    identifier: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    reviewed_at: string | null;
    user: User;
    reviewer?: User | null;
}

interface Props {
    requests: {
        data: PasswordResetRequest[];
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
    };
    filters: {
        status: 'pending' | 'approved' | 'rejected' | 'all';
    };
    stats: {
        pending: number;
        approved: number;
        rejected: number;
    };
}

const statusLabels = {
    pending: 'Menunggu',
    approved: 'Disetujui',
    rejected: 'Ditolak',
};

function statusBadge(status: PasswordResetRequest['status']) {
    if (status === 'approved') {
        return (
            <Badge className="border-green-200 bg-green-50 text-green-700">
                Disetujui
            </Badge>
        );
    }

    if (status === 'rejected') {
        return <Badge variant="destructive">Ditolak</Badge>;
    }

    return (
        <Badge className="border-amber-200 bg-amber-50 text-amber-700">
            Menunggu
        </Badge>
    );
}

export default function PasswordResetRequestIndex({
    requests,
    filters,
    stats,
}: Props) {
    const { flash } = usePage<SharedData>().props;

    const approve = (id: number) => {
        if (confirm('Setujui pengajuan reset password ini?')) {
            router.patch(
                route('admin.password-reset-requests.approve', id),
                {},
                { preserveScroll: true },
            );
        }
    };

    const reject = (id: number) => {
        if (confirm('Tolak pengajuan reset password ini?')) {
            router.patch(
                route('admin.password-reset-requests.reject', id),
                {},
                { preserveScroll: true },
            );
        }
    };

    const statusTabs = [
        {
            label: 'Menunggu',
            value: 'pending',
            count: stats.pending,
        },
        {
            label: 'Disetujui',
            value: 'approved',
            count: stats.approved,
        },
        {
            label: 'Ditolak',
            value: 'rejected',
            count: stats.rejected,
        },
        {
            label: 'Semua',
            value: 'all',
            count: stats.pending + stats.approved + stats.rejected,
        },
    ] as const;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pengajuan Reset Password" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
                            <KeyRound className="h-6 w-6" />
                            Pengajuan Reset Password
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Tinjau password baru yang diajukan dari halaman
                            login.
                        </p>
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

                <div className="flex flex-wrap gap-2">
                    {statusTabs.map((tab) => (
                        <Button
                            key={tab.value}
                            variant={
                                filters.status === tab.value
                                    ? 'default'
                                    : 'outline'
                            }
                            size="sm"
                            asChild
                        >
                            <Link
                                href={route(
                                    'admin.password-reset-requests.index',
                                    {
                                        status: tab.value,
                                    },
                                )}
                            >
                                {tab.value === 'pending' && (
                                    <Clock3 className="h-4 w-4" />
                                )}
                                {tab.label}
                                <span className="rounded bg-background/20 px-1.5 py-0.5 text-xs">
                                    {tab.count}
                                </span>
                            </Link>
                        </Button>
                    ))}
                </div>

                <div className="relative overflow-x-auto rounded-lg border border-sidebar-border">
                    <table className="w-full text-left text-sm text-foreground">
                        <thead className="bg-sidebar text-xs text-sidebar-foreground uppercase">
                            <tr>
                                <th scope="col" className="px-6 py-3">
                                    Pengguna
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Identifier
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Status
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Diajukan
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Direview
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
                            {requests.data.length === 0 && (
                                <tr className="border-b border-sidebar-border bg-background">
                                    <td
                                        colSpan={6}
                                        className="px-6 py-8 text-center text-sm text-muted-foreground"
                                    >
                                        Tidak ada pengajuan reset password.
                                    </td>
                                </tr>
                            )}

                            {requests.data.map((request) => (
                                <tr
                                    key={request.id}
                                    className="border-b border-sidebar-border bg-background hover:bg-sidebar/50"
                                >
                                    <td className="px-6 py-4">
                                        <div className="font-medium">
                                            {request.user.name}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {request.user.email}
                                        </div>
                                        {request.user.nomor_induk_siswa && (
                                            <div className="font-mono text-xs text-muted-foreground">
                                                {request.user.nomor_induk_siswa}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 font-mono text-sm">
                                        {request.identifier}
                                    </td>
                                    <td className="px-6 py-4">
                                        {statusBadge(request.status)}
                                    </td>
                                    <td className="px-6 py-4">
                                        {new Date(
                                            request.created_at,
                                        ).toLocaleString('id-ID')}
                                    </td>
                                    <td className="px-6 py-4">
                                        {request.reviewed_at ? (
                                            <div>
                                                <div>
                                                    {new Date(
                                                        request.reviewed_at,
                                                    ).toLocaleString('id-ID')}
                                                </div>
                                                {request.reviewer && (
                                                    <div className="text-xs text-muted-foreground">
                                                        {request.reviewer.name}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground">
                                                -
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {request.status === 'pending' ? (
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    onClick={() =>
                                                        approve(request.id)
                                                    }
                                                >
                                                    <CheckIcon className="h-4 w-4" />
                                                    Setujui
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                        reject(request.id)
                                                    }
                                                >
                                                    <XIcon className="h-4 w-4" />
                                                    Tolak
                                                </Button>
                                            </div>
                                        ) : (
                                            <span className="text-sm text-muted-foreground">
                                                {statusLabels[request.status]}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <Pagination links={requests.links} />
            </div>
        </AppLayout>
    );
}
