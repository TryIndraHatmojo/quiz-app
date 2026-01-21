import { Button } from '@/components/ui/button';
import { Quiz, QuizQuestion } from '@/types/quiz';
import { Head, Link, router } from '@inertiajs/react';
import { Check, X, Trophy, Clock, Target, BarChart3, Home, RotateCcw } from 'lucide-react';

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
    const scorePercentage = totalPossiblePoints > 0 
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
    
    // Get grade based on percentage
    const getGrade = (percentage: number) => {
        if (percentage >= 90) return { grade: 'A', color: 'text-green-600', bgColor: 'bg-green-100' };
        if (percentage >= 80) return { grade: 'B', color: 'text-blue-600', bgColor: 'bg-blue-100' };
        if (percentage >= 70) return { grade: 'C', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
        if (percentage >= 60) return { grade: 'D', color: 'text-orange-600', bgColor: 'bg-orange-100' };
        return { grade: 'E', color: 'text-red-600', bgColor: 'bg-red-100' };
    };
    
    const gradeInfo = getGrade(scorePercentage);
    
    // Get answer for a question
    const getAnswerForQuestion = (questionId: number) => {
        return answers.find(a => a.quiz_question_id === questionId);
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
                <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">
                        Quiz Selesai! 🎉
                    </h1>
                    <p className="text-white/80 text-lg">{quiz.title}</p>
                </div>
                
                {/* Score Card */}
                <div className="max-w-2xl mx-auto mb-8">
                    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                        {/* Grade Display */}
                        <div className={`${gradeInfo.bgColor} py-8 text-center`}>
                            <div className={`text-8xl font-bold ${gradeInfo.color} mb-2`}>
                                {gradeInfo.grade}
                            </div>
                            <div className="text-2xl font-semibold text-gray-700">
                                {scorePercentage}%
                            </div>
                        </div>
                        
                        {/* Score Details */}
                        <div className="p-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <div className="text-center p-4 rounded-xl bg-green-50">
                                    <div className="flex items-center justify-center mb-2">
                                        <Check className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div className="text-2xl font-bold text-green-600">
                                        {attempt.correct_count}
                                    </div>
                                    <div className="text-sm text-gray-500">Benar</div>
                                </div>
                                
                                <div className="text-center p-4 rounded-xl bg-red-50">
                                    <div className="flex items-center justify-center mb-2">
                                        <X className="h-6 w-6 text-red-600" />
                                    </div>
                                    <div className="text-2xl font-bold text-red-600">
                                        {attempt.wrong_count}
                                    </div>
                                    <div className="text-sm text-gray-500">Salah</div>
                                </div>
                                
                                <div className="text-center p-4 rounded-xl bg-blue-50">
                                    <div className="flex items-center justify-center mb-2">
                                        <Trophy className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div className="text-2xl font-bold text-blue-600">
                                        {attempt.total_points}
                                    </div>
                                    <div className="text-sm text-gray-500">Poin</div>
                                </div>
                                
                                <div className="text-center p-4 rounded-xl bg-purple-50">
                                    <div className="flex items-center justify-center mb-2">
                                        <Clock className="h-6 w-6 text-purple-600" />
                                    </div>
                                    <div className="text-lg font-bold text-purple-600">
                                        {formatDuration(attempt.duration_seconds)}
                                    </div>
                                    <div className="text-sm text-gray-500">Waktu</div>
                                </div>
                            </div>
                            
                            {/* Progress Bar */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-600">Skor Total</span>
                                    <span className="text-sm font-medium text-gray-600">
                                        {attempt.total_points} / {totalPossiblePoints} poin
                                    </span>
                                </div>
                                <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full ${
                                            scorePercentage >= 70 ? 'bg-green-500' :
                                            scorePercentage >= 50 ? 'bg-yellow-500' :
                                            'bg-red-500'
                                        } transition-all duration-500`}
                                        style={{ width: `${scorePercentage}%` }}
                                    />
                                </div>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Button 
                                    className="flex-1" 
                                    onClick={() => router.visit(route('dashboard'))}
                                >
                                    <Home className="mr-2 h-4 w-4" />
                                    Kembali ke Dashboard
                                </Button>
                                <Button 
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => router.visit(route('quiz.start', quiz.id))}
                                >
                                    <RotateCcw className="mr-2 h-4 w-4" />
                                    Coba Lagi
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Answer Review */}
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-xl p-6">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-primary" />
                            Ringkasan Jawaban
                        </h2>
                        
                        <div className="space-y-4">
                            {questions.map((question, idx) => {
                                const answer = getAnswerForQuestion(question.id!);
                                const isCorrect = answer?.is_correct || false;
                                
                                return (
                                    <div 
                                        key={question.id}
                                        className={`p-4 rounded-xl border-2 ${
                                            isCorrect 
                                                ? 'border-green-200 bg-green-50' 
                                                : 'border-red-200 bg-red-50'
                                        }`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                                                isCorrect ? 'bg-green-500' : 'bg-red-500'
                                            } text-white font-bold`}>
                                                {isCorrect ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
                                            </div>
                                            
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-medium text-gray-500">
                                                        Pertanyaan {idx + 1}
                                                    </span>
                                                    <span className={`text-sm font-bold ${
                                                        isCorrect ? 'text-green-600' : 'text-red-600'
                                                    }`}>
                                                        {answer?.awarded_points || 0} / {question.points} poin
                                                    </span>
                                                </div>
                                                
                                                <p className="font-medium text-gray-800 mb-2">
                                                    {question.question_text}
                                                </p>
                                                
                                                {/* Show answer for multiple choice */}
                                                {question.question_type === 'multiple_choice' && answer?.selected_option && (
                                                    <div className="mt-2 space-y-1">
                                                        <p className="text-sm">
                                                            <span className="text-gray-500">Jawaban Anda: </span>
                                                            <span className={isCorrect ? 'text-green-700' : 'text-red-700'}>
                                                                {answer.selected_option.option_text}
                                                            </span>
                                                        </p>
                                                        {!isCorrect && (
                                                            <p className="text-sm">
                                                                <span className="text-gray-500">Jawaban Benar: </span>
                                                                <span className="text-green-700">
                                                                    {question.options.find(o => o.is_correct)?.option_text}
                                                                </span>
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                                
                                                {/* Show answer for true/false */}
                                                {question.question_type === 'true_false' && answer?.answer_text && (
                                                    <div className="mt-2 space-y-1">
                                                        <p className="text-sm">
                                                            <span className="text-gray-500">Jawaban Anda: </span>
                                                            <span className={isCorrect ? 'text-green-700' : 'text-red-700'}>
                                                                {answer.answer_text === 'true' ? 'Benar' : 'Salah'}
                                                            </span>
                                                        </p>
                                                        {!isCorrect && (
                                                            <p className="text-sm">
                                                                <span className="text-gray-500">Jawaban Benar: </span>
                                                                <span className="text-green-700">
                                                                    {question.options.find(o => o.is_correct)?.option_text}
                                                                </span>
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                                
                                                {/* Show answer for short/long answer */}
                                                {(question.question_type === 'short_answer' || question.question_type === 'long_answer') && (
                                                    <div className="mt-2">
                                                        <p className="text-sm">
                                                            <span className="text-gray-500">Jawaban Anda: </span>
                                                            <span className={isCorrect ? 'text-green-700' : 'text-gray-700'}>
                                                                {answer?.answer_text || '(tidak dijawab)'}
                                                            </span>
                                                        </p>
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
