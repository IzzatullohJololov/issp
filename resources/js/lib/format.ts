import type { Locale } from '@/types';

const localeTag: Record<Locale, string> = { ru: 'ru-RU', en: 'en-GB' };

export function formatDate(
    value: string | null | undefined,
    locale: Locale = 'ru',
    options: Intl.DateTimeFormatOptions = {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    },
): string {
    if (!value) {
        return '';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat(localeTag[locale], options).format(date);
}

export function formatDateTime(
    value: string | null | undefined,
    locale: Locale = 'ru',
): string {
    return formatDate(value, locale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function formatShortDate(
    value: string | null | undefined,
    locale: Locale = 'ru',
): string {
    return formatDate(value, locale, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

export function formatTime(
    value: string | null | undefined,
    locale: Locale = 'ru',
): string {
    return formatDate(value, locale, { hour: '2-digit', minute: '2-digit' });
}

export function dateParts(
    value: string,
    locale: Locale = 'ru',
): { day: string; month: string; weekday: string; year: string } {
    const date = new Date(value);
    const tag = localeTag[locale];

    return {
        day: new Intl.DateTimeFormat(tag, { day: 'numeric' }).format(date),
        month: new Intl.DateTimeFormat(tag, { month: 'short' })
            .format(date)
            .replace('.', ''),
        weekday: new Intl.DateTimeFormat(tag, { weekday: 'short' }).format(
            date,
        ),
        year: new Intl.DateTimeFormat(tag, { year: 'numeric' }).format(date),
    };
}

export function relativeTime(
    value: string | null | undefined,
    locale: Locale = 'ru',
): string {
    if (!value) {
        return '';
    }

    const date = new Date(value);
    const diff = (date.getTime() - Date.now()) / 1000;
    const abs = Math.abs(diff);
    const rtf = new Intl.RelativeTimeFormat(localeTag[locale], {
        numeric: 'auto',
    });

    if (abs < 60) {
        return rtf.format(Math.round(diff), 'second');
    }
    if (abs < 3600) {
        return rtf.format(Math.round(diff / 60), 'minute');
    }
    if (abs < 86400) {
        return rtf.format(Math.round(diff / 3600), 'hour');
    }
    if (abs < 86400 * 30) {
        return rtf.format(Math.round(diff / 86400), 'day');
    }

    return formatShortDate(value, locale);
}

export function formatBytes(bytes: number): string {
    if (bytes >= 1024 * 1024) {
        return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    }
    if (bytes >= 1024) {
        return `${Math.round(bytes / 1024)} KB`;
    }

    return `${bytes} B`;
}

export function initials(name: string): string {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('');
}
