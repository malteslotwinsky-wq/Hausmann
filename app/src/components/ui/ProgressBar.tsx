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
        md: 'h-2.5',
        lg: 'h-4',
    };

    const barColor = percentage === 100
        ? 'bg-green-500'
        : color === 'success'
            ? 'bg-green-500'
            : 'bg-blue-500';

    return (
        <div className="flex items-center gap-3">
            <div className={`flex-1 bg-gray-200 rounded-full overflow-hidden ${heightClasses[size]}`}>
                <div
                    className={`${barColor} ${heightClasses[size]} rounded-full transition-all duration-500 ease-out`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            {showLabel && (
                <span className="text-sm font-semibold text-gray-600 min-w-[3rem] text-right">
                    {percentage}%
                </span>
            )}
        </div>
    );
}

interface CircularProgressProps {
    percentage: number;
    size?: number;
    strokeWidth?: number;
}

export function CircularProgress({
    percentage,
    size = 120,
    strokeWidth = 8
}: CircularProgressProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg width={size} height={size} className="-rotate-90">
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="#E5E7EB"
                    strokeWidth={strokeWidth}
                />
                {/* Progress circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={percentage === 100 ? '#22C55E' : '#3B82F6'}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className="transition-all duration-700 ease-out"
                />
            </svg>
            <span className="absolute text-2xl font-bold text-gray-800">
                {percentage}%
            </span>
        </div>
    );
}
