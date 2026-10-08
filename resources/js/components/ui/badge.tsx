import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

const tones: Record<string, string> = {
    blue: 'bg-navy-50 text-navy-700 ring-navy-200',
    amber: 'bg-gold-50 text-gold-800 ring-gold-200',
    emerald: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
    rose: 'bg-rose-50 text-rose-700 ring-rose-200',
    violet: 'bg-violet-50 text-violet-700 ring-violet-200',
    slate: 'bg-slate-100 text-slate-700 ring-slate-200',
    navy: 'bg-navy-900 text-white ring-navy-900',
    gold: 'bg-gold-400 text-navy-950 ring-gold-400',
};

export function Badge({
    children,
    tone = 'slate',
    className,
}: {
    children: ReactNode;
    tone?: string | null;
    className?: string;
}) {
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide uppercase ring-1 ring-inset',
                tones[tone ?? 'slate'] ?? tones.slate,
                className,
            )}
        >
            {children}
        </span>
    );
}
