import { router } from '@inertiajs/react';
import { Download, FileText } from 'lucide-react';
import { FilterChip } from '@/components/site/filters';
import { PageHero } from '@/components/site/section';
import { EmptyState } from '@/components/ui/empty-state';
import { SiteLayout } from '@/layouts/site-layout';
import { formatShortDate } from '@/lib/format';
import { useTranslation } from '@/lib/i18n';
import type { DocumentItem, Option } from '@/types';

type Props = {
    groups: { key: string; label: string; items: DocumentItem[] }[];
    categories: Option[];
    filters: { category: string | null };
};

export default function DocumentsIndex({ groups, categories, filters }: Props) {
    const { t, locale } = useTranslation();

    const apply = (category: string | null) => {
        router.get('/documents', category ? { category } : {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <SiteLayout title={t('documents')}>
            <PageHero
                eyebrow={t('about')}
                title={t('documents')}
                breadcrumbs={[
                    { label: t('home'), href: '/' },
                    { label: t('documents') },
                ]}
                compact
            />
            <div className="container-site py-10">
                <div className="mb-8 flex flex-wrap gap-2">
                    <FilterChip
                        active={!filters.category}
                        onClick={() => apply(null)}
                    >
                        {t('all')}
                    </FilterChip>
                    {categories.map((category) => (
                        <FilterChip
                            key={category.value}
                            active={filters.category === category.value}
                            onClick={() => apply(String(category.value))}
                        >
                            {category.label}
                        </FilterChip>
                    ))}
                </div>

                {groups.length === 0 && (
                    <EmptyState title={t('nothing_found')} />
                )}

                <div className="space-y-10">
                    {groups.map((group) => (
                        <section key={group.key}>
                            <h2 className="mb-4 font-serif text-2xl font-bold text-navy-900">
                                {group.label}
                            </h2>
                            <ul className="divide-y divide-slate-100 card">
                                {group.items.map((document) => (
                                    <li key={document.id}>
                                        <a
                                            href={document.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="group flex items-center gap-4 px-5 py-4 transition hover:bg-navy-50/60"
                                        >
                                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy-50 text-navy-700">
                                                <FileText className="h-5 w-5" />
                                            </span>
                                            <span className="min-w-0 flex-1">
                                                <span className="block font-semibold text-navy-900 group-hover:text-navy-600">
                                                    {document.title}
                                                </span>
                                                <span className="mt-0.5 block text-xs text-slate-500">
                                                    {[
                                                        document.file_name
                                                            .split('.')
                                                            .pop()
                                                            ?.toUpperCase(),
                                                        document.size,
                                                        document.published_at
                                                            ? formatShortDate(
                                                                  document.published_at,
                                                                  locale,
                                                              )
                                                            : null,
                                                    ]
                                                        .filter(Boolean)
                                                        .join(' · ')}
                                                </span>
                                            </span>
                                            <span className="inline-flex items-center gap-1.5 text-sm font-bold text-navy-600">
                                                <Download className="h-4 w-4" />
                                                <span className="hidden sm:inline">
                                                    {t('download')}
                                                </span>
                                            </span>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    ))}
                </div>
            </div>
        </SiteLayout>
    );
}
