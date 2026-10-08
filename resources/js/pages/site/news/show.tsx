import { Link } from '@inertiajs/react';
import { ArrowLeft, Eye, ExternalLink } from 'lucide-react';
import { CoverPattern, DateLine, NewsCard } from '@/components/site/cards';
import {
    Breadcrumbs,
    RichText,
    SectionHeading,
} from '@/components/site/section';
import { Badge } from '@/components/ui/badge';
import { SiteLayout } from '@/layouts/site-layout';
import { useTranslation } from '@/lib/i18n';
import type { NewsCard as NewsCardType, NewsItem } from '@/types';

export default function NewsShow({
    item,
    related,
}: {
    item: NewsItem;
    related: NewsCardType[];
}) {
    const { t } = useTranslation();

    return (
        <SiteLayout title={item.title} description={item.excerpt}>
            <article>
                <div className="container-site pt-8">
                    <Breadcrumbs
                        items={[
                            { label: t('home'), href: '/' },
                            { label: t('news'), href: '/news' },
                            { label: item.title },
                        ]}
                    />
                    <header className="mx-auto mt-8 max-w-3xl">
                        <div className="flex flex-wrap items-center gap-3">
                            {item.category && (
                                <Badge tone={item.category.color}>
                                    {item.category.name}
                                </Badge>
                            )}
                            <DateLine value={item.published_at} />
                            <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                                <Eye className="h-3.5 w-3.5" />
                                {item.views} {t('views')}
                            </span>
                        </div>
                        <h1 className="mt-4 font-serif text-3xl leading-tight font-bold tracking-tight text-balance text-navy-900 sm:text-4xl lg:text-5xl">
                            {item.title}
                        </h1>
                        {item.excerpt && (
                            <p className="mt-5 text-lg leading-relaxed text-slate-600">
                                {item.excerpt}
                            </p>
                        )}
                    </header>
                    <div className="relative mx-auto mt-8 aspect-[21/9] max-w-5xl overflow-hidden rounded-2xl bg-navy-100">
                        {item.cover ? (
                            <img
                                src={item.cover}
                                alt=""
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <CoverPattern />
                        )}
                    </div>
                    <div className="mx-auto mt-10 max-w-3xl">
                        <RichText html={item.body} />
                        {item.source_url && (
                            <a
                                href={item.source_url}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-navy-600 hover:text-navy-900"
                            >
                                <ExternalLink className="h-4 w-4" />
                                {item.source_url}
                            </a>
                        )}
                        <div className="mt-12 border-t border-slate-200 pt-6">
                            <Link
                                href="/news"
                                className="inline-flex items-center gap-2 text-sm font-bold text-navy-700 hover:text-navy-900"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                {t('all_news')}
                            </Link>
                        </div>
                    </div>
                </div>
            </article>

            {related.length > 0 && (
                <section className="container-site mt-16">
                    <SectionHeading title={t('related_news')} />
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {related.map((news) => (
                            <NewsCard key={news.id} item={news} />
                        ))}
                    </div>
                </section>
            )}
        </SiteLayout>
    );
}
