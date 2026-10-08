import { Link } from '@inertiajs/react';
import {
    ArrowUpRight,
    Calendar,
    Clock,
    ExternalLink,
    MapPin,
    Mic,
    Pin,
    User,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { dateParts, formatDate, formatTime, initials } from '@/lib/format';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type {
    EventCard as EventCardType,
    LabCard as LabCardType,
    NewsCard as NewsCardType,
    PersonCard as PersonCardType,
    PublicationItem,
} from '@/types';

export function NewsCard({
    item,
    featured = false,
    horizontal = false,
}: {
    item: NewsCardType;
    featured?: boolean;
    horizontal?: boolean;
}) {
    const { locale, t } = useTranslation();

    if (featured) {
        return (
            <Link
                href={item.url}
                className="group relative flex min-h-[420px] flex-col justify-end overflow-hidden card bg-navy-900 text-white"
            >
                {item.cover ? (
                    <img
                        src={item.cover}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                ) : (
                    <CoverPattern />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/60 to-transparent" />
                <div className="relative p-6 sm:p-8">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                        <Badge tone="gold">
                            <Pin className="h-3 w-3" /> {t('pinned')}
                        </Badge>
                        {item.category && (
                            <span className="text-xs font-semibold text-navy-200">
                                {item.category.name}
                            </span>
                        )}
                    </div>
                    <h3 className="font-serif text-2xl leading-tight font-bold text-balance sm:text-3xl">
                        {item.title}
                    </h3>
                    {item.excerpt && (
                        <p className="mt-3 line-clamp-2 max-w-xl text-sm text-navy-100">
                            {item.excerpt}
                        </p>
                    )}
                    <p className="mt-4 text-xs font-semibold text-gold-300">
                        {formatDate(item.published_at, locale)}
                    </p>
                </div>
            </Link>
        );
    }

    if (horizontal) {
        return (
            <Link
                href={item.url}
                className="group flex gap-4 rounded-xl p-2 transition hover:bg-white"
            >
                <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-navy-100">
                    {item.cover ? (
                        <img
                            src={item.cover}
                            alt=""
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <CoverPattern small />
                    )}
                </div>
                <div className="min-w-0">
                    <p className="text-[11px] font-bold tracking-wider text-gold-600 uppercase">
                        {formatDate(item.published_at, locale)}
                    </p>
                    <h4 className="mt-1 line-clamp-2 text-sm font-bold text-navy-900 group-hover:text-navy-600">
                        {item.title}
                    </h4>
                </div>
            </Link>
        );
    }

    return (
        <Link
            href={item.url}
            className="group flex h-full flex-col overflow-hidden card transition hover:-translate-y-0.5 hover:shadow-float"
        >
            <div className="relative aspect-[16/10] overflow-hidden bg-navy-100">
                {item.cover ? (
                    <img
                        src={item.cover}
                        alt=""
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        loading="lazy"
                    />
                ) : (
                    <CoverPattern />
                )}
                {item.category && (
                    <div className="absolute top-3 left-3">
                        <Badge tone={item.category.color}>
                            {item.category.name}
                        </Badge>
                    </div>
                )}
            </div>
            <div className="flex flex-1 flex-col p-5">
                <p className="text-xs font-semibold text-slate-500">
                    {formatDate(item.published_at, locale)}
                </p>
                <h3 className="mt-2 line-clamp-3 font-serif text-lg leading-snug font-bold text-navy-900 group-hover:text-navy-600">
                    {item.title}
                </h3>
                {item.excerpt && (
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600">
                        {item.excerpt}
                    </p>
                )}
                <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-bold text-navy-700">
                    {t('read_more')}
                    <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
            </div>
        </Link>
    );
}

export function CoverPattern({ small = false }: { small?: boolean }) {
    return (
        <div className="absolute inset-0 overflow-hidden bg-gradient-to-br from-navy-800 via-navy-900 to-navy-950">
            <svg
                className={cn(
                    'absolute text-white/10',
                    small
                        ? '-right-4 -bottom-4 h-24 w-24'
                        : '-right-10 -bottom-10 h-64 w-64',
                )}
                viewBox="0 0 100 100"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
            >
                <circle cx="50" cy="50" r="6" fill="currentColor" />
                <ellipse cx="50" cy="50" rx="44" ry="16" />
                <ellipse
                    cx="50"
                    cy="50"
                    rx="44"
                    ry="16"
                    transform="rotate(60 50 50)"
                />
                <ellipse
                    cx="50"
                    cy="50"
                    rx="44"
                    ry="16"
                    transform="rotate(120 50 50)"
                />
            </svg>
        </div>
    );
}

export function EventCard({
    item,
    compact = false,
}: {
    item: EventCardType;
    compact?: boolean;
}) {
    const { locale } = useTranslation();
    const parts = dateParts(item.starts_at, locale);

    return (
        <Link
            href={item.url}
            className={cn(
                'group flex gap-4 card transition hover:-translate-y-0.5 hover:shadow-float',
                compact ? 'p-4' : 'p-5',
            )}
        >
            <div className="flex w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-navy-900 py-2 text-white">
                <span className="font-serif text-2xl leading-none font-bold">
                    {parts.day}
                </span>
                <span className="mt-1 text-[11px] font-bold tracking-wider uppercase">
                    {parts.month}
                </span>
                <span className="text-[10px] text-navy-300">{parts.year}</span>
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={eventTone(item.type)}>{item.type_label}</Badge>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500">
                        <Clock className="h-3.5 w-3.5" />
                        {formatTime(item.starts_at, locale)}
                    </span>
                </div>
                <h3
                    className={cn(
                        'mt-2 leading-snug font-bold text-navy-900 group-hover:text-navy-600',
                        compact ? 'line-clamp-2 text-sm' : 'text-base',
                    )}
                >
                    {item.title}
                </h3>
                {!compact && item.speaker && (
                    <p className="mt-1.5 inline-flex items-center gap-1.5 text-sm text-slate-600">
                        <Mic className="h-3.5 w-3.5 text-gold-500" />
                        {item.speaker}
                        {item.speaker_affiliation && (
                            <span className="text-slate-400">
                                · {item.speaker_affiliation}
                            </span>
                        )}
                    </p>
                )}
                {!compact && item.location && (
                    <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-slate-500">
                        <MapPin className="h-3.5 w-3.5" />
                        {item.location}
                    </p>
                )}
            </div>
        </Link>
    );
}

export function eventTone(type: string): string {
    return (
        {
            seminar: 'blue',
            conference: 'violet',
            school: 'emerald',
            defense: 'rose',
            lecture: 'amber',
        }[type] ?? 'slate'
    );
}

export function PersonCard({
    item,
    showLab = true,
}: {
    item: PersonCardType;
    showLab?: boolean;
}) {
    return (
        <Link
            href={item.url}
            className="group flex items-center gap-4 card p-4 transition hover:-translate-y-0.5 hover:shadow-float"
        >
            <Avatar name={item.full_name} photo={item.photo} />
            <div className="min-w-0">
                <h3 className="leading-snug font-bold text-navy-900 group-hover:text-navy-600">
                    {item.full_name}
                </h3>
                <p className="mt-0.5 line-clamp-2 text-sm text-slate-600">
                    {item.management_role ?? item.position}
                </p>
                {item.degree && (
                    <p className="mt-0.5 line-clamp-1 text-xs text-slate-400">
                        {item.degree}
                    </p>
                )}
                {showLab && item.laboratory && (
                    <p className="mt-1 line-clamp-1 text-xs font-semibold text-navy-600">
                        {item.laboratory.name}
                    </p>
                )}
            </div>
        </Link>
    );
}

export function Avatar({
    name,
    photo,
    size = 'md',
}: {
    name: string;
    photo: string | null;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
    const sizes = {
        sm: 'h-10 w-10 text-xs',
        md: 'h-16 w-16 text-base',
        lg: 'h-24 w-24 text-xl',
        xl: 'h-40 w-40 text-3xl',
    };

    return (
        <div
            className={cn(
                'flex shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-navy-100 font-bold text-navy-700',
                sizes[size],
            )}
        >
            {photo ? (
                <img
                    src={photo}
                    alt={name}
                    className="h-full w-full object-cover"
                />
            ) : (
                initials(name) || <User className="h-1/2 w-1/2" />
            )}
        </div>
    );
}

export function LabCard({ item }: { item: LabCardType }) {
    const { t } = useTranslation();

    return (
        <Link
            href={item.url}
            className="group flex h-full flex-col card p-5 transition hover:-translate-y-0.5 hover:shadow-float"
        >
            <div className="flex items-start justify-between gap-3">
                <span className="rounded-lg bg-gold-50 px-2 py-1 text-[11px] font-bold tracking-wider text-gold-700 uppercase">
                    {item.short_name ?? 'LAB'}
                </span>
                <ArrowUpRight className="h-5 w-5 text-slate-300 transition group-hover:text-navy-600" />
            </div>
            <h3 className="mt-3 font-serif text-lg leading-snug font-bold text-navy-900 group-hover:text-navy-600">
                {item.name}
            </h3>
            {item.head && (
                <div className="mt-auto flex items-center gap-3 pt-4">
                    <Avatar
                        name={item.head.full_name}
                        photo={item.head.photo}
                        size="sm"
                    />
                    <div className="min-w-0">
                        <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                            {t('head')}
                        </p>
                        <p className="truncate text-sm font-semibold text-slate-700">
                            {item.head.full_name}
                        </p>
                    </div>
                </div>
            )}
        </Link>
    );
}

export function PublicationRow({ item }: { item: PublicationItem }) {
    const { t } = useTranslation();

    return (
        <article className="flex flex-col gap-3 card p-5 sm:flex-row sm:items-start">
            <div className="flex w-16 shrink-0 flex-col items-center rounded-lg bg-navy-50 py-2 text-navy-900">
                <span className="font-serif text-xl font-bold">
                    {item.year}
                </span>
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="slate">{item.type_label}</Badge>
                    {item.laboratory && (
                        <span className="text-xs font-semibold text-navy-600">
                            {item.laboratory.name}
                        </span>
                    )}
                </div>
                <h3 className="mt-2 leading-snug font-bold text-navy-900">
                    {item.title}
                </h3>
                <p className="mt-1 text-sm text-slate-600">{item.authors}</p>
                <p className="mt-1 text-sm text-slate-500 italic">
                    {[item.journal, item.volume, item.pages]
                        .filter(Boolean)
                        .join(', ')}
                </p>
                <div className="mt-2 flex flex-wrap gap-3 text-xs font-semibold">
                    {item.doi_url && (
                        <a
                            href={item.doi_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-navy-600 hover:text-navy-900"
                        >
                            {t('doi')}: {item.doi}
                            <ExternalLink className="h-3 w-3" />
                        </a>
                    )}
                    {item.url && (
                        <a
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-navy-600 hover:text-navy-900"
                        >
                            {t('read_more')}
                            <ExternalLink className="h-3 w-3" />
                        </a>
                    )}
                </div>
            </div>
        </article>
    );
}

export function DateLine({
    value,
    withIcon = true,
}: {
    value: string | null;
    withIcon?: boolean;
}) {
    const { locale } = useTranslation();

    return (
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500">
            {withIcon && <Calendar className="h-4 w-4 text-gold-500" />}
            {formatDate(value, locale)}
        </span>
    );
}
