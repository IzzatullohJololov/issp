import type { ClassValue } from 'clsx';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Read a text field from a FormData instance, ignoring file entries.
 */
export function formString(form: FormData, key: string): string {
    const value = form.get(key);

    return typeof value === 'string' ? value : '';
}

/**
 * Render an unknown scalar as an input value without "[object Object]" surprises.
 */
export function asString(value: unknown): string {
    if (value === null || value === undefined) {
        return '';
    }

    if (typeof value === 'string') {
        return value;
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
        return String(value);
    }

    return '';
}
