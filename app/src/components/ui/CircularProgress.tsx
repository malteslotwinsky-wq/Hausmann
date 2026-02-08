export function CircularProgress({
    percentage,
    size = 120,
    strokeWidth = 10,
    color = "stroke-accent",
    showLabel = true,
}: {
    percentage: number;
    size?: number;
    strokeWidth?: number;
    color?: string;
    showLabel?: boolean;
}) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center">
            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                className="transform -rotate-90"
            >
                {/* Background Ring */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    className="text-gray-200"
                />
                {/* Progress Ring */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className={`${color} transition-all duration-1000 ease-out`}
                />
            </svg>
            {showLabel && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold text-primary">{percentage}%</span>
                </div>
            )}
        </div>
    );
}
