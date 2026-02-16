/**
 * BauLot Logo – Construction crane + building mark.
 *
 * Usage:
 *   <BauLotIcon size={20} />                    – icon only
 *   <BauLotLogo size="sm" />                    – icon + wordmark (small)
 *   <BauLotLogo size="lg" />                    – icon + wordmark (large)
 */

interface BauLotIconProps {
    /** px size of the SVG (width & height) */
    size?: number;
    className?: string;
}

/** Standalone icon mark – a building with a construction crane. */
export function BauLotIcon({ size = 20, className = '' }: BauLotIconProps) {
    // Thicker strokes for small sizes to maintain visibility
    const sw = size <= 16 ? '2.5' : '2';
    return (
        <svg
            className={className}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={sw}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            {/* Building body */}
            <rect x="3" y="10" width="11" height="12" rx="1" />
            {/* Crane mast */}
            <path d="M8.5 10V3" />
            {/* Crane arm */}
            <path d="M4 3h17" />
            {/* Crane cable + hook */}
            <path d="M19 3v5" />
            {/* Ground line */}
            <path d="M1 22h22" />
            {/* Window row 1 */}
            <path d="M6 13.5h3" strokeWidth="1.5" />
            {/* Window row 2 */}
            <path d="M6 17h3" strokeWidth="1.5" />
        </svg>
    );
}

interface BauLotLogoProps {
    /** sm = compact, md = default, lg = large */
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const logoSizes = {
    sm: { icon: 12, text: 'text-sm', gap: 'gap-2' },
    md: { icon: 16, text: 'text-[15px]', gap: 'gap-2.5' },
    lg: { icon: 20, text: 'text-lg', gap: 'gap-3' },
};

/** Icon + "BauLot" wordmark. Inherits text color from parent. */
export function BauLotLogo({ size = 'md', className = '' }: BauLotLogoProps) {
    const s = logoSizes[size];
    return (
        <span className={`inline-flex items-center ${s.gap} ${className}`}>
            <BauLotIcon size={s.icon} />
            <span className={`${s.text} font-semibold tracking-tight`}>BauLot</span>
        </span>
    );
}
