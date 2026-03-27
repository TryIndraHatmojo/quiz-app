import { FileUploader } from '@/components/file-uploader';
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
import { Textarea } from '@/components/ui/textarea';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import {
    type BreadcrumbItem,
    type QuizBackground,
    type QuizCategory,
} from '@/types';
import { type TimeMode } from '@/types/quiz';
import { Head, useForm } from '@inertiajs/react';
import { Clock, Timer } from 'lucide-react';
import { FormEventHandler } from 'react';

interface Jenjang {
    id: number;
    jenjang: string;
    nama_sekolah: string;
}

interface Kelas {
    id: number;
    jenjang_id: number;
    nama_kelas: string;
}

interface Props {
    categories: QuizCategory[];
    backgrounds: QuizBackground[];
    jenjangs: Jenjang[];
    kelases: Kelas[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Koleksi',
        href: '#',
    },
    {
        title: 'Semua Kuis',
        href: '/library/quizzes',
    },
    {
        title: 'Buat',
        href: '/library/quizzes/create',
    },
];

export default function QuizCreate({
    categories = [],
    backgrounds = [],
    jenjangs = [],
    kelases = [],
}: Props) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        quiz_category_id: '',
        jenjang_id: '',
        kelas_id: '',
        quiz_background_id: '',
        background_file: null as File | null,
        time_mode: 'per_question' as TimeMode,
        duration: 30,
        starts_at: '',
        ends_at: '',
        passing_score: 70,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        // Check if category is selected
        if (!data.quiz_category_id) {
            alert('Harap pilih kategori');
            return;
        }

        post(route('library.quizzes.store'));
    };

    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title="Buat Kuis" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="max-w-2xl">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold tracking-tight">
                            Buat Kuis
                        </h1>
                        <p className="text-muted-foreground">
                            Buat kuis baru untuk siswa Anda.
                        </p>
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Judul</Label>
                            <Input
                                id="title"
                                value={data.title}
                                onChange={(e) =>
                                    setData('title', e.target.value)
                                }
                                placeholder="contoh: Ujian Akhir Matematika"
                                required
                            />
                            {errors.title && (
                                <p className="text-sm text-destructive">
                                    {errors.title}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category">Kategori *</Label>
                            <Select
                                value={data.quiz_category_id}
                                onValueChange={(value) =>
                                    setData('quiz_category_id', value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih kategori" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem
                                            key={cat.id}
                                            value={cat.id.toString()}
                                        >
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.quiz_category_id && (
                                <p className="text-sm text-destructive">
                                    {errors.quiz_category_id}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="jenjang">Jenjang</Label>
                                <Select
                                    value={data.jenjang_id || 'none'}
                                    onValueChange={(value) => {
                                        setData((d) => ({
                                            ...d,
                                            jenjang_id:
                                                value === 'none' ? '' : value,
                                            kelas_id: '', // reset kelas when jenjang changes
                                        }));
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih jenjang (Opsional)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">
                                            Tidak Ada
                                        </SelectItem>
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
                                {errors.jenjang_id && (
                                    <p className="text-sm text-destructive">
                                        {errors.jenjang_id}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="kelas">Kelas</Label>
                                <Select
                                    value={data.kelas_id || 'none'}
                                    onValueChange={(value) =>
                                        setData(
                                            'kelas_id',
                                            value === 'none' ? '' : value,
                                        )
                                    }
                                    disabled={!data.jenjang_id}
                                >
                                    <SelectTrigger>
                                        <SelectValue
                                            placeholder={
                                                data.jenjang_id
                                                    ? 'Pilih kelas (Opsional)'
                                                    : 'Pilih jenjang dulu'
                                            }
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">
                                            Tidak Ada
                                        </SelectItem>
                                        {kelases
                                            .filter(
                                                (k) =>
                                                    k.jenjang_id.toString() ===
                                                    data.jenjang_id,
                                            )
                                            .map((kelas) => (
                                                <SelectItem
                                                    key={kelas.id}
                                                    value={kelas.id.toString()}
                                                >
                                                    {kelas.nama_kelas}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                                {errors.kelas_id && (
                                    <p className="text-sm text-destructive">
                                        {errors.kelas_id}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Deskripsi</Label>
                            <Textarea
                                id="description"
                                value={data.description}
                                onChange={(
                                    e: React.ChangeEvent<HTMLTextAreaElement>,
                                ) => setData('description', e.target.value)}
                                placeholder="Deskripsi opsional untuk kuis ini..."
                                className="h-32"
                            />
                            {errors.description && (
                                <p className="text-sm text-destructive">
                                    {errors.description}
                                </p>
                            )}
                        </div>

                        {/* Time Settings */}
                        <div className="space-y-4 rounded-lg border p-4">
                            <div className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-muted-foreground" />
                                <Label className="text-base font-medium">
                                    Pengaturan Waktu
                                </Label>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Mode Waktu</Label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setData((d) => ({
                                                    ...d,
                                                    time_mode: 'per_question',
                                                    duration: 30,
                                                }))
                                            }
                                            className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
                                                data.time_mode ===
                                                'per_question'
                                                    ? 'border-primary bg-primary/5'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <Timer
                                                className={`h-6 w-6 ${data.time_mode === 'per_question' ? 'text-primary' : 'text-muted-foreground'}`}
                                            />
                                            <span
                                                className={`font-medium ${data.time_mode === 'per_question' ? 'text-primary' : ''}`}
                                            >
                                                Per Pertanyaan
                                            </span>
                                            <span className="text-center text-xs text-muted-foreground">
                                                Setiap pertanyaan memiliki batas
                                                waktu sendiri
                                            </span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setData((d) => ({
                                                    ...d,
                                                    time_mode: 'total',
                                                    duration: 15,
                                                }))
                                            }
                                            className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
                                                data.time_mode === 'total'
                                                    ? 'border-primary bg-primary/5'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <Clock
                                                className={`h-6 w-6 ${data.time_mode === 'total' ? 'text-primary' : 'text-muted-foreground'}`}
                                            />
                                            <span
                                                className={`font-medium ${data.time_mode === 'total' ? 'text-primary' : ''}`}
                                            >
                                                Total Waktu
                                            </span>
                                            <span className="text-center text-xs text-muted-foreground">
                                                Waktu dihitung untuk seluruh
                                                kuis
                                            </span>
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="duration">
                                        {data.time_mode === 'per_question'
                                            ? 'Durasi per Pertanyaan (detik)'
                                            : 'Total Durasi (menit)'}
                                    </Label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            id="duration"
                                            type="number"
                                            min={1}
                                            value={data.duration}
                                            onChange={(e) =>
                                                setData(
                                                    'duration',
                                                    parseInt(e.target.value) ||
                                                        0,
                                                )
                                            }
                                            className="w-32"
                                        />
                                        <span className="text-muted-foreground">
                                            {data.time_mode === 'per_question'
                                                ? 'detik'
                                                : 'menit'}
                                        </span>
                                    </div>
                                    {errors.duration && (
                                        <p className="text-sm text-destructive">
                                            {errors.duration}
                                        </p>
                                    )}
                                </div>
                            </div>
                            {errors.time_mode && (
                                <p className="text-sm text-destructive">
                                    {errors.time_mode}
                                </p>
                            )}
                        </div>

                        {/* Exam Schedule */}
                        <div className="space-y-4 rounded-lg border p-4">
                            <div className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-muted-foreground" />
                                <Label className="text-base font-medium">
                                    Jadwal & Batas Nilai
                                </Label>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="starts_at">Tanggal Mulai Ujian</Label>
                                    <Input
                                        id="starts_at"
                                        type="datetime-local"
                                        value={data.starts_at}
                                        onChange={(e) => setData('starts_at', e.target.value)}
                                    />
                                    {errors.starts_at && (
                                        <p className="text-sm text-destructive">{errors.starts_at}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="ends_at">Tanggal Akhir Ujian</Label>
                                    <Input
                                        id="ends_at"
                                        type="datetime-local"
                                        value={data.ends_at}
                                        onChange={(e) => setData('ends_at', e.target.value)}
                                    />
                                    {errors.ends_at && (
                                        <p className="text-sm text-destructive">{errors.ends_at}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="passing_score">Nilai Minimum Kelulusan / KKM (%)</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        id="passing_score"
                                        type="number"
                                        min={0}
                                        max={100}
                                        value={data.passing_score}
                                        onChange={(e) =>
                                            setData('passing_score', parseInt(e.target.value) || 0)
                                        }
                                        className="w-32"
                                    />
                                    <span className="text-muted-foreground">%</span>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Siswa dengan persentase nilai di bawah KKM akan dianggap perlu remedial.
                                </p>
                                {errors.passing_score && (
                                    <p className="text-sm text-destructive">{errors.passing_score}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Label>Background</Label>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">
                                        Pilih dari Galeri
                                    </Label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {backgrounds.map((bg) => (
                                            <div
                                                key={bg.id}
                                                className={`relative cursor-pointer overflow-hidden rounded-md border-2 ${
                                                    data.quiz_background_id ===
                                                    bg.id.toString()
                                                        ? 'border-primary'
                                                        : 'border-transparent'
                                                }`}
                                                onClick={() => {
                                                    setData((data) => ({
                                                        ...data,
                                                        quiz_background_id:
                                                            bg.id.toString(),
                                                        background_file: null,
                                                    }));
                                                }}
                                            >
                                                <img
                                                    src={bg.image_path}
                                                    alt={bg.name}
                                                    className="h-20 w-full object-cover"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">
                                        Atau Upload Baru
                                    </Label>
                                    <FileUploader
                                        onFileSelect={(file: File | null) => {
                                            setData((data) => ({
                                                ...data,
                                                background_file: file,
                                                quiz_background_id: '',
                                            }));
                                        }}
                                        label="Upload Background"
                                        description="Drag & drop atau klik untuk upload"
                                        maxSize={10 * 1024 * 1024}
                                        accept={{
                                            'image/*': [
                                                '.jpeg',
                                                '.png',
                                                '.jpg',
                                                '.gif',
                                            ],
                                        }}
                                    />
                                    {data.background_file && (
                                        <p className="text-sm text-muted-foreground">
                                            File terpilih:{' '}
                                            {data.background_file.name}
                                        </p>
                                    )}
                                </div>
                            </div>
                            {errors.quiz_background_id && (
                                <p className="text-sm text-destructive">
                                    {errors.quiz_background_id}
                                </p>
                            )}
                            {errors.background_file && (
                                <p className="text-sm text-destructive">
                                    {errors.background_file}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center gap-4">
                            <Button type="submit" disabled={processing}>
                                Buat Kuis
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => window.history.back()}
                            >
                                Batal
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppSidebarLayout>
    );
}
