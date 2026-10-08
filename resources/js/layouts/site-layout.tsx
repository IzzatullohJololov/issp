import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ChevronDown,
    Globe,
    Mail,
    MapPin,
    Menu,
    Phone,
    Search,
    X,
} from 'lucide-react';
import { type FormEvent, type ReactNode, useEffect, useState } from 'react';
import { FlashToasts } from '@/components/ui/toast';
import { useTranslation } from '@/lib/i18n';
import { cn, formString } from '@/lib/utils';
import type { MenuItemNode } from '@/types';

export function SiteLayout({
    children,
    title,
    description,
}: {
    children: ReactNode;
    title?: string;
    description?: string | null;
}) {
    const { site, locale, locales, auth } = usePage().props;
    const { t } = useTranslation();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 24);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });

        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        return router.on('navigate', () => {
            setMobileOpen(false);
            setSearchOpen(false);
        });
    }, []);

    const submitSearch = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        router.get('/search', { q: formString(form, 'q') });
    };

    const header = site?.menus.header ?? [];
    const footer = site?.menus.footer ?? [];

    return (
        <div className="flex min-h-screen flex-col">
            <Head>
                {title && <title>{title}</title>}
                {description && (
                    <meta name="description" content={description} />
                )}
            </Head>

            {/* Top bar */}
            <div className="hidden bg-navy-950 text-[13px] text-navy-100 md:block">
                <div className="container-site flex h-9 items-center justify-between">
                    <div className="flex items-center gap-5">
                        {site?.phone && (
                            <a
                                href={`tel:${site.phone.replace(/[^+\d]/g, '')}`}
                                className="inline-flex items-center gap-1.5 hover:text-white"
                            >
                                <Phone className="h-3.5 w-3.5 text-gold-400" />
                                {site.phone}
                            </a>
                        )}
                        {site?.email && (
                            <a
                                href={`mailto:${site.email}`}
                                className="inline-flex items-center gap-1.5 hover:text-white"
                            >
                                <Mail className="h-3.5 w-3.5 text-gold-400" />
                                {site.email}
                            </a>
                        )}
                        {site?.address && (
                            <span className="inline-flex items-center gap-1.5 text-navy-300">
                                <MapPin className="h-3.5 w-3.5 text-gold-400" />
                                {site.address.split('\n')[0]}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        <LocaleSwitch
                            locale={locale}
                            locales={locales}
                            compact
                        />
                        {auth.user ? (
                            <Link
                                href="/admin"
                                className="font-semibold text-gold-300 hover:text-gold-200"
                            >
                                {t('admin_panel')}
                            </Link>
                        ) : (
                            <Link
                                href="/login"
                                className="text-navy-300 hover:text-white"
                            >
                                {t('login')}
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Header */}
            <header
                className={cn(
                    'sticky top-0 z-40 border-b border-navy-900/10 bg-white/95 backdrop-blur transition-shadow',
                    scrolled && 'shadow-card',
                )}
            >
                <div className="container-site flex h-[72px] items-center justify-between gap-6">
                    <Link
                        href="/"
                        className="flex shrink-0 items-center gap-3"
                        aria-label={site?.name}
                    >
                        <Logo />
                        <span className="hidden flex-col leading-tight sm:flex">
                            <span className="font-serif text-xl font-bold tracking-tight text-navy-900">
                                {site?.name}
                            </span>
                            <span className="text-[11px] font-semibold tracking-[0.14em] text-slate-500 uppercase">
                                {locale === 'ru'
                                    ? 'Черноголовка · с 1963'
                                    : 'Chernogolovka · since 1963'}
                            </span>
                        </span>
                    </Link>

                    <nav className="hidden items-center gap-1 lg:flex">
                        {header.map((item) => (
                            <NavItem key={item.id} item={item} />
                        ))}
                    </nav>

                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={() => setSearchOpen((v) => !v)}
                            className="rounded-lg p-2.5 text-navy-900 focus-ring hover:bg-navy-50"
                            aria-label={t('search')}
                        >
                            <Search className="h-5 w-5" />
                        </button>
                        <div className="md:hidden">
                            <LocaleSwitch
                                locale={locale}
                                locales={locales}
                                compact
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => setMobileOpen(true)}
                            className="rounded-lg p-2.5 text-navy-900 focus-ring hover:bg-navy-50 lg:hidden"
                            aria-label={t('menu')}
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                    </div>
                </div>

                {searchOpen && (
                    <div className="animate-fade-in border-t border-navy-900/10 bg-white">
                        <form
                            onSubmit={submitSearch}
                            className="container-site flex items-center gap-3 py-3"
                        >
                            <Search className="h-5 w-5 shrink-0 text-slate-400" />
                            <input
                                autoFocus
                                name="q"
                                type="search"
                                placeholder={t('search_placeholder')}
                                className="h-11 flex-1 bg-transparent text-lg outline-none placeholder:text-slate-400"
                            />
                            <button
                                type="submit"
                                className="rounded-lg bg-navy-900 px-4 py-2 text-sm font-semibold text-white focus-ring"
                            >
                                {t('search')}
                            </button>
                            <button
                                type="button"
                                onClick={() => setSearchOpen(false)}
                                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                                aria-label={t('close')}
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </form>
                    </div>
                )}
            </header>

            {/* Mobile drawer */}
            {mobileOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <button
                        type="button"
                        aria-label={t('close')}
                        className="absolute inset-0 animate-fade-in bg-navy-950/60"
                        onClick={() => setMobileOpen(false)}
                    />
                    <div className="absolute inset-y-0 right-0 flex w-[88%] max-w-sm flex-col overflow-y-auto bg-white shadow-float">
                        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                            <span className="font-serif text-lg font-bold text-navy-900">
                                {t('menu')}
                            </span>
                            <button
                                type="button"
                                onClick={() => setMobileOpen(false)}
                                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <nav className="flex-1 px-3 py-3">
                            {header.map((item) => (
                                <MobileNavItem key={item.id} item={item} />
                            ))}
                        </nav>
                        <div className="border-t border-slate-200 px-5 py-4">
                            <LocaleSwitch locale={locale} locales={locales} />
                        </div>
                    </div>
                </div>
            )}

            <main className="flex-1">{children}</main>

            {/* Footer */}
            <footer className="mt-20 bg-navy-950 text-navy-100">
                <div className="container-site grid gap-10 py-14 md:grid-cols-12">
                    <div className="md:col-span-5">
                        <div className="flex items-center gap-3">
                            <Logo light />
                            <span className="font-serif text-xl font-bold text-white">
                                {site?.name}
                            </span>
                        </div>
                        <p className="mt-4 max-w-md text-sm leading-relaxed text-navy-200">
                            {site?.fullName}
                        </p>
                        {site?.footerText && (
                            <p className="mt-3 max-w-md text-xs leading-relaxed text-navy-300">
                                {site.footerText}
                            </p>
                        )}
                        {site?.social && site.social.length > 0 && (
                            <div className="mt-6">
                                <p className="eyebrow text-navy-300">
                                    {t('follow_us')}
                                </p>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {site.social.map((link) => (
                                        <a
                                            key={link.url + link.label}
                                            href={link.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="rounded-full border border-navy-700 px-3 py-1 text-xs font-semibold text-navy-100 transition hover:border-gold-400 hover:text-gold-300"
                                        >
                                            {link.label}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="md:col-span-3">
                        <p className="eyebrow text-gold-400">
                            {t('quick_links')}
                        </p>
                        <ul className="mt-4 space-y-2.5 text-sm">
                            {footer.map((item) => (
                                <li key={item.id}>
                                    <Link
                                        href={item.url}
                                        className="text-navy-100 transition hover:text-white"
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="md:col-span-4">
                        <p className="eyebrow text-gold-400">{t('contacts')}</p>
                        <ul className="mt-4 space-y-3 text-sm">
                            {site?.address && (
                                <li className="flex gap-3">
                                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />
                                    <span className="whitespace-pre-line">
                                        {site.address}
                                    </span>
                                </li>
                            )}
                            {site?.phone && (
                                <li className="flex gap-3">
                                    <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />
                                    <a
                                        href={`tel:${site.phone.replace(/[^+\d]/g, '')}`}
                                        className="hover:text-white"
                                    >
                                        {site.phone}
                                    </a>
                                </li>
                            )}
                            {site?.email && (
                                <li className="flex gap-3">
                                    <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />
                                    <a
                                        href={`mailto:${site.email}`}
                                        className="hover:text-white"
                                    >
                                        {site.email}
                                    </a>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
                <div className="border-t border-navy-800">
                    <div className="container-site flex flex-col gap-2 py-5 text-xs text-navy-400 sm:flex-row sm:items-center sm:justify-between">
                        <span>
                            © {site?.founded ?? 1963}–{new Date().getFullYear()}{' '}
                            {site?.name}. {t('all_rights')}.
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <Globe className="h-3.5 w-3.5" />
                            {locales[locale]}
                        </span>
                    </div>
                </div>
            </footer>

            <FlashToasts />
        </div>
    );
}

export function Logo({ light = false }: { light?: boolean }) {
    return (
        <span
            className={cn(
                'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
                light ? 'bg-white/10' : 'bg-navy-900',
            )}
            aria-hidden
        >
            <svg viewBox="0 0 40 40" className="h-7 w-7" fill="none">
                <circle cx="20" cy="20" r="4" className="fill-gold-400" />
                <ellipse
                    cx="20"
                    cy="20"
                    rx="15"
                    ry="6"
                    className="stroke-white"
                    strokeWidth="1.8"
                />
                <ellipse
                    cx="20"
                    cy="20"
                    rx="15"
                    ry="6"
                    className="stroke-white"
                    strokeWidth="1.8"
                    transform="rotate(60 20 20)"
                />
                <ellipse
                    cx="20"
                    cy="20"
                    rx="15"
                    ry="6"
                    className="stroke-white"
                    strokeWidth="1.8"
                    transform="rotate(120 20 20)"
                />
            </svg>
        </span>
    );
}

function NavItem({ item }: { item: MenuItemNode }) {
    const { url } = usePage();
    const active =
        (item.url !== '/' && url.startsWith(item.url.split('?')[0])) ||
        item.children.some(
            (child) =>
                url.startsWith(child.url.split('?')[0]) && child.url !== '/',
        );
    const hasChildren = item.children.length > 0;

    return (
        <div className="group relative">
            <Link
                href={item.url}
                target={item.target === '_blank' ? '_blank' : undefined}
                className={cn(
                    'inline-flex items-center gap-1 rounded-lg px-3 py-2 text-[15px] font-semibold text-navy-900 focus-ring transition hover:bg-navy-50',
                    active && 'text-navy-600',
                )}
            >
                {item.label}
                {hasChildren && (
                    <ChevronDown className="h-4 w-4 text-slate-400 transition group-hover:rotate-180" />
                )}
            </Link>
            {hasChildren && (
                <div className="invisible absolute top-full left-0 z-30 min-w-[260px] translate-y-1 pt-2 opacity-0 transition-all group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                    <div className="rounded-xl border border-navy-900/10 bg-white p-2 shadow-float">
                        {item.children.map((child) => (
                            <Link
                                key={child.id}
                                href={child.url}
                                target={
                                    child.target === '_blank'
                                        ? '_blank'
                                        : undefined
                                }
                                className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 focus-ring transition hover:bg-navy-50 hover:text-navy-900"
                            >
                                {child.label}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function MobileNavItem({ item }: { item: MenuItemNode }) {
    const [open, setOpen] = useState(false);
    const hasChildren = item.children.length > 0;

    return (
        <div className="border-b border-slate-100 last:border-0">
            <div className="flex items-center">
                <Link
                    href={item.url}
                    className="flex-1 px-3 py-3 text-base font-semibold text-navy-900"
                >
                    {item.label}
                </Link>
                {hasChildren && (
                    <button
                        type="button"
                        onClick={() => setOpen((v) => !v)}
                        className="rounded-lg p-2 text-slate-500"
                        aria-expanded={open}
                    >
                        <ChevronDown
                            className={cn(
                                'h-5 w-5 transition',
                                open && 'rotate-180',
                            )}
                        />
                    </button>
                )}
            </div>
            {hasChildren && open && (
                <div className="mb-2 ml-3 border-l-2 border-gold-300 pl-3">
                    {item.children.map((child) => (
                        <Link
                            key={child.id}
                            href={child.url}
                            className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700"
                        >
                            {child.label}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

function LocaleSwitch({
    locale,
    locales,
    compact = false,
}: {
    locale: string;
    locales: Record<string, string>;
    compact?: boolean;
}) {
    return (
        <div
            className={cn(
                'inline-flex items-center overflow-hidden rounded-full',
                compact
                    ? 'border border-navy-700/60'
                    : 'border border-slate-300',
            )}
        >
            {Object.entries(locales).map(([code, label]) => (
                <a
                    key={code}
                    href={`/lang/${code}`}
                    className={cn(
                        'px-2.5 py-1 text-[11px] font-bold tracking-wider uppercase transition',
                        code === locale
                            ? compact
                                ? 'bg-gold-400 text-navy-950'
                                : 'bg-navy-900 text-white'
                            : compact
                              ? 'text-navy-200 hover:text-white'
                              : 'text-slate-600 hover:bg-slate-100',
                    )}
                    title={label}
                >
                    {code}
                </a>
            ))}
        </div>
    );
}
