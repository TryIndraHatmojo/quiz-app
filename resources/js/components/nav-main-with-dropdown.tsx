import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { resolveUrl } from '@/lib/utils';
import { type NavGroup } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import { useState } from 'react';

export function NavMainWithDropdown({ groups = [] }: { groups: NavGroup[] }) {
    const page = usePage();
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

    const toggleGroup = (title: string) => {
        setOpenGroups((prev) => ({ ...prev, [title]: !prev[title] }));
    };

    return (
        <>
            {groups.map((group) => (
                <SidebarGroup key={group.title} className="px-2 py-0">
                    <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
                    <SidebarMenu>
                        {group.items.map((item) =>
                            item.items && item.items.length > 0 ? (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        onClick={() => toggleGroup(item.title)}
                                        tooltip={{ children: item.title }}
                                        className="cursor-pointer"
                                    >
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                        <ChevronRight
                                            className={`ml-auto transition-transform duration-200 ${
                                                openGroups[item.title]
                                                    ? 'rotate-90'
                                                    : ''
                                            }`}
                                        />
                                    </SidebarMenuButton>
                                    {openGroups[item.title] && (
                                        <SidebarMenuSub>
                                            {item.items.map((subItem) => (
                                                <SidebarMenuSubItem
                                                    key={subItem.title}
                                                >
                                                    <SidebarMenuSubButton
                                                        asChild
                                                        isActive={page.url.startsWith(
                                                            resolveUrl(
                                                                subItem.href,
                                                            ),
                                                        )}
                                                    >
                                                        <Link
                                                            href={subItem.href}
                                                            prefetch
                                                        >
                                                            {subItem.icon && (
                                                                <subItem.icon />
                                                            )}
                                                            <span>
                                                                {subItem.title}
                                                            </span>
                                                        </Link>
                                                    </SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                            ))}
                                        </SidebarMenuSub>
                                    )}
                                </SidebarMenuItem>
                            ) : (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={page.url.startsWith(
                                            resolveUrl(item.href),
                                        )}
                                        tooltip={{ children: item.title }}
                                    >
                                        <Link href={item.href} prefetch>
                                            {item.icon && <item.icon />}
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ),
                        )}
                    </SidebarMenu>
                </SidebarGroup>
            ))}
        </>
    );
}
