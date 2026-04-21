import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { FormEventHandler } from 'react';

interface Menu {
    id: number;
    group_name: string | null;
    title: string;
    url: string | null;
    route_name: string | null;
    parent_id: number | null;
    icon: string | null;
}

interface Role {
    id: number;
    name: string;
}

interface Props {
    role: Role;
    menus: Menu[];
    assignedMenuIds: number[];
}

export default function RoleAccess({ role, menus, assignedMenuIds }: Props) {
    const { data, setData, post, processing } = useForm({
        menu_ids: assignedMenuIds,
    });

    // Group menus by group_name
    const groupedMenus = menus.reduce((acc, menu) => {
        const group = menu.group_name || 'Others';
        if (!acc[group]) {
            acc[group] = [];
        }
        acc[group].push(menu);
        return acc;
    }, {} as Record<string, Menu[]>);

    const handleCheckboxChange = (menuId: number, checked: boolean | 'indeterminate') => {
        if (checked === true) {
            setData('menu_ids', [...data.menu_ids, menuId]);
        } else {
            setData('menu_ids', data.menu_ids.filter((id) => id !== menuId));
        }
    };

    const handleSelectAllGroup = (groupMenus: Menu[], checked: boolean | 'indeterminate') => {
        if (checked === true) {
            const newIds = [...data.menu_ids];
            groupMenus.forEach(menu => {
                if (!newIds.includes(menu.id)) newIds.push(menu.id);
            });
            setData('menu_ids', newIds);
        } else {
            const groupIds = groupMenus.map(m => m.id);
            setData('menu_ids', data.menu_ids.filter(id => !groupIds.includes(id)));
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('master.roles.access.update', role.id));
    };

    return (
        <AppShell>
            <Head title={`Hak Akses: ${role.name}`} />

            <div className="p-4 sm:p-8 flex flex-col gap-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href={route('master.roles.index')}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Atur Hak Akses</h1>
                        <p className="text-muted-foreground">
                            Peran: <span className="font-semibold text-foreground">{role.name}</span>
                        </p>
                    </div>
                </div>

                <form onSubmit={submit}>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {Object.entries(groupedMenus).map(([group, groupMenus]) => {
                            const allChecked = groupMenus.length > 0 && groupMenus.every(m => data.menu_ids.includes(m.id));
                            const someChecked = groupMenus.some(m => data.menu_ids.includes(m.id));
                            
                            return (
                                <Card key={group}>
                                    <CardHeader className="pb-3 border-b">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox 
                                                id={`group-${group}`} 
                                                checked={allChecked ? true : someChecked ? 'indeterminate' : false}
                                                onCheckedChange={(checked) => handleSelectAllGroup(groupMenus, checked)}
                                            />
                                            <label 
                                                htmlFor={`group-${group}`}
                                                className="text-lg font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                            >
                                                {group}
                                            </label>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-4 space-y-4">
                                        {groupMenus.map((menu) => (
                                            <div key={menu.id} className="flex items-start space-x-3">
                                                <Checkbox
                                                    id={`menu-${menu.id}`}
                                                    checked={data.menu_ids.includes(menu.id)}
                                                    onCheckedChange={(checked) => handleCheckboxChange(menu.id, checked)}
                                                />
                                                <div className="grid gap-1.5 leading-none">
                                                    <label
                                                        htmlFor={`menu-${menu.id}`}
                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                                    >
                                                        {menu.title}
                                                    </label>
                                                    {menu.url && (
                                                        <p className="text-xs text-muted-foreground font-mono">
                                                            {menu.url}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    <div className="mt-8 flex justify-end">
                        <Button type="submit" disabled={processing} className="min-w-32">
                            <Save className="mr-2 h-4 w-4" />
                            Simpan Hak Akses
                        </Button>
                    </div>
                </form>
            </div>
        </AppShell>
    );
}
