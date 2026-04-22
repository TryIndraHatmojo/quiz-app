import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    CheckCircle2,
    Eye,
    MessageSquareWarning,
    Pencil,
    Plus,
    Search,
    Trash2,
    XCircle,
} from 'lucide-react';
import { FormEventHandler, useEffect, useRef, useState } from 'react';

interface QuizCategory {
    id: number;
    name: string;
}

interface Jenjang {
    id: number;
    jenjang: string;
    nama_sekolah: string;
}

interface Kelas {
    id: number;
    jenjang_id: number;
    nama_kelas: string;
}

interface Quiz {
    id: number;
    title: string;
    slug: string;
    join_code: string;
    description: string;
    status: string;
    time_mode: 'per_question' | 'total';
    duration: number | null;
    category?: QuizCategory;
    jenjang?: Jenjang;
    kelas?: Kelas;
    created_at: string;
    can_edit?: boolean;
    can_preview?: boolean;
    can_manage_questions?: boolean;
    can_delete?: boolean;
    can_review?: boolean;
    catatan_butuh_review_count?: number;
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
    jenjangs: Jenjang[];
    kelases: Kelas[];
    filters: {
        status?: string;
        category?: string;
        jenjang_id?: string;
        kelas_id?: string;
        search?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Koleksi',
        href: '#',
    },
    {
        title: 'Semua Kuis',
        href: '/library/quizzes',
    },
];

export default function QuizIndex({
    quizzes,
    categories = [],
    jenjangs = [],
    kelases = [],
    filters,
}: Props) {
    const { flash } = usePage<SharedData>().props;
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [categoryFilter, setCategoryFilter] = useState(
        filters.category ? filters.category : '',
    );
    const [jenjangFilter, setJenjangFilter] = useState(
        filters.jenjang_id || '',
    );
    const [kelasFilter, setKelasFilter] = useState(filters.kelas_id || '');
    const [search, setSearch] = useState(filters.search || '');
    const [loading, setLoading] = useState(false);
    const observerTarget = useRef(null);

    const [localQuizzes, setLocalQuizzes] = useState<Quiz[]>(quizzes.data);

    useEffect(() => {
        if (quizzes.current_page === 1) {
            setLocalQuizzes(quizzes.data);
        } else {
            setLocalQuizzes((prev) => {
                const newIds = new Set(quizzes.data.map((q) => q.id));
                const existing = prev.filter((q) => !newIds.has(q.id));
                return [...existing, ...quizzes.data];
            });
        }
    }, [quizzes.data, quizzes.current_page]);

    const applyFilters = () => {
        const params: Record<string, string> = {};
        if (statusFilter) params.status = statusFilter;
        if (categoryFilter) params.category = categoryFilter;
        if (jenjangFilter) params.jenjang_id = jenjangFilter;
        if (kelasFilter) params.kelas_id = kelasFilter;
        if (search) params.search = search;

        router.get(route('library.quizzes.index'), params, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                // Reset local state on filter change is handled by useEffect with current_page === 1
            },
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus kuis ini?')) {
            router.delete(route('library.quizzes.destroy', id), {
                preserveScroll: true,
            });
        }
    };

    // Lazy loading with Intersection Observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (
                    entries[0].isIntersecting &&
                    quizzes.current_page < quizzes.last_page &&
                    !loading
                ) {
                    setLoading(true);
                    const nextPageUrl = quizzes.links.find(
                        (link) => link.label === '&raquo;',
                    )?.url;
                    if (nextPageUrl) {
                        router.get(
                            nextPageUrl,
                            {},
                            {
                                preserveState: true,
                                preserveScroll: true,
                                only: ['quizzes'],
                                onSuccess: () => setLoading(false),
                                onError: () => setLoading(false),
                            },
                        );
                    }
                }
            },
            { threshold: 0.1 },
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
            <Head title="Koleksi - Semua Kuis" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                {flash.success && (
                    <Alert
                        variant="default"
                        className="border-green-500 bg-green-50 text-green-900 dark:bg-green-900/20 dark:text-green-300"
                    >
                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <AlertTitle>Berhasil</AlertTitle>
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
                        <h1>Koleksi</h1>
                        <p className="text-muted-foreground">Kelola kuis.</p>
                    </div>
                    <Button asChild>
                        <Link href={route('library.quizzes.create')}>
                            <Plus className="mr-2 h-4 w-4" />
                            Buat Kuis
                        </Link>
                    </Button>
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-4">
                    {/* Status Filter */}
                    <div className="flex gap-2">
                        <Button
                            variant={
                                statusFilter === '' ? 'default' : 'outline'
                            }
                            onClick={() => {
                                setStatusFilter('');
                                router.get(
                                    route('library.quizzes.index'),
                                    {
                                        category: categoryFilter,
                                        search,
                                    },
                                    {
                                        preserveState: true,
                                        preserveScroll: true,
                                    },
                                );
                            }}
                        >
                            Semua
                        </Button>
                        <Button
                            variant={
                                statusFilter === 'live' ? 'default' : 'outline'
                            }
                            onClick={() => {
                                setStatusFilter('live');
                                router.get(
                                    route('library.quizzes.index'),
                                    {
                                        status: 'live',
                                        category: categoryFilter,
                                        search,
                                    },
                                    {
                                        preserveState: true,
                                        preserveScroll: true,
                                    },
                                );
                            }}
                        >
                            Tayang
                        </Button>
                        <Button
                            variant={
                                statusFilter === 'draft' ? 'default' : 'outline'
                            }
                            onClick={() => {
                                setStatusFilter('draft');
                                router.get(
                                    route('library.quizzes.index'),
                                    {
                                        status: 'draft',
                                        category: categoryFilter,
                                        search,
                                    },
                                    {
                                        preserveState: true,
                                        preserveScroll: true,
                                    },
                                );
                            }}
                        >
                            Draf
                        </Button>
                    </div>

                    {/* Filters and Search */}
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-wrap gap-4">
                            <Select
                                value={categoryFilter || 'all'}
                                onValueChange={(value) => {
                                    const newValue =
                                        value === 'all' ? '' : value;
                                    setCategoryFilter(newValue);
                                    router.get(
                                        route('library.quizzes.index'),
                                        {
                                            status: statusFilter,
                                            category: newValue,
                                            jenjang_id: jenjangFilter,
                                            kelas_id: kelasFilter,
                                            search,
                                        },
                                        {
                                            preserveState: true,
                                            preserveScroll: true,
                                        },
                                    );
                                }}
                            >
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="Semua Kategori" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Semua Kategori
                                    </SelectItem>
                                    {categories?.map((cat) => (
                                        <SelectItem
                                            key={cat.id}
                                            value={cat.id.toString()}
                                        >
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select
                                value={jenjangFilter || 'all'}
                                onValueChange={(value) => {
                                    const newValue =
                                        value === 'all' ? '' : value;
                                    setJenjangFilter(newValue);
                                    // Reset kelas filter when jenjang changes
                                    setKelasFilter('');
                                    router.get(
                                        route('library.quizzes.index'),
                                        {
                                            status: statusFilter,
                                            category: categoryFilter,
                                            jenjang_id: newValue,
                                            kelas_id: '',
                                            search,
                                        },
                                        {
                                            preserveState: true,
                                            preserveScroll: true,
                                        },
                                    );
                                }}
                            >
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="Semua Jenjang" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Semua Jenjang
                                    </SelectItem>
                                    {jenjangs?.map((jenjang) => (
                                        <SelectItem
                                            key={jenjang.id}
                                            value={jenjang.id.toString()}
                                        >
                                            {jenjang.jenjang} -{' '}
                                            {jenjang.nama_sekolah}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select
                                value={kelasFilter || 'all'}
                                onValueChange={(value) => {
                                    const newValue =
                                        value === 'all' ? '' : value;
                                    setKelasFilter(newValue);
                                    router.get(
                                        route('library.quizzes.index'),
                                        {
                                            status: statusFilter,
                                            category: categoryFilter,
                                            jenjang_id: jenjangFilter,
                                            kelas_id: newValue,
                                            search,
                                        },
                                        {
                                            preserveState: true,
                                            preserveScroll: true,
                                        },
                                    );
                                }}
                                disabled={!jenjangFilter}
                            >
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue
                                        placeholder={
                                            jenjangFilter
                                                ? 'Semua Kelas'
                                                : 'Pilih Jenjang Dulu'
                                        }
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Semua Kelas
                                    </SelectItem>
                                    {kelases
                                        ?.filter(
                                            (k) =>
                                                k.jenjang_id?.toString() ===
                                                jenjangFilter,
                                        )
                                        ?.map((kelas) => (
                                            <SelectItem
                                                key={kelas.id}
                                                value={kelas.id.toString()}
                                            >
                                                {kelas.nama_kelas}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-1 items-center space-x-2">
                            <form
                                onSubmit={handleSearchSubmit}
                                className="flex flex-1 gap-2"
                            >
                                <Input
                                    placeholder="Cari kuis..."
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
                </div>

                {/* Quiz Cards */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {localQuizzes.length === 0 ? (
                        <div className="col-span-full py-12 text-center text-muted-foreground">
                            Tidak ada kuis ditemukan. Klik "Buat Kuis" untuk
                            memulai.
                        </div>
                    ) : (
                        localQuizzes.map((quiz) => (
                            <Card key={quiz.id} className="flex flex-col">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="line-clamp-1">
                                                {quiz.title}
                                            </CardTitle>
                                            <CardDescription className="mt-1">
                                                Kode:{' '}
                                                <span className="font-mono">
                                                    {quiz.join_code}
                                                </span>
                                            </CardDescription>
                                        </div>
                                        <span
                                            className={`ml-2 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                quiz.status === 'live'
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                                    : quiz.status === 'finished'
                                                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                                                      : quiz.status ===
                                                          'archived'
                                                        ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
                                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                                            }`}
                                        >
                                            {quiz.status === 'live'
                                                ? 'Tayang'
                                                : quiz.status === 'finished'
                                                  ? 'Selesai'
                                                  : quiz.status === 'archived'
                                                    ? 'Arsip'
                                                    : 'Draf'}
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <p className="line-clamp-3 text-sm text-muted-foreground">
                                        {quiz.description ||
                                            'Tidak ada deskripsi.'}
                                    </p>
                                    {quiz.category && (
                                        <p className="mt-2 text-xs text-muted-foreground">
                                            Kategori: {quiz.category.name}
                                        </p>
                                    )}
                                    <p className="mt-2 text-xs text-muted-foreground">
                                        Waktu:{' '}
                                        {quiz.duration
                                            ? quiz.time_mode === 'per_question'
                                                ? `${quiz.duration} detik/pertanyaan`
                                                : `${quiz.duration} menit total`
                                            : 'Tidak diatur'}
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Dibuat:{' '}
                                        {new Date(
                                            quiz.created_at,
                                        ).toLocaleDateString()}
                                    </p>
                                    {/* Badge catatan telaah */}
                                    {(quiz.catatan_butuh_review_count ?? 0) >
                                        0 && (
                                        <div className="mt-3 flex items-center gap-1.5 rounded-md bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                            <MessageSquareWarning className="h-3.5 w-3.5" />
                                            <span>
                                                {
                                                    quiz.catatan_butuh_review_count
                                                }{' '}
                                                catatan telaah butuh review
                                            </span>
                                        </div>
                                    )}
                                </CardContent>
                                <CardFooter className="flex flex-wrap gap-2">
                                    {quiz.can_manage_questions && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            asChild
                                        >
                                            <Link
                                                href={route(
                                                    'library.quizzes.questions',
                                                    quiz.id,
                                                )}
                                            >
                                                <Pencil className="mr-2 h-4 w-4" />
                                                Pertanyaan
                                            </Link>
                                        </Button>
                                    )}
                                    {quiz.can_review && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="relative flex-1 border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-900/30"
                                            asChild
                                        >
                                            <Link
                                                href={route(
                                                    'library.quizzes.telaah-soal',
                                                    quiz.id,
                                                )}
                                            >
                                                <Search className="mr-1.5 h-4 w-4" />
                                                Telaah Soal
                                                {(quiz.catatan_butuh_review_count ??
                                                    0) > 0 && (
                                                    <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white">
                                                        {
                                                            quiz.catatan_butuh_review_count
                                                        }
                                                    </span>
                                                )}
                                            </Link>
                                        </Button>
                                    )}
                                    {quiz.can_preview && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            asChild
                                        >
                                            <Link
                                                href={route(
                                                    'library.quizzes.preview',
                                                    quiz.id,
                                                )}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                    )}
                                    {quiz.can_edit && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            asChild
                                        >
                                            <Link
                                                href={route(
                                                    'library.quizzes.edit',
                                                    quiz.id,
                                                )}
                                            >
                                                Edit
                                            </Link>
                                        </Button>
                                    )}
                                    {quiz.can_delete && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                            onClick={() =>
                                                handleDelete(quiz.id)
                                            }
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        ))
                    )}
                </div>

                {/* Lazy loading trigger */}
                {quizzes.current_page < quizzes.last_page && (
                    <div
                        ref={observerTarget}
                        className="py-4 text-center text-sm text-muted-foreground"
                    >
                        {loading
                            ? 'Memuat lebih banyak...'
                            : 'Gulir untuk lebih banyak'}
                    </div>
                )}
            </div>
        </AppSidebarLayout>
    );
}
