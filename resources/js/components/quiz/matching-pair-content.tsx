import { cn } from '@/lib/utils';

interface MatchingPairContentProps {
    text?: string | null;
    mediaPath?: string | null;
    imageAlt?: string;
    compact?: boolean;
    emptyLabel?: string;
    className?: string;
    imageClassName?: string;
    textClassName?: string;
}

export function MatchingPairContent({
    text,
    mediaPath,
    imageAlt = 'Media pasangan',
    compact = false,
    emptyLabel = '(kosong)',
    className,
    imageClassName,
    textClassName,
}: MatchingPairContentProps) {
    const trimmedText = text?.trim() ?? '';
    const hasText = trimmedText.length > 0;
    const hasMedia = Boolean(mediaPath);

    if (!hasText && !hasMedia) {
        return (
            <span
                className={cn(
                    'min-w-0 flex-1 text-sm text-muted-foreground italic',
                    textClassName,
                )}
            >
                {emptyLabel}
            </span>
        );
    }

    return (
        <div
            className={cn(
                'flex min-w-0 flex-1 flex-col gap-2',
                compact && 'gap-1.5',
                className,
            )}
        >
            {hasMedia && (
                <img
                    src={mediaPath!}
                    alt={imageAlt}
                    className={cn(
                        'max-h-36 w-full rounded-md border border-black/10 bg-white object-contain',
                        compact && 'max-h-20',
                        imageClassName,
                    )}
                />
            )}
            {hasText && (
                <span
                    className={cn(
                        'block font-medium break-words text-current',
                        compact && 'text-sm',
                        textClassName,
                    )}
                >
                    {trimmedText}
                </span>
            )}
        </div>
    );
}
