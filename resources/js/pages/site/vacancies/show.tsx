import { Link } from '@inertiajs/react';
import {
    ArrowLeft,
    CalendarClock,
    FlaskConical,
    Mail,
    Wallet,
} from 'lucide-react';
import { Breadcrumbs, RichText } from '@/components/site/section';
import { Button } from '@/components/ui/button';
import { SiteLayout } from '@/layouts/site-layout';
import { formatDate } from '@/lib/format';
import { useTranslation } from '@/lib/i18n';
import type { VacancyItem } from '@/types';

export default function VacancyShow({ item }: { item: VacancyItem }) {
    const { t, locale } = useTranslation();

    return (
        <SiteLayout title={item.title}>
            <div className="container-site pt-8">
                <Breadcrumbs
                    items={[
                        { label: t('home'), href: '/' },
                        { label: t('vacancies'), href: '/vacancies' },
                        { label: item.title },
                    ]}
                />
                <div className="mt-8 grid gap-10 lg:grid-cols-12">
                    <article className="lg:col-span-8">
                        <p className="eyebrow text-gold-600">
                            {t('vacancies')}
                        </p>
                        <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl lg:text-5xl">
                            {item.title}
                        </h1>
                        <div className="mt-8">
                            <RichText html={item.description} />
                        </div>
                        {item.requirements.length > 0 && (
                            <section className="mt-10">
                                <h2 className="font-serif text-2xl font-bold text-navy-900">
                                    {t('requirements')}
                                </h2>
                                <ul className="mt-4 space-y-2">
                                    {item.requirements.map((req, index) => (
                                        <li
                                            key={index}
                                            className="flex gap-3 text-slate-700"
                                        >
                                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                                            {req}
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}
                        <div className="mt-12 border-t border-slate-200 pt-6">
                            <Link
                                href="/vacancies"
                                className="inline-flex items-center gap-2 text-sm font-bold text-navy-700 hover:text-navy-900"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                {t('vacancies')}
                            </Link>
                        </div>
                    </article>
                    <aside className="lg:col-span-4">
                        <div className="sticky top-24 card p-6">
                            <dl className="space-y-4 text-sm">
                                {item.laboratory && (
                                    <div className="flex gap-3">
                                        <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-navy-500" />
                                        <div>
                                            <dt className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                                                {t('laboratory')}
                                            </dt>
                                            <dd>
                                                <Link
                                                    href={item.laboratory.url}
                                                    className="font-semibold text-navy-600 hover:underline"
                                                >
                                                    {item.laboratory.name}
                                                </Link>
                                            </dd>
                                        </div>
                                    </div>
                                )}
                                {item.salary && (
                                    <div className="flex gap-3">
                                        <Wallet className="mt-0.5 h-4 w-4 shrink-0 text-navy-500" />
                                        <div>
                                            <dt className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                                                {t('salary')}
                                            </dt>
                                            <dd className="font-semibold text-navy-900">
                                                {item.salary}
                                            </dd>
                                        </div>
                                    </div>
                                )}
                                {item.deadline && (
                                    <div className="flex gap-3">
                                        <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-navy-500" />
                                        <div>
                                            <dt className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                                                {t('deadline')}
                                            </dt>
                                            <dd className="font-semibold text-navy-900">
                                                {formatDate(
                                                    item.deadline,
                                                    locale,
                                                )}
                                            </dd>
                                        </div>
                                    </div>
                                )}
                            </dl>
                            {item.contact_email && (
                                <Button
                                    href={`mailto:${item.contact_email}?subject=${encodeURIComponent(item.title)}`}
                                    external
                                    variant="gold"
                                    className="mt-6 w-full"
                                >
                                    <Mail className="h-4 w-4" />
                                    {t('apply_vacancy')}
                                </Button>
                            )}
                        </div>
                    </aside>
                </div>
            </div>
        </SiteLayout>
    );
}
