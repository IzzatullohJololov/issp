import { X } from 'lucide-react';
import { type ReactNode, useEffect } from 'react';
import { cn } from '@/lib/utils';

export function Modal({
    open,
    onClose,
    title,
    children,
    footer,
    size = 'md',
}: {
    open: boolean;
    onClose: () => void;
    title?: ReactNode;
    children: ReactNode;
    footer?: ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
    useEffect(() => {
        if (!open) {
            return;
        }

        const handler = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handler);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handler);
            document.body.style.overflow = '';
        };
    }, [open, onClose]);

    if (!open) {
        return null;
    }

    const widths = {
        sm: 'max-w-md',
        md: 'max-w-xl',
        lg: 'max-w-3xl',
        xl: 'max-w-5xl',
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6"
            role="dialog"
            aria-modal="true"
        >
            <button
                type="button"
                aria-label="close"
                className="animate-fade-in absolute inset-0 bg-navy-950/60 backdrop-blur-sm"
                onClick={onClose}
            />
            <div
                className={cn(
                    'animate-fade-up relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-float sm:rounded-2xl',
                    widths[size],
                )}
            >
                {title && (
                    <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                        <h2 className="text-base font-bold text-navy-900">
                            {title}
                        </h2>
                        <button
                            type="button"
                            onClick={onClose}
                            className="focus-ring rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                )}
                <div className="flex-1 overflow-y-auto px-5 py-4">
                    {children}
                </div>
                {footer && (
                    <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}
