import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginationProps {
    links: PaginationLink[];
}

export default function Pagination({ links }: PaginationProps) {
    // Don't render if there's only one page
    if (links.length <= 3) return null;

    return (
        <div className="flex items-center justify-center gap-1 mt-4">
            {links.map((link, index) => {
                // Handle Previous button
                if (index === 0) {
                    return (
                        <Button
                            key="prev"
                            variant="outline"
                            size="sm"
                            disabled={!link.url}
                            asChild={!!link.url}
                            className="gap-1"
                        >
                            {link.url ? (
                                <Link href={link.url} preserveScroll>
                                    <ChevronLeft className="h-4 w-4" />
                                    <span>Previous</span>
                                </Link>
                            ) : (
                                <>
                                    <ChevronLeft className="h-4 w-4" />
                                    <span>Previous</span>
                                </>
                            )}
                        </Button>
                    );
                }

                // Handle Next button
                if (index === links.length - 1) {
                    return (
                        <Button
                            key="next"
                            variant="outline"
                            size="sm"
                            disabled={!link.url}
                            asChild={!!link.url}
                            className="gap-1"
                        >
                            {link.url ? (
                                <Link href={link.url} preserveScroll>
                                    <span>Next</span>
                                    <ChevronRight className="h-4 w-4" />
                                </Link>
                            ) : (
                                <>
                                    <span>Next</span>
                                    <ChevronRight className="h-4 w-4" />
                                </>
                            )}
                        </Button>
                    );
                }

                // Handle page numbers
                return (
                    <Button
                        key={index}
                        variant={link.active ? 'default' : 'outline'}
                        size="sm"
                        disabled={!link.url}
                        asChild={!!link.url}
                        className="min-w-[2.5rem]"
                    >
                        {link.url ? (
                            <Link href={link.url} preserveScroll>
                                <span dangerouslySetInnerHTML={{ __html: link.label }} />
                            </Link>
                        ) : (
                            <span dangerouslySetInnerHTML={{ __html: link.label }} />
                        )}
                    </Button>
                );
            })}
        </div>
    );
}
