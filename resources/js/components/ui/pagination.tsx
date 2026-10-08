import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Paginated } from '@/types';
import { cn } from '@/lib/utils';

export function Pagination({
    paginator,
    className,
    compact = false,
}: {
    paginator: Paginated<unknown>;
    className?: string;
    compact?: boolean;
}) {
    if (paginator.last_page <= 1) {
        return null;
    }

    const pages = paginator.links.slice(1, -1);

    return (
        <nav
            className={cn(
                'flex flex-wrap items-center justify-between gap-3',
                className,
            )}
            aria-label="Pagination"
        >
            {!compact && (
                <p className="text-sm text-slate-500">
                    {paginator.from}–{paginator.to} / {paginator.total}
                </p>
            )}
            <div className="flex items-center gap-1">
                <PageLink
                    href={paginator.prev_page_url}
                    disabled={!paginator.prev_page_url}
                >
                    <ChevronLeft className="h-4 w-4" />
                </PageLink>
                {pages.map((link, index) => (
                    <PageLink
                        key={`${link.label}-${index}`}
                        href={link.url}
                        active={link.active}
                        disabled={!link.url}
                    >
                        {link.label}
                    </PageLink>
                ))}
                <PageLink
                    href={paginator.next_page_url}
                    disabled={!paginator.next_page_url}
                >
                    <ChevronRight className="h-4 w-4" />
                </PageLink>
            </div>
        </nav>
    );
}

function PageLink({
    href,
    active,
    disabled,
    children,
}: {
    href: string | null;
    active?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
}) {
    const classes = cn(
        'focus-ring inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-semibold transition',
        active
            ? 'bg-navy-900 text-white'
            : 'text-slate-700 hover:bg-navy-900/5',
        disabled && 'pointer-events-none opacity-40',
    );

    if (!href || disabled) {
        return <span className={classes}>{children}</span>;
    }

    return (
        <Link href={href} className={classes} preserveScroll>
            {children}
        </Link>
    );
}
