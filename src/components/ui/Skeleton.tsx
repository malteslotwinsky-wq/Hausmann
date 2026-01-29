export function SkeletonCard() {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
            <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gray-200 rounded-xl" />
                <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
            </div>
            <div className="h-2 bg-gray-200 rounded-full w-full" />
        </div>
    );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonCard key={i} />
            ))}
        </div>
    );
}

export function SkeletonProgress() {
    return (
        <div className="flex flex-col items-center py-8 animate-pulse">
            <div className="w-32 h-32 bg-gray-200 rounded-full mb-4" />
            <div className="h-5 bg-gray-200 rounded w-32 mb-2" />
            <div className="h-4 bg-gray-100 rounded w-48" />
        </div>
    );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
    return (
        <div className="space-y-2 animate-pulse">
            {Array.from({ length: lines }).map((_, i) => (
                <div
                    key={i}
                    className="h-4 bg-gray-200 rounded"
                    style={{ width: `${100 - i * 15}%` }}
                />
            ))}
        </div>
    );
}
