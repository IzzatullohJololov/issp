import { Link } from '@inertiajs/react';
import {
    ArrowUpRight,
    Briefcase,
    CalendarClock,
    FlaskConical,
} from 'lucide-react';
import { PageHero } from '@/components/site/section';
import { EmptyState } from '@/components/ui/empty-state';
import { SiteLayout } from '@/layouts/site-layout';
import { formatDate } from '@/lib/format';
import { useTranslation } from '@/lib/i18n';
import type { VacancyItem } from '@/types';

export default function VacanciesIndex({ items }: { items: VacancyItem[] }) {
    const { t, locale } = useTranslation();

    return (
        <SiteLayout title={t('vacancies')}>
            <PageHero
                eyebrow={t('about')}
                title={t('vacancies')}
                breadcrumbs={[
                    { label: t('home'), href: '/' },
                    { label: t('vacancies') },
                ]}
                compact
            />
            <div className="container-site py-10">
                {items.length === 0 ? (
                    <EmptyState
                        title={t('no_vacancies')}
                        icon={<Briefcase className="h-6 w-6" />}
                    />
                ) : (
                    <div className="grid gap-5 lg:grid-cols-2">
                        {items.map((vacancy) => (
                            <Link
                                key={vacancy.id}
                                href={vacancy.url}
                                className="group flex flex-col card p-6 transition hover:-translate-y-0.5 hover:shadow-float"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <h2 className="font-serif text-xl font-bold text-navy-900 group-hover:text-navy-600">
                                        {vacancy.title}
                                    </h2>
                                    <ArrowUpRight className="h-5 w-5 shrink-0 text-slate-300 transition group-hover:text-navy-600" />
                                </div>
                                <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-600">
                                    {vacancy.laboratory && (
                                        <span className="inline-flex items-center gap-1.5">
                                            <FlaskConical className="h-4 w-4 text-gold-500" />
                                            {vacancy.laboratory.name}
                                        </span>
                                    )}
                                    {vacancy.deadline && (
                                        <span className="inline-flex items-center gap-1.5">
                                            <CalendarClock className="h-4 w-4 text-gold-500" />
                                            {t('deadline')}:{' '}
                                            {formatDate(
                                                vacancy.deadline,
                                                locale,
                                            )}
                                        </span>
                                    )}
                                </div>
                                {vacancy.requirements.length > 0 && (
                                    <ul className="mt-4 space-y-1 text-sm text-slate-600">
                                        {vacancy.requirements
                                            .slice(0, 3)
                                            .map((req, index) => (
                                                <li
                                                    key={index}
                                                    className="flex gap-2"
                                                >
                                                    <span className="text-gold-500">
                                                        •
                                                    </span>
                                                    {req}
                                                </li>
                                            ))}
                                    </ul>
                                )}
                                {vacancy.salary && (
                                    <p className="mt-4 text-sm font-semibold text-navy-900">
                                        {t('salary')}: {vacancy.salary}
                                    </p>
                                )}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </SiteLayout>
    );
}
