import { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
    onClick?: () => void;
    hover?: boolean;
}

export function Card({ children, className = '', onClick, hover = false }: CardProps) {
    const hoverClasses = hover
        ? 'cursor-pointer card-mobile-interactive'
        : '';

    return (
        <div
            className={`bg-surface rounded-xl border border-transparent dark:border-border ${hoverClasses} ${className}`}
            style={{ boxShadow: 'var(--shadow-sm)' }}
            onClick={onClick}
        >
            {children}
        </div>
    );
}

interface CardHeaderProps {
    children: ReactNode;
    className?: string;
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
    return (
        <div className={`px-4 py-3 border-b border-border/60 ${className}`}>
            {children}
        </div>
    );
}

interface CardContentProps {
    children: ReactNode;
    className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps) {
    return (
        <div className={`p-4 ${className}`}>
            {children}
        </div>
    );
}

interface CardFooterProps {
    children: ReactNode;
    className?: string;
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
    return (
        <div className={`px-4 py-3 border-t border-border/60 bg-muted/50 rounded-b-xl ${className}`}>
            {children}
        </div>
    );
}
