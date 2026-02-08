import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
    icon?: ReactNode;
}

export function Button({
    children,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    icon,
    className = '',
    ...props
}: ButtonProps) {
    const baseClasses = 'inline-flex items-center justify-center gap-2 font-medium rounded-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide text-xs';

    const variantClasses = {
        primary: 'bg-primary text-primary-foreground hover:opacity-90 active:scale-95 border border-transparent shadow-sm',
        secondary: 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 active:scale-95 border border-transparent',
        ghost: 'bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted active:bg-muted/80',
        danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
    };

    const sizeClasses = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
    };

    const widthClass = fullWidth ? 'w-full' : '';

    return (
        <button
            className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`}
            {...props}
        >
            {icon && <span className="shrink-0">{icon}</span>}
            {children}
        </button>
    );
}
