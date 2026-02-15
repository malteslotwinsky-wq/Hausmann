'use client';

interface ProgressBarProps {
    percentage: number;
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
    color?: 'default' | 'success';
}

export function ProgressBar({
    percentage,
    size = 'md',
    showLabel = true,
    color = 'default'
}: ProgressBarProps) {
    const heightClasses = {
        sm: 'h-1.5',
        md: 'h-2',
        lg: 'h-3',
    };

    const barColor = percentage === 100
        ? 'bg-success'
        : color === 'success'
            ? 'bg-success'
            : 'bg-accent';

    return (
        <div className="flex items-center gap-3">
            <div className={`flex-1 bg-border/40 rounded-full overflow-hidden ${heightClasses[size]}`}>
                <div
                    className={`${barColor} ${heightClasses[size]} rounded-full transition-all duration-500 ease-out`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            {showLabel && (
                <span className="text-sm font-medium text-muted-foreground min-w-[3rem] text-right tabular-nums">
                    {percentage}%
                </span>
            )}
        </div>
    );
}
