import { router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import type { FormEvent } from 'react';
import { PublicationRow } from '@/components/site/cards';
import { cleanQuery, FilterSelect } from '@/components/site/filters';
import { PageHero } from '@/components/site/section';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Pagination } from '@/components/ui/pagination';
import { SiteLayout } from '@/layouts/site-layout';
import { useTranslation } from '@/lib/i18n';
import type { Option, Paginated, PublicationItem } from '@/types';
import { formString } from '@/lib/utils';

type Props = {
    items: Paginated<PublicationItem>;
    years: number[];
    types: Option[];
    labs: { slug: string; name: string }[];
    filters: {
        year: number | null;
        type: string | null;
        lab: string | null;
        q: string | null;
    };
    total: number;
};

export default function PublicationsIndex({
    items,
    years,
    types,
    labs,
    filters,
    total,
}: Props) {
    const { t } = useTranslation();

    const apply = (next: Partial<Props['filters']>) => {
        router.get('/publications', cleanQuery({ ...filters, ...next }), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const onSearch = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        apply({ q: formString(form, 'q') || null });
    };

    const hasFilters = Boolean(
        filters.year || filters.type || filters.lab || filters.q,
    );

    return (
        <SiteLayout title={t('publications')}>
            <PageHero
                eyebrow={t('publications')}
                title={t('publications')}
                description={`${total} ${t('publications_count')}`}
                breadcrumbs={[
                    { label: t('home'), href: '/' },
                    { label: t('publications') },
                ]}
                compact
            />
            <div className="container-site py-10">
                <div className="mb-8 flex flex-wrap items-center gap-3 card p-4">
                    <form
                        onSubmit={onSearch}
                        className="relative min-w-[240px] flex-1"
                    >
                        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            name="q"
                            defaultValue={filters.q ?? ''}
                            type="search"
                            placeholder={`${t('search')}: ${t('publications').toLowerCase()}, ${t('doi')}…`}
                            className="h-10 w-full rounded-lg border border-slate-300 bg-white pr-3 pl-9 text-sm focus-ring"
                        />
                    </form>
                    <FilterSelect
                        value={filters.year}
                        onChange={(value) =>
                            apply({ year: value ? Number(value) : null })
                        }
                        placeholder={`${t('year')}: ${t('all').toLowerCase()}`}
                        options={years.map((year) => ({
                            value: year,
                            label: String(year),
                        }))}
                    />
                    <FilterSelect
                        value={filters.type}
                        onChange={(value) => apply({ type: value || null })}
                        placeholder={`${t('type')}: ${t('all').toLowerCase()}`}
                        options={types}
                    />
                    <FilterSelect
                        value={filters.lab}
                        onChange={(value) => apply({ lab: value || null })}
                        placeholder={`${t('laboratory')}: ${t('all').toLowerCase()}`}
                        options={labs.map((lab) => ({
                            value: lab.slug,
                            label: lab.name,
                        }))}
                    />
                    {hasFilters && (
                        <Button variant="ghost" size="sm" href="/publications">
                            {t('reset')}
                        </Button>
                    )}
                </div>

                {items.data.length > 0 ? (
                    <div className="space-y-4">
                        {items.data.map((publication) => (
                            <PublicationRow
                                key={publication.id}
                                item={publication}
                            />
                        ))}
                    </div>
                ) : (
                    <EmptyState title={t('nothing_found')} />
                )}

                <Pagination paginator={items} className="mt-10" />
            </div>
        </SiteLayout>
    );
}
