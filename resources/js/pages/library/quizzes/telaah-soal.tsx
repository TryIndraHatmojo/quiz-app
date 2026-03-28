import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import {
    type BreadcrumbItem,
    type CatatanTelaahSoal,
    type SharedData,
} from '@/types';
import { type Quiz, type QuizQuestion } from '@/types/quiz';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    AlignLeft,
    ArrowLeft,
    Check,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock,
    FileText,
    Link2,
    ListChecks,
    MessageSquare,
    MessageSquareWarning,
    Send,
    ToggleLeft,
    Trash2,
    X,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

interface Props {
    quiz: Quiz;
}

const questionTypeLabels: Record<
    string,
    { label: string; icon: React.ReactNode; color: string }
> = {
    multiple_choice: {
        label: 'Pilihan Ganda',
        icon: <ListChecks className="h-4 w-4" />,
        color: 'bg-blue-500',
    },
    long_answer: {
        label: 'Jawaban Panjang',
        icon: <AlignLeft className="h-4 w-4" />,
        color: 'bg-purple-500',
    },
    short_answer: {
        label: 'Isian Singkat',
        icon: <FileText className="h-4 w-4" />,
        color: 'bg-orange-500',
    },
    matching_pairs: {
        label: 'Mencocokkan',
        icon: <Link2 className="h-4 w-4" />,
        color: 'bg-green-500',
    },
    true_false: {
        label: 'Benar/Salah',
        icon: <ToggleLeft className="h-4 w-4" />,
        color: 'bg-pink-500',
    },
};

const optionColors = [
    'bg-red-600',
    'bg-blue-600',
    'bg-yellow-500',
    'bg-green-600',
    'bg-purple-600',
    'bg-pink-600',
    'bg-indigo-600',
    'bg-teal-600',
];

export default function TelaahSoal({ quiz }: Props) {
    const { flash } = usePage<SharedData>().props;
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [newCatatan, setNewCatatan] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [catatanToDelete, setCatatanToDelete] =
        useState<CatatanTelaahSoal | null>(null);

    const questions = quiz.questions || [];
    const currentQuestion = questions[currentQuestionIndex];

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Koleksi', href: '#' },
        { title: 'Semua Kuis', href: '/library/quizzes' },
        { title: quiz.title, href: '#' },
        { title: 'Telaah Soal', href: '#' },
    ];

    // Hitung total catatan butuh review
    const totalButuhReview = questions.reduce(
        (sum, q) => sum + (q.catatan_telaah_count ?? 0),
        0,
    );
    const totalCatatan = questions.reduce(
        (sum, q) => sum + (q.catatan_telaah?.length ?? 0),
        0,
    );

    const handleSubmitCatatan = () => {
        if (!currentQuestion?.id || !newCatatan.trim()) return;
        setSubmitting(true);
        router.post(
            route('library.catatan-telaah.store', currentQuestion.id),
            { catatan: newCatatan },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setNewCatatan('');
                    setSubmitting(false);
                },
                onError: () => {
                    setSubmitting(false);
                },
            },
        );
    };

    const handleDeleteCatatan = (catatan: CatatanTelaahSoal) => {
        setCatatanToDelete(catatan);
        setDeleteDialogOpen(true);
    };

    const confirmDeleteCatatan = () => {
        if (!catatanToDelete) return;
        router.delete(
            route('library.catatan-telaah.destroy', catatanToDelete.id),
            {
                preserveScroll: true,
                onSuccess: () => {
                    setDeleteDialogOpen(false);
                    setCatatanToDelete(null);
                },
            },
        );
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const renderQuestionPreview = (question: QuizQuestion) => {
        const typeInfo = questionTypeLabels[question.question_type];

        return (
            <div className="space-y-4">
                {/* Question Type Badge */}
                <div className="flex items-center gap-2">
                    <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-white ${typeInfo?.color || 'bg-gray-500'}`}
                    >
                        {typeInfo?.icon}
                        {typeInfo?.label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                        <Clock className="mr-1 inline h-3 w-3" />
                        {question.time_limit} detik
                    </span>
                    <span className="text-xs text-muted-foreground">
                        {question.points} poin
                    </span>
                </div>

                {/* Question Text */}
                <div className="rounded-xl border bg-muted/30 p-6">
                    <p className="text-lg leading-relaxed font-medium whitespace-pre-wrap">
                        {question.question_text}
                    </p>
                    {question.media_path && (
                        <img
                            src={question.media_path}
                            alt="Media soal"
                            className="mt-4 max-h-64 rounded-lg object-contain"
                        />
                    )}
                </div>

                {/* Answer Options */}
                {question.question_type === 'multiple_choice' &&
                    question.options && (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {question.options.map((option, idx) => (
                                <div
                                    key={idx}
                                    className={`flex items-center gap-3 rounded-xl border-2 p-4 transition-all ${
                                        option.is_correct
                                            ? 'border-green-400 bg-green-50 dark:border-green-600 dark:bg-green-900/20'
                                            : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50'
                                    }`}
                                >
                                    <div
                                        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white ${optionColors[idx % optionColors.length]}`}
                                    >
                                        {String.fromCharCode(65 + idx)}
                                    </div>
                                    <span className="flex-1 text-sm">
                                        {option.option_text}
                                    </span>
                                    {option.is_correct && (
                                        <Check className="h-5 w-5 flex-shrink-0 text-green-600" />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                {question.question_type === 'true_false' &&
                    question.options && (
                        <div className="grid grid-cols-2 gap-4">
                            {question.options.map((option, idx) => (
                                <div
                                    key={idx}
                                    className={`flex items-center justify-center gap-3 rounded-xl border-2 p-6 ${
                                        option.is_correct
                                            ? 'border-green-400 bg-green-50 dark:border-green-600 dark:bg-green-900/20'
                                            : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50'
                                    }`}
                                >
                                    {idx === 0 ? (
                                        <Check className="h-8 w-8 text-green-600" />
                                    ) : (
                                        <X className="h-8 w-8 text-red-500" />
                                    )}
                                    <span className="text-xl font-bold">
                                        {option.option_text}
                                    </span>
                                    {option.is_correct && (
                                        <Badge className="ml-2 bg-green-500">
                                            Jawaban Benar
                                        </Badge>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                {question.question_type === 'matching_pairs' &&
                    question.matching_pairs && (
                        <div className="space-y-3">
                            <div className="mb-2 grid grid-cols-2 gap-4">
                                <p className="text-center text-sm font-semibold text-muted-foreground">
                                    Soal
                                </p>
                                <p className="text-center text-sm font-semibold text-muted-foreground">
                                    Pasangan
                                </p>
                            </div>
                            {question.matching_pairs.map((pair, idx) => (
                                <div
                                    key={idx}
                                    className="grid grid-cols-2 gap-4"
                                >
                                    <div className="flex items-center gap-2 rounded-lg border bg-blue-50 p-3 dark:bg-blue-900/20">
                                        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">
                                            {idx + 1}
                                        </span>
                                        <span className="text-sm">
                                            {pair.left_text}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 rounded-lg border bg-green-50 p-3 dark:bg-green-900/20">
                                        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-green-500 text-xs font-bold text-white">
                                            {String.fromCharCode(65 + idx)}
                                        </span>
                                        <span className="text-sm">
                                            {pair.right_text}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                {(question.question_type === 'short_answer' ||
                    question.question_type === 'long_answer') &&
                    question.short_answer_fields && (
                        <div className="space-y-3">
                            <p className="text-sm font-medium text-muted-foreground">
                                Kunci Jawaban:
                            </p>
                            {question.short_answer_fields.map((field, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center gap-3 rounded-lg border bg-green-50 p-3 dark:bg-green-900/20"
                                >
                                    <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-green-500 text-xs font-bold text-white">
                                        {idx + 1}
                                    </span>
                                    <span className="text-sm font-medium">
                                        {field.expected_answer || '(kosong)'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
            </div>
        );
    };

    if (!currentQuestion) {
        return (
            <AppSidebarLayout breadcrumbs={breadcrumbs}>
                <Head title={`Telaah Soal - ${quiz.title}`} />
                <div className="flex flex-col items-center justify-center p-12">
                    <h2 className="mb-4 text-2xl font-bold">
                        Tidak ada pertanyaan
                    </h2>
                    <p className="text-muted-foreground">
                        Kuis ini belum memiliki pertanyaan untuk ditelaah.
                    </p>
                    <Button variant="outline" className="mt-4" asChild>
                        <Link href={route('library.quizzes.index')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali ke Daftar Kuis
                        </Link>
                    </Button>
                </div>
            </AppSidebarLayout>
        );
    }

    const currentCatatan = currentQuestion.catatan_telaah || [];
    const openCatatan = currentCatatan.filter(
        (c) => c.status === 'butuh_review',
    );
    const resolvedCatatan = currentCatatan.filter(
        (c) => c.status === 'selesai',
    );

    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title={`Telaah Soal - ${quiz.title}`} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                {/* Flash Messages */}
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

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Telaah Soal
                        </h1>
                        <p className="text-muted-foreground">
                            {quiz.title} —{' '}
                            <span className="font-medium text-amber-600">
                                {totalButuhReview} catatan butuh review
                            </span>
                            {totalCatatan > 0 && (
                                <span className="ml-1 text-xs">
                                    ({totalCatatan} total catatan)
                                </span>
                            )}
                        </p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href={route('library.quizzes.index')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali
                        </Link>
                    </Button>
                </div>

                {/* Question Navigation */}
                <div className="flex items-center gap-2 overflow-x-auto rounded-xl border border-sidebar-border bg-sidebar p-3">
                    <span className="mr-2 text-sm font-medium whitespace-nowrap text-muted-foreground">
                        Soal:
                    </span>
                    {questions.map((q, idx) => {
                        const hasOpenNotes =
                            (q.catatan_telaah_count ?? 0) > 0;
                        const hasCatatan =
                            (q.catatan_telaah?.length ?? 0) > 0;
                        return (
                            <button
                                key={idx}
                                onClick={() => setCurrentQuestionIndex(idx)}
                                className={`relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-sm font-bold transition-all ${
                                    idx === currentQuestionIndex
                                        ? 'scale-110 bg-amber-500 text-white ring-2 ring-amber-300'
                                        : hasOpenNotes
                                          ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/40 dark:text-amber-300'
                                          : hasCatatan
                                            ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/40 dark:text-green-300'
                                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                }`}
                            >
                                {idx + 1}
                                {hasOpenNotes && (
                                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                                        {q.catatan_telaah_count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Main Content: Question Preview + Catatan Panel */}
                <div className="grid flex-1 gap-6 lg:grid-cols-5">
                    {/* Left: Question Preview (3/5) */}
                    <div className="lg:col-span-3">
                        <div className="rounded-xl border border-sidebar-border bg-sidebar p-6 shadow-sm">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-lg font-semibold">
                                    Soal #{currentQuestionIndex + 1}
                                </h2>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={currentQuestionIndex === 0}
                                        onClick={() =>
                                            setCurrentQuestionIndex(
                                                (i) => i - 1,
                                            )
                                        }
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <span className="flex items-center px-2 text-sm text-muted-foreground">
                                        {currentQuestionIndex + 1} /{' '}
                                        {questions.length}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={
                                            currentQuestionIndex ===
                                            questions.length - 1
                                        }
                                        onClick={() =>
                                            setCurrentQuestionIndex(
                                                (i) => i + 1,
                                            )
                                        }
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {renderQuestionPreview(currentQuestion)}
                        </div>
                    </div>

                    {/* Right: Catatan Telaah Panel (2/5) */}
                    <div className="flex flex-col gap-4 lg:col-span-2">
                        {/* New Catatan Form */}
                        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-5 shadow-sm dark:border-amber-800 dark:bg-amber-900/10">
                            <div className="mb-3 flex items-center gap-2">
                                <MessageSquare className="h-5 w-5 text-amber-600" />
                                <h3 className="text-base font-semibold text-amber-800 dark:text-amber-300">
                                    Beri Catatan Telaah
                                </h3>
                            </div>
                            <Textarea
                                value={newCatatan}
                                onChange={(e) => setNewCatatan(e.target.value)}
                                placeholder="Tulis catatan revisi atau saran untuk soal ini... (minimal 5 karakter)"
                                className="mb-3 min-h-[100px] resize-none border-amber-200 bg-white focus-visible:border-amber-400 focus-visible:ring-amber-300 dark:border-amber-700 dark:bg-gray-900"
                            />
                            <Button
                                onClick={handleSubmitCatatan}
                                disabled={
                                    submitting || newCatatan.trim().length < 5
                                }
                                className="w-full bg-amber-600 text-white hover:bg-amber-700"
                            >
                                <Send className="mr-2 h-4 w-4" />
                                {submitting
                                    ? 'Mengirim...'
                                    : 'Kirim Catatan Telaah'}
                            </Button>
                        </div>

                        {/* Existing Catatan */}
                        <div className="rounded-xl border border-sidebar-border bg-sidebar p-5 shadow-sm">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-base font-semibold">
                                    Catatan Soal Ini
                                </h3>
                                <div className="flex gap-2">
                                    {openCatatan.length > 0 && (
                                        <Badge
                                            variant="outline"
                                            className="border-amber-300 bg-amber-50 text-amber-700"
                                        >
                                            <MessageSquareWarning className="mr-1 h-3 w-3" />
                                            {openCatatan.length} Butuh Review
                                        </Badge>
                                    )}
                                    {resolvedCatatan.length > 0 && (
                                        <Badge
                                            variant="outline"
                                            className="border-green-300 bg-green-50 text-green-700"
                                        >
                                            <CheckCircle2 className="mr-1 h-3 w-3" />
                                            {resolvedCatatan.length} Selesai
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            {currentCatatan.length === 0 ? (
                                <div className="flex flex-col items-center py-8 text-center text-muted-foreground">
                                    <MessageSquare className="mb-2 h-8 w-8 opacity-30" />
                                    <p className="text-sm">
                                        Belum ada catatan telaah untuk soal ini.
                                    </p>
                                    <p className="text-xs">
                                        Tulis catatan di atas untuk memulai
                                        telaah.
                                    </p>
                                </div>
                            ) : (
                                <div className="max-h-[400px] space-y-3 overflow-y-auto pr-1">
                                    {currentCatatan.map((catatan) => (
                                        <div
                                            key={catatan.id}
                                            className={`group rounded-lg border p-4 transition-all ${
                                                catatan.status ===
                                                'butuh_review'
                                                    ? 'border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-900/10'
                                                    : 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-900/10'
                                            }`}
                                        >
                                            {/* Catatan Header */}
                                            <div className="mb-2 flex items-start justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700 dark:bg-amber-800 dark:text-amber-300">
                                                        {catatan.user?.name
                                                            ?.charAt(0)
                                                            ?.toUpperCase() ||
                                                            '?'}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium">
                                                            {catatan.user
                                                                ?.name ||
                                                                'Pengguna'}
                                                        </p>
                                                        <p className="text-[11px] text-muted-foreground">
                                                            {formatDate(
                                                                catatan.created_at,
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Badge
                                                        variant="outline"
                                                        className={`text-[10px] ${
                                                            catatan.status ===
                                                            'butuh_review'
                                                                ? 'border-amber-300 text-amber-700'
                                                                : 'border-green-300 text-green-700'
                                                        }`}
                                                    >
                                                        {catatan.status ===
                                                        'butuh_review'
                                                            ? 'Butuh Review'
                                                            : 'Selesai'}
                                                    </Badge>
                                                    <button
                                                        onClick={() =>
                                                            handleDeleteCatatan(
                                                                catatan,
                                                            )
                                                        }
                                                        className="rounded p-1 text-red-400 opacity-0 transition-opacity hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
                                                        title="Hapus catatan"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Catatan Body */}
                                            <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                                {catatan.catatan}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus Catatan Telaah?</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        Catatan ini akan dihapus secara permanen dan tidak bisa
                        dikembalikan.
                    </p>
                    <div className="mt-4 flex justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialogOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDeleteCatatan}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Hapus
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </AppSidebarLayout>
    );
}
