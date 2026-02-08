import { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
    onClick?: () => void;
    hover?: boolean;
}

export function Card({ children, className = '', onClick, hover = false }: CardProps) {
    const hoverClasses = hover
        ? 'cursor-pointer hover:shadow-md hover:border-accent/50 transition-all duration-200'
        : '';

    return (
        <div
            className={`bg-surface rounded-xl border border-border shadow-sm ${hoverClasses} ${className}`}
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
        <div className={`px-4 py-3 border-b border-border ${className}`}>
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
        <div className={`px-4 py-3 border-t border-border bg-muted rounded-b-xl ${className}`}>
            {children}
        </div>
    );
}
