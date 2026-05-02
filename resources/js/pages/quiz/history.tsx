import { Button } from '@/components/ui/button';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Award,
    BarChart3,
    Check,
    Clock,
    History,
    Home,
    Medal,
    Play,
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
    duration_seconds: number | null;
    started_at: string | null;
    completed_at: string | null;
    is_passed: boolean;
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
    if (percentage >= passingScore) return 'from-emerald-500/20 to-emerald-500/5';
    if (percentage >= passingScore * 0.7) return 'from-amber-500/20 to-amber-500/5';
    return 'from-red-500/20 to-red-500/5';
}

export default function QuizHistory({ quiz, attempts, maxPoints }: Props) {
    const gradedAttempt = attempts.find((a) => a.is_graded);
    const bestAttempt = attempts.reduce(
        (best, a) => (a.score_percentage > (best?.score_percentage ?? 0) ? a : best),
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
            <div className="min-h-screen backdrop-blur-sm bg-black/20">
                <div className="container mx-auto px-4 py-8 max-w-5xl">
                    {/* Header */}
                    <div className="mb-8">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="mb-4 text-white/80 hover:text-white hover:bg-white/10"
                            onClick={() => router.visit(route('dashboard'))}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali ke Dashboard
                        </Button>

                        <div className="flex items-center gap-3 mb-2">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
                                <History className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white drop-shadow-lg">
                                    Riwayat Percobaan
                                </h1>
                                <p className="text-white/70 text-sm">{quiz.title}</p>
                            </div>
                        </div>
                    </div>

                    {/* Summary Cards Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                        {/* Total Attempts */}
                        <div className="rounded-2xl bg-white/95 backdrop-blur-md shadow-xl p-5 border border-white/20">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100">
                                    <RotateCcw className="h-5 w-5 text-indigo-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Total Percobaan
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {attempts.length}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Best Score */}
                        <div className="rounded-2xl bg-white/95 backdrop-blur-md shadow-xl p-5 border border-white/20">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
                                    <Trophy className="h-5 w-5 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Skor Terbaik
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {bestAttempt?.score_percentage ?? 0}%
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Graded Score */}
                        <div className="rounded-2xl bg-white/95 backdrop-blur-md shadow-xl p-5 border border-white/20">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
                                    <Award className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                    <div className="rounded-2xl bg-gradient-to-r from-indigo-500/90 to-purple-500/90 backdrop-blur-md p-4 mb-6 shadow-lg">
                        <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                                <Star className="h-4 w-4 text-white" />
                            </div>
                            <p className="text-white text-sm font-medium">
                                Hanya <strong>percobaan pertama</strong> yang masuk penilaian resmi (Nilai).
                                Percobaan selanjutnya dapat digunakan untuk latihan.
                            </p>
                        </div>
                    </div>

                    {/* Attempt List */}
                    {attempts.length === 0 ? (
                        <div className="rounded-2xl bg-white/95 backdrop-blur-md shadow-xl p-16 text-center">
                            <History className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                            <h3 className="text-lg font-medium text-gray-600">
                                Belum Ada Riwayat
                            </h3>
                            <p className="mt-1 text-sm text-gray-400">
                                Anda belum menyelesaikan percobaan apapun untuk quiz ini.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {attempts.map((attempt, index) => (
                                <div
                                    key={attempt.id}
                                    className={`group relative rounded-2xl bg-white/95 backdrop-blur-md shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.01] border-2 ${
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
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                                                        Percobaan ke-{attempt.attempt_number}
                                                    </h3>
                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                        {formatDateTime(attempt.completed_at)}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Right: Score */}
                                            <div className="flex items-center gap-6">
                                                {/* Stats */}
                                                <div className="hidden sm:flex items-center gap-4 text-sm">
                                                    <div className="flex items-center gap-1.5 text-emerald-600">
                                                        <Check className="h-4 w-4" />
                                                        <span className="font-medium">
                                                            {attempt.correct_count}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-red-500">
                                                        <X className="h-4 w-4" />
                                                        <span className="font-medium">
                                                            {attempt.wrong_count}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-gray-500">
                                                        <Clock className="h-4 w-4" />
                                                        <span className="font-medium">
                                                            {formatDuration(attempt.duration_seconds)}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Score percentage */}
                                                <div className="text-right">
                                                    <div
                                                        className={`text-3xl font-bold ${getScoreColor(attempt.score_percentage, quiz.passing_score)}`}
                                                    >
                                                        {attempt.score_percentage}%
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {attempt.total_points} / {attempt.max_points} poin
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
                                                    variant={attempt.is_graded ? 'default' : 'outline'}
                                                    className="h-9"
                                                    onClick={() =>
                                                        router.visit(
                                                            route('quiz.result', attempt.id),
                                                        )
                                                    }
                                                >
                                                    <BarChart3 className="mr-1.5 h-3.5 w-3.5" />
                                                    Detail
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Mobile stats row */}
                                        <div className="flex sm:hidden items-center gap-4 mt-3 pt-3 border-t border-gray-100 text-sm">
                                            <div className="flex items-center gap-1.5 text-emerald-600">
                                                <Check className="h-3.5 w-3.5" />
                                                <span>{attempt.correct_count} benar</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-red-500">
                                                <X className="h-3.5 w-3.5" />
                                                <span>{attempt.wrong_count} salah</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-gray-500">
                                                <Clock className="h-3.5 w-3.5" />
                                                <span>{formatDuration(attempt.duration_seconds)}</span>
                                            </div>
                                        </div>

                                        {/* Progress bar */}
                                        <div className="mt-3">
                                            <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-700 ${
                                                        attempt.is_passed
                                                            ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                                                            : attempt.score_percentage >= quiz.passing_score * 0.7
                                                              ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                                                              : 'bg-gradient-to-r from-red-400 to-red-500'
                                                    }`}
                                                    style={{ width: `${Math.min(attempt.score_percentage, 100)}%` }}
                                                />
                                            </div>
                                            <div className="flex justify-between mt-1 text-[10px] text-gray-400">
                                                <span>0%</span>
                                                <span className="font-medium">KKM: {quiz.passing_score}%</span>
                                                <span>100%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Bottom Action Bar */}
                    <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                        <Button
                            className="bg-white/95 text-gray-900 hover:bg-white shadow-xl backdrop-blur-md"
                            onClick={() => router.visit(route('dashboard'))}
                        >
                            <Home className="mr-2 h-4 w-4" />
                            Kembali ke Dashboard
                        </Button>

                        {quiz.status === 'live' && (
                            <Button
                                className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-xl hover:from-indigo-600 hover:to-purple-600"
                                onClick={() => router.visit(route('quiz.start', quiz.id))}
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
