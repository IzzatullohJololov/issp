import { usePage } from '@inertiajs/react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

type Toast = { id: number; type: 'success' | 'error'; message: string };

export function FlashToasts() {
    const { flash, errors } = usePage().props;
    const [toasts, setToasts] = useState<Toast[]>([]);

    const success = flash?.success ?? null;
    const error = flash?.error ?? null;
    const errorCount = errors ? Object.keys(errors).length : 0;

    useEffect(() => {
        const next: Toast[] = [];

        if (success) {
            next.push({ id: Date.now(), type: 'success', message: success });
        }
        if (error) {
            next.push({ id: Date.now() + 1, type: 'error', message: error });
        }
        if (!error && errorCount > 0) {
            next.push({
                id: Date.now() + 2,
                type: 'error',
                message: 'Проверьте правильность заполнения формы.',
            });
        }

        if (next.length === 0) {
            return;
        }

        setToasts((current) => [...current, ...next]);

        const timer = setTimeout(() => {
            setToasts((current) =>
                current.filter((toast) => !next.some((n) => n.id === toast.id)),
            );
        }, 5000);

        return () => clearTimeout(timer);
    }, [success, error, errorCount]);

    if (toasts.length === 0) {
        return null;
    }

    return (
        <div className="pointer-events-none fixed right-4 bottom-4 z-[60] flex w-full max-w-sm flex-col gap-2">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={cn(
                        'animate-fade-up pointer-events-auto flex items-start gap-3 rounded-xl px-4 py-3 text-sm shadow-float',
                        toast.type === 'success'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-rose-600 text-white',
                    )}
                >
                    {toast.type === 'success' ? (
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                    ) : (
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    )}
                    <span className="flex-1 font-medium">{toast.message}</span>
                    <button
                        type="button"
                        onClick={() =>
                            setToasts((current) =>
                                current.filter((t) => t.id !== toast.id),
                            )
                        }
                        className="rounded p-0.5 opacity-70 hover:opacity-100"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            ))}
        </div>
    );
}
