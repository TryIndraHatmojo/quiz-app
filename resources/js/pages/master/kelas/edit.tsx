import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Jenjang } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Data Master',
        href: '#',
    },
    {
        title: 'Kelas',
        href: '/master/kelas',
    },
    {
        title: 'Edit Kelas',
        href: '#',
    },
];

interface KelasData {
    id: number;
    nama_kelas: string;
    jenjang_id: number;
}

interface Props {
    kelasData: KelasData;
    jenjangs: Jenjang[];
}

export default function KelasEdit({ kelasData, jenjangs }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        nama_kelas: kelasData.nama_kelas,
        jenjang_id: kelasData.jenjang_id.toString(),
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('master.kelas.update', kelasData.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Kelas" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-foreground">
                        Edit Data Kelas
                    </h1>
                    <Button variant="outline" asChild>
                        <Link href={route('master.kelas.index')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali
                        </Link>
                    </Button>
                </div>

                <div className="max-w-2xl rounded-lg border border-sidebar-border bg-background p-6 shadow-sm">
                    <form onSubmit={submit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="nama_kelas">Nama Kelas</Label>
                            <Input
                                id="nama_kelas"
                                value={data.nama_kelas}
                                onChange={(e) =>
                                    setData('nama_kelas', e.target.value)
                                }
                                placeholder="Contoh: X MIPA 1, XI TKJ 2"
                                className="max-w-md"
                            />
                            <InputError message={errors.nama_kelas} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="jenjang_id">
                                Jenjang / Sekolah
                            </Label>
                            <div className="max-w-md">
                                <Select
                                    value={data.jenjang_id}
                                    onValueChange={(val) =>
                                        setData('jenjang_id', val)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Jenjang Sekolah" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {jenjangs.map((jenjang) => (
                                            <SelectItem
                                                key={jenjang.id}
                                                value={jenjang.id.toString()}
                                            >
                                                {jenjang.jenjang} -{' '}
                                                {jenjang.nama_sekolah}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <InputError message={errors.jenjang_id} />
                        </div>

                        <div className="flex items-center gap-4">
                            <Button type="submit" disabled={processing}>
                                Simpan Perubahan
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
