import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Jenjang } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save } from 'lucide-react';
import InputError from '@/components/input-error';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Data Master',
        href: '#',
    },
    {
        title: 'Jenjang',
        href: '/master/jenjang',
    },
    {
        title: 'Edit',
        href: '#',
    },
];

interface Props {
    jenjang: Jenjang;
}

export default function JenjangEdit({ jenjang }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        jenjang: jenjang.jenjang,
        nama_sekolah: jenjang.nama_sekolah,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('master.jenjang.update', jenjang.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Jenjang" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-foreground">Edit Jenjang</h1>
                    <Button variant="outline" asChild>
                        <Link href={route('master.jenjang.index')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali
                        </Link>
                    </Button>
                </div>

                <div className="rounded-xl border border-sidebar-border bg-sidebar p-6 shadow-sm">
                    <form onSubmit={submit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="jenjang">Jenjang</Label>
                            <Input
                                id="jenjang"
                                value={data.jenjang}
                                onChange={(e) => setData('jenjang', e.target.value)}
                                placeholder="Contoh: SMA, SMK, SMP"
                                className="max-w-md"
                            />
                            <InputError message={errors.jenjang} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="nama_sekolah">Nama Sekolah</Label>
                            <Input
                                id="nama_sekolah"
                                value={data.nama_sekolah}
                                onChange={(e) => setData('nama_sekolah', e.target.value)}
                                placeholder="Contoh: SMA Negeri 1 Surabaya"
                                className="max-w-md"
                            />
                            <InputError message={errors.nama_sekolah} />
                        </div>

                        <div className="flex items-center gap-4">
                            <Button type="submit" disabled={processing}>
                                <Save className="mr-2 h-4 w-4" />
                                Simpan Perubahan
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
