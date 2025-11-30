import { Button } from '@/components/ui/button';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { BreadcrumbItem } from '@/types';
import { Quiz, QuizQuestion } from '@/types/quiz';
import { Head } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useState } from 'react';

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
        title: 'Preview',
        href: '#',
    },
];

const OPTION_COLORS = [
    { bg: 'bg-red-600', hover: 'hover:bg-red-700', text: 'text-white' },
    { bg: 'bg-blue-600', hover: 'hover:bg-blue-700', text: 'text-white' },
    { bg: 'bg-yellow-500', hover: 'hover:bg-yellow-600', text: 'text-white' },
    { bg: 'bg-green-600', hover: 'hover:bg-green-700', text: 'text-white' },
];

export default function QuizPreview({ quiz }: Props) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const questions = quiz.questions || [];
    const currentQuestion = questions[currentQuestionIndex];
    
    const goToNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const goToPrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    if (!currentQuestion) {
        return (
            <AppSidebarLayout breadcrumbs={breadcrumbs}>
                <Head title={`Preview - ${quiz.title}`} />
                <div className="flex h-screen items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-4">Tidak ada pertanyaan</h2>
                        <p className="text-muted-foreground">Tambahkan pertanyaan terlebih dahulu</p>
                    </div>
                </div>
            </AppSidebarLayout>
        );
    }

    return (
        <div 
            className="min-h-screen flex flex-col"
            style={{
                backgroundImage: quiz.background?.image_path 
                    ? `url(${quiz.background.image_path})` 
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            <Head title={`Preview - ${quiz.title}`} />
            
            {/* Header */}
            <div className="bg-black/30 backdrop-blur-sm p-4 flex items-center justify-between text-white">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/20"
                        onClick={() => window.history.back()}
                    >
                        <X className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold">{quiz.title}</h1>
                        <p className="text-sm text-white/80">{quiz.description}</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-sm text-white/80">Pertanyaan</div>
                    <div className="text-2xl font-bold">
                        {currentQuestionIndex + 1} / {questions.length}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-8">
                <div className="w-full max-w-5xl space-y-8">
                    {/* Question */}
                    <div className="bg-white rounded-2xl p-8 shadow-2xl">
                        <h2 className="text-3xl font-bold text-center mb-6">
                            {currentQuestion.question_text}
                        </h2>
                        
                        {/* Media */}
                        {currentQuestion.media_path && (
                            <div className="mb-6 flex justify-center">
                                <img 
                                    src={currentQuestion.media_path} 
                                    alt="Question media" 
                                    className="max-h-96 rounded-lg shadow-lg object-contain"
                                />
                            </div>
                        )}
                    </div>

                    {/* Answer Options */}
                    <div className="grid grid-cols-2 gap-4">
                        {currentQuestion.options.map((option, index) => (
                            <button
                                key={index}
                                className={`${OPTION_COLORS[index]?.bg} ${OPTION_COLORS[index]?.hover} ${OPTION_COLORS[index]?.text} p-8 rounded-2xl shadow-2xl font-bold text-xl transition-transform hover:scale-105 active:scale-95 relative overflow-hidden`}
                            >
                                <div className="flex items-center justify-center gap-4">
                                    <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-lg bg-white/20 text-2xl">
                                        {['▲', '◆', '●', '■'][index]}
                                    </div>
                                    <span className="flex-1 text-left">{option.option_text}</span>
                                    {option.is_correct && (
                                        <div className="flex-shrink-0 bg-white/30 px-3 py-1 rounded-full text-sm">
                                            ✓ Benar
                                        </div>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between items-center pt-4">
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
                        <div className="flex gap-2">
                            {questions.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentQuestionIndex(idx)}
                                    className={`w-3 h-3 rounded-full transition-all ${
                                        idx === currentQuestionIndex
                                            ? 'bg-white scale-125'
                                            : 'bg-white/50 hover:bg-white/75'
                                    }`}
                                />
                            ))}
                        </div>
                        <Button
                            onClick={goToNext}
                            disabled={currentQuestionIndex === questions.length - 1}
                            variant="secondary"
                            size="lg"
                            className="bg-white/90 hover:bg-white"
                        >
                            Selanjutnya
                            <ChevronRight className="ml-2 h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
