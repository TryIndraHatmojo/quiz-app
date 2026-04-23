import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Quiz } from '@/types/quiz';
import { Head, router } from '@inertiajs/react';
import {
    AlignLeft,
    Check,
    ChevronLeft,
    ChevronRight,
    Clock,
    FileText,
    Link2,
    ListChecks,
    Send,
    Timer,
    ToggleLeft,
    X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface QuizAttempt {
    id: number;
    quiz_id: number;
    user_id: number;
    started_at: string;
    completed_at: string | null;
    total_points: number;
    correct_count: number;
    wrong_count: number;
    duration_seconds: number | null;
}

interface ExistingAnswer {
    id: number;
    quiz_question_id: number;
    quiz_question_option_id: number | null;
    quiz_matching_pair_id: number | null;
    answer_text: string | null;
    matching_pair_answers?: Array<{
        left_quiz_matching_pair_id: number | null;
        selected_right_quiz_matching_pair_id: number | null;
    }>;
}

interface Props {
    quiz: Quiz;
    attempt: QuizAttempt;
    existingAnswers: Record<number, ExistingAnswer>;
}

// Extended color palette for options
const optionColors = [
    {
        bg: 'bg-red-600',
        hover: 'hover:bg-red-700',
        selected: 'ring-4 ring-red-300',
        text: 'text-white',
    },
    {
        bg: 'bg-blue-600',
        hover: 'hover:bg-blue-700',
        selected: 'ring-4 ring-blue-300',
        text: 'text-white',
    },
    {
        bg: 'bg-yellow-500',
        hover: 'hover:bg-yellow-600',
        selected: 'ring-4 ring-yellow-300',
        text: 'text-white',
    },
    {
        bg: 'bg-green-600',
        hover: 'hover:bg-green-700',
        selected: 'ring-4 ring-green-300',
        text: 'text-white',
    },
    {
        bg: 'bg-purple-600',
        hover: 'hover:bg-purple-700',
        selected: 'ring-4 ring-purple-300',
        text: 'text-white',
    },
    {
        bg: 'bg-pink-600',
        hover: 'hover:bg-pink-700',
        selected: 'ring-4 ring-pink-300',
        text: 'text-white',
    },
    {
        bg: 'bg-indigo-600',
        hover: 'hover:bg-indigo-700',
        selected: 'ring-4 ring-indigo-300',
        text: 'text-white',
    },
    {
        bg: 'bg-teal-600',
        hover: 'hover:bg-teal-700',
        selected: 'ring-4 ring-teal-300',
        text: 'text-white',
    },
];

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

// Answer types for different question types
type Answer = {
    selectedOption?: number | null;
    trueFalseAnswer?: boolean | null;
    matchingAnswers?: Record<number, number | null>;
    shortAnswers?: string[];
    longAnswer?: string;
};

// Fisher-Yates shuffle utility
function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

export default function QuizAttemptPage({
    quiz,
    attempt,
    existingAnswers,
}: Props) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, Answer>>({});
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Matching pairs specific state
    const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
    const [hoveredRight, setHoveredRight] = useState<number | null>(null);
    const [leftRefs] = useState<Record<number, HTMLDivElement | null>>({});
    const [rightRefs] = useState<Record<number, HTMLDivElement | null>>({});
    const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(
        null,
    );
    const [shuffledRightOptions, setShuffledRightOptions] = useState<
        Record<number, Array<{ text: string; originalIndex: number }>>
    >({});
    const [renderKey, setRenderKey] = useState(0);

    // Shuffle questions order and multiple choice options on mount
    const questions = useMemo(() => {
        const rawQuestions = quiz.questions || [];
        // Shuffle the questions order
        const shuffledQuestions = shuffleArray(rawQuestions);
        // Shuffle options for multiple choice and matching pairs questions
        return shuffledQuestions.map((q) => {
            if (q.question_type === 'multiple_choice' && q.options?.length > 0) {
                return { ...q, options: shuffleArray(q.options) };
            }
            if (q.question_type === 'matching_pairs' && q.matching_pairs?.length) {
                return { ...q, matching_pairs: shuffleArray(q.matching_pairs) };
            }
            return q;
        });
    }, [quiz.questions]);
    const currentQuestion = questions[currentQuestionIndex];

    // Initialize answers from existing answers
    useEffect(() => {
        if (Object.keys(existingAnswers).length > 0) {
            const initialAnswers: Record<number, Answer> = {};
            questions.forEach((question, idx) => {
                const existing = existingAnswers[question.id || 0];
                if (existing) {
                    switch (question.question_type) {
                        case 'multiple_choice':
                            const optionIndex = question.options.findIndex(
                                (o) =>
                                    o.id === existing.quiz_question_option_id,
                            );
                            if (optionIndex >= 0) {
                                initialAnswers[idx] = {
                                    selectedOption: optionIndex,
                                };
                            }
                            break;
                        case 'true_false':
                            if (existing.answer_text !== null) {
                                initialAnswers[idx] = {
                                    trueFalseAnswer:
                                        existing.answer_text === 'true',
                                };
                            }
                            break;
                        case 'short_answer':
                            if (existing.answer_text) {
                                initialAnswers[idx] = {
                                    shortAnswers:
                                        existing.answer_text.split('|||'),
                                };
                            }
                            break;
                        case 'long_answer':
                            if (existing.answer_text) {
                                initialAnswers[idx] = {
                                    longAnswer: existing.answer_text,
                                };
                            }
                            break;
                        case 'matching_pairs':
                            if (existing.matching_pair_answers?.length) {
                                const matchingAnswers: Record<
                                    number,
                                    number | null
                                > = {};

                                existing.matching_pair_answers.forEach(
                                    (row) => {
                                        if (
                                            !row.left_quiz_matching_pair_id ||
                                            !row.selected_right_quiz_matching_pair_id
                                        ) {
                                            return;
                                        }

                                        const leftIndex =
                                            question.matching_pairs?.findIndex(
                                                (pair) =>
                                                    pair.id ===
                                                    row.left_quiz_matching_pair_id,
                                            );

                                        const rightIndex =
                                            question.matching_pairs?.findIndex(
                                                (pair) =>
                                                    pair.id ===
                                                    row.selected_right_quiz_matching_pair_id,
                                            );

                                        if (
                                            leftIndex !== undefined &&
                                            rightIndex !== undefined &&
                                            leftIndex >= 0 &&
                                            rightIndex >= 0
                                        ) {
                                            matchingAnswers[leftIndex] =
                                                rightIndex;
                                        }
                                    },
                                );

                                initialAnswers[idx] = { matchingAnswers };
                            }
                            break;
                    }
                }
            });
            setAnswers(initialAnswers);
        }
    }, [existingAnswers, questions]);

    // Initialize shuffled right options for matching pairs questions
    useEffect(() => {
        questions.forEach((question, idx) => {
            if (
                question.question_type === 'matching_pairs' &&
                !shuffledRightOptions[idx]
            ) {
                const pairs = question.matching_pairs || [];
                const rightOptions = pairs.map((p, i) => ({
                    text: p.right_text,
                    originalIndex: i,
                }));
                // Fisher-Yates shuffle
                for (let i = rightOptions.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [rightOptions[i], rightOptions[j]] = [
                        rightOptions[j],
                        rightOptions[i],
                    ];
                }
                setShuffledRightOptions((prev) => ({
                    ...prev,
                    [idx]: rightOptions,
                }));
            }
        });
    }, [questions, shuffledRightOptions]);

    // Reset matching pairs selection when changing questions
    useEffect(() => {
        setSelectedLeft(null);
        setHoveredRight(null);
    }, [currentQuestionIndex]);

    // Initialize timer based on quiz time_mode
    useEffect(() => {
        if (quiz.time_mode === 'per_question' && quiz.duration) {
            setTimeLeft(quiz.duration);
        } else if (quiz.time_mode === 'total' && quiz.duration) {
            // For total time, calculate remaining time based on started_at
            const startedAt = new Date(attempt.started_at);
            const elapsedSeconds = Math.floor(
                (Date.now() - startedAt.getTime()) / 1000,
            );
            const remainingSeconds = Math.max(
                0,
                quiz.duration * 60 - elapsedSeconds,
            );
            setTimeLeft(remainingSeconds);
        }
    }, [
        currentQuestionIndex,
        quiz.time_mode,
        quiz.duration,
        attempt.started_at,
    ]);

    // Timer countdown
    useEffect(() => {
        if (timeLeft === null || timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev === null || prev <= 0) {
                    clearInterval(timer);
                    // Auto-submit if time runs out for total time mode
                    if (quiz.time_mode === 'total') {
                        handleSubmit();
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, quiz.time_mode]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const goToNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            saveCurrentAnswer();
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const goToPrevious = () => {
        if (currentQuestionIndex > 0) {
            saveCurrentAnswer();
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const goToQuestion = (index: number) => {
        saveCurrentAnswer();
        setCurrentQuestionIndex(index);
    };

    // Save answer to server
    const saveCurrentAnswer = async (): Promise<boolean> => {
        const currentAnswer = answers[currentQuestionIndex];
        if (!currentAnswer || !currentQuestion) return true;

        setIsSaving(true);

        const answerData: {
            quiz_question_id: number;
            quiz_question_option_id?: number | null;
            quiz_matching_pair_id?: number | null;
            answer_text?: string | null;
            matching_answers?: Array<{
                left_quiz_matching_pair_id: number;
                selected_right_quiz_matching_pair_id: number;
            }>;
        } = {
            quiz_question_id: currentQuestion.id!,
        };

        switch (currentQuestion.question_type) {
            case 'multiple_choice':
                if (
                    currentAnswer.selectedOption !== null &&
                    currentAnswer.selectedOption !== undefined
                ) {
                    const option =
                        currentQuestion.options[currentAnswer.selectedOption];
                    answerData.quiz_question_option_id = option?.id || null;
                }
                break;
            case 'true_false':
                if (
                    currentAnswer.trueFalseAnswer !== null &&
                    currentAnswer.trueFalseAnswer !== undefined
                ) {
                    const option = currentQuestion.options.find(
                        (o) =>
                            (currentAnswer.trueFalseAnswer &&
                                o.option_text === 'Benar') ||
                            (!currentAnswer.trueFalseAnswer &&
                                o.option_text === 'Salah'),
                    );
                    answerData.quiz_question_option_id = option?.id || null;
                    answerData.answer_text =
                        currentAnswer.trueFalseAnswer.toString();
                }
                break;
            case 'short_answer':
                if (currentAnswer.shortAnswers) {
                    answerData.answer_text =
                        currentAnswer.shortAnswers.join('|||');
                }
                break;
            case 'long_answer':
                if (currentAnswer.longAnswer) {
                    answerData.answer_text = currentAnswer.longAnswer;
                }
                break;
            case 'matching_pairs':
                if (currentAnswer.matchingAnswers) {
                    const pairs = currentQuestion.matching_pairs || [];
                    const matchingAnswers = Object.entries(
                        currentAnswer.matchingAnswers,
                    )
                        .map(([leftIndex, rightIndex]) => {
                            if (
                                rightIndex === null ||
                                rightIndex === undefined
                            ) {
                                return null;
                            }

                            const leftPair = pairs[Number(leftIndex)];
                            const rightPair = pairs[Number(rightIndex)];

                            if (!leftPair?.id || !rightPair?.id) {
                                return null;
                            }

                            return {
                                left_quiz_matching_pair_id: leftPair.id,
                                selected_right_quiz_matching_pair_id:
                                    rightPair.id,
                            };
                        })
                        .filter(
                            (
                                row,
                            ): row is {
                                left_quiz_matching_pair_id: number;
                                selected_right_quiz_matching_pair_id: number;
                            } => row !== null,
                        );

                    if (matchingAnswers.length > 0) {
                        answerData.matching_answers = matchingAnswers;
                    }
                }
                break;
        }

        try {
            // Gunakan cookie XSRF-TOKEN yang otomatis diperbarui oleh Laravel
            // Ini mencegah error CSRF token mismatch jika meta tag kadaluarsa setelah login
            const xsrfCookie = document.cookie
                .split('; ')
                .find((row) => row.startsWith('XSRF-TOKEN='))
                ?.split('=')[1];

            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            };

            if (xsrfCookie) {
                headers['X-XSRF-TOKEN'] = decodeURIComponent(xsrfCookie);
            } else {
                const metaToken = document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute('content');
                if (metaToken) {
                    headers['X-CSRF-TOKEN'] = metaToken;
                } else {
                    console.error(
                        'Failed to save answer: CSRF token not found',
                    );
                    return false;
                }
            }

            const response = await fetch(route('quiz.answer', attempt.id), {
                method: 'POST',
                credentials: 'same-origin',
                headers,
                body: JSON.stringify(answerData),
            });

            if (!response.ok) {
                const errorBody = await response.text();
                console.error('Failed to save answer: HTTP error', {
                    status: response.status,
                    statusText: response.statusText,
                    body: errorBody,
                });
                return false;
            }

            return true;
        } catch (error) {
            console.error('Failed to save answer:', error);
            return false;
        } finally {
            setIsSaving(false);
        }
    };

    // Check if a question has been answered
    const isAnswered = useCallback(
        (questionIndex: number): boolean => {
            const answer = answers[questionIndex];
            if (!answer) return false;

            const question = questions[questionIndex];
            if (!question) return false;

            switch (question.question_type) {
                case 'multiple_choice':
                    return (
                        answer.selectedOption !== undefined &&
                        answer.selectedOption !== null
                    );
                case 'true_false':
                    return (
                        answer.trueFalseAnswer !== undefined &&
                        answer.trueFalseAnswer !== null
                    );
                case 'matching_pairs':
                    if (!answer.matchingAnswers) return false;
                    const pairs = question.matching_pairs || [];
                    return pairs.every(
                        (_, idx) =>
                            answer.matchingAnswers?.[idx] !== undefined &&
                            answer.matchingAnswers?.[idx] !== null,
                    );
                case 'short_answer':
                    if (!answer.shortAnswers) return false;
                    const fields = question.short_answer_fields || [];
                    return (
                        fields.length > 0 &&
                        fields.every((_, idx) =>
                            answer.shortAnswers?.[idx]?.trim(),
                        )
                    );
                case 'long_answer':
                    return !!answer.longAnswer?.trim();
                default:
                    return false;
            }
        },
        [answers, questions],
    );

    // Update answer for current question
    const updateAnswer = (update: Partial<Answer>) => {
        setAnswers((prev) => ({
            ...prev,
            [currentQuestionIndex]: {
                ...prev[currentQuestionIndex],
                ...update,
            },
        }));
        // Force re-render of SVG
        setRenderKey((prev) => prev + 1);
    };

    // Submit quiz
    const handleSubmit = async () => {
        if (isSubmitting) return;

        const answeredCount = questions.filter((_, idx) =>
            isAnswered(idx),
        ).length;
        const unansweredCount = questions.length - answeredCount;

        if (unansweredCount > 0) {
            const confirmed = confirm(
                `Anda masih memiliki ${unansweredCount} pertanyaan yang belum dijawab. Yakin ingin menyelesaikan quiz?`,
            );
            if (!confirmed) return;
        }

        setIsSubmitting(true);

        // Save current answer first
        const saved = await saveCurrentAnswer();
        if (!saved) {
            alert(
                'Jawaban gagal disimpan. Periksa koneksi/CSRF lalu coba submit lagi.',
            );
            setIsSubmitting(false);
            return;
        }

        // Complete the attempt
        router.post(
            route('quiz.complete', attempt.id),
            {},
            {
                onError: (errors) => {
                    console.error('Failed to complete quiz:', errors);
                    setIsSubmitting(false);
                },
            },
        );
    };

    // Get question number button color
    const getQuestionButtonColor = (index: number): string => {
        if (index === currentQuestionIndex) {
            return 'bg-blue-600 text-white ring-2 ring-blue-300 scale-110';
        }
        if (isAnswered(index)) {
            return 'bg-green-500 text-white hover:bg-green-600';
        }
        return 'bg-gray-300 text-gray-700 hover:bg-gray-400';
    };

    if (!currentQuestion) {
        return (
            <div
                className="flex min-h-screen flex-col items-center justify-center"
                style={{
                    backgroundImage: quiz.background?.image_path
                        ? `url(${quiz.background.image_path})`
                        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <Head title={`${quiz.title}`} />
                <div className="rounded-2xl bg-white p-12 text-center shadow-2xl">
                    <h2 className="mb-4 text-2xl font-bold">
                        Tidak ada pertanyaan
                    </h2>
                    <p className="mb-6 text-muted-foreground">
                        Quiz ini belum memiliki pertanyaan
                    </p>
                    <Button onClick={() => router.visit(route('dashboard'))}>
                        Kembali ke Dashboard
                    </Button>
                </div>
            </div>
        );
    }

    const renderQuestionContent = () => {
        const currentAnswer = answers[currentQuestionIndex] || {};

        switch (currentQuestion.question_type) {
            case 'multiple_choice':
                return renderMultipleChoice(currentAnswer);
            case 'true_false':
                return renderTrueFalse(currentAnswer);
            case 'matching_pairs':
                return renderMatchingPairs(currentAnswer);
            case 'short_answer':
                return renderShortAnswer(currentAnswer);
            case 'long_answer':
                return renderLongAnswer(currentAnswer);
            default:
                return null;
        }
    };

    const renderMultipleChoice = (currentAnswer: Answer) => {
        const options = currentQuestion.options || [];
        return (
            <div className="grid grid-cols-2 gap-4">
                {options.map((option, index) => {
                    const isSelected = currentAnswer.selectedOption === index;
                    const color = optionColors[index % optionColors.length];
                    return (
                        <button
                            key={index}
                            onClick={() =>
                                updateAnswer({ selectedOption: index })
                            }
                            className={`${color.bg} ${color.hover} ${color.text} ${isSelected ? color.selected : ''} relative overflow-hidden rounded-2xl p-6 text-lg font-bold shadow-xl transition-all hover:scale-102 active:scale-98`}
                        >
                            <div className="flex items-center justify-center gap-4">
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-white/20 text-xl">
                                    {
                                        [
                                            '▲',
                                            '◆',
                                            '●',
                                            '■',
                                            '★',
                                            '♦',
                                            '♠',
                                            '♣',
                                        ][index % 8]
                                    }
                                </div>
                                <span className="flex-1 text-left">
                                    {option.option_text}
                                </span>
                                {isSelected && (
                                    <div className="flex-shrink-0 rounded-full bg-white/30 p-2">
                                        <Check className="h-5 w-5" />
                                    </div>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
        );
    };

    const renderTrueFalse = (currentAnswer: Answer) => {
        return (
            <div className="grid grid-cols-2 gap-6">
                <button
                    onClick={() => updateAnswer({ trueFalseAnswer: true })}
                    className={`flex items-center justify-center gap-4 rounded-2xl p-12 shadow-xl transition-all ${
                        currentAnswer.trueFalseAnswer === true
                            ? 'scale-105 bg-green-500 text-white ring-4 ring-green-300'
                            : 'bg-white text-gray-700 hover:bg-green-50 hover:ring-2 hover:ring-green-300'
                    }`}
                >
                    <Check className="h-12 w-12" />
                    <span className="text-3xl font-bold">Benar</span>
                </button>
                <button
                    onClick={() => updateAnswer({ trueFalseAnswer: false })}
                    className={`flex items-center justify-center gap-4 rounded-2xl p-12 shadow-xl transition-all ${
                        currentAnswer.trueFalseAnswer === false
                            ? 'scale-105 bg-red-500 text-white ring-4 ring-red-300'
                            : 'bg-white text-gray-700 hover:bg-red-50 hover:ring-2 hover:ring-red-300'
                    }`}
                >
                    <X className="h-12 w-12" />
                    <span className="text-3xl font-bold">Salah</span>
                </button>
            </div>
        );
    };

    const renderMatchingPairs = (currentAnswer: Answer) => {
        const pairs = currentQuestion.matching_pairs || [];
        const matchingAnswers = currentAnswer.matchingAnswers || {};
        const shuffledRight = shuffledRightOptions[currentQuestionIndex] || [];

        const handleLeftClick = (leftIndex: number) => {
            if (selectedLeft === leftIndex) {
                setSelectedLeft(null);
            } else {
                setSelectedLeft(leftIndex);
            }
        };

        const handleRightClick = (rightShuffledIndex: number) => {
            if (selectedLeft !== null) {
                const rightOriginalIndex =
                    shuffledRight[rightShuffledIndex].originalIndex;
                const newAnswers = { ...matchingAnswers };
                const currentConnection = newAnswers[selectedLeft];
                const existingLeftForThisRight = Object.entries(
                    newAnswers,
                ).find(([, val]) => val === rightOriginalIndex)?.[0];

                if (currentConnection === rightOriginalIndex) {
                    delete newAnswers[selectedLeft];
                } else {
                    if (currentConnection !== undefined) {
                        delete newAnswers[selectedLeft];
                    }
                    if (existingLeftForThisRight !== undefined) {
                        delete newAnswers[parseInt(existingLeftForThisRight)];
                    }
                    newAnswers[selectedLeft] = rightOriginalIndex;
                }

                updateAnswer({ matchingAnswers: newAnswers });
                setSelectedLeft(null);
            }
        };

        const getLineCoordinates = (
            leftIndex: number,
            rightOriginalIndex: number,
        ) => {
            if (
                !containerRef ||
                !leftRefs[leftIndex] ||
                !rightRefs[rightOriginalIndex]
            ) {
                return null;
            }
            const containerRect = containerRef.getBoundingClientRect();
            const leftRect = leftRefs[leftIndex]!.getBoundingClientRect();
            const rightRect =
                rightRefs[rightOriginalIndex]!.getBoundingClientRect();
            return {
                x1: leftRect.right - containerRect.left,
                y1: leftRect.top + leftRect.height / 2 - containerRect.top,
                x2: rightRect.left - containerRect.left,
                y2: rightRect.top + rightRect.height / 2 - containerRect.top,
            };
        };

        const isRightConnected = (rightOriginalIndex: number) => {
            return Object.values(matchingAnswers).includes(rightOriginalIndex);
        };

        const getConnectedLeftIndex = (rightOriginalIndex: number) => {
            return Object.entries(matchingAnswers).find(
                ([, val]) => val === rightOriginalIndex,
            )?.[0];
        };

        return (
            <div className="rounded-2xl bg-white p-8 shadow-xl">
                <div className="mb-6 text-center">
                    <p className="text-sm text-gray-600">
                        Klik pada soal di sebelah kiri, lalu klik pasangannya di
                        sebelah kanan
                    </p>
                </div>
                <div
                    ref={setContainerRef}
                    className="relative grid grid-cols-2 gap-12"
                >
                    {containerRef && (
                        <svg
                            key={renderKey}
                            className="pointer-events-none absolute inset-0"
                            style={{
                                zIndex: 0,
                                width: '100%',
                                height: '100%',
                                overflow: 'visible',
                            }}
                        >
                            {Object.entries(matchingAnswers).map(
                                ([leftIdx, rightOrigIdx]) => {
                                    const coords = getLineCoordinates(
                                        parseInt(leftIdx),
                                        rightOrigIdx as number,
                                    );
                                    if (!coords) return null;
                                    return (
                                        <line
                                            key={`${leftIdx}-${rightOrigIdx}`}
                                            x1={coords.x1}
                                            y1={coords.y1}
                                            x2={coords.x2}
                                            y2={coords.y2}
                                            stroke="#10b981"
                                            strokeWidth="3"
                                            strokeLinecap="round"
                                        />
                                    );
                                },
                            )}
                            {selectedLeft !== null &&
                                hoveredRight !== null &&
                                (() => {
                                    const coords = getLineCoordinates(
                                        selectedLeft,
                                        hoveredRight,
                                    );
                                    if (!coords) return null;
                                    return (
                                        <line
                                            x1={coords.x1}
                                            y1={coords.y1}
                                            x2={coords.x2}
                                            y2={coords.y2}
                                            stroke="#3b82f6"
                                            strokeWidth="2"
                                            strokeDasharray="5,5"
                                            strokeLinecap="round"
                                            opacity="0.6"
                                        />
                                    );
                                })()}
                        </svg>
                    )}

                    <div className="space-y-4" style={{ zIndex: 1 }}>
                        <h3 className="mb-4 text-center text-lg font-bold text-gray-700">
                            Soal
                        </h3>
                        {pairs.map((pair, idx) => {
                            const isSelected = selectedLeft === idx;
                            const isConnected =
                                matchingAnswers[idx] !== undefined;
                            return (
                                <div
                                    key={idx}
                                    ref={(el) => {
                                        leftRefs[idx] = el;
                                    }}
                                    onClick={() => handleLeftClick(idx)}
                                    className={`flex cursor-pointer items-center gap-3 rounded-xl p-4 transition-all ${
                                        isSelected
                                            ? 'scale-105 bg-blue-500 text-white ring-4 ring-blue-300'
                                            : isConnected
                                              ? 'border-2 border-green-500 bg-green-50 hover:bg-green-100'
                                              : 'border-2 border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-gray-100'
                                    }`}
                                >
                                    <span
                                        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full font-bold ${
                                            isSelected
                                                ? 'bg-white text-blue-500'
                                                : isConnected
                                                  ? 'bg-green-500 text-white'
                                                  : 'bg-blue-500 text-white'
                                        }`}
                                    >
                                        {idx + 1}
                                    </span>
                                    <span className="flex-1 font-medium">
                                        {pair.left_text}
                                    </span>
                                    {isConnected && !isSelected && (
                                        <span className="text-sm text-green-600">
                                            ✓
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="space-y-4" style={{ zIndex: 1 }}>
                        <h3 className="mb-4 text-center text-lg font-bold text-gray-700">
                            Pasangan
                        </h3>
                        {shuffledRight.map((item, shuffledIdx) => {
                            const isConnected = isRightConnected(
                                item.originalIndex,
                            );
                            const connectedLeftIdx = getConnectedLeftIndex(
                                item.originalIndex,
                            );
                            const isHovered =
                                hoveredRight === item.originalIndex;

                            return (
                                <div
                                    key={shuffledIdx}
                                    ref={(el) => {
                                        rightRefs[item.originalIndex] = el;
                                    }}
                                    onClick={() =>
                                        handleRightClick(shuffledIdx)
                                    }
                                    onMouseEnter={() =>
                                        selectedLeft !== null &&
                                        setHoveredRight(item.originalIndex)
                                    }
                                    onMouseLeave={() => setHoveredRight(null)}
                                    className={`flex cursor-pointer items-center gap-3 rounded-xl p-4 transition-all ${
                                        isHovered && selectedLeft !== null
                                            ? 'scale-105 border-2 border-blue-400 bg-blue-100'
                                            : isConnected
                                              ? 'border-2 border-green-500 bg-green-50 hover:bg-green-100'
                                              : 'border-2 border-gray-200 bg-gray-50 hover:border-green-300 hover:bg-gray-100'
                                    }`}
                                >
                                    <span
                                        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full font-bold ${
                                            isConnected
                                                ? 'bg-green-500 text-white'
                                                : 'bg-gray-400 text-white'
                                        }`}
                                    >
                                        {String.fromCharCode(65 + shuffledIdx)}
                                    </span>
                                    <span className="flex-1 font-medium">
                                        {item.text}
                                    </span>
                                    {isConnected && connectedLeftIdx && (
                                        <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-bold text-green-700">
                                            {parseInt(connectedLeftIdx) + 1}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };

    const renderShortAnswer = (currentAnswer: Answer) => {
        const fields = currentQuestion.short_answer_fields || [];
        const shortAnswers = currentAnswer.shortAnswers || [];
        const parts = currentQuestion.question_text.split('___');

        return (
            <div className="space-y-6 rounded-2xl bg-white p-8 shadow-xl">
                <div className="flex flex-wrap items-center gap-2 text-2xl leading-relaxed font-medium">
                    {parts.map((part, idx) => (
                        <span key={idx} className="inline-flex items-center">
                            <span>{part}</span>
                            {idx < parts.length - 1 && (
                                <Input
                                    value={shortAnswers[idx] || ''}
                                    onChange={(e) => {
                                        const newAnswers = [...shortAnswers];
                                        newAnswers[idx] = e.target.value;
                                        updateAnswer({
                                            shortAnswers: newAnswers,
                                        });
                                    }}
                                    placeholder={`Isian ${idx + 1}`}
                                    className="mx-2 inline-block w-40 rounded-none border-t-0 border-r-0 border-b-2 border-l-0 border-orange-400 bg-orange-50 text-center text-lg focus-visible:border-orange-500 focus-visible:ring-0"
                                />
                            )}
                        </span>
                    ))}
                </div>

                {fields.length > 0 && (
                    <div className="mt-4 border-t pt-4">
                        <p className="mb-2 text-sm text-gray-500">
                            Jawaban Anda:
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {fields.map((_, idx) => (
                                <span
                                    key={idx}
                                    className={`rounded-full px-3 py-1 text-sm font-medium ${
                                        shortAnswers[idx]?.trim()
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-gray-100 text-gray-500'
                                    }`}
                                >
                                    {idx + 1}: {shortAnswers[idx] || '(kosong)'}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderLongAnswer = (currentAnswer: Answer) => {
        const field = currentQuestion.short_answer_fields?.[0];
        return (
            <div className="rounded-2xl bg-white p-8 shadow-xl">
                <Textarea
                    value={currentAnswer.longAnswer || ''}
                    onChange={(e) =>
                        updateAnswer({ longAnswer: e.target.value })
                    }
                    placeholder={
                        field?.placeholder || 'Tulis jawaban Anda di sini...'
                    }
                    className="min-h-[200px] resize-none border-2 text-lg focus-visible:border-purple-500 focus-visible:ring-0"
                    maxLength={field?.character_limit || undefined}
                />
                {field?.character_limit && (
                    <p className="mt-2 text-right text-sm text-gray-500">
                        {(currentAnswer.longAnswer || '').length} /{' '}
                        {field.character_limit} karakter
                    </p>
                )}
            </div>
        );
    };

    const answeredCount = questions.filter((_, idx) => isAnswered(idx)).length;

    return (
        <div
            className="flex min-h-screen flex-col"
            style={{
                backgroundImage: quiz.background?.image_path
                    ? `url(${quiz.background.image_path})`
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            <Head title={`${quiz.title}`} />

            {/* Header */}
            <div className="flex items-center justify-between bg-black/40 p-4 text-white backdrop-blur-sm">
                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-xl font-bold">{quiz.title}</h1>
                        <div className="flex items-center gap-2 text-sm text-white/80">
                            <span
                                className={`flex items-center gap-1 rounded px-2 py-0.5 ${questionTypeLabels[currentQuestion.question_type]?.color || 'bg-gray-500'}`}
                            >
                                {
                                    questionTypeLabels[
                                        currentQuestion.question_type
                                    ]?.icon
                                }
                                {
                                    questionTypeLabels[
                                        currentQuestion.question_type
                                    ]?.label
                                }
                            </span>
                            {isSaving && (
                                <span className="text-xs text-yellow-300">
                                    Menyimpan...
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    {/* Progress */}
                    <div className="text-center">
                        <div className="text-sm text-white/80">Dijawab</div>
                        <div className="text-xl font-bold">
                            {answeredCount} / {questions.length}
                        </div>
                    </div>

                    {/* Timer */}
                    {timeLeft !== null && (
                        <div
                            className={`flex items-center gap-2 rounded-xl px-4 py-2 ${
                                timeLeft <= 60
                                    ? 'animate-pulse bg-red-500/80'
                                    : 'bg-white/20'
                            }`}
                        >
                            {quiz.time_mode === 'per_question' ? (
                                <Timer className="h-5 w-5" />
                            ) : (
                                <Clock className="h-5 w-5" />
                            )}
                            <span className="font-mono text-2xl font-bold">
                                {formatTime(timeLeft)}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Question Number Navigation */}
            <div className="bg-black/20 px-4 py-3 backdrop-blur-sm">
                <div className="flex flex-wrap items-center justify-center gap-2">
                    {questions.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => goToQuestion(idx)}
                            className={`h-10 w-10 rounded-lg text-sm font-bold transition-all ${getQuestionButtonColor(idx)}`}
                        >
                            {idx + 1}
                        </button>
                    ))}
                </div>
                <div className="mt-2 flex justify-center gap-4 text-xs text-white/70">
                    <span className="flex items-center gap-1">
                        <span className="h-3 w-3 rounded bg-blue-600"></span>{' '}
                        Aktif
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="h-3 w-3 rounded bg-green-500"></span>{' '}
                        Dijawab
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="h-3 w-3 rounded bg-gray-300"></span>{' '}
                        Belum Dijawab
                    </span>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex flex-1 flex-col items-center justify-center p-8">
                <div className="w-full max-w-5xl space-y-6">
                    {/* Question */}
                    <div className="rounded-2xl bg-white p-8 shadow-2xl">
                        <div className="mb-4 flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-500">
                                Pertanyaan {currentQuestionIndex + 1} dari{' '}
                                {questions.length}
                            </span>
                            <span className="text-sm font-bold text-primary">
                                {currentQuestion.points} poin
                            </span>
                        </div>
                        <h2 className="text-center text-2xl font-bold md:text-3xl">
                            {currentQuestion.question_type === 'short_answer'
                                ? 'Lengkapi kalimat berikut:'
                                : currentQuestion.question_text}
                        </h2>

                        {/* Media */}
                        {currentQuestion.media_path && (
                            <div className="mt-6 flex justify-center">
                                <img
                                    src={currentQuestion.media_path}
                                    alt="Question media"
                                    className="max-h-80 rounded-xl object-contain shadow-lg"
                                />
                            </div>
                        )}
                    </div>

                    {/* Answer Area */}
                    {renderQuestionContent()}

                    {/* Navigation */}
                    <div className="flex items-center justify-between pt-4">
                        <Button
                            onClick={goToPrevious}
                            disabled={currentQuestionIndex === 0}
                            variant="secondary"
                            size="lg"
                            className="bg-white/90 hover:bg-white"
                        >
                            <ChevronLeft className="mr-2 h-5 w-5" />
                            Sebelumnya
                        </Button>

                        <div className="text-center text-white">
                            <span className="text-lg font-bold">
                                {currentQuestionIndex + 1} / {questions.length}
                            </span>
                        </div>

                        {currentQuestionIndex === questions.length - 1 ? (
                            <Button
                                size="lg"
                                className="bg-green-600 text-white hover:bg-green-700"
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                            >
                                <Send className="mr-2 h-5 w-5" />
                                {isSubmitting
                                    ? 'Mengirim...'
                                    : 'Selesai & Kirim'}
                            </Button>
                        ) : (
                            <Button
                                onClick={goToNext}
                                variant="secondary"
                                size="lg"
                                className="bg-white/90 hover:bg-white"
                            >
                                Selanjutnya
                                <ChevronRight className="ml-2 h-5 w-5" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
