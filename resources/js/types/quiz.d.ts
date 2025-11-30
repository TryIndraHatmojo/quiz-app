import { QuizBackground } from './index';

export interface QuizQuestionOption {
    id?: number;
    quiz_question_id?: number;
    option_text: string;
    is_correct: boolean;
    order: number;
}

export interface QuizQuestion {
    id?: number;
    quiz_id?: number;
    question_type: 'multiple_choice' | 'true_false' | 'short_answer';
    question_text: string;
    media_path?: string | null;
    time_limit: number;
    points: number;
    order: number;
    options: QuizQuestionOption[];
}

export interface Quiz {
    id: number;
    title: string;
    description: string;
    quiz_category_id: number;
    status: string;
    quiz_background_id?: number | null;
    background?: QuizBackground;
    questions?: QuizQuestion[];
}
