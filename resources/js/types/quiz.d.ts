import { QuizBackground } from './index';

export interface QuizQuestionOption {
    id?: number;
    quiz_question_id?: number;
    option_text: string;
    is_correct: boolean;
    order: number;
}

export interface QuizMatchingPair {
    id?: number;
    quiz_question_id?: number;
    left_text: string;
    right_text: string;
    left_media_path?: string | null;
    right_media_path?: string | null;
    order: number;
}

export interface QuizShortAnswerField {
    id?: number;
    quiz_question_id?: number;
    label?: string | null;
    placeholder?: string | null;
    character_limit?: number | null;
    expected_answer: string;
    case_sensitive: boolean;
    trim_whitespace: boolean;
    order: number;
}

export interface QuizQuestion {
    id?: number;
    quiz_id?: number;
    question_type: 'multiple_choice' | 'long_answer' | 'short_answer' | 'matching_pairs' | 'true_false';
    question_text: string;
    media_path?: string | null;
    time_limit: number;
    points: number;
    order: number;
    options: QuizQuestionOption[];
    matching_pairs?: QuizMatchingPair[];
    short_answer_fields?: QuizShortAnswerField[];
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
