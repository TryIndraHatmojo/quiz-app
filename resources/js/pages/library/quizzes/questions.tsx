import { FileUploader } from '@/components/file-uploader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { BreadcrumbItem, CatatanTelaahSoal, Gallery } from '@/types';
import {
    Quiz,
    QuizMatchingPair,
    QuizQuestion,
    QuizQuestionOption,
    QuizShortAnswerField,
} from '@/types/quiz';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    AlignLeft,
    Check,
    CheckCircle2,
    ChevronLeft,
    Copy,
    Eye,
    FileText,
    Image as ImageIcon,
    Link2,
    ListChecks,
    MessageSquareWarning,
    Plus,
    Save,
    ToggleLeft,
    Trash2,
    X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface Props {
    quiz: Quiz;
    galleries: Gallery[];
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
        title: 'Pembuat',
        href: '#',
    },
];

type QuestionType =
    | 'multiple_choice'
    | 'long_answer'
    | 'short_answer'
    | 'matching_pairs'
    | 'true_false';

const questionTypeLabels: Record<
    QuestionType,
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

// Extended color palette for options
const optionColors = [
    { bg: 'bg-red-600', ring: 'focus-within:ring-red-500', light: 'bg-red-50' },
    {
        bg: 'bg-blue-600',
        ring: 'focus-within:ring-blue-500',
        light: 'bg-blue-50',
    },
    {
        bg: 'bg-yellow-500',
        ring: 'focus-within:ring-yellow-500',
        light: 'bg-yellow-50',
    },
    {
        bg: 'bg-green-600',
        ring: 'focus-within:ring-green-500',
        light: 'bg-green-50',
    },
    {
        bg: 'bg-purple-600',
        ring: 'focus-within:ring-purple-500',
        light: 'bg-purple-50',
    },
    {
        bg: 'bg-pink-600',
        ring: 'focus-within:ring-pink-500',
        light: 'bg-pink-50',
    },
    {
        bg: 'bg-indigo-600',
        ring: 'focus-within:ring-indigo-500',
        light: 'bg-indigo-50',
    },
    {
        bg: 'bg-teal-600',
        ring: 'focus-within:ring-teal-500',
        light: 'bg-teal-50',
    },
];

const defaultOption: QuizQuestionOption = {
    option_text: '',
    is_correct: false,
    order: 0,
};

const defaultMatchingPair: QuizMatchingPair = {
    left_text: '',
    right_text: '',
    order: 0,
};

const defaultShortAnswerField: QuizShortAnswerField = {
    label: '',
    placeholder: '',
    character_limit: null,
    expected_answer: '',
    case_sensitive: false,
    trim_whitespace: true,
    order: 0,
};

const createDefaultQuestion = (
    type: QuestionType = 'multiple_choice',
): QuizQuestion => {
    const base = {
        question_type: type,
        question_text: '',
        time_limit: 30,
        points: 100,
        order: 0,
        options: [],
        matching_pairs: [],
        short_answer_fields: [],
    };

    switch (type) {
        case 'multiple_choice':
            return {
                ...base,
                options: [
                    { ...defaultOption, order: 0 },
                    { ...defaultOption, order: 1 },
                    { ...defaultOption, order: 2 },
                    { ...defaultOption, order: 3 },
                ],
            };
        case 'true_false':
            return {
                ...base,
                options: [
                    {
                        ...defaultOption,
                        option_text: 'Benar',
                        is_correct: true,
                        order: 0,
                    },
                    {
                        ...defaultOption,
                        option_text: 'Salah',
                        is_correct: false,
                        order: 1,
                    },
                ],
            };
        case 'matching_pairs':
            return {
                ...base,
                matching_pairs: [
                    { ...defaultMatchingPair, order: 0 },
                    { ...defaultMatchingPair, order: 1 },
                    { ...defaultMatchingPair, order: 2 },
                ],
            };
        case 'short_answer':
            return {
                ...base,
                question_text: 'Lengkapi kalimat: ___ adalah ibukota Indonesia',
                short_answer_fields: [
                    { ...defaultShortAnswerField, label: '1', order: 0 },
                ],
            };
        case 'long_answer':
            return {
                ...base,
                short_answer_fields: [{ ...defaultShortAnswerField, order: 0 }],
            };
        default:
            return base;
    }
};

// Helper to count blanks in question text
const countBlanks = (text: string): number => {
    const matches = text.match(/___/g);
    return matches ? matches.length : 0;
};

// Helper to sync short answer fields with blanks count
const syncFieldsWithBlanks = (
    fields: QuizShortAnswerField[],
    blankCount: number,
): QuizShortAnswerField[] => {
    const newFields = [...fields];

    // Add more fields if needed
    while (newFields.length < blankCount) {
        newFields.push({
            ...defaultShortAnswerField,
            label: String(newFields.length + 1),
            order: newFields.length,
        });
    }

    // Remove extra fields if needed
    while (newFields.length > blankCount && blankCount > 0) {
        newFields.pop();
    }

    // Ensure at least one field if there are blanks
    if (blankCount > 0 && newFields.length === 0) {
        newFields.push({
            ...defaultShortAnswerField,
            label: '1',
            order: 0,
        });
    }

    return newFields;
};

export default function QuizQuestions({ quiz, galleries }: Props) {
    const [questions, setQuestions] = useState<QuizQuestion[]>(
        quiz.questions && quiz.questions.length > 0
            ? quiz.questions
            : [createDefaultQuestion('multiple_choice')],
    );
    const [currentIndex, setCurrentIndex] = useState(0);
    const [mediaDialogOpen, setMediaDialogOpen] = useState(false);
    const [galleryList, setGalleryList] = useState<Gallery[]>(galleries);
    const [isUploading, setIsUploading] = useState(false);
    const [activeTab, setActiveTab] = useState<'gallery' | 'upload'>('gallery');
    const questionTextRef = useRef<HTMLTextAreaElement>(null);

    // Strip read-only catatan fields from form data (not submitted, only displayed)
    const stripCatatanForForm = (qs: QuizQuestion[]) =>
        qs.map(({ catatan_telaah, catatan_telaah_count, ...rest }) => rest);

    const { setData, post, processing } = useForm({
        questions: stripCatatanForForm(questions),
    });

    // Sync local state with form data whenever questions change
    useEffect(() => {
        setData('questions', stripCatatanForForm(questions));
    }, [questions, setData]);

    const currentQuestion = questions[currentIndex];

    const handleAddQuestion = (type: QuestionType = 'multiple_choice') => {
        const newQuestion = createDefaultQuestion(type);
        newQuestion.order = questions.length;
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
            id: undefined,
            order: questions.length,
            options: questionToDuplicate.options.map((opt) => ({
                ...opt,
                id: undefined,
                quiz_question_id: undefined,
            })),
            matching_pairs: questionToDuplicate.matching_pairs?.map((pair) => ({
                ...pair,
                id: undefined,
                quiz_question_id: undefined,
            })),
            short_answer_fields: questionToDuplicate.short_answer_fields?.map(
                (field) => ({
                    ...field,
                    id: undefined,
                    quiz_question_id: undefined,
                }),
            ),
        };
        setQuestions([...questions, newQuestion]);
        setCurrentIndex(questions.length);
    };

    const handleQuestionTypeChange = (type: QuestionType) => {
        const newQuestions = [...questions];
        const newQuestion = createDefaultQuestion(type);
        newQuestion.id = currentQuestion.id;
        newQuestion.question_text = currentQuestion.question_text;
        newQuestion.media_path = currentQuestion.media_path;
        newQuestion.time_limit = currentQuestion.time_limit;
        newQuestion.points = currentQuestion.points;
        newQuestion.order = currentQuestion.order;
        newQuestions[currentIndex] = newQuestion;
        setQuestions(newQuestions);
    };

    const updateCurrentQuestion = (
        field: keyof QuizQuestion,
        value: unknown,
    ) => {
        const newQuestions = [...questions];
        newQuestions[currentIndex] = {
            ...newQuestions[currentIndex],
            [field]: value,
        };

        // For short_answer, sync fields with blanks count
        if (
            field === 'question_text' &&
            currentQuestion.question_type === 'short_answer'
        ) {
            const blankCount = countBlanks(value as string);
            const syncedFields = syncFieldsWithBlanks(
                newQuestions[currentIndex].short_answer_fields || [],
                blankCount,
            );
            newQuestions[currentIndex].short_answer_fields = syncedFields;
        }

        setQuestions(newQuestions);
    };

    const updateOption = (
        optionIndex: number,
        field: keyof QuizQuestionOption,
        value: string | boolean,
    ) => {
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

    const addOption = () => {
        const newQuestions = [...questions];
        const newOptions = [...newQuestions[currentIndex].options];
        if (newOptions.length < 8) {
            // Max 8 options
            newOptions.push({ ...defaultOption, order: newOptions.length });
            newQuestions[currentIndex] = {
                ...newQuestions[currentIndex],
                options: newOptions,
            };
            setQuestions(newQuestions);
        }
    };

    const removeOption = (optionIndex: number) => {
        const newQuestions = [...questions];
        const newOptions = [...newQuestions[currentIndex].options];
        if (newOptions.length > 2) {
            // Minimum 2 options
            newOptions.splice(optionIndex, 1);
            // Re-order remaining options
            newOptions.forEach((opt, idx) => {
                opt.order = idx;
            });
            newQuestions[currentIndex] = {
                ...newQuestions[currentIndex],
                options: newOptions,
            };
            setQuestions(newQuestions);
        }
    };

    const updateMatchingPair = (
        pairIndex: number,
        field: keyof QuizMatchingPair,
        value: string,
    ) => {
        const newQuestions = [...questions];
        const newPairs = [...(newQuestions[currentIndex].matching_pairs || [])];
        newPairs[pairIndex] = {
            ...newPairs[pairIndex],
            [field]: value,
        };
        newQuestions[currentIndex] = {
            ...newQuestions[currentIndex],
            matching_pairs: newPairs,
        };
        setQuestions(newQuestions);
    };

    const addMatchingPair = () => {
        const newQuestions = [...questions];
        const newPairs = [...(newQuestions[currentIndex].matching_pairs || [])];
        newPairs.push({ ...defaultMatchingPair, order: newPairs.length });
        newQuestions[currentIndex] = {
            ...newQuestions[currentIndex],
            matching_pairs: newPairs,
        };
        setQuestions(newQuestions);
    };

    const removeMatchingPair = (pairIndex: number) => {
        const newQuestions = [...questions];
        const newPairs = [...(newQuestions[currentIndex].matching_pairs || [])];
        if (newPairs.length > 1) {
            newPairs.splice(pairIndex, 1);
            newQuestions[currentIndex] = {
                ...newQuestions[currentIndex],
                matching_pairs: newPairs,
            };
            setQuestions(newQuestions);
        }
    };

    const updateShortAnswerField = (
        fieldIndex: number,
        field: keyof QuizShortAnswerField,
        value: unknown,
    ) => {
        const newQuestions = [...questions];
        const newFields = [
            ...(newQuestions[currentIndex].short_answer_fields || []),
        ];
        newFields[fieldIndex] = {
            ...newFields[fieldIndex],
            [field]: value,
        };
        newQuestions[currentIndex] = {
            ...newQuestions[currentIndex],
            short_answer_fields: newFields,
        };
        setQuestions(newQuestions);
    };

    const insertBlankAtCursor = () => {
        const textarea = questionTextRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = currentQuestion.question_text;
        const newText = text.substring(0, start) + '___' + text.substring(end);

        updateCurrentQuestion('question_text', newText);

        // Set cursor position after the inserted blank
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + 3, start + 3);
        }, 0);
    };

    const save = () => {
        post(route('library.quizzes.questions.store', quiz.id), {
            preserveScroll: true,
            onSuccess: () => {
                // Optional: show toast
            },
        });
    };

    const handleSelectGalleryItem = (gallery: Gallery) => {
        updateCurrentQuestion('media_path', gallery.file_path);
        setMediaDialogOpen(false);
    };

    const handleFileUpload = async (file: File | null) => {
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', `Question ${currentIndex + 1} Media`);

        try {
            const response = await fetch(route('master.galleries.store'), {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const data = await response.json();
            const newGallery = data.gallery;

            setGalleryList([newGallery, ...galleryList]);
            updateCurrentQuestion('media_path', newGallery.file_path);
            setMediaDialogOpen(false);
            setActiveTab('gallery');
        } catch (error) {
            console.error('Upload error:', error);
            alert('Gagal mengunggah file');
        } finally {
            setIsUploading(false);
        }
    };

    const handleStatusChange = (newStatus: string) => {
        router.patch(
            route('library.quizzes.status.update', quiz.id),
            { status: newStatus },
            { preserveScroll: true }
        );
    };

    const renderQuestionTypeEditor = () => {
        switch (currentQuestion.question_type) {
            case 'multiple_choice':
                return renderMultipleChoiceEditor();
            case 'true_false':
                return renderTrueFalseEditor();
            case 'matching_pairs':
                return renderMatchingPairsEditor();
            case 'short_answer':
                return renderShortAnswerEditor();
            case 'long_answer':
                return renderLongAnswerEditor();
            default:
                return null;
        }
    };

    const renderMultipleChoiceEditor = () => {
        const options = currentQuestion.options;
        const canAddMore = options.length < 8;
        const canRemove = options.length > 2;

        return (
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    {options.map((option, idx) => (
                        <div
                            key={idx}
                            className={`group relative flex items-center rounded-lg bg-white p-2 shadow-sm ring-1 ring-gray-200 ${optionColors[idx % optionColors.length]?.ring || 'focus-within:ring-primary'}`}
                        >
                            <div
                                className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded ${optionColors[idx % optionColors.length]?.bg || 'bg-gray-500'} text-white`}
                            >
                                <span className="text-lg font-bold">
                                    {String.fromCharCode(65 + idx)}
                                </span>
                            </div>
                            <Textarea
                                value={option.option_text || ''}
                                onChange={(e) =>
                                    updateOption(
                                        idx,
                                        'option_text',
                                        e.target.value,
                                    )
                                }
                                placeholder={`Tambah jawaban ${idx + 1}`}
                                className="min-h-[60px] resize-none border-none bg-transparent focus-visible:ring-0"
                            />
                            <div className="absolute top-1/2 right-4 flex -translate-y-1/2 items-center gap-2">
                                {canRemove && (
                                    <button
                                        onClick={() => removeOption(idx)}
                                        className="flex h-7 w-7 items-center justify-center rounded-full text-red-500 opacity-0 transition-all group-hover:opacity-100 hover:bg-red-50"
                                        title="Hapus opsi"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                )}
                                <button
                                    onClick={() =>
                                        updateOption(
                                            idx,
                                            'is_correct',
                                            !option.is_correct,
                                        )
                                    }
                                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors ${
                                        option.is_correct
                                            ? 'border-green-500 bg-green-500 text-white'
                                            : 'border-gray-300 text-transparent hover:border-green-500'
                                    }`}
                                >
                                    <Check className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                {canAddMore && (
                    <Button
                        variant="outline"
                        onClick={addOption}
                        className="w-full"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Tambah Opsi (
                        {options.length}/8)
                    </Button>
                )}
            </div>
        );
    };

    const renderTrueFalseEditor = () => {
        return (
            <div className="grid grid-cols-2 gap-4">
                {/* True Option */}
                <button
                    onClick={() => {
                        updateOption(0, 'is_correct', true);
                        updateOption(1, 'is_correct', false);
                    }}
                    className={`flex items-center justify-center gap-3 rounded-xl p-8 transition-all ${
                        currentQuestion.options[0]?.is_correct
                            ? 'bg-green-500 text-white ring-4 ring-green-300'
                            : 'bg-white text-gray-700 shadow-sm ring-1 ring-gray-200 hover:ring-green-300'
                    }`}
                >
                    <Check className="h-8 w-8" />
                    <span className="text-2xl font-bold">Benar</span>
                </button>
                {/* False Option */}
                <button
                    onClick={() => {
                        updateOption(0, 'is_correct', false);
                        updateOption(1, 'is_correct', true);
                    }}
                    className={`flex items-center justify-center gap-3 rounded-xl p-8 transition-all ${
                        currentQuestion.options[1]?.is_correct
                            ? 'bg-red-500 text-white ring-4 ring-red-300'
                            : 'bg-white text-gray-700 shadow-sm ring-1 ring-gray-200 hover:ring-red-300'
                    }`}
                >
                    <X className="h-8 w-8" />
                    <span className="text-2xl font-bold">Salah</span>
                </button>
            </div>
        );
    };

    const renderMatchingPairsEditor = () => {
        const pairs = currentQuestion.matching_pairs || [];
        return (
            <div className="space-y-4">
                <div className="mb-2 grid grid-cols-2 gap-4">
                    <div className="text-center font-medium text-gray-600">
                        Sisi Kiri
                    </div>
                    <div className="text-center font-medium text-gray-600">
                        Sisi Kanan (Pasangan)
                    </div>
                </div>
                {pairs.map((pair, idx) => (
                    <div
                        key={idx}
                        className="grid grid-cols-2 items-center gap-4"
                    >
                        <div className="relative">
                            <Input
                                value={pair.left_text}
                                onChange={(e) =>
                                    updateMatchingPair(
                                        idx,
                                        'left_text',
                                        e.target.value,
                                    )
                                }
                                placeholder={`Item ${idx + 1}`}
                                className="pr-8"
                            />
                            <div className="absolute top-1/2 right-2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">
                                {idx + 1}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                                <Input
                                    value={pair.right_text}
                                    onChange={(e) =>
                                        updateMatchingPair(
                                            idx,
                                            'right_text',
                                            e.target.value,
                                        )
                                    }
                                    placeholder={`Pasangan ${idx + 1}`}
                                    className="pr-8"
                                />
                                <div className="absolute top-1/2 right-2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-green-500 text-xs font-bold text-white">
                                    {idx + 1}
                                </div>
                            </div>
                            {pairs.length > 1 && (
                                <button
                                    onClick={() => removeMatchingPair(idx)}
                                    className="rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                <Button
                    variant="outline"
                    onClick={addMatchingPair}
                    className="w-full"
                >
                    <Plus className="mr-2 h-4 w-4" /> Tambah Pasangan
                </Button>
            </div>
        );
    };

    const renderShortAnswerEditor = () => {
        const fields = currentQuestion.short_answer_fields || [];
        const blankCount = countBlanks(currentQuestion.question_text);

        // Render question with interactive blanks
        const renderQuestionPreview = () => {
            const text = currentQuestion.question_text;
            const parts = text.split('___');

            return (
                <div className="flex flex-wrap items-center gap-1 text-lg">
                    {parts.map((part, idx) => (
                        <span key={idx} className="flex items-center">
                            <span>{part}</span>
                            {idx < parts.length - 1 && (
                                <span className="mx-1 inline-flex items-center">
                                    <span className="inline-block min-w-[80px] rounded-t border-b-2 border-orange-400 bg-orange-50 px-2 py-1 text-center font-medium text-orange-600">
                                        {fields[idx]?.expected_answer || `___`}
                                    </span>
                                    <span className="ml-1 text-xs font-bold text-orange-500">
                                        ({idx + 1})
                                    </span>
                                </span>
                            )}
                        </span>
                    ))}
                </div>
            );
        };

        return (
            <div className="space-y-6">
                {/* Instructions & Insert Button */}
                <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
                    <div className="mb-3 flex items-center justify-between">
                        <div>
                            <h4 className="font-medium text-orange-800">
                                Soal Isian Singkat
                            </h4>
                            <p className="text-sm text-orange-600">
                                Gunakan tanda{' '}
                                <code className="rounded bg-orange-100 px-1">
                                    ___
                                </code>{' '}
                                (3 underscore) untuk menandai bagian yang harus
                                diisi.
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={insertBlankAtCursor}
                            className="border-orange-300 text-orange-700 hover:bg-orange-100"
                        >
                            <Plus className="mr-1 h-4 w-4" /> Sisipkan Isian
                        </Button>
                    </div>
                    <p className="text-xs text-orange-500">
                        Contoh: "Andi ___ ke sekolah setiap ___ pagi"
                    </p>
                </div>

                {/* Preview */}
                {blankCount > 0 && (
                    <div className="rounded-xl bg-white p-6 shadow-sm">
                        <p className="mb-3 text-sm text-gray-500">
                            Preview Soal:
                        </p>
                        {renderQuestionPreview()}
                    </div>
                )}

                {/* Answer Fields */}
                {blankCount > 0 && (
                    <div className="rounded-xl bg-white p-6 shadow-sm">
                        <h4 className="mb-4 font-medium">
                            Jawaban untuk setiap isian ({blankCount} isian)
                        </h4>
                        <div className="space-y-4">
                            {fields.slice(0, blankCount).map((field, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-start gap-4 rounded-lg bg-gray-50 p-4"
                                >
                                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-orange-500 font-bold text-white">
                                        {idx + 1}
                                    </div>
                                    <div className="flex-1 space-y-3">
                                        <div>
                                            <Label className="text-sm">
                                                Jawaban yang Benar
                                            </Label>
                                            <Input
                                                value={field.expected_answer}
                                                onChange={(e) =>
                                                    updateShortAnswerField(
                                                        idx,
                                                        'expected_answer',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Masukkan jawaban yang benar"
                                                className="mt-1"
                                            />
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <Switch
                                                    id={`case-sensitive-${idx}`}
                                                    checked={
                                                        field.case_sensitive
                                                    }
                                                    onCheckedChange={(
                                                        checked,
                                                    ) =>
                                                        updateShortAnswerField(
                                                            idx,
                                                            'case_sensitive',
                                                            checked,
                                                        )
                                                    }
                                                />
                                                <Label
                                                    htmlFor={`case-sensitive-${idx}`}
                                                    className="cursor-pointer text-sm"
                                                >
                                                    Case Sensitive
                                                </Label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {blankCount === 0 && (
                    <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-8 text-center">
                        <FileText className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                        <p className="text-gray-500">
                            Belum ada isian. Tambahkan{' '}
                            <code className="rounded bg-gray-200 px-1">
                                ___
                            </code>{' '}
                            pada pertanyaan di atas.
                        </p>
                    </div>
                )}
            </div>
        );
    };

    const renderLongAnswerEditor = () => {
        const field =
            currentQuestion.short_answer_fields?.[0] || defaultShortAnswerField;
        return (
            <div className="space-y-6 rounded-xl bg-white p-6 shadow-sm">
                <div className="space-y-4">
                    <div>
                        <Label>
                            Jawaban yang Diharapkan (Opsional - untuk referensi)
                        </Label>
                        <Textarea
                            value={field.expected_answer}
                            onChange={(e) =>
                                updateShortAnswerField(
                                    0,
                                    'expected_answer',
                                    e.target.value,
                                )
                            }
                            placeholder="Masukkan contoh jawaban atau poin-poin kunci"
                            className="mt-1 min-h-[100px]"
                        />
                    </div>
                    <div>
                        <Label>Placeholder (Opsional)</Label>
                        <Input
                            value={field.placeholder || ''}
                            onChange={(e) =>
                                updateShortAnswerField(
                                    0,
                                    'placeholder',
                                    e.target.value,
                                )
                            }
                            placeholder="Teks placeholder untuk input"
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <Label>Batas Karakter (Opsional)</Label>
                        <Input
                            type="number"
                            value={field.character_limit || ''}
                            onChange={(e) =>
                                updateShortAnswerField(
                                    0,
                                    'character_limit',
                                    e.target.value
                                        ? parseInt(e.target.value)
                                        : null,
                                )
                            }
                            placeholder="Tidak ada batas"
                            className="mt-1 w-48"
                        />
                    </div>
                </div>
                <div className="rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 p-4">
                    <p className="mb-2 text-sm text-gray-500">Preview:</p>
                    <Textarea
                        disabled
                        placeholder={
                            field.placeholder ||
                            'Jawaban peserta akan muncul di sini...'
                        }
                        className="min-h-[120px] bg-white"
                    />
                </div>
            </div>
        );
    };

    // Render question input based on type
    const renderQuestionInput = () => {
        if (currentQuestion.question_type === 'short_answer') {
            return (
                <div className="rounded-xl bg-white p-6 shadow-sm">
                    <Textarea
                        ref={questionTextRef}
                        value={currentQuestion.question_text}
                        onChange={(e) =>
                            updateCurrentQuestion(
                                'question_text',
                                e.target.value,
                            )
                        }
                        className="min-h-[80px] resize-none border-none text-center text-xl font-medium shadow-none placeholder:text-gray-300 focus-visible:ring-0"
                        placeholder="Ketik pertanyaan dengan ___ untuk bagian isian. Contoh: Andi ___ ke sekolah"
                    />
                </div>
            );
        }

        return (
            <div className="rounded-xl bg-white p-6 shadow-sm">
                <Input
                    value={currentQuestion.question_text}
                    onChange={(e) =>
                        updateCurrentQuestion('question_text', e.target.value)
                    }
                    className="border-none text-center text-xl font-medium shadow-none placeholder:text-gray-300 focus-visible:ring-0"
                    placeholder="Mulai ketik pertanyaan Anda"
                />
            </div>
        );
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
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`flex h-5 w-5 items-center justify-center rounded text-[10px] text-white ${questionTypeLabels[q.question_type]?.color || 'bg-gray-500'}`}
                                        >
                                            {
                                                questionTypeLabels[
                                                    q.question_type
                                                ]?.icon
                                            }
                                        </span>
                                        <span className="text-xs font-medium text-muted-foreground">
                                            #{idx + 1}
                                        </span>
                                    </div>
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
                                            className="rounded p-1 text-red-500 hover:bg-red-100"
                                            title="Hapus"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex h-12 items-center justify-center rounded bg-gray-100 text-center text-[10px] text-gray-400">
                                    {q.media_path ? (
                                        <img
                                            src={q.media_path}
                                            alt=""
                                            className="h-full w-full rounded object-cover"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center">
                                            <ImageIcon className="mb-1 h-4 w-4" />
                                            <span>Gambar</span>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-2 truncate text-xs font-medium">
                                    {q.question_text || 'Pertanyaan'}
                                </div>
                                {(q.catatan_telaah_count ?? 0) > 0 && (
                                    <div className="mt-1 flex items-center gap-1 text-[10px] font-medium text-amber-600">
                                        <MessageSquareWarning className="h-3 w-3" />
                                        <span>{q.catatan_telaah_count}</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Add Question Menu */}
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className="mt-4 w-full" variant="outline">
                                <Plus className="mr-2 h-4 w-4" /> Tambah
                                Pertanyaan
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>
                                    Pilih Jenis Pertanyaan
                                </DialogTitle>
                            </DialogHeader>
                            <div className="grid grid-cols-2 gap-3 pt-4">
                                {(
                                    Object.entries(questionTypeLabels) as [
                                        QuestionType,
                                        (typeof questionTypeLabels)[QuestionType],
                                    ][]
                                ).map(([type, info]) => (
                                    <button
                                        key={type}
                                        onClick={() => {
                                            handleAddQuestion(type);
                                            // Close dialog
                                            const closeBtn =
                                                document.querySelector(
                                                    '[data-state="open"] button[aria-label="Close"]',
                                                ) as HTMLButtonElement;
                                            closeBtn?.click();
                                        }}
                                        className="flex items-center gap-3 rounded-lg border p-4 text-left transition-colors hover:border-primary hover:bg-gray-50"
                                    >
                                        <div
                                            className={`flex h-10 w-10 items-center justify-center rounded-lg ${info.color} text-white`}
                                        >
                                            {info.icon}
                                        </div>
                                        <span className="font-medium">
                                            {info.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Main Content - Editor */}
                <div className="flex flex-1 flex-col overflow-hidden">
                    {/* Top Bar */}
                    <div className="flex items-center justify-between border-b bg-white px-6 py-3">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.history.back()}
                            >
                                <ChevronLeft className="mr-1 h-4 w-4" /> Kembali
                            </Button>
                            <div className="h-6 w-px bg-gray-200" />
                            <div className="flex items-center gap-2">
                                <Label className="text-sm text-muted-foreground">
                                    Jenis:
                                </Label>
                                <Select
                                    value={currentQuestion.question_type}
                                    onValueChange={(value) =>
                                        handleQuestionTypeChange(
                                            value as QuestionType,
                                        )
                                    }
                                >
                                    <SelectTrigger className="w-48">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(
                                            Object.entries(
                                                questionTypeLabels,
                                            ) as [
                                                QuestionType,
                                                (typeof questionTypeLabels)[QuestionType],
                                            ][]
                                        ).map(([type, info]) => (
                                            <SelectItem key={type} value={type}>
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className={`flex h-5 w-5 items-center justify-center rounded ${info.color} text-white`}
                                                    >
                                                        {info.icon}
                                                    </span>
                                                    {info.label}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 border-r pr-4">
                                <Label className="text-sm font-medium">Status Kuis:</Label>
                                <Select
                                    defaultValue={quiz.status}
                                    onValueChange={handleStatusChange}
                                >
                                    <SelectTrigger className="h-8 w-32">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="draft">Draft</SelectItem>
                                        <SelectItem value="live">Live</SelectItem>
                                        <SelectItem value="finished">Selesai</SelectItem>
                                        <SelectItem value="archived">Arsip</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" asChild>
                                    <Link
                                        href={route(
                                            'library.quizzes.preview',
                                            quiz.id,
                                        )}
                                    >
                                        <Eye className="mr-2 h-4 w-4" /> Preview
                                    </Link>
                                </Button>
                                <Button onClick={save} disabled={processing}>
                                    <Save className="mr-2 h-4 w-4" /> Simpan
                                    Perubahan
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Canvas */}
                    <div className="flex-1 overflow-y-auto p-8">
                        <div className="mx-auto max-w-5xl space-y-6">
                            {/* Question Settings Row */}
                            <div className="flex items-center justify-end gap-4">
                                {quiz.time_mode === 'per_question' && (
                                    <div className="flex items-center gap-2">
                                        <Label className="text-sm">
                                            Waktu:
                                        </Label>
                                        <Select
                                            value={String(
                                                currentQuestion.time_limit,
                                            )}
                                            onValueChange={(value) =>
                                                updateCurrentQuestion(
                                                    'time_limit',
                                                    parseInt(value),
                                                )
                                            }
                                        >
                                            <SelectTrigger className="w-24">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {[
                                                    10, 20, 30, 45, 60, 90, 120,
                                                ].map((sec) => (
                                                    <SelectItem
                                                        key={sec}
                                                        value={String(sec)}
                                                    >
                                                        {sec} dtk
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                                {quiz.time_mode === 'total' && (
                                    <div className="flex items-center gap-2 rounded-md bg-blue-50 px-3 py-1.5 text-sm text-blue-700">
                                        <span>
                                            Total waktu: {quiz.duration} menit
                                        </span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <Label className="text-sm">Poin:</Label>
                                    <Input
                                        type="number"
                                        className="w-24"
                                        value={currentQuestion.points}
                                        onChange={(e) =>
                                            updateCurrentQuestion(
                                                'points',
                                                parseInt(e.target.value) || 0,
                                            )
                                        }
                                        min="0"
                                    />
                                </div>
                            </div>

                            {/* Question Input */}
                            {renderQuestionInput()}

                            {/* Media Area */}
                            <div className="relative">
                                {currentQuestion.media_path ? (
                                    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-gray-100">
                                        <img
                                            src={currentQuestion.media_path}
                                            alt="Question media"
                                            className="h-full w-full object-contain"
                                        />
                                        <button
                                            onClick={() =>
                                                updateCurrentQuestion(
                                                    'media_path',
                                                    '',
                                                )
                                            }
                                            className="absolute top-2 right-2 rounded-full bg-red-500 p-2 text-white transition-colors hover:bg-red-600"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <Dialog
                                        open={mediaDialogOpen}
                                        onOpenChange={setMediaDialogOpen}
                                    >
                                        <DialogTrigger asChild>
                                            <button className="flex aspect-video w-full items-center justify-center rounded-xl border-2 border-dashed border-blue-200 bg-blue-100/50 transition-colors hover:bg-blue-100">
                                                <div className="flex flex-col items-center gap-4 text-blue-900/50">
                                                    <div className="rounded-full bg-white p-4 shadow-sm">
                                                        <Plus className="h-8 w-8" />
                                                    </div>
                                                    <span className="font-medium">
                                                        Sisipkan media
                                                    </span>
                                                    <span className="text-sm">
                                                        Klik untuk memilih dari
                                                        galeri atau unggah baru
                                                    </span>
                                                </div>
                                            </button>
                                        </DialogTrigger>
                                        <DialogContent className="max-h-[80vh] max-w-4xl overflow-y-auto">
                                            <DialogHeader>
                                                <DialogTitle>
                                                    Pilih Media
                                                </DialogTitle>
                                            </DialogHeader>
                                            <div className="space-y-4">
                                                {/* Tabs */}
                                                <div className="flex gap-2 border-b">
                                                    <button
                                                        onClick={() =>
                                                            setActiveTab(
                                                                'gallery',
                                                            )
                                                        }
                                                        className={`px-4 py-2 font-medium transition-colors ${
                                                            activeTab ===
                                                            'gallery'
                                                                ? 'border-b-2 border-primary text-primary'
                                                                : 'text-muted-foreground hover:text-foreground'
                                                        }`}
                                                    >
                                                        Galeri
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            setActiveTab(
                                                                'upload',
                                                            )
                                                        }
                                                        className={`px-4 py-2 font-medium transition-colors ${
                                                            activeTab ===
                                                            'upload'
                                                                ? 'border-b-2 border-primary text-primary'
                                                                : 'text-muted-foreground hover:text-foreground'
                                                        }`}
                                                    >
                                                        Upload Baru
                                                    </button>
                                                </div>

                                                {/* Gallery Tab */}
                                                {activeTab === 'gallery' && (
                                                    <div className="grid grid-cols-3 gap-4">
                                                        {galleryList
                                                            .filter(
                                                                (g) =>
                                                                    g.file_type ===
                                                                    'image',
                                                            )
                                                            .map((gallery) => (
                                                                <button
                                                                    key={
                                                                        gallery.id
                                                                    }
                                                                    onClick={() =>
                                                                        handleSelectGalleryItem(
                                                                            gallery,
                                                                        )
                                                                    }
                                                                    className="group relative aspect-video overflow-hidden rounded-lg border-2 border-gray-200 transition-colors hover:border-primary"
                                                                >
                                                                    <img
                                                                        src={
                                                                            gallery.file_path
                                                                        }
                                                                        alt={
                                                                            gallery.title
                                                                        }
                                                                        className="h-full w-full object-cover"
                                                                    />
                                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                                                                        <span className="font-medium text-white">
                                                                            Pilih
                                                                        </span>
                                                                    </div>
                                                                </button>
                                                            ))}
                                                        {galleryList.filter(
                                                            (g) =>
                                                                g.file_type ===
                                                                'image',
                                                        ).length === 0 && (
                                                            <div className="col-span-3 py-12 text-center text-muted-foreground">
                                                                Belum ada gambar
                                                                di galeri
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Upload Tab */}
                                                {activeTab === 'upload' && (
                                                    <div>
                                                        <FileUploader
                                                            onFileSelect={
                                                                handleFileUpload
                                                            }
                                                            accept={{
                                                                'image/*': [],
                                                            }}
                                                            label="Upload Gambar"
                                                            description="Format: JPG, PNG, GIF. Maksimal 10MB."
                                                            maxSize={
                                                                10 * 1024 * 1024
                                                            }
                                                            fileType="image"
                                                        />
                                                        {isUploading && (
                                                            <div className="mt-4 text-center text-muted-foreground">
                                                                Mengunggah...
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                )}
                            </div>

                            {/* Type-specific Editor */}
                            {renderQuestionTypeEditor()}

                            {/* Catatan Telaah Soal Panel - Visible to Editors */}
                            {currentQuestion.catatan_telaah &&
                                currentQuestion.catatan_telaah.length > 0 && (
                                    <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50/50 p-5 dark:border-amber-800 dark:bg-amber-900/10">
                                        <div className="mb-4 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <MessageSquareWarning className="h-5 w-5 text-amber-600" />
                                                <h3 className="text-base font-semibold text-amber-800 dark:text-amber-300">
                                                    Catatan Telaah Soal
                                                </h3>
                                            </div>
                                            <div className="flex gap-2">
                                                {(currentQuestion.catatan_telaah_count ??
                                                    0) > 0 && (
                                                    <Badge
                                                        variant="outline"
                                                        className="border-amber-300 bg-amber-100 text-amber-700"
                                                    >
                                                        {
                                                            currentQuestion.catatan_telaah_count
                                                        }{' '}
                                                        Butuh Review
                                                    </Badge>
                                                )}
                                                {currentQuestion.catatan_telaah.filter(
                                                    (c) =>
                                                        c.status === 'selesai',
                                                ).length > 0 && (
                                                    <Badge
                                                        variant="outline"
                                                        className="border-green-300 bg-green-100 text-green-700"
                                                    >
                                                        <CheckCircle2 className="mr-1 h-3 w-3" />
                                                        {
                                                            currentQuestion.catatan_telaah.filter(
                                                                (c) =>
                                                                    c.status ===
                                                                    'selesai',
                                                            ).length
                                                        }{' '}
                                                        Selesai
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            {currentQuestion.catatan_telaah.map(
                                                (
                                                    catatan: CatatanTelaahSoal,
                                                ) => (
                                                    <div
                                                        key={catatan.id}
                                                        className={`rounded-lg border p-4 transition-all ${
                                                            catatan.status ===
                                                            'butuh_review'
                                                                ? 'border-amber-200 bg-white dark:border-amber-700 dark:bg-gray-900'
                                                                : 'border-green-200 bg-green-50/50 dark:border-green-700 dark:bg-green-900/10'
                                                        }`}
                                                    >
                                                        <div className="mb-2 flex items-start justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700 dark:bg-amber-800 dark:text-amber-300">
                                                                    {catatan.user?.name
                                                                        ?.charAt(
                                                                            0,
                                                                        )
                                                                        ?.toUpperCase() ||
                                                                        '?'}
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-medium">
                                                                        {catatan
                                                                            .user
                                                                            ?.name ||
                                                                            'Penelaah'}
                                                                    </p>
                                                                    <p className="text-[11px] text-muted-foreground">
                                                                        {new Date(
                                                                            catatan.created_at,
                                                                        ).toLocaleDateString(
                                                                            'id-ID',
                                                                            {
                                                                                day: 'numeric',
                                                                                month: 'short',
                                                                                year: 'numeric',
                                                                                hour: '2-digit',
                                                                                minute: '2-digit',
                                                                            },
                                                                        )}
                                                                    </p>
                                                                </div>
                                                            </div>
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
                                                        </div>
                                                        <p className="mb-3 text-sm leading-relaxed whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                                                            {catatan.catatan}
                                                        </p>
                                                        <div className="flex justify-end gap-2">
                                                            {catatan.status ===
                                                            'butuh_review' ? (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="border-green-300 text-green-700 hover:bg-green-50"
                                                                    onClick={() => {
                                                                        router.patch(
                                                                            route(
                                                                                'library.catatan-telaah.resolve',
                                                                                catatan.id,
                                                                            ),
                                                                            {},
                                                                            {
                                                                                preserveScroll: true,
                                                                            },
                                                                        );
                                                                    }}
                                                                >
                                                                    <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                                                                    Tandai
                                                                    Selesai
                                                                </Button>
                                                            ) : (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="border-amber-300 text-amber-700 hover:bg-amber-50"
                                                                    onClick={() => {
                                                                        router.patch(
                                                                            route(
                                                                                'library.catatan-telaah.reopen',
                                                                                catatan.id,
                                                                            ),
                                                                            {},
                                                                            {
                                                                                preserveScroll: true,
                                                                            },
                                                                        );
                                                                    }}
                                                                >
                                                                    Buka Kembali
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                )}
                        </div>
                    </div>
                </div>
            </div>
        </AppSidebarLayout>
    );
}
