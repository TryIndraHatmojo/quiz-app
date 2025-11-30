import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Role {
    id: number;
    name: string;
    slug: string;
    description: string;
    created_at: string;
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
    [key: string]: unknown; // This allows for additional properties...
}
