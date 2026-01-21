import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem, type QuizCategory, type QuizBackground } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { BookOpen, Clock, HelpCircle, Play, CheckCircle2 } from 'lucide-react';

interface StudentQuiz {
    id: number;
    title: string;
    description: string | null;
    status: string;
    time_mode: 'per_question' | 'total';
    duration: number | null;
    category: QuizCategory | null;
    background: QuizBackground | null;
    questions_count: number;
    attempt_count: number;
    accessed_at: string | null;
}

interface Props {
    isStudent: boolean;
    studentQuizzes: StudentQuiz[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function Dashboard({ isStudent, studentQuizzes }: Props) {
    // Format duration display
    const formatDuration = (quiz: StudentQuiz) => {
        if (!quiz.duration) return 'Tidak ada batas waktu';
        if (quiz.time_mode === 'per_question') {
            return `${quiz.duration} detik/soal`;
        }
        return `${quiz.duration} menit total`;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                {/* Student Dashboard */}
                {isStudent && (
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Quiz Saya</h1>
                            <p className="text-muted-foreground">
                                Daftar quiz yang harus Anda kerjakan
                            </p>
                        </div>

                        {studentQuizzes.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-sidebar-border py-16">
                                <BookOpen className="h-12 w-12 text-muted-foreground/50 mb-4" />
                                <h3 className="text-lg font-medium text-muted-foreground">Belum Ada Quiz</h3>
                                <p className="text-sm text-muted-foreground/70 mt-1">
                                    Anda belum memiliki quiz yang harus dikerjakan.
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {studentQuizzes.map((quiz) => (
                                    <div
                                        key={quiz.id}
                                        className="group relative overflow-hidden rounded-xl border border-sidebar-border bg-sidebar shadow-sm transition-all hover:shadow-md"
                                    >
                                        {/* Background Image */}
                                        {quiz.background?.image_path && (
                                            <div className="absolute inset-0 opacity-10">
                                                <img 
                                                    src={quiz.background.image_path} 
                                                    alt="" 
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                        )}
                                        
                                        <div className="relative p-5">
                                            {/* Category Badge */}
                                            {quiz.category && (
                                                <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary mb-3">
                                                    {quiz.category.name}
                                                </span>
                                            )}

                                            {/* Title & Description */}
                                            <h3 className="font-semibold text-lg mb-1 line-clamp-1">
                                                {quiz.title}
                                            </h3>
                                            {quiz.description && (
                                                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                                                    {quiz.description}
                                                </p>
                                            )}

                                            {/* Quiz Info */}
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                                                <div className="flex items-center gap-1.5">
                                                    <HelpCircle className="h-4 w-4" />
                                                    <span>{quiz.questions_count} soal</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="h-4 w-4" />
                                                    <span>{formatDuration(quiz)}</span>
                                                </div>
                                            </div>

                                            {/* Status & Actions */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    {quiz.attempt_count > 0 ? (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                                                            <CheckCircle2 className="h-3 w-3" />
                                                            {quiz.attempt_count}x dikerjakan
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                                                            Belum dikerjakan
                                                        </span>
                                                    )}
                                                </div>
                                                
                                                {quiz.status === 'live' ? (
                                                    <Button size="sm" asChild>
                                                        <Link href={`/quiz/${quiz.id}/start`}>
                                                            <Play className="mr-1.5 h-3.5 w-3.5" />
                                                            Mulai
                                                        </Link>
                                                    </Button>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">
                                                        Belum tersedia
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Non-Student Dashboard (placeholder) */}
                {!isStudent && (
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                            <p className="text-muted-foreground">
                                Selamat datang di Quiz App
                            </p>
                        </div>
                        
                        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                            <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border bg-sidebar p-4">
                                <div className="flex flex-col justify-center h-full">
                                    <h3 className="font-semibold">Total Quiz</h3>
                                    <p className="text-3xl font-bold mt-2">-</p>
                                </div>
                            </div>
                            <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border bg-sidebar p-4">
                                <div className="flex flex-col justify-center h-full">
                                    <h3 className="font-semibold">Total Siswa</h3>
                                    <p className="text-3xl font-bold mt-2">-</p>
                                </div>
                            </div>
                            <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border bg-sidebar p-4">
                                <div className="flex flex-col justify-center h-full">
                                    <h3 className="font-semibold">Quiz Aktif</h3>
                                    <p className="text-3xl font-bold mt-2">-</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
