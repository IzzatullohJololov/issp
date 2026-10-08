import { usePage } from '@inertiajs/react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DynamicIcon } from '@/components/icon';
import {
    EventCard,
    LabCard,
    NewsCard,
    PublicationRow,
} from '@/components/site/cards';
import { SectionHeading } from '@/components/site/section';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { SiteLayout } from '@/layouts/site-layout';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type {
    EventCard as EventCardType,
    LabCard as LabCardType,
    NewsCard as NewsCardType,
    PublicationItem,
} from '@/types';

type Slide = {
    id: number;
    title: string;
    subtitle: string | null;
    image: string | null;
    link_url: string | null;
    button_text: string | null;
};

type Props = {
    slides: Slide[];
    pinned: NewsCardType | null;
    news: NewsCardType[];
    events: EventCardType[];
    researchAreas: {
        id: number;
        title: string;
        description: string | null;
        icon: string | null;
    }[];
    labs: LabCardType[];
    publications: PublicationItem[];
    partners: { id: number; title: string; url: string; logo: string | null }[];
    intro: string;
    stats: { value: string; label: string }[];
    counts: { labs: number; people: number; publications: number };
};

export default function Home({
    slides,
    pinned,
    news,
    events,
    researchAreas,
    labs,
    publications,
    partners,
    intro,
    stats,
    counts,
}: Props) {
    const { site } = usePage().props;
    const { t } = useTranslation();

    return (
        <SiteLayout description={site?.tagline}>
            <Hero slides={slides} />

            {/* Stats + intro */}
            <section className="relative z-10 container-site -mt-10">
                <div className="grid gap-6 card p-6 sm:p-8 lg:grid-cols-12">
                    <div className="lg:col-span-7">
                        <p className="eyebrow text-gold-600">{t('about')}</p>
                        <h2 className="mt-2 font-serif text-2xl font-bold text-navy-900 sm:text-3xl">
                            {site?.fullName}
                        </h2>
                        <p className="mt-4 text-base leading-relaxed text-slate-600">
                            {intro}
                        </p>
                        <Button
                            href="/pages/about"
                            variant="outline"
                            className="mt-6"
                        >
                            {t('read_more')}
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4 lg:col-span-5">
                        {(stats.length > 0
                            ? stats
                            : [
                                  {
                                      value: String(site?.founded ?? 1963),
                                      label: t('founded'),
                                  },
                                  {
                                      value: String(counts.labs),
                                      label: t('labs_count'),
                                  },
                                  {
                                      value: String(counts.people),
                                      label: t('staff_count'),
                                  },
                                  {
                                      value: String(counts.publications),
                                      label: t('publications_count'),
                                  },
                              ]
                        ).map((stat) => (
                            <div
                                key={stat.label + stat.value}
                                className="rounded-xl bg-navy-50 p-5"
                            >
                                <p className="font-serif text-3xl font-bold text-navy-900 sm:text-4xl">
                                    {stat.value}
                                </p>
                                <p className="mt-1 text-sm font-semibold text-slate-600">
                                    {stat.label}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* News + events */}
            <section className="container-site py-16 sm:py-20">
                <div className="grid gap-12 lg:grid-cols-12">
                    <div className="lg:col-span-8">
                        <SectionHeading
                            eyebrow={t('news')}
                            title={t('latest_news')}
                            action="/news"
                            actionLabel={t('all_news')}
                        />
                        {pinned || news.length > 0 ? (
                            <div className="grid gap-6 md:grid-cols-2">
                                {pinned && (
                                    <div className="md:col-span-2">
                                        <NewsCard item={pinned} featured />
                                    </div>
                                )}
                                {news.slice(0, 4).map((item) => (
                                    <NewsCard key={item.id} item={item} />
                                ))}
                            </div>
                        ) : (
                            <EmptyState title={t('no_news')} />
                        )}
                    </div>
                    <aside className="lg:col-span-4">
                        <SectionHeading
                            eyebrow={t('events')}
                            title={t('upcoming_events')}
                        />
                        {events.length > 0 ? (
                            <div className="space-y-4">
                                {events.map((item) => (
                                    <EventCard
                                        key={item.id}
                                        item={item}
                                        compact
                                    />
                                ))}
                            </div>
                        ) : (
                            <EmptyState title={t('no_events')} />
                        )}
                        <Button
                            href="/events"
                            variant="secondary"
                            className="mt-6 w-full"
                        >
                            {t('event_calendar')}
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                        {news.length > 4 && (
                            <div className="mt-10">
                                <p className="mb-3 eyebrow text-gold-600">
                                    {t('news')}
                                </p>
                                <div className="divide-y divide-slate-200">
                                    {news.slice(4).map((item) => (
                                        <NewsCard
                                            key={item.id}
                                            item={item}
                                            horizontal
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </aside>
                </div>
            </section>

            {/* Research areas */}
            {researchAreas.length > 0 && (
                <section className="bg-navy-950 py-16 text-white sm:py-20">
                    <div className="container-site">
                        <SectionHeading
                            eyebrow={t('research_areas')}
                            title={
                                site?.name
                                    ? `${t('research_areas')} — ${site.name}`
                                    : t('research_areas')
                            }
                            action="/pages/research"
                            actionLabel={t('read_more')}
                            light
                        />
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {researchAreas.map((area) => (
                                <div
                                    key={area.id}
                                    className="group rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:border-gold-400/50 hover:bg-white/10"
                                >
                                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-400 text-navy-950">
                                        <DynamicIcon
                                            name={area.icon}
                                            className="h-5 w-5"
                                        />
                                    </span>
                                    <h3 className="mt-4 font-serif text-lg font-bold">
                                        {area.title}
                                    </h3>
                                    {area.description && (
                                        <p className="mt-2 text-sm leading-relaxed text-navy-200">
                                            {area.description}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Labs */}
            {labs.length > 0 && (
                <section className="container-site py-16 sm:py-20">
                    <SectionHeading
                        eyebrow={t('structure')}
                        title={t('laboratories')}
                        action="/structure"
                        actionLabel={t('all_labs')}
                    />
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {labs.map((lab) => (
                            <LabCard key={lab.id} item={lab} />
                        ))}
                    </div>
                </section>
            )}

            {/* Publications */}
            {publications.length > 0 && (
                <section className="bg-white py-16 sm:py-20">
                    <div className="container-site">
                        <SectionHeading
                            eyebrow={t('publications')}
                            title={t('featured_publications')}
                            action="/publications"
                            actionLabel={t('all_publications')}
                        />
                        <div className="grid gap-4 lg:grid-cols-2">
                            {publications.map((publication) => (
                                <PublicationRow
                                    key={publication.id}
                                    item={publication}
                                />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Partners */}
            {partners.length > 0 && (
                <section className="container-site py-14">
                    <p className="mb-6 text-center eyebrow text-slate-400">
                        {t('partners')}
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-3">
                        {partners.map((partner) => (
                            <a
                                key={partner.id}
                                href={partner.url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-navy-300 hover:text-navy-900"
                            >
                                {partner.logo && (
                                    <img
                                        src={partner.logo}
                                        alt=""
                                        className="h-5 w-auto"
                                    />
                                )}
                                {partner.title}
                            </a>
                        ))}
                    </div>
                </section>
            )}
        </SiteLayout>
    );
}

function Hero({ slides }: { slides: Slide[] }) {
    const { site } = usePage().props;
    const [index, setIndex] = useState(0);
    const count = slides.length;

    useEffect(() => {
        if (count <= 1) {
            return;
        }

        const timer = setInterval(() => {
            setIndex((current) => (current + 1) % count);
        }, 7000);

        return () => clearInterval(timer);
    }, [count]);

    const slide = slides[index] ?? {
        id: 0,
        title: site?.fullName ?? '',
        subtitle: site?.tagline ?? null,
        image: null,
        link_url: '/pages/about',
        button_text: null,
    };

    return (
        <section className="relative overflow-hidden bg-navy-950 text-white">
            {slide.image ? (
                <img
                    key={slide.id}
                    src={slide.image}
                    alt=""
                    className="absolute inset-0 h-full w-full animate-fade-in object-cover opacity-50"
                />
            ) : (
                <HeroBackdrop />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-950/80 to-navy-900/30" />
            <div className="relative container-site flex min-h-[560px] flex-col justify-center py-24 sm:min-h-[640px]">
                <div key={slide.id} className="max-w-3xl animate-fade-up">
                    <p className="eyebrow text-gold-400">{site?.tagline}</p>
                    <h1 className="mt-4 font-serif text-4xl leading-[1.05] font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                        {slide.title}
                    </h1>
                    {slide.subtitle && (
                        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-navy-100">
                            {slide.subtitle}
                        </p>
                    )}
                    <div className="mt-8 flex flex-wrap gap-3">
                        {slide.link_url && (
                            <Button
                                href={slide.link_url}
                                variant="gold"
                                size="lg"
                            >
                                {slide.button_text ?? 'Подробнее'}
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        )}
                        <Button
                            href="/structure"
                            variant="outline"
                            size="lg"
                            className="border-white/30 bg-white/5 text-white hover:border-white hover:bg-white/10"
                        >
                            Лаборатории
                        </Button>
                    </div>
                </div>
                {count > 1 && (
                    <div className="absolute right-4 bottom-8 flex items-center gap-2 sm:right-8">
                        <button
                            type="button"
                            onClick={() =>
                                setIndex((index - 1 + count) % count)
                            }
                            className="rounded-full border border-white/30 p-2 hover:bg-white/10"
                            aria-label="previous"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <div className="flex gap-1.5">
                            {slides.map((s, i) => (
                                <button
                                    key={s.id}
                                    type="button"
                                    onClick={() => setIndex(i)}
                                    className={cn(
                                        'h-1.5 rounded-full transition-all',
                                        i === index
                                            ? 'w-8 bg-gold-400'
                                            : 'w-3 bg-white/40 hover:bg-white/70',
                                    )}
                                    aria-label={`slide ${i + 1}`}
                                />
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={() => setIndex((index + 1) % count)}
                            className="rounded-full border border-white/30 p-2 hover:bg-white/10"
                            aria-label="next"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}

function HeroBackdrop() {
    return (
        <div className="absolute inset-0" aria-hidden>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(43,90,168,0.55),_transparent_55%),radial-gradient(ellipse_at_bottom_left,_rgba(217,158,20,0.25),_transparent_50%)]" />
            <svg
                className="absolute top-1/2 -right-24 h-[720px] w-[720px] -translate-y-1/2 text-white/[0.07]"
                viewBox="0 0 100 100"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.4"
            >
                {Array.from({ length: 6 }).map((_, i) => (
                    <ellipse
                        key={i}
                        cx="50"
                        cy="50"
                        rx="46"
                        ry="14"
                        transform={`rotate(${i * 30} 50 50)`}
                    />
                ))}
                <circle cx="50" cy="50" r="3" fill="currentColor" />
                <circle cx="50" cy="50" r="46" strokeDasharray="1 2" />
            </svg>
            <svg
                className="absolute inset-0 h-full w-full text-white/[0.05]"
                aria-hidden
            >
                <defs>
                    <pattern
                        id="grid"
                        width="48"
                        height="48"
                        patternUnits="userSpaceOnUse"
                    >
                        <path
                            d="M 48 0 L 0 0 0 48"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="0.5"
                        />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
        </div>
    );
}
