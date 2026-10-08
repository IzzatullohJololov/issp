import { Link, router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import type { FormEvent } from 'react';
import {
    EventCard,
    LabCard,
    NewsCard,
    PersonCard,
    PublicationRow,
} from '@/components/site/cards';
import { PageHero } from '@/components/site/section';
import { EmptyState } from '@/components/ui/empty-state';
import { SiteLayout } from '@/layouts/site-layout';
import { useTranslation } from '@/lib/i18n';
import { formString } from '@/lib/utils';
import type {
    EventCard as EventCardType,
    LabCard as LabCardType,
    NewsCard as NewsCardType,
    PageLink,
    PersonCard as PersonCardType,
    PublicationItem,
} from '@/types';

type Results = {
    news?: NewsCardType[];
    events?: EventCardType[];
    people?: PersonCardType[];
    labs?: LabCardType[];
    pages?: PageLink[];
    publications?: PublicationItem[];
};

export default function SearchPage({
    q,
    results,
    total,
}: {
    q: string;
    results: Results;
    total: number;
}) {
    const { t } = useTranslation();

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        router.get('/search', { q: formString(form, 'q') });
    };

    const sections: { key: keyof Results; title: string }[] = [
        { key: 'news', title: t('news') },
        { key: 'events', title: t('events') },
        { key: 'labs', title: t('laboratories') },
        { key: 'people', title: t('staff') },
        { key: 'pages', title: t('subsections') },
        { key: 'publications', title: t('publications') },
    ];

    return (
        <SiteLayout title={t('search')}>
            <PageHero
                title={t('search_results')}
                description={q ? `«${q}» — ${total}` : null}
                compact
            >
                <form onSubmit={submit} className="mt-8 flex max-w-2xl gap-2">
                    <div className="relative flex-1">
                        <Search className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-400" />
                        <input
                            name="q"
                            defaultValue={q}
                            type="search"
                            placeholder={t('search_placeholder')}
                            className="h-12 w-full rounded-xl border-0 bg-white pr-4 pl-12 text-base text-navy-900 focus-ring"
                            autoFocus
                        />
                    </div>
                    <button
                        type="submit"
                        className="h-12 rounded-xl bg-gold-400 px-6 font-bold text-navy-950 focus-ring hover:bg-gold-300"
                    >
                        {t('search')}
                    </button>
                </form>
            </PageHero>

            <div className="container-site py-12">
                {q && total === 0 && <EmptyState title={t('nothing_found')} />}

                <div className="space-y-14">
                    {sections.map(({ key, title }) => {
                        const items = results[key];

                        if (!items || items.length === 0) {
                            return null;
                        }

                        return (
                            <section key={key}>
                                <h2 className="mb-5 font-serif text-2xl font-bold text-navy-900">
                                    {title}{' '}
                                    <span className="text-base font-semibold text-slate-400">
                                        ({items.length})
                                    </span>
                                </h2>
                                {key === 'news' && (
                                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                        {(items as NewsCardType[]).map(
                                            (item) => (
                                                <NewsCard
                                                    key={item.id}
                                                    item={item}
                                                />
                                            ),
                                        )}
                                    </div>
                                )}
                                {key === 'events' && (
                                    <div className="grid gap-4 lg:grid-cols-2">
                                        {(items as EventCardType[]).map(
                                            (item) => (
                                                <EventCard
                                                    key={item.id}
                                                    item={item}
                                                />
                                            ),
                                        )}
                                    </div>
                                )}
                                {key === 'labs' && (
                                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                        {(items as LabCardType[]).map(
                                            (item) => (
                                                <LabCard
                                                    key={item.id}
                                                    item={item}
                                                />
                                            ),
                                        )}
                                    </div>
                                )}
                                {key === 'people' && (
                                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                        {(items as PersonCardType[]).map(
                                            (item) => (
                                                <PersonCard
                                                    key={item.id}
                                                    item={item}
                                                />
                                            ),
                                        )}
                                    </div>
                                )}
                                {key === 'pages' && (
                                    <ul className="divide-y divide-slate-100 card">
                                        {(items as PageLink[]).map((item) => (
                                            <li key={item.id}>
                                                <Link
                                                    href={item.url}
                                                    className="block px-5 py-3 font-semibold text-navy-900 hover:bg-navy-50"
                                                >
                                                    {item.title}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                {key === 'publications' && (
                                    <div className="space-y-4">
                                        {(items as PublicationItem[]).map(
                                            (item) => (
                                                <PublicationRow
                                                    key={item.id}
                                                    item={item}
                                                />
                                            ),
                                        )}
                                    </div>
                                )}
                            </section>
                        );
                    })}
                </div>
            </div>
        </SiteLayout>
    );
}
