import { router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { type FormEvent } from 'react';
import { NewsCard } from '@/components/site/cards';
import { PageHero } from '@/components/site/section';
import { EmptyState } from '@/components/ui/empty-state';
import { Pagination } from '@/components/ui/pagination';
import { SiteLayout } from '@/layouts/site-layout';
import { FilterChip } from '@/components/site/filters';
import { useTranslation } from '@/lib/i18n';
import type { NewsCard as NewsCardType, Paginated } from '@/types';
import { formString } from '@/lib/utils';

type Props = {
    items: Paginated<NewsCardType>;
    categories: { slug: string; name: string; color: string | null }[];
    years: number[];
    filters: { category: string | null; year: number | null; q: string | null };
};

export default function NewsIndex({
    items,
    categories,
    years,
    filters,
}: Props) {
    const { t } = useTranslation();

    const apply = (next: Partial<Props['filters']>) => {
        router.get(
            '/news',
            Object.fromEntries(
                Object.entries({ ...filters, ...next }).filter(
                    ([, value]) => value !== null && value !== '',
                ),
            ),
            { preserveState: true, preserveScroll: true },
        );
    };

    const onSearch = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        apply({ q: formString(form, 'q') || null });
    };

    return (
        <SiteLayout title={t('news')}>
            <PageHero
                eyebrow={t('news')}
                title={t('news')}
                breadcrumbs={[
                    { label: t('home'), href: '/' },
                    { label: t('news') },
                ]}
                compact
            />

            <div className="container-site py-10">
                <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-wrap gap-2">
                        <FilterChip
                            active={!filters.category}
                            onClick={() => apply({ category: null })}
                        >
                            {t('all')}
                        </FilterChip>
                        {categories.map((category) => (
                            <FilterChip
                                key={category.slug}
                                active={filters.category === category.slug}
                                onClick={() =>
                                    apply({ category: category.slug })
                                }
                            >
                                {category.name}
                            </FilterChip>
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                        <select
                            value={filters.year ?? ''}
                            onChange={(event) =>
                                apply({
                                    year: event.target.value
                                        ? Number(event.target.value)
                                        : null,
                                })
                            }
                            className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm focus-ring"
                        >
                            <option value="">
                                {t('year')}: {t('all').toLowerCase()}
                            </option>
                            {years.map((year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>
                        <form onSubmit={onSearch} className="relative">
                            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                name="q"
                                defaultValue={filters.q ?? ''}
                                type="search"
                                placeholder={t('search')}
                                className="h-10 w-56 rounded-lg border border-slate-300 bg-white pr-3 pl-9 text-sm focus-ring"
                            />
                        </form>
                    </div>
                </div>

                {items.data.length > 0 ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {items.data.map((item) => (
                            <NewsCard key={item.id} item={item} />
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
