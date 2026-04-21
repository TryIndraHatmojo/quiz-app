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
import { type NavGroup, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import * as LucideIcons from 'lucide-react';
import AppLogo from './app-logo';

export function AppSidebar() {
    const { navGroups } = usePage<SharedData>().props;

    // Convert string icons to Lucide components
    const mappedNavGroups: NavGroup[] = (navGroups || []).map(group => ({
        ...group,
        items: group.items.map(item => ({
            ...item,
            icon: item.icon ? (LucideIcons[item.icon as keyof typeof LucideIcons] as any) : undefined,
            items: item.items?.map(subItem => ({
                ...subItem,
                icon: subItem.icon ? (LucideIcons[subItem.icon as keyof typeof LucideIcons] as any) : undefined,
            }))
        }))
    }));

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
                <NavMainWithDropdown groups={mappedNavGroups} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
