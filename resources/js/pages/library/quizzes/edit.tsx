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
import { type Quiz, type TimeMode } from '@/types/quiz';
import { Head, Link, useForm } from '@inertiajs/react';
import { Clock, Timer, UserCog } from 'lucide-react';
import { FormEventHandler } from 'react';

interface Props {
    quiz: Quiz;
    categories: QuizCategory[];
    backgrounds: QuizBackground[];
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
        title: 'Edit',
        href: '#',
    },
];

export default function QuizEdit({
    quiz,
    categories = [],
    backgrounds = [],
}: Props) {
    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        title: quiz.title || '',
        description: quiz.description || '',
        quiz_category_id: quiz.quiz_category_id?.toString() || '',
        quiz_background_id: quiz.quiz_background_id?.toString() || '',
        background_file: null as File | null,
        status: quiz.status || 'draft',
        time_mode: (quiz.time_mode || 'per_question') as TimeMode,
        duration: quiz.duration || 30,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('library.quizzes.update', quiz.id));
    };

    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Kuis" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="max-w-2xl">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">
                                Edit Kuis
                            </h1>
                            <p className="text-muted-foreground">
                                Perbarui detail kuis Anda.
                            </p>
                        </div>
                        <Button variant="outline" asChild>
                            <Link
                                href={route('library.quizzes.access', quiz.id)}
                            >
                                <UserCog className="mr-2 h-4 w-4" />
                                Pengaturan Akses
                            </Link>
                        </Button>
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
                                                    duration:
                                                        d.time_mode ===
                                                        'per_question'
                                                            ? d.duration
                                                            : 30,
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
                                                    duration:
                                                        d.time_mode === 'total'
                                                            ? d.duration
                                                            : 15,
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
                                        currentFile={
                                            quiz.background?.image_path
                                        }
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

                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={data.status}
                                onValueChange={(value) =>
                                    setData('status', value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="live">Live</SelectItem>
                                    <SelectItem value="finished">
                                        Finished
                                    </SelectItem>
                                    <SelectItem value="archived">
                                        Archived
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.status && (
                                <p className="text-sm text-destructive">
                                    {errors.status}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center gap-4">
                            <Button type="submit" disabled={processing}>
                                Perbarui Kuis
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
