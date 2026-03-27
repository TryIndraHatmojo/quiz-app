import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { router } from '@inertiajs/react';
import { RotateCcw, Search } from 'lucide-react';
import { useCallback, useState } from 'react';

interface JenjangItem {
    id: number;
    jenjang: string;
    nama_sekolah: string;
}

interface Filters {
    search?: string;
    jenjang_id?: string;
    date_from?: string;
    date_to?: string;
}

interface NilaiFilterBarProps {
    jenjangs: JenjangItem[];
    filters: Filters;
}

export function NilaiFilterBar({ jenjangs, filters }: NilaiFilterBarProps) {
    const [localSearch, setLocalSearch] = useState(filters.search || '');

    const applyFilters = useCallback(
        (newFilters: Partial<Filters>) => {
            const merged = { ...filters, ...newFilters };

            // Remove empty values
            const cleaned: Record<string, string> = {};
            for (const [key, val] of Object.entries(merged)) {
                if (val && val !== '' && val !== 'all') {
                    cleaned[key] = val;
                }
            }

            router.get(route('nilai.index'), cleaned, {
                preserveState: true,
                preserveScroll: true,
            });
        },
        [filters],
    );

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters({ search: localSearch });
    };

    const resetFilters = () => {
        setLocalSearch('');
        router.get(route('nilai.index'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const hasActiveFilters = !!(
        filters.search ||
        filters.jenjang_id ||
        filters.date_from ||
        filters.date_to
    );

    return (
        <div className="rounded-xl border border-sidebar-border bg-sidebar p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
                {/* Search */}
                <form onSubmit={handleSearchSubmit} className="flex-1">
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">
                        Cari Quiz / Siswa
                    </label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Ketik nama quiz atau siswa..."
                            value={localSearch}
                            onChange={(e) => setLocalSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </form>

                {/* Jenjang Filter */}
                <div className="w-full lg:w-48">
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">
                        Jenjang
                    </label>
                    <Select
                        value={filters.jenjang_id || 'all'}
                        onValueChange={(value) =>
                            applyFilters({
                                jenjang_id: value === 'all' ? '' : value,
                            })
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Semua Jenjang" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Jenjang</SelectItem>
                            {jenjangs.map((j) => (
                                <SelectItem
                                    key={j.id}
                                    value={j.id.toString()}
                                >
                                    {j.jenjang} - {j.nama_sekolah}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Date From */}
                <div className="w-full lg:w-44">
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">
                        Dari Tanggal
                    </label>
                    <Input
                        type="date"
                        value={filters.date_from || ''}
                        onChange={(e) =>
                            applyFilters({ date_from: e.target.value })
                        }
                    />
                </div>

                {/* Date To */}
                <div className="w-full lg:w-44">
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">
                        Sampai Tanggal
                    </label>
                    <Input
                        type="date"
                        value={filters.date_to || ''}
                        onChange={(e) =>
                            applyFilters({ date_to: e.target.value })
                        }
                    />
                </div>

                {/* Reset */}
                {hasActiveFilters && (
                    <div className="flex items-end">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={resetFilters}
                            className="h-9 gap-1.5 text-muted-foreground hover:text-foreground"
                        >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Reset
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
