import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Role {
    id: number;
    name: string;
    slug: string;
    description: string;
    created_at: string;
    menus_count?: number;
    menus?: { id: number; title: string }[];
}

export interface QuizCategory {
    id: number;
    name: string;
}

export interface QuizBackground {
    id: number;
    name: string;
    image_path: string;
    is_public: boolean;
    created_at: string;
    user?: User;
}

export interface Kelas {
    id: number;
    jenjang_id: number;
    nama_kelas: string;
    created_at: string;
    updated_at: string;
}

export interface Jenjang {
    id: number;
    jenjang: string;
    nama_sekolah: string;
    created_at: string;
    updated_at: string;
}

export interface Gallery {
    id: number;
    title: string;
    file_path: string;
    file_type: string;
    mime_type: string;
    size: number;
    created_at: string;
    user?: User;
}

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
    items?: NavItem[]; // Support for dropdown children
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    navGroups?: Array<{
        title: string;
        items: Array<{
            title: string;
            href: string;
            icon?: string | null;
            items?: Array<{
                title: string;
                href: string;
                icon?: string | null;
            }>;
        }>;
    }>;
    flash: {
        success: string | null;
        error: string | null;
    };
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    roles?: Role[];
    jenjang?: Jenjang | null;
    jenjang_id?: number | null;
    kelas?: Kelas | null;
    kelas_id?: number | null;
    orang_tua?: User | null;
    orang_tua_id?: number | null;
    [key: string]: unknown; // This allows for additional properties...
}

export interface QuizTeacherAccess {
    id: number;
    quiz_id: number;
    user_id: number;
    permission: 'view' | 'edit' | 'telaah_soal';
    granted_at: string;
    granted_by: number | null;
    user?: User;
    granter?: User;
}

export interface QuizStudentAccess {
    id: number;
    quiz_id: number;
    user_id: number;
    granted_at: string;
    granted_by: number | null;
    accessed_at: string | null;
    attempt_count: number;
    user?: User;
    granter?: User;
}

export interface CatatanTelaahSoal {
    id: number;
    quiz_question_id: number;
    user_id: number;
    catatan: string;
    status: 'butuh_review' | 'selesai';
    created_at: string;
    updated_at: string;
    user?: User;
}
