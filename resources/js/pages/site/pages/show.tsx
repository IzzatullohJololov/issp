import { Link, usePage } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import { PageHero, RichText } from '@/components/site/section';
import { SiteLayout } from '@/layouts/site-layout';
import { formatDate } from '@/lib/format';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { PageItem, PageLink } from '@/types';

export default function PageShow({
    page,
    breadcrumbs,
    sidebar,
    children,
}: {
    page: PageItem;
    breadcrumbs: PageLink[];
    sidebar: { root: PageLink; items: PageLink[] };
    children: (PageLink & { excerpt: string | null })[];
}) {
    const { t, locale } = useTranslation();
    const { url } = usePage();
    const wide =
        page.template === 'wide' ||
        (sidebar.items.length === 0 && children.length === 0);

    return (
        <SiteLayout
            title={page.meta_title ?? page.title}
            description={page.meta_description ?? page.excerpt}
        >
            <PageHero
                eyebrow={breadcrumbs[0]?.title}
                title={page.title}
                description={page.excerpt}
                breadcrumbs={[
                    { label: t('home'), href: '/' },
                    ...breadcrumbs.map((crumb) => ({
                        label: crumb.title,
                        href: crumb.url,
                    })),
                    { label: page.title },
                ]}
                compact
            />

            <div
                className={cn(
                    'container-site py-12',
                    !wide && 'grid gap-10 lg:grid-cols-12',
                )}
            >
                {!wide && (
                    <aside className="lg:col-span-3">
                        <nav className="sticky top-24 overflow-hidden card">
                            <Link
                                href={sidebar.root.url}
                                className={cn(
                                    'block px-5 py-3 text-sm font-bold',
                                    sidebar.root.url === url.split('?')[0]
                                        ? 'bg-navy-900 text-white'
                                        : 'bg-navy-50 text-navy-900',
                                )}
                            >
                                {sidebar.root.title}
                            </Link>
                            <ul className="py-1">
                                {sidebar.items.map((item) => {
                                    const active =
                                        item.url === url.split('?')[0];

                                    return (
                                        <li key={item.id}>
                                            <Link
                                                href={item.url}
                                                className={cn(
                                                    'flex items-center justify-between gap-2 px-5 py-2.5 text-sm transition',
                                                    active
                                                        ? 'bg-gold-50 font-bold text-navy-900'
                                                        : 'font-medium text-slate-600 hover:bg-slate-50 hover:text-navy-900',
                                                )}
                                            >
                                                {item.title}
                                                <ChevronRight
                                                    className={cn(
                                                        'h-4 w-4',
                                                        active
                                                            ? 'text-gold-500'
                                                            : 'text-slate-300',
                                                    )}
                                                />
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </nav>
                    </aside>
                )}
                <div
                    className={cn(
                        !wide ? 'lg:col-span-9' : 'mx-auto max-w-4xl',
                    )}
                >
                    {page.cover && (
                        <img
                            src={page.cover}
                            alt=""
                            className="mb-8 w-full rounded-2xl shadow-card"
                        />
                    )}
                    <RichText html={page.body} />

                    {children.length > 0 && (
                        <section className="mt-12">
                            <h2 className="mb-4 font-serif text-2xl font-bold text-navy-900">
                                {t('subsections')}
                            </h2>
                            <div className="grid gap-4 sm:grid-cols-2">
                                {children.map((child) => (
                                    <Link
                                        key={child.id}
                                        href={child.url}
                                        className="group card p-5 transition hover:-translate-y-0.5 hover:shadow-float"
                                    >
                                        <h3 className="font-bold text-navy-900 group-hover:text-navy-600">
                                            {child.title}
                                        </h3>
                                        {child.excerpt && (
                                            <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                                                {child.excerpt}
                                            </p>
                                        )}
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    {page.updated_at && (
                        <p className="mt-12 text-xs text-slate-400">
                            {t('page_updated')}:{' '}
                            {formatDate(page.updated_at, locale)}
                        </p>
                    )}
                </div>
            </div>
        </SiteLayout>
    );
}
