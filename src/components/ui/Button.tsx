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
    const baseClasses = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

    const variantClasses = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
        secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300',
        ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 active:bg-gray-200',
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
