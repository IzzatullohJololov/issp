import { router } from '@inertiajs/react';
import { EventCard } from '@/components/site/cards';
import { FilterChip } from '@/components/site/filters';
import { PageHero } from '@/components/site/section';
import { EmptyState } from '@/components/ui/empty-state';
import { Pagination } from '@/components/ui/pagination';
import { SiteLayout } from '@/layouts/site-layout';
import { useTranslation } from '@/lib/i18n';
import type { EventCard as EventCardType, Option, Paginated } from '@/types';

type Props = {
    items: Paginated<EventCardType>;
    types: Option[];
    filters: { period: string; type: string | null };
};

export default function EventsIndex({ items, types, filters }: Props) {
    const { t } = useTranslation();

    const apply = (next: Partial<Props['filters']>) => {
        router.get(
            '/events',
            Object.fromEntries(
                Object.entries({ ...filters, ...next }).filter(
                    ([, value]) => value !== null && value !== '',
                ),
            ),
            { preserveState: true, preserveScroll: true },
        );
    };

    return (
        <SiteLayout title={t('events')}>
            <PageHero
                eyebrow={t('event_calendar')}
                title={t('events')}
                breadcrumbs={[
                    { label: t('home'), href: '/' },
                    { label: t('events') },
                ]}
                compact
            />
            <div className="container-site py-10">
                <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="inline-flex rounded-full bg-navy-50 p-1">
                        {(['upcoming', 'past'] as const).map((period) => (
                            <button
                                key={period}
                                type="button"
                                onClick={() => apply({ period })}
                                className={`rounded-full px-5 py-1.5 text-sm font-bold transition ${
                                    filters.period === period
                                        ? 'bg-navy-900 text-white shadow'
                                        : 'text-navy-700 hover:text-navy-900'
                                }`}
                            >
                                {period === 'upcoming'
                                    ? t('upcoming')
                                    : t('past_events')}
                            </button>
                        ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <FilterChip
                            active={!filters.type}
                            onClick={() => apply({ type: null })}
                        >
                            {t('all')}
                        </FilterChip>
                        {types.map((type) => (
                            <FilterChip
                                key={type.value}
                                active={filters.type === type.value}
                                onClick={() =>
                                    apply({ type: String(type.value) })
                                }
                            >
                                {type.label}
                            </FilterChip>
                        ))}
                    </div>
                </div>

                {items.data.length > 0 ? (
                    <div className="grid gap-4 lg:grid-cols-2">
                        {items.data.map((item) => (
                            <EventCard key={item.id} item={item} />
                        ))}
                    </div>
                ) : (
                    <EmptyState title={t('no_events')} />
                )}

                <Pagination paginator={items} className="mt-10" />
            </div>
        </SiteLayout>
    );
}
