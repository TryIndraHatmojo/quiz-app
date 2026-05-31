import { CatatanTelaahSoal, QuizBackground, User } from './index';

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
    question_type:
        | 'multiple_choice'
        | 'long_answer'
        | 'short_answer'
        | 'matching_pairs'
        | 'true_false';
    question_text: string;
    media_path?: string | null;
    explanation?: string | null;
    points: number;
    order: number;
    options: QuizQuestionOption[];
    matching_pairs?: QuizMatchingPair[];
    short_answer_fields?: QuizShortAnswerField[];
    catatan_telaah?: CatatanTelaahSoal[];
    catatan_telaah_count?: number;
}

export interface Quiz {
    id: number;
    title: string;
    description: string;
    quiz_category_id: number;
    status: string;
    audience?: 'regular' | 'guest';
    duration: number | null;
    starts_at?: string | null;
    ends_at?: string | null;
    passing_score?: number;
    jenjang_id?: number | null;
    kelas_id?: number | null;
    quiz_background_id?: number | null;
    user?: User | null;
    background?: QuizBackground;
    questions?: QuizQuestion[];
}
