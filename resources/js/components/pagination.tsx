import { Button } from '@/components/ui/button';
import { Link, usePage } from '@inertiajs/react';
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
    const { url: currentUrl } = usePage();

    const buildHref = (targetUrl: string | null) => {
        if (!targetUrl) return null;

        const baseUrl =
            typeof window !== 'undefined'
                ? window.location.origin
                : 'http://localhost';

        const current = new URL(currentUrl, baseUrl);
        const target = new URL(targetUrl, baseUrl);

        // Keep all active filters in pagination links, but let target page win.
        current.searchParams.forEach((value, key) => {
            if (key !== 'page' && !target.searchParams.has(key)) {
                target.searchParams.set(key, value);
            }
        });

        return `${target.pathname}${target.search}${target.hash}`;
    };

    // Don't render if there's only one page
    if (links.length <= 3) return null;

    return (
        <div className="mt-4 flex items-center justify-center gap-1">
            {links.map((link, index) => {
                const href = buildHref(link.url);

                // Handle Previous button
                if (index === 0) {
                    return (
                        <Button
                            key="prev"
                            variant="outline"
                            size="sm"
                            disabled={!href}
                            asChild={!!href}
                            className="gap-1"
                        >
                            {href ? (
                                <Link href={href} preserveScroll>
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
                            disabled={!href}
                            asChild={!!href}
                            className="gap-1"
                        >
                            {href ? (
                                <Link href={href} preserveScroll>
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
                        disabled={!href}
                        asChild={!!href}
                        className="min-w-[2.5rem]"
                    >
                        {href ? (
                            <Link href={href} preserveScroll>
                                <span
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                />
                            </Link>
                        ) : (
                            <span
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        )}
                    </Button>
                );
            })}
        </div>
    );
}
