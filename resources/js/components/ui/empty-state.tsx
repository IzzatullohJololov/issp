import { Inbox } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function EmptyState({
    title,
    description,
    action,
    icon,
    className,
}: {
    title: string;
    description?: string;
    action?: ReactNode;
    icon?: ReactNode;
    className?: string;
}) {
    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-14 text-center',
                className,
            )}
        >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-navy-50 text-navy-500">
                {icon ?? <Inbox className="h-6 w-6" />}
            </div>
            <h3 className="text-base font-bold text-navy-900">{title}</h3>
            {description && (
                <p className="mt-1 max-w-sm text-sm text-slate-500">
                    {description}
                </p>
            )}
            {action && <div className="mt-5">{action}</div>}
        </div>
    );
}
