import { Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    Clock,
    ExternalLink,
    FlaskConical,
    MapPin,
    Mic,
} from 'lucide-react';
import { EventCard, eventTone } from '@/components/site/cards';
import {
    Breadcrumbs,
    RichText,
    SectionHeading,
} from '@/components/site/section';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SiteLayout } from '@/layouts/site-layout';
import { formatDate, formatTime } from '@/lib/format';
import { useTranslation } from '@/lib/i18n';
import type { EventCard as EventCardType, EventItem } from '@/types';

export default function EventShow({
    item,
    upcoming,
}: {
    item: EventItem;
    upcoming: EventCardType[];
}) {
    const { t, locale } = useTranslation();

    return (
        <SiteLayout title={item.title}>
            <div className="container-site pt-8">
                <Breadcrumbs
                    items={[
                        { label: t('home'), href: '/' },
                        { label: t('events'), href: '/events' },
                        { label: item.title },
                    ]}
                />
                <div className="mt-8 grid gap-10 lg:grid-cols-12">
                    <article className="lg:col-span-8">
                        <Badge tone={eventTone(item.type)}>
                            {item.type_label}
                        </Badge>
                        <h1 className="mt-4 font-serif text-3xl leading-tight font-bold tracking-tight text-balance text-navy-900 sm:text-4xl lg:text-5xl">
                            {item.title}
                        </h1>
                        {item.speaker && (
                            <p className="mt-5 flex items-start gap-3 text-lg text-slate-700">
                                <Mic className="mt-1 h-5 w-5 shrink-0 text-gold-500" />
                                <span>
                                    <span className="font-bold">
                                        {item.speaker}
                                    </span>
                                    {item.speaker_affiliation && (
                                        <span className="block text-sm text-slate-500">
                                            {item.speaker_affiliation}
                                        </span>
                                    )}
                                </span>
                            </p>
                        )}
                        {item.cover && (
                            <img
                                src={item.cover}
                                alt=""
                                className="mt-8 w-full rounded-2xl shadow-card"
                            />
                        )}
                        <div className="mt-8">
                            <RichText html={item.description} />
                        </div>
                        <div className="mt-12 border-t border-slate-200 pt-6">
                            <Link
                                href="/events"
                                className="inline-flex items-center gap-2 text-sm font-bold text-navy-700 hover:text-navy-900"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                {t('all_events')}
                            </Link>
                        </div>
                    </article>
                    <aside className="lg:col-span-4">
                        <div className="sticky top-24 card p-6">
                            <dl className="space-y-4 text-sm">
                                <Row
                                    icon={<Calendar className="h-4 w-4" />}
                                    label={t('date')}
                                >
                                    {formatDate(item.starts_at, locale, {
                                        weekday: 'long',
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                    })}
                                </Row>
                                <Row
                                    icon={<Clock className="h-4 w-4" />}
                                    label={t('time')}
                                >
                                    {formatTime(item.starts_at, locale)}
                                    {item.ends_at &&
                                        ` — ${formatTime(item.ends_at, locale)}`}
                                </Row>
                                {item.location && (
                                    <Row
                                        icon={<MapPin className="h-4 w-4" />}
                                        label={t('location')}
                                    >
                                        {item.location}
                                    </Row>
                                )}
                                {item.laboratory && (
                                    <Row
                                        icon={
                                            <FlaskConical className="h-4 w-4" />
                                        }
                                        label={t('laboratory')}
                                    >
                                        <Link
                                            href={item.laboratory.url}
                                            className="text-navy-600 hover:underline"
                                        >
                                            {item.laboratory.name}
                                        </Link>
                                    </Row>
                                )}
                            </dl>
                            {item.registration_url && (
                                <Button
                                    href={item.registration_url}
                                    external
                                    variant="gold"
                                    className="mt-6 w-full"
                                >
                                    {t('registration')}
                                    <ExternalLink className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </aside>
                </div>
            </div>

            {upcoming.length > 0 && (
                <section className="container-site mt-16">
                    <SectionHeading
                        title={t('upcoming_events')}
                        action="/events"
                        actionLabel={t('all_events')}
                    />
                    <div className="grid gap-4 md:grid-cols-2">
                        {upcoming.map((event) => (
                            <EventCard key={event.id} item={event} compact />
                        ))}
                    </div>
                </section>
            )}
        </SiteLayout>
    );
}

function Row({
    icon,
    label,
    children,
}: {
    icon: React.ReactNode;
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex gap-3">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-navy-50 text-navy-700">
                {icon}
            </span>
            <div>
                <dt className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                    {label}
                </dt>
                <dd className="mt-0.5 font-semibold text-navy-900">
                    {children}
                </dd>
            </div>
        </div>
    );
}
