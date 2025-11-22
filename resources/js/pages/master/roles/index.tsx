import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

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

interface Role {
    id: number;
    name: string;
    slug: string;
    description: string;
    created_at: string;
}

interface Props {
    roles: {
        data: Role[];
        links: any[];
    };
}

export default function RoleIndex({ roles }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Data Peran" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-foreground">Data Peran</h1>
                </div>

                <div className="relative overflow-x-auto rounded-lg border border-sidebar-border">
                    <table className="w-full text-left text-sm text-foreground">
                        <thead className="bg-sidebar text-xs uppercase text-sidebar-foreground">
                            <tr>
                                <th scope="col" className="px-6 py-3">
                                    Nama
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
                                    <td className="px-6 py-4">{role.description}</td>
                                    <td className="px-6 py-4">
                                        {new Date(role.created_at).toLocaleDateString('id-ID')}
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
