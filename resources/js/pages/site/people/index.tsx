import { router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import type { FormEvent } from 'react';
import { PersonCard } from '@/components/site/cards';
import {
    cleanQuery,
    FilterChip,
    FilterSelect,
} from '@/components/site/filters';
import { PageHero } from '@/components/site/section';
import { EmptyState } from '@/components/ui/empty-state';
import { Pagination } from '@/components/ui/pagination';
import { SiteLayout } from '@/layouts/site-layout';
import { useTranslation } from '@/lib/i18n';
import type { Paginated, PersonCard as PersonCardType } from '@/types';
import { formString } from '@/lib/utils';

type Props = {
    items: Paginated<PersonCardType>;
    labs: { slug: string; name: string }[];
    filters: { group: string; lab: string | null; q: string | null };
};

export default function PeopleIndex({ items, labs, filters }: Props) {
    const { t } = useTranslation();

    const titles: Record<string, string> = {
        all: t('staff'),
        management: t('management'),
        council: t('council'),
    };

    const apply = (next: Partial<Props['filters']>) => {
        router.get('/people', cleanQuery({ ...filters, ...next }), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const onSearch = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        apply({ q: formString(form, 'q') || null });
    };

    return (
        <SiteLayout title={titles[filters.group] ?? t('staff')}>
            <PageHero
                eyebrow={t('about')}
                title={titles[filters.group] ?? t('staff')}
                description={`${items.total} ${t('staff_count')}`}
                breadcrumbs={[
                    { label: t('home'), href: '/' },
                    { label: t('staff') },
                ]}
                compact
            />

            <div className="container-site py-10">
                <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-wrap gap-2">
                        {(['all', 'management', 'council'] as const).map(
                            (group) => (
                                <FilterChip
                                    key={group}
                                    active={filters.group === group}
                                    onClick={() => apply({ group, lab: null })}
                                >
                                    {titles[group]}
                                </FilterChip>
                            ),
                        )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <FilterSelect
                            value={filters.lab}
                            onChange={(value) => apply({ lab: value || null })}
                            placeholder={`${t('laboratory')}: ${t('all').toLowerCase()}`}
                            options={labs.map((lab) => ({
                                value: lab.slug,
                                label: lab.name,
                            }))}
                        />
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
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {items.data.map((person) => (
                            <PersonCard key={person.id} item={person} />
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
