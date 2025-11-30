import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { BreadcrumbItem } from '@/types';
import { Quiz, QuizQuestion, QuizQuestionOption } from '@/types/quiz';
import { Head, useForm } from '@inertiajs/react';
import {
    Check,
    ChevronLeft,
    Copy,
    Image as ImageIcon,
    Plus,
    Save,
    Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface Props {
    quiz: Quiz;
}

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
        title: 'Pembuat',
        href: '#',
    },
];

const defaultOption: QuizQuestionOption = {
    option_text: '',
    is_correct: false,
    order: 0,
};

const defaultQuestion: QuizQuestion = {
    question_type: 'multiple_choice',
    question_text: '',
    time_limit: 30,
    points: 100,
    order: 0,
    options: [
        { ...defaultOption, order: 0 },
        { ...defaultOption, order: 1 },
        { ...defaultOption, order: 2 },
        { ...defaultOption, order: 3 },
    ],
};

export default function QuizQuestions({ quiz }: Props) {
    const [questions, setQuestions] = useState<QuizQuestion[]>(
        quiz.questions && quiz.questions.length > 0
            ? quiz.questions
            : [{ ...defaultQuestion }]
    );
    const [currentIndex, setCurrentIndex] = useState(0);

    const { setData, post, processing } = useForm({
        questions: questions,
    });

    // Sync local state with form data whenever questions change
    useEffect(() => {
        setData('questions', questions);
    }, [questions, setData]);

    const currentQuestion = questions[currentIndex];

    const handleAddQuestion = () => {
        const newQuestion = {
            ...defaultQuestion,
            order: questions.length,
            options: [
                { ...defaultOption, order: 0 },
                { ...defaultOption, order: 1 },
                { ...defaultOption, order: 2 },
                { ...defaultOption, order: 3 },
            ],
        };
        setQuestions([...questions, newQuestion]);
        setCurrentIndex(questions.length);
    };

    const handleDeleteQuestion = (index: number) => {
        if (questions.length === 1) return;
        const newQuestions = questions.filter((_, i) => i !== index);
        setQuestions(newQuestions);
        if (currentIndex >= newQuestions.length) {
            setCurrentIndex(newQuestions.length - 1);
        }
    };

    const handleDuplicateQuestion = (index: number) => {
        const questionToDuplicate = questions[index];
        const newQuestion = {
            ...questionToDuplicate,
            id: undefined, // Clear ID for new record
            order: questions.length,
            options: questionToDuplicate.options.map((opt) => ({
                ...opt,
                id: undefined,
                quiz_question_id: undefined,
            })),
        };
        setQuestions([...questions, newQuestion]);
        setCurrentIndex(questions.length);
    };

    const updateCurrentQuestion = (field: keyof QuizQuestion, value: string | number | boolean | QuizQuestionOption[]) => {
        const newQuestions = [...questions];
        newQuestions[currentIndex] = {
            ...newQuestions[currentIndex],
            [field]: value,
        };
        setQuestions(newQuestions);
    };

    const updateOption = (optionIndex: number, field: keyof QuizQuestionOption, value: string | boolean) => {
        const newQuestions = [...questions];
        const newOptions = [...newQuestions[currentIndex].options];
        newOptions[optionIndex] = {
            ...newOptions[optionIndex],
            [field]: value,
        };
        newQuestions[currentIndex] = {
            ...newQuestions[currentIndex],
            options: newOptions,
        };
        setQuestions(newQuestions);
    };

    const save = () => {
        post(route('library.quizzes.questions.store', quiz.id), {
            preserveScroll: true,
            onSuccess: () => {
                // Optional: show toast
            },
        });
    };

    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Pertanyaan - ${quiz.title}`} />

            <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-gray-50">
                {/* Sidebar - Question List */}
                <div className="w-64 flex-shrink-0 overflow-y-auto border-r bg-white p-4">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="font-semibold">Pertanyaan</h2>
                        <span className="text-xs text-muted-foreground">
                            {questions.length} total
                        </span>
                    </div>
                    
                    <div className="space-y-3">
                        {questions.map((q, idx) => (
                            <div
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={`group relative cursor-pointer rounded-lg border p-3 transition-all hover:border-primary ${
                                    currentIndex === idx
                                        ? 'border-primary bg-blue-50 ring-1 ring-primary'
                                        : 'bg-white'
                                }`}
                            >
                                <div className="mb-2 flex items-center justify-between">
                                    <span className="text-xs font-medium text-muted-foreground">
                                        {idx + 1} Kuis
                                    </span>
                                    <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDuplicateQuestion(idx);
                                            }}
                                            className="rounded p-1 hover:bg-gray-200"
                                            title="Duplikat"
                                        >
                                            <Copy className="h-3 w-3" />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteQuestion(idx);
                                            }}
                                            className="rounded p-1 hover:bg-red-100 text-red-500"
                                            title="Hapus"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex h-16 items-center justify-center rounded bg-gray-100 text-center text-[10px] text-gray-400">
                                    {q.media_path ? (
                                        <ImageIcon className="h-6 w-6" />
                                    ) : (
                                        <div className="flex flex-col items-center">
                                            <ImageIcon className="h-4 w-4 mb-1" />
                                            <span>Gambar</span>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-2 truncate text-xs font-medium">
                                    {q.question_text || 'Pertanyaan'}
                                </div>
                            </div>
                        ))}
                    </div>

                    <Button
                        onClick={handleAddQuestion}
                        className="mt-4 w-full"
                        variant="outline"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Tambah Pertanyaan
                    </Button>
                </div>

                {/* Main Content - Editor */}
                <div className="flex flex-1 flex-col overflow-hidden">
                    {/* Top Bar */}
                    <div className="flex items-center justify-between border-b bg-white px-6 py-3">
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
                                <ChevronLeft className="mr-1 h-4 w-4" /> Kembali
                            </Button>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button onClick={save} disabled={processing}>
                                <Save className="mr-2 h-4 w-4" /> Simpan Perubahan
                            </Button>
                        </div>
                    </div>

                    {/* Canvas */}
                    <div className="flex-1 overflow-y-auto p-8">
                        <div className="mx-auto max-w-5xl space-y-6">
                            {/* Question Input */}
                            <div className="rounded-xl bg-white p-6 shadow-sm">
                                <Input
                                    value={currentQuestion.question_text}
                                    onChange={(e) =>
                                        updateCurrentQuestion('question_text', e.target.value)
                                    }
                                    className="text-center text-xl font-medium placeholder:text-gray-300 border-none shadow-none focus-visible:ring-0"
                                    placeholder="Mulai ketik pertanyaan Anda"
                                />
                            </div>

                            {/* Media Area */}
                            <div className="flex aspect-video w-full items-center justify-center rounded-xl bg-purple-100/50 border-2 border-dashed border-purple-200">
                                <div className="flex flex-col items-center gap-4 text-purple-900/50">
                                    <div className="rounded-full bg-white p-4 shadow-sm">
                                        <Plus className="h-8 w-8" />
                                    </div>
                                    <span className="font-medium">Cari dan sisipkan media</span>
                                    <span className="text-sm">Unggah file atau tarik ke sini untuk mengunggah</span>
                                </div>
                            </div>

                            {/* Options Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                {/* Option 1 - Red Triangle */}
                                <div className="group relative flex items-center rounded-lg bg-white p-2 shadow-sm ring-1 ring-gray-200 focus-within:ring-2 focus-within:ring-red-500">
                                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded bg-red-600 text-white">
                                        <svg viewBox="0 0 32 32" className="h-6 w-6 fill-current"><path d="M16,4L2,28h28L16,4z" /></svg>
                                    </div>
                                    <Textarea
                                        value={currentQuestion.options[0]?.option_text || ''}
                                        onChange={(e) => updateOption(0, 'option_text', e.target.value)}
                                        placeholder="Tambah jawaban 1"
                                        className="min-h-[60px] resize-none border-none bg-transparent focus-visible:ring-0"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                        <button
                                            onClick={() => updateOption(0, 'is_correct', !currentQuestion.options[0]?.is_correct)}
                                            className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors ${
                                                currentQuestion.options[0]?.is_correct
                                                    ? 'border-green-500 bg-green-500 text-white'
                                                    : 'border-gray-300 text-transparent hover:border-green-500'
                                            }`}
                                        >
                                            <Check className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Option 2 - Blue Diamond */}
                                <div className="group relative flex items-center rounded-lg bg-white p-2 shadow-sm ring-1 ring-gray-200 focus-within:ring-2 focus-within:ring-blue-500">
                                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded bg-blue-600 text-white">
                                        <svg viewBox="0 0 32 32" className="h-6 w-6 fill-current"><path d="M16,2l14,14L16,30L2,16L16,2z" /></svg>
                                    </div>
                                    <Textarea
                                        value={currentQuestion.options[1]?.option_text || ''}
                                        onChange={(e) => updateOption(1, 'option_text', e.target.value)}
                                        placeholder="Tambah jawaban 2"
                                        className="min-h-[60px] resize-none border-none bg-transparent focus-visible:ring-0"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                        <button
                                            onClick={() => updateOption(1, 'is_correct', !currentQuestion.options[1]?.is_correct)}
                                            className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors ${
                                                currentQuestion.options[1]?.is_correct
                                                    ? 'border-green-500 bg-green-500 text-white'
                                                    : 'border-gray-300 text-transparent hover:border-green-500'
                                            }`}
                                        >
                                            <Check className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Option 3 - Yellow Circle */}
                                <div className="group relative flex items-center rounded-lg bg-white p-2 shadow-sm ring-1 ring-gray-200 focus-within:ring-2 focus-within:ring-yellow-500">
                                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded bg-yellow-500 text-white">
                                        <svg viewBox="0 0 32 32" className="h-6 w-6 fill-current"><circle cx="16" cy="16" r="14" /></svg>
                                    </div>
                                    <Textarea
                                        value={currentQuestion.options[2]?.option_text || ''}
                                        onChange={(e) => updateOption(2, 'option_text', e.target.value)}
                                        placeholder="Tambah jawaban 3 (opsional)"
                                        className="min-h-[60px] resize-none border-none bg-transparent focus-visible:ring-0"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                        <button
                                            onClick={() => updateOption(2, 'is_correct', !currentQuestion.options[2]?.is_correct)}
                                            className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors ${
                                                currentQuestion.options[2]?.is_correct
                                                    ? 'border-green-500 bg-green-500 text-white'
                                                    : 'border-gray-300 text-transparent hover:border-green-500'
                                            }`}
                                        >
                                            <Check className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Option 4 - Green Square */}
                                <div className="group relative flex items-center rounded-lg bg-white p-2 shadow-sm ring-1 ring-gray-200 focus-within:ring-2 focus-within:ring-green-500">
                                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded bg-green-600 text-white">
                                        <svg viewBox="0 0 32 32" className="h-6 w-6 fill-current"><rect x="4" y="4" width="24" height="24" /></svg>
                                    </div>
                                    <Textarea
                                        value={currentQuestion.options[3]?.option_text || ''}
                                        onChange={(e) => updateOption(3, 'option_text', e.target.value)}
                                        placeholder="Tambah jawaban 4 (opsional)"
                                        className="min-h-[60px] resize-none border-none bg-transparent focus-visible:ring-0"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                        <button
                                            onClick={() => updateOption(3, 'is_correct', !currentQuestion.options[3]?.is_correct)}
                                            className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors ${
                                                currentQuestion.options[3]?.is_correct
                                                    ? 'border-green-500 bg-green-500 text-white'
                                                    : 'border-gray-300 text-transparent hover:border-green-500'
                                            }`}
                                        >
                                            <Check className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppSidebarLayout>
    );
}
