import { Link } from '@inertiajs/react';
import { Globe, Mail, MapPin, Phone } from 'lucide-react';
import {
    Avatar,
    EventCard,
    PersonCard,
    PublicationRow,
} from '@/components/site/cards';
import { PageHero, RichText, SectionHeading } from '@/components/site/section';
import { SiteLayout } from '@/layouts/site-layout';
import { useTranslation } from '@/lib/i18n';
import type {
    EventCard as EventCardType,
    LabItem,
    PersonCard as PersonCardType,
    PublicationItem,
} from '@/types';

export default function LabShow({
    lab,
    people,
    publications,
    events,
}: {
    lab: LabItem;
    people: PersonCardType[];
    publications: PublicationItem[];
    events: EventCardType[];
}) {
    const { t } = useTranslation();

    return (
        <SiteLayout title={lab.name}>
            <PageHero
                eyebrow={lab.department?.name ?? t('laboratories')}
                title={lab.name}
                breadcrumbs={[
                    { label: t('home'), href: '/' },
                    { label: t('structure'), href: '/structure' },
                    { label: lab.short_name ?? lab.name },
                ]}
                compact
            />

            <div className="container-site grid gap-10 py-12 lg:grid-cols-12">
                <div className="lg:col-span-8">
                    {lab.cover && (
                        <img
                            src={lab.cover}
                            alt=""
                            className="mb-8 w-full rounded-2xl shadow-card"
                        />
                    )}
                    <RichText html={lab.description} />

                    {lab.research_areas.length > 0 && (
                        <section className="mt-12">
                            <SectionHeading title={t('research_of_lab')} />
                            <ul className="grid gap-3 sm:grid-cols-2">
                                {lab.research_areas.map((area, index) => (
                                    <li
                                        key={index}
                                        className="flex gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm font-medium text-slate-700"
                                    >
                                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold-400 text-xs font-bold text-navy-950">
                                            {index + 1}
                                        </span>
                                        {area}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    {people.length > 0 && (
                        <section className="mt-12">
                            <SectionHeading
                                title={t('lab_staff')}
                                description={`${people.length} ${t('staff_count')}`}
                            />
                            <div className="grid gap-4 sm:grid-cols-2">
                                {people.map((person) => (
                                    <PersonCard
                                        key={person.id}
                                        item={person}
                                        showLab={false}
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {publications.length > 0 && (
                        <section className="mt-12">
                            <SectionHeading
                                title={t('lab_publications')}
                                action={`/publications?lab=${lab.slug}`}
                                actionLabel={t('see_all')}
                            />
                            <div className="space-y-4">
                                {publications.map((publication) => (
                                    <PublicationRow
                                        key={publication.id}
                                        item={publication}
                                    />
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                <aside className="space-y-6 lg:col-span-4">
                    {lab.head && (
                        <div className="card p-6">
                            <p className="eyebrow text-gold-600">
                                {t('head_of_lab')}
                            </p>
                            <Link
                                href={lab.head.url}
                                className="mt-4 flex items-center gap-4"
                            >
                                <Avatar
                                    name={lab.head.full_name}
                                    photo={lab.head.photo}
                                    size="lg"
                                />
                                <div>
                                    <p className="font-bold text-navy-900">
                                        {lab.head.full_name}
                                    </p>
                                    {lab.head.degree && (
                                        <p className="mt-1 text-xs text-slate-500">
                                            {lab.head.degree}
                                        </p>
                                    )}
                                </div>
                            </Link>
                        </div>
                    )}

                    <div className="card p-6">
                        <p className="eyebrow text-gold-600">{t('contacts')}</p>
                        <ul className="mt-4 space-y-3 text-sm">
                            {lab.phone && (
                                <li className="flex items-center gap-3">
                                    <Phone className="h-4 w-4 text-navy-500" />
                                    <a
                                        href={`tel:${lab.phone}`}
                                        className="font-medium text-slate-700"
                                    >
                                        {lab.phone}
                                    </a>
                                </li>
                            )}
                            {lab.email && (
                                <li className="flex items-center gap-3">
                                    <Mail className="h-4 w-4 text-navy-500" />
                                    <a
                                        href={`mailto:${lab.email}`}
                                        className="font-medium text-navy-600 hover:underline"
                                    >
                                        {lab.email}
                                    </a>
                                </li>
                            )}
                            {lab.room && (
                                <li className="flex items-center gap-3">
                                    <MapPin className="h-4 w-4 text-navy-500" />
                                    <span className="font-medium text-slate-700">
                                        {lab.room}
                                    </span>
                                </li>
                            )}
                            {lab.website && (
                                <li className="flex items-center gap-3">
                                    <Globe className="h-4 w-4 text-navy-500" />
                                    <a
                                        href={lab.website}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="font-medium text-navy-600 hover:underline"
                                    >
                                        {t('website')}
                                    </a>
                                </li>
                            )}
                            {!lab.phone &&
                                !lab.email &&
                                !lab.room &&
                                !lab.website && (
                                    <li className="text-slate-400">—</li>
                                )}
                        </ul>
                    </div>

                    {events.length > 0 && (
                        <div>
                            <p className="mb-3 eyebrow text-gold-600">
                                {t('lab_events')}
                            </p>
                            <div className="space-y-3">
                                {events.map((event) => (
                                    <EventCard
                                        key={event.id}
                                        item={event}
                                        compact
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </aside>
            </div>
        </SiteLayout>
    );
}
