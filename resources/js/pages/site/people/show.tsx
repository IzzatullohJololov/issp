import { Link } from '@inertiajs/react';
import { ExternalLink, FlaskConical, Mail, MapPin, Phone } from 'lucide-react';
import { Avatar } from '@/components/site/cards';
import { Breadcrumbs, RichText } from '@/components/site/section';
import { Badge } from '@/components/ui/badge';
import { SiteLayout } from '@/layouts/site-layout';
import { useTranslation } from '@/lib/i18n';
import type { PersonItem } from '@/types';

export default function PersonShow({ person }: { person: PersonItem }) {
    const { t } = useTranslation();

    return (
        <SiteLayout title={person.full_name}>
            <div className="container-site pt-8">
                <Breadcrumbs
                    items={[
                        { label: t('home'), href: '/' },
                        { label: t('staff'), href: '/people' },
                        { label: person.full_name },
                    ]}
                />
                <div className="mt-8 grid gap-10 lg:grid-cols-12">
                    <aside className="lg:col-span-4">
                        <div className="card p-6">
                            <Avatar
                                name={person.full_name}
                                photo={person.photo}
                                size="xl"
                            />
                            <div className="mt-5 flex flex-wrap gap-2">
                                {person.is_management && (
                                    <Badge tone="gold">{t('management')}</Badge>
                                )}
                                {person.is_council_member && (
                                    <Badge tone="blue">{t('council')}</Badge>
                                )}
                            </div>
                            <ul className="mt-5 space-y-3 text-sm">
                                {person.laboratory && (
                                    <li className="flex items-start gap-3">
                                        <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-navy-500" />
                                        <Link
                                            href={person.laboratory.url}
                                            className="font-medium text-navy-600 hover:underline"
                                        >
                                            {person.laboratory.name}
                                        </Link>
                                    </li>
                                )}
                                {person.email && (
                                    <li className="flex items-center gap-3">
                                        <Mail className="h-4 w-4 text-navy-500" />
                                        <a
                                            href={`mailto:${person.email}`}
                                            className="font-medium text-navy-600 hover:underline"
                                        >
                                            {person.email}
                                        </a>
                                    </li>
                                )}
                                {person.phone && (
                                    <li className="flex items-center gap-3">
                                        <Phone className="h-4 w-4 text-navy-500" />
                                        <span className="font-medium text-slate-700">
                                            {person.phone}
                                        </span>
                                    </li>
                                )}
                                {person.room && (
                                    <li className="flex items-center gap-3">
                                        <MapPin className="h-4 w-4 text-navy-500" />
                                        <span className="font-medium text-slate-700">
                                            {t('room')} {person.room}
                                        </span>
                                    </li>
                                )}
                                {person.orcid && (
                                    <li className="flex items-center gap-3">
                                        <ExternalLink className="h-4 w-4 text-navy-500" />
                                        <a
                                            href={`https://orcid.org/${person.orcid}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="font-medium text-navy-600 hover:underline"
                                        >
                                            ORCID {person.orcid}
                                        </a>
                                    </li>
                                )}
                            </ul>
                        </div>
                    </aside>
                    <article className="lg:col-span-8">
                        <p className="eyebrow text-gold-600">
                            {person.management_role ?? person.position}
                        </p>
                        <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl lg:text-5xl">
                            {person.full_name}
                        </h1>
                        {person.degree && (
                            <p className="mt-3 text-lg text-slate-600">
                                {person.degree}
                            </p>
                        )}
                        {person.management_role &&
                            person.position &&
                            person.management_role !== person.position && (
                                <p className="mt-1 text-sm text-slate-500">
                                    {person.position}
                                </p>
                            )}
                        <div className="mt-8">
                            {person.bio ? (
                                <RichText html={person.bio} />
                            ) : (
                                <p className="text-slate-400">—</p>
                            )}
                        </div>
                    </article>
                </div>
            </div>
        </SiteLayout>
    );
}
