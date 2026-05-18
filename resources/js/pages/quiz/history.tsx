import { Button } from '@/components/ui/button';
import { Head, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Award,
    BarChart3,
    Check,
    Clock,
    History,
    Home,
    Medal,
    RotateCcw,
    Star,
    Target,
    Trophy,
    X,
    Zap,
} from 'lucide-react';

interface QuizInfo {
    id: number;
    title: string;
    status: string;
    passing_score: number;
    background: {
        image_path: string;
    } | null;
}

interface AttemptData {
    id: number;
    attempt_number: number;
    is_graded: boolean;
    total_points: number;
    max_points: number;
    score_percentage: number;
    correct_count: number;
    wrong_count: number;
    ungraded_count: number;
    duration_seconds: number | null;
    started_at: string | null;
    completed_at: string | null;
    is_passed: boolean;
    true_false_answers?: Array<{
        question_id: number;
        question_number: number;
        answer_text: string | null;
        answer_explanation: string | null;
        awarded_points: number;
        is_correct: boolean;
    }>;
}

interface Props {
    quiz: QuizInfo;
    attempts: AttemptData[];
    maxPoints: number;
}

function formatDuration(seconds: number | null): string {
    if (!seconds) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
}

function formatDateTime(dateStr: string | null): string {
    if (!dateStr) return '-';
    try {
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return dateStr;
    }
}

function getScoreColor(percentage: number, passingScore: number): string {
    if (percentage >= passingScore) return 'text-emerald-600';
    if (percentage >= passingScore * 0.7) return 'text-amber-600';
    return 'text-red-500';
}

function getScoreGradient(percentage: number, passingScore: number): string {
    if (percentage >= passingScore)
        return 'from-emerald-500/20 to-emerald-500/5';
    if (percentage >= passingScore * 0.7)
        return 'from-amber-500/20 to-amber-500/5';
    return 'from-red-500/20 to-red-500/5';
}

export default function QuizHistory({ quiz, attempts, maxPoints }: Props) {
    const gradedAttempt = attempts.find((a) => a.is_graded);
    const bestAttempt = attempts.reduce(
        (best, a) =>
            a.score_percentage > (best?.score_percentage ?? 0) ? a : best,
        attempts[0],
    );

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
            <Head title={`Riwayat Percobaan - ${quiz.title}`} />

            {/* Glass overlay */}
            <div className="min-h-screen bg-black/20 backdrop-blur-sm">
                <div className="container mx-auto max-w-5xl px-4 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="mb-4 text-white/80 hover:bg-white/10 hover:text-white"
                            onClick={() => router.visit(route('dashboard'))}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali ke Dashboard
                        </Button>

                        <div className="mb-2 flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
                                <History className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white drop-shadow-lg">
                                    Riwayat Percobaan
                                </h1>
                                <p className="text-sm text-white/70">
                                    {quiz.title}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Summary Cards Row */}
                    <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                        {/* Total Attempts */}
                        <div className="rounded-2xl border border-white/20 bg-white/95 p-5 shadow-xl backdrop-blur-md">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100">
                                    <RotateCcw className="h-5 w-5 text-indigo-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">
                                        Total Percobaan
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {attempts.length}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Best Score */}
                        <div className="rounded-2xl border border-white/20 bg-white/95 p-5 shadow-xl backdrop-blur-md">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
                                    <Trophy className="h-5 w-5 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">
                                        Skor Terbaik
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {bestAttempt?.score_percentage ?? 0}%
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Graded Score */}
                        <div className="rounded-2xl border border-white/20 bg-white/95 p-5 shadow-xl backdrop-blur-md">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
                                    <Award className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">
                                        Nilai Resmi
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {gradedAttempt?.score_percentage ?? '-'}
                                        {gradedAttempt && '%'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Info Banner */}
                    <div className="mb-6 rounded-2xl bg-gradient-to-r from-indigo-500/90 to-purple-500/90 p-4 shadow-lg backdrop-blur-md">
                        <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                                <Star className="h-4 w-4 text-white" />
                            </div>
                            <p className="text-sm font-medium text-white">
                                Hanya <strong>percobaan pertama</strong> yang
                                masuk penilaian resmi (Nilai). Percobaan
                                selanjutnya dapat digunakan untuk latihan.
                            </p>
                        </div>
                    </div>

                    {/* Attempt List */}
                    {attempts.length === 0 ? (
                        <div className="rounded-2xl bg-white/95 p-16 text-center shadow-xl backdrop-blur-md">
                            <History className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                            <h3 className="text-lg font-medium text-gray-600">
                                Belum Ada Riwayat
                            </h3>
                            <p className="mt-1 text-sm text-gray-400">
                                Anda belum menyelesaikan percobaan apapun untuk
                                quiz ini.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {attempts.map((attempt, index) => (
                                <div
                                    key={attempt.id}
                                    className={`group relative overflow-hidden rounded-2xl border-2 bg-white/95 shadow-xl backdrop-blur-md transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl ${
                                        attempt.is_graded
                                            ? 'border-emerald-400/60'
                                            : 'border-white/20'
                                    }`}
                                >
                                    {/* Graded ribbon */}
                                    {attempt.is_graded && (
                                        <div className="absolute top-3 right-3 z-10">
                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 px-3 py-1 text-xs font-bold text-white shadow-lg shadow-emerald-500/30">
                                                <Medal className="h-3.5 w-3.5" />
                                                Nilai Resmi
                                            </span>
                                        </div>
                                    )}

                                    {/* Score gradient bar */}
                                    <div
                                        className={`h-1.5 bg-gradient-to-r ${getScoreGradient(attempt.score_percentage, quiz.passing_score)}`}
                                    />

                                    <div className="p-5">
                                        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                                            {/* Left: Attempt info */}
                                            <div className="flex items-center gap-4">
                                                {/* Attempt number circle */}
                                                <div
                                                    className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl text-lg font-bold ${
                                                        attempt.is_graded
                                                            ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                                                            : 'bg-gray-100 text-gray-600'
                                                    }`}
                                                >
                                                    #{attempt.attempt_number}
                                                </div>

                                                <div>
                                                    <h3 className="font-semibold text-gray-900">
                                                        Percobaan ke-
                                                        {attempt.attempt_number}
                                                    </h3>
                                                    <p className="mt-0.5 text-xs text-gray-500">
                                                        {formatDateTime(
                                                            attempt.completed_at,
                                                        )}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Right: Score */}
                                            <div className="flex items-center gap-6">
                                                {/* Stats */}
                                                <div className="hidden items-center gap-4 text-sm sm:flex">
                                                    <div className="flex items-center gap-1.5 text-emerald-600">
                                                        <Check className="h-4 w-4" />
                                                        <span className="font-medium">
                                                            {
                                                                attempt.correct_count
                                                            }
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-red-500">
                                                        <X className="h-4 w-4" />
                                                        <span className="font-medium">
                                                            {
                                                                attempt.wrong_count
                                                            }
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-orange-500">
                                                        <Clock className="h-4 w-4" />
                                                        <span
                                                            className="font-medium"
                                                            title="Belum Dinilai"
                                                        >
                                                            {
                                                                attempt.ungraded_count
                                                            }
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-gray-500">
                                                        <Clock className="h-4 w-4" />
                                                        <span className="font-medium">
                                                            {formatDuration(
                                                                attempt.duration_seconds,
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Score percentage */}
                                                <div className="text-right">
                                                    <div
                                                        className={`text-3xl font-bold ${getScoreColor(attempt.score_percentage, quiz.passing_score)}`}
                                                    >
                                                        {
                                                            attempt.score_percentage
                                                        }
                                                        %
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {attempt.total_points} /{' '}
                                                        {attempt.max_points}{' '}
                                                        poin
                                                    </div>
                                                </div>

                                                {/* Status badge */}
                                                <div className="flex flex-col items-center gap-1">
                                                    {attempt.is_passed ? (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                                            <Trophy className="h-3 w-3" />
                                                            Lulus
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                                                            <Target className="h-3 w-3" />
                                                            Remedial
                                                        </span>
                                                    )}
                                                </div>

                                                {/* View result button */}
                                                <Button
                                                    size="sm"
                                                    variant={
                                                        attempt.is_graded
                                                            ? 'default'
                                                            : 'outline'
                                                    }
                                                    className="h-9"
                                                    onClick={() =>
                                                        router.visit(
                                                            route(
                                                                'quiz.result',
                                                                attempt.id,
                                                            ),
                                                        )
                                                    }
                                                >
                                                    <BarChart3 className="mr-1.5 h-3.5 w-3.5" />
                                                    Detail
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Mobile stats row */}
                                        <div className="mt-3 flex items-center gap-4 border-t border-gray-100 pt-3 text-sm sm:hidden">
                                            <div className="flex items-center gap-1.5 text-emerald-600">
                                                <Check className="h-3.5 w-3.5" />
                                                <span>
                                                    {attempt.correct_count}{' '}
                                                    benar
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-red-500">
                                                <X className="h-3.5 w-3.5" />
                                                <span>
                                                    {attempt.wrong_count} salah
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-orange-500">
                                                <Clock className="h-3.5 w-3.5" />
                                                <span>
                                                    {attempt.ungraded_count}{' '}
                                                    belum dinilai
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-gray-500">
                                                <Clock className="h-3.5 w-3.5" />
                                                <span>
                                                    {formatDuration(
                                                        attempt.duration_seconds,
                                                    )}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Progress bar */}
                                        <div className="mt-3">
                                            <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-700 ${
                                                        attempt.is_passed
                                                            ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                                                            : attempt.score_percentage >=
                                                                quiz.passing_score *
                                                                    0.7
                                                              ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                                                              : 'bg-gradient-to-r from-red-400 to-red-500'
                                                    }`}
                                                    style={{
                                                        width: `${Math.min(attempt.score_percentage, 100)}%`,
                                                    }}
                                                />
                                            </div>
                                            <div className="mt-1 flex justify-between text-[10px] text-gray-400">
                                                <span>0%</span>
                                                <span className="font-medium">
                                                    KKM: {quiz.passing_score}%
                                                </span>
                                                <span>100%</span>
                                            </div>
                                        </div>

                                        {attempt.true_false_answers &&
                                            attempt.true_false_answers.some(
                                                (answer) =>
                                                    answer.answer_explanation,
                                            ) && (
                                                <div className="mt-4 border-t border-gray-100 pt-3">
                                                    <p className="mb-2 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                                                        Keterangan Benar/Salah
                                                    </p>
                                                    <div className="grid gap-2 sm:grid-cols-2">
                                                        {attempt.true_false_answers
                                                            .filter(
                                                                (answer) =>
                                                                    answer.answer_explanation,
                                                            )
                                                            .map((answer) => (
                                                                <div
                                                                    key={
                                                                        answer.question_id
                                                                    }
                                                                    className="rounded-lg bg-gray-50 p-3 text-xs text-gray-700"
                                                                >
                                                                    <div className="mb-1 flex items-center justify-between gap-2">
                                                                        <span className="font-semibold text-gray-900">
                                                                            Soal{' '}
                                                                            {answer.question_number ||
                                                                                '-'}{' '}
                                                                            -{' '}
                                                                            {answer.answer_text ===
                                                                            'true'
                                                                                ? 'Benar'
                                                                                : 'Salah'}
                                                                        </span>
                                                                        <span
                                                                            className={
                                                                                answer.is_correct
                                                                                    ? 'text-emerald-600'
                                                                                    : 'text-red-500'
                                                                            }
                                                                        >
                                                                            {
                                                                                answer.awarded_points
                                                                            }{' '}
                                                                            poin
                                                                        </span>
                                                                    </div>
                                                                    <p className="line-clamp-2 whitespace-pre-wrap text-gray-500">
                                                                        {
                                                                            answer.answer_explanation
                                                                        }
                                                                    </p>
                                                                </div>
                                                            ))}
                                                    </div>
                                                </div>
                                            )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Bottom Action Bar */}
                    <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                        <Button
                            className="bg-white/95 text-gray-900 shadow-xl backdrop-blur-md hover:bg-white"
                            onClick={() => router.visit(route('dashboard'))}
                        >
                            <Home className="mr-2 h-4 w-4" />
                            Kembali ke Dashboard
                        </Button>

                        {quiz.status === 'live' && (
                            <Button
                                className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-xl hover:from-indigo-600 hover:to-purple-600"
                                onClick={() =>
                                    router.visit(route('quiz.start', quiz.id))
                                }
                            >
                                <Zap className="mr-2 h-4 w-4" />
                                Coba Lagi
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
