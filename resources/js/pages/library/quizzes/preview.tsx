import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { BreadcrumbItem } from '@/types';
import { Quiz, QuizQuestion, QuizQuestionOption, QuizMatchingPair, QuizShortAnswerField } from '@/types/quiz';
import { Head, Link } from '@inertiajs/react';
import { Check, ChevronLeft, ChevronRight, Clock, X, Timer, FileText, Link2, ToggleLeft, ListChecks, AlignLeft } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

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

// Extended color palette for options
const optionColors = [
    { bg: 'bg-red-600', hover: 'hover:bg-red-700', selected: 'ring-4 ring-red-300', text: 'text-white' },
    { bg: 'bg-blue-600', hover: 'hover:bg-blue-700', selected: 'ring-4 ring-blue-300', text: 'text-white' },
    { bg: 'bg-yellow-500', hover: 'hover:bg-yellow-600', selected: 'ring-4 ring-yellow-300', text: 'text-white' },
    { bg: 'bg-green-600', hover: 'hover:bg-green-700', selected: 'ring-4 ring-green-300', text: 'text-white' },
    { bg: 'bg-purple-600', hover: 'hover:bg-purple-700', selected: 'ring-4 ring-purple-300', text: 'text-white' },
    { bg: 'bg-pink-600', hover: 'hover:bg-pink-700', selected: 'ring-4 ring-pink-300', text: 'text-white' },
    { bg: 'bg-indigo-600', hover: 'hover:bg-indigo-700', selected: 'ring-4 ring-indigo-300', text: 'text-white' },
    { bg: 'bg-teal-600', hover: 'hover:bg-teal-700', selected: 'ring-4 ring-teal-300', text: 'text-white' },
];

const questionTypeLabels: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    multiple_choice: { label: 'Pilihan Ganda', icon: <ListChecks className="h-4 w-4" />, color: 'bg-blue-500' },
    long_answer: { label: 'Jawaban Panjang', icon: <AlignLeft className="h-4 w-4" />, color: 'bg-purple-500' },
    short_answer: { label: 'Isian Singkat', icon: <FileText className="h-4 w-4" />, color: 'bg-orange-500' },
    matching_pairs: { label: 'Mencocokkan', icon: <Link2 className="h-4 w-4" />, color: 'bg-green-500' },
    true_false: { label: 'Benar/Salah', icon: <ToggleLeft className="h-4 w-4" />, color: 'bg-pink-500' },
};

// Answer types for different question types
type Answer = {
    selectedOption?: number | null;
    trueFalseAnswer?: boolean | null;
    matchingAnswers?: Record<number, number | null>;
    shortAnswers?: string[];
    longAnswer?: string;
};

export default function QuizPreview({ quiz }: Props) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, Answer>>({});
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    
    // Matching pairs specific state
    const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
    const [hoveredRight, setHoveredRight] = useState<number | null>(null);
    const [leftRefs] = useState<Record<number, HTMLDivElement | null>>({});
    const [rightRefs] = useState<Record<number, HTMLDivElement | null>>({});
    const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);
    const [shuffledRightOptions, setShuffledRightOptions] = useState<Record<number, Array<{ text: string; originalIndex: number }>>>({});
    const [renderKey, setRenderKey] = useState(0);
    
    const questions = quiz.questions || [];
    const currentQuestion = questions[currentQuestionIndex];
    
    // Initialize shuffled right options for matching pairs questions
    useEffect(() => {
        questions.forEach((question, idx) => {
            if (question.question_type === 'matching_pairs' && !shuffledRightOptions[idx]) {
                const pairs = question.matching_pairs || [];
                const rightOptions = pairs.map((p, i) => ({ text: p.right_text, originalIndex: i }));
                // Fisher-Yates shuffle
                for (let i = rightOptions.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [rightOptions[i], rightOptions[j]] = [rightOptions[j], rightOptions[i]];
                }
                setShuffledRightOptions(prev => ({ ...prev, [idx]: rightOptions }));
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
            setTimeLeft(quiz.duration * 60); // Convert minutes to seconds
        }
    }, [currentQuestionIndex, quiz.time_mode, quiz.duration]);

    // Timer countdown
    useEffect(() => {
        if (timeLeft === null || timeLeft <= 0) return;
        
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev === null || prev <= 0) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

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

    const goToQuestion = (index: number) => {
        setCurrentQuestionIndex(index);
    };

    // Check if a question has been answered
    const isAnswered = useCallback((questionIndex: number): boolean => {
        const answer = answers[questionIndex];
        if (!answer) return false;
        
        const question = questions[questionIndex];
        if (!question) return false;

        switch (question.question_type) {
            case 'multiple_choice':
                return answer.selectedOption !== undefined && answer.selectedOption !== null;
            case 'true_false':
                return answer.trueFalseAnswer !== undefined && answer.trueFalseAnswer !== null;
            case 'matching_pairs':
                if (!answer.matchingAnswers) return false;
                const pairs = question.matching_pairs || [];
                return pairs.every((_, idx) => answer.matchingAnswers?.[idx] !== undefined && answer.matchingAnswers?.[idx] !== null);
            case 'short_answer':
                if (!answer.shortAnswers) return false;
                const fields = question.short_answer_fields || [];
                return fields.length > 0 && fields.every((_, idx) => answer.shortAnswers?.[idx]?.trim());
            case 'long_answer':
                return !!answer.longAnswer?.trim();
            default:
                return false;
        }
    }, [answers, questions]);

    // Update answer for current question
    const updateAnswer = (update: Partial<Answer>) => {
        setAnswers(prev => ({
            ...prev,
            [currentQuestionIndex]: {
                ...prev[currentQuestionIndex],
                ...update,
            }
        }));
        // Force re-render of SVG
        setRenderKey(prev => prev + 1);
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
                className="min-h-screen flex flex-col items-center justify-center"
                style={{
                    backgroundImage: quiz.background?.image_path 
                        ? `url(${quiz.background.image_path})` 
                        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <Head title={`Preview - ${quiz.title}`} />
                <div className="bg-white rounded-2xl p-12 shadow-2xl text-center">
                    <h2 className="text-2xl font-bold mb-4">Tidak ada pertanyaan</h2>
                    <p className="text-muted-foreground mb-6">Tambahkan pertanyaan terlebih dahulu</p>
                    <Button asChild>
                        <Link href={route('library.quizzes.questions', quiz.id)}>
                            Tambah Pertanyaan
                        </Link>
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
                            onClick={() => updateAnswer({ selectedOption: index })}
                            className={`${color.bg} ${color.hover} ${color.text} ${isSelected ? color.selected : ''} p-6 rounded-2xl shadow-xl font-bold text-lg transition-all hover:scale-102 active:scale-98 relative overflow-hidden`}
                        >
                            <div className="flex items-center justify-center gap-4">
                                <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-white/20 text-xl">
                                    {['▲', '◆', '●', '■', '★', '♦', '♠', '♣'][index % 8]}
                                </div>
                                <span className="flex-1 text-left">{option.option_text}</span>
                                {isSelected && (
                                    <div className="flex-shrink-0 bg-white/30 p-2 rounded-full">
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
                    className={`flex items-center justify-center gap-4 rounded-2xl p-12 transition-all shadow-xl ${
                        currentAnswer.trueFalseAnswer === true
                            ? 'bg-green-500 text-white ring-4 ring-green-300 scale-105'
                            : 'bg-white text-gray-700 hover:bg-green-50 hover:ring-2 hover:ring-green-300'
                    }`}
                >
                    <Check className="h-12 w-12" />
                    <span className="text-3xl font-bold">Benar</span>
                </button>
                <button
                    onClick={() => updateAnswer({ trueFalseAnswer: false })}
                    className={`flex items-center justify-center gap-4 rounded-2xl p-12 transition-all shadow-xl ${
                        currentAnswer.trueFalseAnswer === false
                            ? 'bg-red-500 text-white ring-4 ring-red-300 scale-105'
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
        
        // Get shuffled right options for current question
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
                const rightOriginalIndex = shuffledRight[rightShuffledIndex].originalIndex;
                
                const newAnswers = { ...matchingAnswers };
                
                // Check if this left is already connected
                const currentConnection = newAnswers[selectedLeft];
                
                // Check if this right is already connected to another left
                const existingLeftForThisRight = Object.entries(newAnswers).find(
                    ([, val]) => val === rightOriginalIndex
                )?.[0];
                
                // If clicking the same connection, remove it
                if (currentConnection === rightOriginalIndex) {
                    delete newAnswers[selectedLeft];
                } else {
                    // Remove the old connection from this left (if any)
                    if (currentConnection !== undefined) {
                        delete newAnswers[selectedLeft];
                    }
                    
                    // Remove the old connection to this right (if any)
                    if (existingLeftForThisRight !== undefined) {
                        delete newAnswers[parseInt(existingLeftForThisRight)];
                    }
                    
                    // Create new connection
                    newAnswers[selectedLeft] = rightOriginalIndex;
                }
                
                updateAnswer({ matchingAnswers: newAnswers });
                setSelectedLeft(null);
            }
        };

        const getLineCoordinates = (leftIndex: number, rightOriginalIndex: number) => {
            if (!containerRef || !leftRefs[leftIndex] || !rightRefs[rightOriginalIndex]) {
                return null;
            }

            const containerRect = containerRef.getBoundingClientRect();
            const leftRect = leftRefs[leftIndex]!.getBoundingClientRect();
            const rightRect = rightRefs[rightOriginalIndex]!.getBoundingClientRect();

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
            return Object.entries(matchingAnswers).find(([, val]) => val === rightOriginalIndex)?.[0];
        };

        return (
            <div className="bg-white rounded-2xl p-8 shadow-xl">
                <div className="text-center mb-6">
                    <p className="text-sm text-gray-600">
                        Klik pada soal di sebelah kiri, lalu klik pasangannya di sebelah kanan
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        Setiap soal hanya bisa dipasangkan dengan satu jawaban, dan setiap jawaban hanya bisa digunakan sekali
                    </p>
                </div>
                <div ref={setContainerRef} className="relative grid grid-cols-2 gap-12">
                    {/* SVG for lines */}
                    {containerRef && (
                        <svg 
                            key={renderKey}
                            className="absolute inset-0 pointer-events-none" 
                            style={{ 
                                zIndex: 0,
                                width: '100%',
                                height: '100%',
                                overflow: 'visible'
                            }}
                        >
                            {/* Draw existing connections */}
                            {Object.entries(matchingAnswers).map(([leftIdx, rightOrigIdx]) => {
                                const coords = getLineCoordinates(parseInt(leftIdx), rightOrigIdx as number);
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
                            })}
                            
                            {/* Draw preview line when hovering */}
                            {selectedLeft !== null && hoveredRight !== null && (
                                (() => {
                                    const coords = getLineCoordinates(selectedLeft, hoveredRight);
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
                                })()
                            )}
                        </svg>
                    )}

                    {/* Left side - Questions */}
                    <div className="space-y-4" style={{ zIndex: 1 }}>
                        <h3 className="font-bold text-lg text-center mb-4 text-gray-700">Soal</h3>
                        {pairs.map((pair, idx) => {
                            const isSelected = selectedLeft === idx;
                            const isConnected = matchingAnswers[idx] !== undefined;
                            return (
                                <div
                                    key={idx}
                                    ref={(el) => { leftRefs[idx] = el; }}
                                    onClick={() => handleLeftClick(idx)}
                                    className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all ${
                                        isSelected
                                            ? 'bg-blue-500 text-white ring-4 ring-blue-300 scale-105'
                                            : isConnected
                                            ? 'bg-green-50 border-2 border-green-500 hover:bg-green-100'
                                            : 'bg-gray-50 border-2 border-gray-200 hover:bg-gray-100 hover:border-blue-300'
                                    }`}
                                >
                                    <span className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full font-bold ${
                                        isSelected
                                            ? 'bg-white text-blue-500'
                                            : isConnected
                                            ? 'bg-green-500 text-white'
                                            : 'bg-blue-500 text-white'
                                    }`}>
                                        {idx + 1}
                                    </span>
                                    <span className="font-medium flex-1">{pair.left_text}</span>
                                    {isConnected && !isSelected && (
                                        <span className="text-green-600 text-sm">✓</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Right side - Answers (shuffled) */}
                    <div className="space-y-4" style={{ zIndex: 1 }}>
                        <h3 className="font-bold text-lg text-center mb-4 text-gray-700">Pasangan</h3>
                        {shuffledRight.map((item, shuffledIdx) => {
                            const isConnected = isRightConnected(item.originalIndex);
                            const connectedLeftIdx = getConnectedLeftIndex(item.originalIndex);
                            const isHovered = hoveredRight === item.originalIndex;
                            
                            return (
                                <div
                                    key={shuffledIdx}
                                    ref={(el) => { rightRefs[item.originalIndex] = el; }}
                                    onClick={() => handleRightClick(shuffledIdx)}
                                    onMouseEnter={() => selectedLeft !== null && setHoveredRight(item.originalIndex)}
                                    onMouseLeave={() => setHoveredRight(null)}
                                    className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all ${
                                        isHovered && selectedLeft !== null
                                            ? 'bg-blue-100 border-2 border-blue-400 scale-105'
                                            : isConnected
                                            ? 'bg-green-50 border-2 border-green-500 hover:bg-green-100'
                                            : 'bg-gray-50 border-2 border-gray-200 hover:bg-gray-100 hover:border-green-300'
                                    }`}
                                >
                                    <span className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full font-bold ${
                                        isConnected
                                            ? 'bg-green-500 text-white'
                                            : 'bg-gray-400 text-white'
                                    }`}>
                                        {String.fromCharCode(65 + shuffledIdx)}
                                    </span>
                                    <span className="font-medium flex-1">{item.text}</span>
                                    {isConnected && connectedLeftIdx && (
                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">
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
        
        // Parse question text for blanks
        const parts = currentQuestion.question_text.split('___');
        
        return (
            <div className="bg-white rounded-2xl p-8 shadow-xl space-y-6">
                {/* Question with inline blanks */}
                <div className="text-2xl font-medium leading-relaxed flex flex-wrap items-center gap-2">
                    {parts.map((part, idx) => (
                        <span key={idx} className="inline-flex items-center">
                            <span>{part}</span>
                            {idx < parts.length - 1 && (
                                <Input
                                    value={shortAnswers[idx] || ''}
                                    onChange={(e) => {
                                        const newAnswers = [...shortAnswers];
                                        newAnswers[idx] = e.target.value;
                                        updateAnswer({ shortAnswers: newAnswers });
                                    }}
                                    placeholder={`Isian ${idx + 1}`}
                                    className="inline-block w-40 mx-2 text-lg border-b-2 border-t-0 border-l-0 border-r-0 border-orange-400 rounded-none bg-orange-50 text-center focus-visible:ring-0 focus-visible:border-orange-500"
                                />
                            )}
                        </span>
                    ))}
                </div>

                {/* Answer summary */}
                {fields.length > 0 && (
                    <div className="border-t pt-4 mt-4">
                        <p className="text-sm text-gray-500 mb-2">Jawaban Anda:</p>
                        <div className="flex flex-wrap gap-2">
                            {fields.map((_, idx) => (
                                <span 
                                    key={idx} 
                                    className={`px-3 py-1 rounded-full text-sm font-medium ${
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
            <div className="bg-white rounded-2xl p-8 shadow-xl">
                <Textarea
                    value={currentAnswer.longAnswer || ''}
                    onChange={(e) => updateAnswer({ longAnswer: e.target.value })}
                    placeholder={field?.placeholder || 'Tulis jawaban Anda di sini...'}
                    className="min-h-[200px] text-lg resize-none border-2 focus-visible:ring-0 focus-visible:border-purple-500"
                    maxLength={field?.character_limit || undefined}
                />
                {field?.character_limit && (
                    <p className="text-sm text-gray-500 mt-2 text-right">
                        {(currentAnswer.longAnswer || '').length} / {field.character_limit} karakter
                    </p>
                )}
            </div>
        );
    };

    const answeredCount = questions.filter((_, idx) => isAnswered(idx)).length;

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
            <div className="bg-black/40 backdrop-blur-sm p-4 flex items-center justify-between text-white">
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
                        <div className="flex items-center gap-2 text-sm text-white/80">
                            <span className={`flex items-center gap-1 px-2 py-0.5 rounded ${questionTypeLabels[currentQuestion.question_type]?.color || 'bg-gray-500'}`}>
                                {questionTypeLabels[currentQuestion.question_type]?.icon}
                                {questionTypeLabels[currentQuestion.question_type]?.label}
                            </span>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-6">
                    {/* Progress */}
                    <div className="text-center">
                        <div className="text-sm text-white/80">Dijawab</div>
                        <div className="text-xl font-bold">{answeredCount} / {questions.length}</div>
                    </div>
                    
                    {/* Timer */}
                    {timeLeft !== null && (
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
                            timeLeft <= 10 ? 'bg-red-500/80 animate-pulse' : 'bg-white/20'
                        }`}>
                            {quiz.time_mode === 'per_question' ? (
                                <Timer className="h-5 w-5" />
                            ) : (
                                <Clock className="h-5 w-5" />
                            )}
                            <span className="text-2xl font-bold font-mono">
                                {formatTime(timeLeft)}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Question Number Navigation */}
            <div className="bg-black/20 backdrop-blur-sm px-4 py-3">
                <div className="flex items-center justify-center gap-2 flex-wrap">
                    {questions.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => goToQuestion(idx)}
                            className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${getQuestionButtonColor(idx)}`}
                        >
                            {idx + 1}
                        </button>
                    ))}
                </div>
                <div className="flex justify-center mt-2 gap-4 text-xs text-white/70">
                    <span className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded bg-blue-600"></span> Aktif
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded bg-green-500"></span> Dijawab
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded bg-gray-300"></span> Belum Dijawab
                    </span>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-8">
                <div className="w-full max-w-5xl space-y-6">
                    {/* Question */}
                    <div className="bg-white rounded-2xl p-8 shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-medium text-gray-500">
                                Pertanyaan {currentQuestionIndex + 1} dari {questions.length}
                            </span>
                            <span className="text-sm font-bold text-primary">
                                {currentQuestion.points} poin
                            </span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-center">
                            {currentQuestion.question_type === 'short_answer' 
                                ? 'Lengkapi kalimat berikut:'
                                : currentQuestion.question_text
                            }
                        </h2>
                        
                        {/* Media */}
                        {currentQuestion.media_path && (
                            <div className="mt-6 flex justify-center">
                                <img 
                                    src={currentQuestion.media_path} 
                                    alt="Question media" 
                                    className="max-h-80 rounded-xl shadow-lg object-contain"
                                />
                            </div>
                        )}
                    </div>

                    {/* Answer Area */}
                    {renderQuestionContent()}

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
                        
                        <div className="text-white text-center">
                            <span className="text-lg font-bold">
                                {currentQuestionIndex + 1} / {questions.length}
                            </span>
                        </div>

                        {currentQuestionIndex === questions.length - 1 ? (
                            <Button
                                size="lg"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => {
                                    alert(`Preview selesai!\nDijawab: ${answeredCount} dari ${questions.length} pertanyaan`);
                                }}
                            >
                                <Check className="mr-2 h-5 w-5" />
                                Selesai
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
