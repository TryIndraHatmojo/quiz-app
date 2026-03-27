import { type LucideIcon } from 'lucide-react';

interface SummaryCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: LucideIcon;
    colorScheme: 'blue' | 'green' | 'amber' | 'purple';
}

const colorMap = {
    blue: {
        bg: 'bg-gradient-to-br from-blue-500/10 to-blue-600/5 dark:from-blue-500/20 dark:to-blue-600/10',
        border: 'border-blue-200/50 dark:border-blue-500/20',
        icon: 'text-blue-500 dark:text-blue-400',
        iconBg: 'bg-blue-500/10 dark:bg-blue-500/20',
        value: 'text-blue-700 dark:text-blue-300',
    },
    green: {
        bg: 'bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 dark:from-emerald-500/20 dark:to-emerald-600/10',
        border: 'border-emerald-200/50 dark:border-emerald-500/20',
        icon: 'text-emerald-500 dark:text-emerald-400',
        iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
        value: 'text-emerald-700 dark:text-emerald-300',
    },
    amber: {
        bg: 'bg-gradient-to-br from-amber-500/10 to-amber-600/5 dark:from-amber-500/20 dark:to-amber-600/10',
        border: 'border-amber-200/50 dark:border-amber-500/20',
        icon: 'text-amber-500 dark:text-amber-400',
        iconBg: 'bg-amber-500/10 dark:bg-amber-500/20',
        value: 'text-amber-700 dark:text-amber-300',
    },
    purple: {
        bg: 'bg-gradient-to-br from-purple-500/10 to-purple-600/5 dark:from-purple-500/20 dark:to-purple-600/10',
        border: 'border-purple-200/50 dark:border-purple-500/20',
        icon: 'text-purple-500 dark:text-purple-400',
        iconBg: 'bg-purple-500/10 dark:bg-purple-500/20',
        value: 'text-purple-700 dark:text-purple-300',
    },
};

export function SummaryCard({
    title,
    value,
    subtitle,
    icon: Icon,
    colorScheme,
}: SummaryCardProps) {
    const colors = colorMap[colorScheme];

    return (
        <div
            className={`relative overflow-hidden rounded-xl border ${colors.border} ${colors.bg} p-5 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg`}
        >
            {/* Background icon watermark */}
            <div className="pointer-events-none absolute -right-3 -top-3 opacity-[0.07]">
                <Icon className="h-24 w-24" />
            </div>

            <div className="relative z-10 flex items-start justify-between">
                <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                        {title}
                    </p>
                    <p className={`text-3xl font-bold tracking-tight ${colors.value}`}>
                        {value}
                    </p>
                    {subtitle && (
                        <p className="text-xs text-muted-foreground">
                            {subtitle}
                        </p>
                    )}
                </div>

                <div className={`rounded-lg p-2.5 ${colors.iconBg}`}>
                    <Icon className={`h-5 w-5 ${colors.icon}`} />
                </div>
            </div>
        </div>
    );
}
