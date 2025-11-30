import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem, type QuizBackground, type QuizCategory } from '@/types';
import { type Quiz } from '@/types/quiz';
import { FileUploader } from '@/components/file-uploader';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Library',
        href: '#',
    },
    {
        title: 'Semua Aktivitas',
        href: '/library/quizzes',
    },
    {
        title: 'Edit',
        href: '#',
    },
];

export default function QuizEdit({ quiz, categories = [], backgrounds = [] }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        title: quiz.title || '',
        description: quiz.description || '',
        quiz_category_id: quiz.quiz_category_id?.toString() || '',
        quiz_background_id: quiz.quiz_background_id?.toString() || '',
        background_file: null as File | null,
        status: quiz.status || 'draft',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('library.quizzes.update', quiz.id));
    };

    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Aktivitas" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="max-w-2xl">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold tracking-tight">Edit Aktivitas</h1>
                        <p className="text-muted-foreground">
                            Perbarui detail kuis atau aktivitas Anda.
                        </p>
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Judul</Label>
                            <Input
                                id="title"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                placeholder="contoh: Ujian Akhir Matematika"
                                required
                            />
                            {errors.title && (
                                <p className="text-sm text-destructive">{errors.title}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Deskripsi</Label>
                            <Textarea
                                id="description"
                                value={data.description}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('description', e.target.value)}
                                placeholder="Deskripsi opsional untuk aktivitas ini..."
                                className="h-32"
                            />
                            {errors.description && (
                                <p className="text-sm text-destructive">{errors.description}</p>
                            )}
                        </div>

                        <div className="space-y-4">
                            <Label>Background</Label>
                            
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">Pilih dari Galeri</Label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {backgrounds.map((bg) => (
                                            <div 
                                                key={bg.id}
                                                className={`relative cursor-pointer overflow-hidden rounded-md border-2 ${
                                                    data.quiz_background_id === bg.id.toString() 
                                                        ? 'border-primary' 
                                                        : 'border-transparent'
                                                }`}
                                                onClick={() => {
                                                    setData(data => ({
                                                        ...data,
                                                        quiz_background_id: bg.id.toString(),
                                                        background_file: null
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
                                    <Label className="text-xs text-muted-foreground">Atau Upload Baru</Label>
                                    <FileUploader
                                        onFileSelect={(file: File | null) => {
                                            setData(data => ({
                                                ...data,
                                                background_file: file,
                                                quiz_background_id: ''
                                            }));
                                        }}
                                        label="Upload Background"
                                        description="Drag & drop atau klik untuk upload"
                                        maxSize={10 * 1024 * 1024}
                                        accept={{
                                            'image/*': ['.jpeg', '.png', '.jpg', '.gif']
                                        }}
                                        currentFile={quiz.background?.image_path}
                                    />
                                    {data.background_file && (
                                        <p className="text-sm text-muted-foreground">
                                            File terpilih: {data.background_file.name}
                                        </p>
                                    )}
                                </div>
                            </div>
                            {errors.quiz_background_id && (
                                <p className="text-sm text-destructive">{errors.quiz_background_id}</p>
                            )}
                            {errors.background_file && (
                                <p className="text-sm text-destructive">{errors.background_file}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category">Kategori *</Label>
                            <Select
                                value={data.quiz_category_id}
                                onValueChange={(value) => setData('quiz_category_id', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih kategori" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id.toString()}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.quiz_category_id && (
                                <p className="text-sm text-destructive">{errors.quiz_category_id}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={data.status}
                                onValueChange={(value) => setData('status', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="live">Live</SelectItem>
                                    <SelectItem value="finished">Finished</SelectItem>
                                    <SelectItem value="archived">Archived</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.status && (
                                <p className="text-sm text-destructive">{errors.status}</p>
                            )}
                        </div>

                        <div className="flex items-center gap-4">
                            <Button type="submit" disabled={processing}>
                                Perbarui Aktivitas
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
