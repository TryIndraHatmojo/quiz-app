import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { CheckCircle2, Pencil, Plus, Search, Trash2, XCircle } from 'lucide-react';
import { FormEventHandler, useEffect, useRef, useState } from 'react';

interface QuizCategory {
    id: number;
    name: string;
}

interface Quiz {
    id: number;
    title: string;
    slug: string;
    join_code: string;
    description: string;
    status: string;
    category?: QuizCategory;
    created_at: string;
}

interface Props {
    quizzes: {
        data: Quiz[];
        current_page: number;
        last_page: number;
        total: number;
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
    };
    categories: QuizCategory[];
    filters: {
        status?: string;
        category?: string;
        search?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Library',
        href: '#',
    },
    {
        title: 'All Activities',
        href: '/library/quizzes',
    },
];

export default function QuizIndex({ quizzes, categories = [], filters }: Props) {
    const { flash } = usePage<SharedData>().props;
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [categoryFilter, setCategoryFilter] = useState(filters.category ? filters.category : '');
    const [search, setSearch] = useState(filters.search || '');
    const [loading, setLoading] = useState(false);
    const observerTarget = useRef(null);

    const [localQuizzes, setLocalQuizzes] = useState<Quiz[]>(quizzes.data);

    useEffect(() => {
        if (quizzes.current_page === 1) {
            console.log(quizzes.data);
            setLocalQuizzes(quizzes.data);
        } else {
            setLocalQuizzes(prev => {
                console.log(quizzes.data);
                const newIds = new Set(quizzes.data.map(q => q.id));
                const existing = prev.filter(q => !newIds.has(q.id));
                return [...existing, ...quizzes.data];
            });
        }
    }, [quizzes.data, quizzes.current_page]);

    const applyFilters = () => {
        const params: Record<string, string> = {};
        if (statusFilter) params.status = statusFilter;
        if (categoryFilter) params.category = categoryFilter;
        if (search) params.search = search;

        router.get(route('library.quizzes.index'), params, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                // Reset local state on filter change is handled by useEffect with current_page === 1
            }
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this quiz?')) {
            router.delete(route('library.quizzes.destroy', id), {
                preserveScroll: true,
            });
        }
    };

    // Lazy loading with Intersection Observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && quizzes.current_page < quizzes.last_page && !loading) {
                    setLoading(true);
                    const nextPageUrl = quizzes.links.find(link => link.label === '&raquo;')?.url;
                    if (nextPageUrl) {
                        router.get(nextPageUrl, {}, {
                            preserveState: true,
                            preserveScroll: true,
                            only: ['quizzes'],
                            onSuccess: () => setLoading(false),
                            onError: () => setLoading(false),
                        });
                    }
                }
            },
            { threshold: 0.1 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => observer.disconnect();
    }, [quizzes, loading]);

    const handleSearchSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        applyFilters();
    };

    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title="Library - All Activities" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                {flash.success && (
                    <Alert variant="default" className="border-green-500 bg-green-50 text-green-900 dark:bg-green-900/20 dark:text-green-300">
                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <AlertTitle>Success</AlertTitle>
                        <AlertDescription>{flash.success}</AlertDescription>
                    </Alert>
                )}

                {flash.error && (
                    <Alert variant="destructive">
                        <XCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{flash.error}</AlertDescription>
                    </Alert>
                )}

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Library</h1>
                        <p className="text-muted-foreground">
                            Manage your quizzes and activities.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={route('library.quizzes.create')}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Activity
                        </Link>
                    </Button>
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-4">
                    {/* Status Filter */}
                    <div className="flex gap-2">
                        <Button
                            variant={statusFilter === '' ? 'default' : 'outline'}
                            onClick={() => {
                                setStatusFilter('');
                                router.get(route('library.quizzes.index'), {
                                    category: categoryFilter,
                                    search,
                                }, { preserveState: true, preserveScroll: true });
                            }}
                        >
                            All
                        </Button>
                        <Button
                            variant={statusFilter === 'live' ? 'default' : 'outline'}
                            onClick={() => {
                                setStatusFilter('live');
                                router.get(route('library.quizzes.index'), {
                                    status: 'live',
                                    category: categoryFilter,
                                    search,
                                }, { preserveState: true, preserveScroll: true });
                            }}
                        >
                            Live
                        </Button>
                        <Button
                            variant={statusFilter === 'draft' ? 'default' : 'outline'}
                            onClick={() => {
                                setStatusFilter('draft');
                                router.get(route('library.quizzes.index'), {
                                    status: 'draft',
                                    category: categoryFilter,
                                    search,
                                }, { preserveState: true, preserveScroll: true });
                            }}
                        >
                            Draft
                        </Button>
                    </div>

                    {/* Category and Search */}
                    <div className="flex gap-4">
                        <Select
                            value={categoryFilter || 'all'}
                            onValueChange={(value) => {
                                const newValue = value === 'all' ? '' : value;
                                setCategoryFilter(newValue);
                                router.get(route('library.quizzes.index'), {
                                    status: statusFilter,
                                    category: newValue,
                                    search,
                                }, { preserveState: true, preserveScroll: true });
                            }}
                        >
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="All Categories" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {categories.map((cat) => (
                                    <SelectItem key={cat.id} value={cat.id.toString()}>
                                        {cat.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <form onSubmit={handleSearchSubmit} className="flex flex-1 gap-2">
                            <Input
                                placeholder="Search quizzes..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="flex-1"
                            />
                            <Button type="submit" size="icon">
                                <Search className="h-4 w-4" />
                            </Button>
                        </form>
                    </div>
                </div>

                {/* Quiz Cards */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {localQuizzes.length === 0 ? (
                        <div className="col-span-full py-12 text-center text-muted-foreground">
                            No activities found. Click "Create Activity" to get started.
                        </div>
                    ) : (
                        localQuizzes.map((quiz) => (
                            <Card key={quiz.id} className="flex flex-col">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="line-clamp-1">{quiz.title}</CardTitle>
                                            <CardDescription className="mt-1">
                                                Code: <span className="font-mono">{quiz.join_code}</span>
                                            </CardDescription>
                                        </div>
                                        <span className={`ml-2 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                            quiz.status === 'live'
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                                        }`}>
                                            {quiz.status.toUpperCase()}
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <p className="line-clamp-3 text-sm text-muted-foreground">
                                        {quiz.description || 'No description provided.'}
                                    </p>
                                    {quiz.category && (
                                        <p className="mt-2 text-xs text-muted-foreground">
                                            Category: {quiz.category.name}
                                        </p>
                                    )}
                                    <p className="mt-2 text-xs text-muted-foreground">
                                        Created: {new Date(quiz.created_at).toLocaleDateString()}
                                    </p>
                                </CardContent>
                                <CardFooter className="flex gap-2">
                                    <Button variant="outline" size="sm" className="flex-1" asChild>
                                        <Link href={route('library.quizzes.edit', quiz.id)}>
                                            <Pencil className="mr-2 h-4 w-4" />
                                            Edit
                                        </Link>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                        onClick={() => handleDelete(quiz.id)}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))
                    )}
                </div>

                {/* Lazy loading trigger */}
                {quizzes.current_page < quizzes.last_page && (
                    <div ref={observerTarget} className="py-4 text-center text-sm text-muted-foreground">
                        {loading ? 'Loading more...' : 'Scroll for more'}
                    </div>
                )}
            </div>
        </AppSidebarLayout>
    );
}
