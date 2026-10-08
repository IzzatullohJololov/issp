import { Link } from '@inertiajs/react';
import { ArrowRight, ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function SectionHeading({
    eyebrow,
    title,
    description,
    action,
    actionLabel,
    align = 'left',
    light = false,
    className,
}: {
    eyebrow?: string;
    title: string;
    description?: string | null;
    action?: string;
    actionLabel?: string;
    align?: 'left' | 'center';
    light?: boolean;
    className?: string;
}) {
    return (
        <div
            className={cn(
                'mb-8 flex flex-col gap-4 sm:mb-10',
                align === 'center'
                    ? 'items-center text-center'
                    : 'sm:flex-row sm:items-end sm:justify-between',
                className,
            )}
        >
            <div className="max-w-2xl">
                {eyebrow && (
                    <p
                        className={cn(
                            'mb-2 eyebrow',
                            light ? 'text-gold-400' : 'text-gold-600',
                        )}
                    >
                        {eyebrow}
                    </p>
                )}
                <h2
                    className={cn(
                        'font-serif text-3xl font-bold tracking-tight sm:text-4xl',
                        light ? 'text-white' : 'text-navy-900',
                    )}
                >
                    {title}
                </h2>
                {description && (
                    <p
                        className={cn(
                            'mt-3 text-base leading-relaxed',
                            light ? 'text-navy-200' : 'text-slate-600',
                        )}
                    >
                        {description}
                    </p>
                )}
            </div>
            {action && actionLabel && (
                <Link
                    href={action}
                    className={cn(
                        'group inline-flex shrink-0 items-center gap-2 text-sm font-bold transition',
                        light
                            ? 'text-gold-300 hover:text-gold-200'
                            : 'text-navy-700 hover:text-navy-900',
                    )}
                >
                    {actionLabel}
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </Link>
            )}
        </div>
    );
}

export function PageHero({
    eyebrow,
    title,
    description,
    breadcrumbs,
    children,
    compact = false,
}: {
    eyebrow?: string;
    title: string;
    description?: string | null;
    breadcrumbs?: { label: string; href?: string }[];
    children?: ReactNode;
    compact?: boolean;
}) {
    return (
        <section className="relative overflow-hidden bg-navy-950 text-white">
            <div className="pointer-events-none absolute inset-0 opacity-60">
                <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-navy-600/40 blur-3xl" />
                <div className="absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-gold-500/20 blur-3xl" />
            </div>
            <div
                className={cn(
                    'relative container-site',
                    compact ? 'py-10 sm:py-12' : 'py-14 sm:py-20',
                )}
            >
                {breadcrumbs && breadcrumbs.length > 0 && (
                    <nav
                        className="mb-5 flex flex-wrap items-center gap-1 text-xs font-semibold text-navy-300"
                        aria-label="Breadcrumb"
                    >
                        {breadcrumbs.map((crumb, index) => (
                            <span
                                key={`${crumb.label}-${index}`}
                                className="inline-flex items-center gap-1"
                            >
                                {index > 0 && (
                                    <ChevronRight className="h-3.5 w-3.5 text-navy-500" />
                                )}
                                {crumb.href ? (
                                    <Link
                                        href={crumb.href}
                                        className="transition hover:text-white"
                                    >
                                        {crumb.label}
                                    </Link>
                                ) : (
                                    <span className="text-navy-100">
                                        {crumb.label}
                                    </span>
                                )}
                            </span>
                        ))}
                    </nav>
                )}
                {eyebrow && (
                    <p className="mb-3 eyebrow text-gold-400">{eyebrow}</p>
                )}
                <h1
                    className={cn(
                        'max-w-4xl font-serif font-bold tracking-tight text-balance',
                        compact
                            ? 'text-3xl sm:text-4xl'
                            : 'text-4xl sm:text-5xl lg:text-6xl',
                    )}
                >
                    {title}
                </h1>
                {description && (
                    <p className="mt-4 max-w-2xl text-base leading-relaxed text-navy-100 sm:text-lg">
                        {description}
                    </p>
                )}
                {children}
            </div>
        </section>
    );
}

export function Breadcrumbs({
    items,
    className,
}: {
    items: { label: string; href?: string }[];
    className?: string;
}) {
    return (
        <nav
            className={cn(
                'flex flex-wrap items-center gap-1 text-xs font-semibold text-slate-500',
                className,
            )}
            aria-label="Breadcrumb"
        >
            {items.map((crumb, index) => (
                <span
                    key={`${crumb.label}-${index}`}
                    className="inline-flex items-center gap-1"
                >
                    {index > 0 && (
                        <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
                    )}
                    {crumb.href ? (
                        <Link
                            href={crumb.href}
                            className="transition hover:text-navy-900"
                        >
                            {crumb.label}
                        </Link>
                    ) : (
                        <span className="text-navy-900">{crumb.label}</span>
                    )}
                </span>
            ))}
        </nav>
    );
}

export function RichText({
    html,
    className,
}: {
    html: string | null | undefined;
    className?: string;
}) {
    if (!html) {
        return null;
    }

    return (
        <div
            className={cn('prose-site', className)}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}
