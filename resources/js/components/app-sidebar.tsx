import { NavMainWithDropdown } from '@/components/nav-main-with-dropdown';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavGroup } from '@/types';
import { Link } from '@inertiajs/react';
import {
    BookOpen,
    Database,
    FileImage,
    GraduationCap,
    LayoutGrid,
    Plus,
    Shield,
    Users,
} from 'lucide-react';
import AppLogo from './app-logo';

const mainNavGroups: NavGroup[] = [
    {
        title: 'Platform',
        items: [
            {
                title: 'Dashboard',
                href: dashboard(),
                icon: LayoutGrid,
            },
        ],
    },
    {
        title: 'Koleksi',
        items: [
            {
                title: 'Buat Baru',
                href: '/library/quizzes/create',
                icon: Plus,
            },
            {
                title: 'Semua Kuis',
                href: '/library/quizzes',
                icon: BookOpen,
            },
        ],
    },
    {
        title: 'Data Master',
        items: [
            {
                title: 'Master Data',
                href: '#',
                icon: Database,
                items: [
                    {
                        title: 'Pengguna',
                        href: '/master/users',
                        icon: Users,
                    },
                    {
                        title: 'Peran',
                        href: '/master/roles',
                        icon: Shield,
                    },
                    {
                        title: 'Mata Pelajaran',
                        href: '/master/categories',
                        icon: BookOpen,
                    },
                    {
                        title: 'Jenjang',
                        href: '/master/jenjang',
                        icon: GraduationCap,
                    },
                    {
                        title: 'Kelas',
                        href: '/master/kelas',
                        icon: Users,
                    },
                    {
                        title: 'Backgrounds',
                        href: '/master/backgrounds',
                        icon: LayoutGrid,
                    },
                    {
                        title: 'Galeri',
                        href: '/master/galleries',
                        icon: FileImage,
                    },
                ],
            },
        ],
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMainWithDropdown groups={mainNavGroups} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
