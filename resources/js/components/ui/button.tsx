import { Link } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gold';
type Size = 'sm' | 'md' | 'lg' | 'icon';

const variants: Record<Variant, string> = {
    primary:
        'bg-navy-900 text-white hover:bg-navy-800 shadow-sm',
    secondary:
        'bg-navy-50 text-navy-900 hover:bg-navy-100',
    outline:
        'border border-navy-900/15 bg-white text-navy-900 hover:border-navy-900/40 hover:bg-navy-50',
    ghost: 'text-navy-900 hover:bg-navy-900/5',
    danger: 'bg-rose-600 text-white hover:bg-rose-700',
    gold: 'bg-gold-400 text-navy-950 hover:bg-gold-300 shadow-sm',
};

const sizes: Record<Size, string> = {
    sm: 'h-8 px-3 text-xs gap-1.5',
    md: 'h-10 px-4 text-sm gap-2',
    lg: 'h-12 px-6 text-base gap-2',
    icon: 'h-9 w-9 p-0',
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: Variant;
    size?: Size;
    loading?: boolean;
    href?: string;
    external?: boolean;
    children?: ReactNode;
};

export function buttonClasses(
    variant: Variant = 'primary',
    size: Size = 'md',
    className?: string,
) {
    return cn(
        'focus-ring inline-flex items-center justify-center rounded-lg font-semibold whitespace-nowrap transition disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
    );
}

export function Button({
    variant = 'primary',
    size = 'md',
    loading = false,
    href,
    external = false,
    className,
    children,
    disabled,
    type = 'button',
    ...props
}: ButtonProps) {
    const classes = buttonClasses(variant, size, className);

    if (href && external) {
        return (
            <a
                href={href}
                className={classes}
                target="_blank"
                rel="noreferrer"
            >
                {children}
            </a>
        );
    }

    if (href) {
        return (
            <Link href={href} className={classes}>
                {children}
            </Link>
        );
    }

    return (
        <button
            type={type}
            className={classes}
            disabled={disabled || loading}
            {...props}
        >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {children}
        </button>
    );
}
