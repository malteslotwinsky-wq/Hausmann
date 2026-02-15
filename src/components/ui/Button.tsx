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
    const baseClasses = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed text-sm';

    const variantClasses = {
        primary: 'bg-accent text-accent-foreground hover:bg-accent-light active:scale-[0.97] border border-transparent shadow-sm',
        secondary: 'bg-muted text-foreground hover:bg-surface-highlight active:scale-[0.97] border border-border/60',
        ghost: 'bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted active:bg-muted/80',
        danger: 'bg-error text-white hover:opacity-90 active:scale-[0.97]',
    };

    const sizeClasses = {
        sm: 'px-3 py-1.5 text-[13px]',
        md: 'px-4 py-2',
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
