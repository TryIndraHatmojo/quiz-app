import { Button } from '@/components/ui/button';
import { Quiz } from '@/types/quiz';
import { Head, router } from '@inertiajs/react';
import {
    BarChart3,
    Check,
    Clock,
    Home,
    RotateCcw,
    Trophy,
    X,
} from 'lucide-react';

interface QuizAttempt {
    id: number;
    quiz_id: number;
    user_id: number;
    started_at: string;
    completed_at: string;
    total_points: number;
    correct_count: number;
    wrong_count: number;
    duration_seconds: number;
    quiz: Quiz;
    answers: QuizAnswer[];
}

interface QuizAnswer {
    id: number;
    quiz_question_id: number;
    is_correct: boolean;
    awarded_points: number;
    answer_text: string | null;
    selected_option?: {
        id: number;
        option_text: string;
        is_correct: boolean;
    } | null;
    matching_pair_answers?: {
        id: number;
        is_correct: boolean;
        awarded_points: number;
        left_pair?: {
            id: number;
            left_text: string;
            right_text: string;
        };
        selected_right_pair?: {
            id: number;
            left_text: string;
            right_text: string;
        };
    }[];
}

interface Props {
    attempt: QuizAttempt;
}

export default function QuizResult({ attempt }: Props) {
    const quiz = attempt.quiz;
    const questions = quiz.questions || [];
    const answers = attempt.answers || [];

    // Calculate total possible points
    const totalPossiblePoints = questions.reduce((sum, q) => sum + q.points, 0);
    const scorePercentage =
        totalPossiblePoints > 0
            ? Math.round((attempt.total_points / totalPossiblePoints) * 100)
            : 0;

    // Format duration
    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        if (mins > 0) {
            return `${mins} menit ${secs} detik`;
        }
        return `${secs} detik`;
    };

    // Get answer for a question
    const getAnswerForQuestion = (questionId: number) => {
        return answers.find((a) => a.quiz_question_id === questionId);
    };

    return (
        <div
            className="min-h-screen"
            style={{
                backgroundImage: quiz.background?.image_path
                    ? `url(${quiz.background.image_path})`
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
            }}
        >
            <Head title={`Hasil - ${quiz.title}`} />

            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="mb-2 text-3xl font-bold text-white drop-shadow-lg md:text-4xl">
                        Quiz Selesai! 🎉
                    </h1>
                    <p className="text-lg text-white/80">{quiz.title}</p>
                </div>

                {/* Score Card */}
                <div className="mx-auto mb-8 max-w-2xl">
                    <div className="overflow-hidden rounded-3xl bg-white shadow-2xl">
                        {/* Score Details */}
                        <div className="p-6">
                            <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                                <div className="rounded-xl bg-green-50 p-4 text-center">
                                    <div className="mb-2 flex items-center justify-center">
                                        <Check className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div className="text-2xl font-bold text-green-600">
                                        {attempt.correct_count}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        Benar
                                    </div>
                                </div>

                                <div className="rounded-xl bg-red-50 p-4 text-center">
                                    <div className="mb-2 flex items-center justify-center">
                                        <X className="h-6 w-6 text-red-600" />
                                    </div>
                                    <div className="text-2xl font-bold text-red-600">
                                        {attempt.wrong_count}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        Salah
                                    </div>
                                </div>

                                <div className="rounded-xl bg-blue-50 p-4 text-center">
                                    <div className="mb-2 flex items-center justify-center">
                                        <Trophy className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div className="text-2xl font-bold text-blue-600">
                                        {attempt.total_points}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        Poin
                                    </div>
                                </div>

                                <div className="rounded-xl bg-purple-50 p-4 text-center">
                                    <div className="mb-2 flex items-center justify-center">
                                        <Clock className="h-6 w-6 text-purple-600" />
                                    </div>
                                    <div className="text-lg font-bold text-purple-600">
                                        {formatDuration(
                                            attempt.duration_seconds,
                                        )}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        Waktu
                                    </div>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-6">
                                <div className="mb-2 flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-600">
                                        Skor Total
                                    </span>
                                    <span className="text-sm font-medium text-gray-600">
                                        {attempt.total_points} /{' '}
                                        {totalPossiblePoints} poin
                                    </span>
                                </div>
                                <div className="h-4 overflow-hidden rounded-full bg-gray-200">
                                    <div
                                        className={`h-full ${
                                            scorePercentage >= 70
                                                ? 'bg-green-500'
                                                : scorePercentage >= 50
                                                  ? 'bg-yellow-500'
                                                  : 'bg-red-500'
                                        } transition-all duration-500`}
                                        style={{ width: `${scorePercentage}%` }}
                                    />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col gap-3 sm:flex-row">
                                <Button
                                    className="flex-1"
                                    onClick={() =>
                                        router.visit(route('dashboard'))
                                    }
                                >
                                    <Home className="mr-2 h-4 w-4" />
                                    Kembali ke Dashboard
                                </Button>
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() =>
                                        router.visit(
                                            route('quiz.start', quiz.id),
                                        )
                                    }
                                >
                                    <RotateCcw className="mr-2 h-4 w-4" />
                                    Coba Lagi
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Answer Review */}
                <div className="mx-auto max-w-4xl">
                    <div className="rounded-2xl bg-white p-6 shadow-xl">
                        <h2 className="mb-6 flex items-center gap-2 text-xl font-bold">
                            <BarChart3 className="h-5 w-5 text-primary" />
                            Ringkasan Jawaban
                        </h2>

                        <div className="space-y-4">
                            {questions.map((question, idx) => {
                                const answer = getAnswerForQuestion(
                                    question.id!,
                                );
                                const isCorrect = answer?.is_correct || false;

                                return (
                                    <div
                                        key={question.id}
                                        className={`rounded-xl border-2 p-4 ${
                                            isCorrect
                                                ? 'border-green-200 bg-green-50'
                                                : 'border-red-200 bg-red-50'
                                        }`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div
                                                className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                                                    isCorrect
                                                        ? 'bg-green-500'
                                                        : 'bg-red-500'
                                                } font-bold text-white`}
                                            >
                                                {isCorrect ? (
                                                    <Check className="h-5 w-5" />
                                                ) : (
                                                    <X className="h-5 w-5" />
                                                )}
                                            </div>

                                            <div className="flex-1">
                                                <div className="mb-2 flex items-center justify-between">
                                                    <span className="text-sm font-medium text-gray-500">
                                                        Pertanyaan {idx + 1}
                                                    </span>
                                                    <span
                                                        className={`text-sm font-bold ${
                                                            isCorrect
                                                                ? 'text-green-600'
                                                                : 'text-red-600'
                                                        }`}
                                                    >
                                                        {answer?.awarded_points ||
                                                            0}{' '}
                                                        / {question.points} poin
                                                    </span>
                                                </div>

                                                <p className="mb-2 font-medium text-gray-800">
                                                    {question.question_text}
                                                </p>

                                                {/* Show answer for multiple choice */}
                                                {question.question_type ===
                                                    'multiple_choice' &&
                                                    answer?.selected_option && (
                                                        <div className="mt-2 space-y-1">
                                                            <p className="text-sm">
                                                                <span className="text-gray-500">
                                                                    Jawaban
                                                                    Anda:{' '}
                                                                </span>
                                                                <span
                                                                    className={
                                                                        isCorrect
                                                                            ? 'text-green-700'
                                                                            : 'text-red-700'
                                                                    }
                                                                >
                                                                    {
                                                                        answer
                                                                            .selected_option
                                                                            .option_text
                                                                    }
                                                                </span>
                                                            </p>
                                                            {!isCorrect && (
                                                                <p className="text-sm">
                                                                    <span className="text-gray-500">
                                                                        Jawaban
                                                                        Benar:{' '}
                                                                    </span>
                                                                    <span className="text-green-700">
                                                                        {
                                                                            question.options.find(
                                                                                (
                                                                                    o,
                                                                                ) =>
                                                                                    o.is_correct,
                                                                            )
                                                                                ?.option_text
                                                                        }
                                                                    </span>
                                                                </p>
                                                            )}
                                                        </div>
                                                    )}

                                                {/* Show answer for true/false */}
                                                {question.question_type ===
                                                    'true_false' &&
                                                    answer?.answer_text && (
                                                        <div className="mt-2 space-y-1">
                                                            <p className="text-sm">
                                                                <span className="text-gray-500">
                                                                    Jawaban
                                                                    Anda:{' '}
                                                                </span>
                                                                <span
                                                                    className={
                                                                        isCorrect
                                                                            ? 'text-green-700'
                                                                            : 'text-red-700'
                                                                    }
                                                                >
                                                                    {answer.answer_text ===
                                                                    'true'
                                                                        ? 'Benar'
                                                                        : 'Salah'}
                                                                </span>
                                                            </p>
                                                            {!isCorrect && (
                                                                <p className="text-sm">
                                                                    <span className="text-gray-500">
                                                                        Jawaban
                                                                        Benar:{' '}
                                                                    </span>
                                                                    <span className="text-green-700">
                                                                        {
                                                                            question.options.find(
                                                                                (
                                                                                    o,
                                                                                ) =>
                                                                                    o.is_correct,
                                                                            )
                                                                                ?.option_text
                                                                        }
                                                                    </span>
                                                                </p>
                                                            )}
                                                        </div>
                                                    )}

                                                {/* Show answer for short/long answer */}
                                                {(question.question_type ===
                                                    'short_answer' ||
                                                    question.question_type ===
                                                        'long_answer') && (
                                                    <div className="mt-2">
                                                        <p className="text-sm">
                                                            <span className="text-gray-500">
                                                                Jawaban
                                                                Anda:{' '}
                                                            </span>
                                                            <span
                                                                className={
                                                                    isCorrect
                                                                        ? 'text-green-700'
                                                                        : 'text-gray-700'
                                                                }
                                                            >
                                                                {question.question_type ===
                                                                    'short_answer' &&
                                                                answer?.answer_text
                                                                    ? answer.answer_text
                                                                          .split(
                                                                              '|||',
                                                                          )
                                                                          .join(
                                                                              ', ',
                                                                          )
                                                                    : answer?.answer_text ||
                                                                      '(tidak dijawab)'}
                                                            </span>
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Show answer for matching pairs */}
                                                {question.question_type ===
                                                    'matching_pairs' &&
                                                    answer?.matching_pair_answers && (
                                                        <div className="mt-4 space-y-2">
                                                            <p className="text-sm font-medium text-gray-700">
                                                                Pasangan yang
                                                                dipilih:
                                                            </p>
                                                            <div className="grid gap-2">
                                                                {answer.matching_pair_answers.map(
                                                                    (mpa) => (
                                                                        <div
                                                                            key={
                                                                                mpa.id
                                                                            }
                                                                            className="flex items-center rounded border border-gray-100 bg-white p-2 text-sm shadow-sm"
                                                                        >
                                                                            <div className="flex-1 border-r pr-4 text-right font-medium text-gray-800">
                                                                                {mpa
                                                                                    .left_pair
                                                                                    ?.left_text ||
                                                                                    '(tidak ada)'}
                                                                            </div>
                                                                            <div className="flex items-center justify-center px-3">
                                                                                {mpa.is_correct ? (
                                                                                    <Check className="h-4 w-4 text-green-500" />
                                                                                ) : (
                                                                                    <X className="h-4 w-4 text-red-500" />
                                                                                )}
                                                                            </div>
                                                                            <div
                                                                                className={`flex-1 pl-4 ${mpa.is_correct ? 'text-green-700' : 'text-red-700'}`}
                                                                            >
                                                                                {mpa
                                                                                    .selected_right_pair
                                                                                    ?.right_text ||
                                                                                    '(tidak dijawab)'}
                                                                                {!mpa.is_correct && (
                                                                                    <div className="mt-1 text-xs text-green-600">
                                                                                        Benar:{' '}
                                                                                        {
                                                                                            mpa
                                                                                                .left_pair
                                                                                                ?.right_text
                                                                                        }
                                                                                    </div>
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
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
