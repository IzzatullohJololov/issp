import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function FilterChip({
    active,
    onClick,
    children,
}: {
    active: boolean;
    onClick: () => void;
    children: ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'rounded-full border px-4 py-1.5 text-sm font-semibold focus-ring transition',
                active
                    ? 'border-navy-900 bg-navy-900 text-white'
                    : 'border-slate-300 bg-white text-slate-700 hover:border-navy-400',
            )}
        >
            {children}
        </button>
    );
}

export function FilterSelect({
    value,
    onChange,
    placeholder,
    options,
}: {
    value: string | number | null | undefined;
    onChange: (value: string) => void;
    placeholder: string;
    options: { value: string | number; label: string }[];
}) {
    return (
        <select
            value={value ?? ''}
            onChange={(event) => onChange(event.target.value)}
            className="h-10 max-w-xs rounded-lg border border-slate-300 bg-white px-3 text-sm focus-ring"
        >
            <option value="">{placeholder}</option>
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    );
}

/**
 * Remove empty values from a filter object before sending it as a query string.
 */
export function cleanQuery(
    params: Record<string, string | number | null | undefined>,
): Record<string, string | number> {
    return Object.fromEntries(
        Object.entries(params).filter(
            ([, value]) =>
                value !== null && value !== undefined && value !== '',
        ),
    ) as Record<string, string | number>;
}
