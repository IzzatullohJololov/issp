import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Activity,
    Bell,
    ChevronDown,
    ExternalLink,
    FolderTree,
    Images,
    LayoutDashboard,
    LogOut,
    Mail,
    Menu as MenuIcon,
    Settings,
    Trash2,
    UserCircle,
    Users,
    X,
} from 'lucide-react';
import { type ReactNode, useEffect, useState } from 'react';
import { DynamicIcon } from '@/components/icon';
import { Logo } from '@/layouts/site-layout';
import { FlashToasts } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import type { AdminNavItem } from '@/types';

type NavLink = {
    title: string;
    href: string;
    icon: ReactNode;
    badge?: number;
    adminOnly?: boolean;
};

export function AdminLayout({
    children,
    title,
    description,
    actions,
    breadcrumbs,
}: {
    children: ReactNode;
    title: string;
    description?: string;
    actions?: ReactNode;
    breadcrumbs?: { label: string; href?: string }[];
}) {
    const { auth, admin, name } = usePage().props;
    const { url } = usePage();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [userMenu, setUserMenu] = useState(false);
    const isAdmin = auth.user?.role === 'admin';

    useEffect(() => router.on('navigate', () => setMobileOpen(false)), []);

    const groups = groupNavigation(admin?.navigation ?? []);

    const system: NavLink[] = [
        {
            title: 'Меню сайта',
            href: '/admin/menus',
            icon: <FolderTree className="h-4 w-4" />,
        },
        {
            title: 'Медиатека',
            href: '/admin/media',
            icon: <Images className="h-4 w-4" />,
        },
        {
            title: 'Сообщения',
            href: '/admin/messages',
            icon: <Mail className="h-4 w-4" />,
            badge: admin?.unreadMessages,
        },
        {
            title: 'Корзина',
            href: '/admin/trash',
            icon: <Trash2 className="h-4 w-4" />,
        },
        {
            title: 'Пользователи',
            href: '/admin/users',
            icon: <Users className="h-4 w-4" />,
            adminOnly: true,
        },
        {
            title: 'Журнал действий',
            href: '/admin/activity',
            icon: <Activity className="h-4 w-4" />,
            adminOnly: true,
        },
        {
            title: 'Настройки',
            href: '/admin/settings',
            icon: <Settings className="h-4 w-4" />,
            adminOnly: true,
        },
    ];

    const isActive = (href: string) =>
        href === '/admin'
            ? url === '/admin'
            : url === href ||
              url.startsWith(href + '/') ||
              url.startsWith(href + '?');

    const sidebar = (
        <div className="flex h-full flex-col">
            <Link href="/admin" className="flex items-center gap-3 px-5 py-5">
                <Logo light />
                <span className="leading-tight">
                    <span className="block font-serif text-base font-bold text-white">
                        {name}
                    </span>
                    <span className="block text-[11px] font-semibold tracking-wider text-navy-300 uppercase">
                        Панель управления
                    </span>
                </span>
            </Link>
            <nav className="flex-1 scrollbar-thin space-y-6 overflow-y-auto px-3 pb-6">
                <div>
                    <SidebarLink
                        href="/admin"
                        active={isActive('/admin')}
                        icon={<LayoutDashboard className="h-4 w-4" />}
                    >
                        Обзор
                    </SidebarLink>
                </div>
                {Object.entries(groups).map(([group, items]) => (
                    <div key={group}>
                        <p className="mb-1 px-3 text-[11px] font-bold tracking-wider text-navy-400 uppercase">
                            {group}
                        </p>
                        {items.map((item) => (
                            <SidebarLink
                                key={item.slug}
                                href={item.href}
                                active={isActive(item.href)}
                                icon={
                                    <DynamicIcon
                                        name={item.icon}
                                        className="h-4 w-4"
                                    />
                                }
                            >
                                {item.title}
                            </SidebarLink>
                        ))}
                    </div>
                ))}
                <div>
                    <p className="mb-1 px-3 text-[11px] font-bold tracking-wider text-navy-400 uppercase">
                        Система
                    </p>
                    {system
                        .filter((item) => !item.adminOnly || isAdmin)
                        .map((item) => (
                            <SidebarLink
                                key={item.href}
                                href={item.href}
                                active={isActive(item.href)}
                                icon={item.icon}
                                badge={item.badge}
                            >
                                {item.title}
                            </SidebarLink>
                        ))}
                </div>
            </nav>
            <div className="border-t border-white/10 p-3">
                <a
                    href="/"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-navy-200 hover:bg-white/5 hover:text-white"
                >
                    <ExternalLink className="h-4 w-4" /> Открыть сайт
                </a>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-100 text-slate-900">
            <Head title={`${title} · Панель`} />

            <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 bg-navy-950 lg:block">
                {sidebar}
            </aside>

            {mobileOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <button
                        type="button"
                        aria-label="close"
                        className="absolute inset-0 bg-navy-950/60"
                        onClick={() => setMobileOpen(false)}
                    />
                    <div className="absolute inset-y-0 left-0 w-72 bg-navy-950 shadow-float">
                        <button
                            type="button"
                            onClick={() => setMobileOpen(false)}
                            className="absolute top-4 right-3 rounded-lg p-2 text-navy-300 hover:text-white"
                        >
                            <X className="h-5 w-5" />
                        </button>
                        {sidebar}
                    </div>
                </div>
            )}

            <div className="lg:pl-64">
                <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setMobileOpen(true)}
                            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
                        >
                            <MenuIcon className="h-5 w-5" />
                        </button>
                        {breadcrumbs && breadcrumbs.length > 0 && (
                            <nav className="hidden items-center gap-1 text-sm text-slate-500 sm:flex">
                                {breadcrumbs.map((crumb, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center gap-1"
                                    >
                                        {index > 0 && (
                                            <span className="text-slate-300">
                                                /
                                            </span>
                                        )}
                                        {crumb.href ? (
                                            <Link
                                                href={crumb.href}
                                                className="hover:text-navy-900"
                                            >
                                                {crumb.label}
                                            </Link>
                                        ) : (
                                            <span className="font-semibold text-slate-800">
                                                {crumb.label}
                                            </span>
                                        )}
                                    </span>
                                ))}
                            </nav>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <Link
                            href="/admin/messages?status=unread"
                            className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                            aria-label="Сообщения"
                        >
                            <Bell className="h-5 w-5" />
                            {admin?.unreadMessages ? (
                                <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                                    {admin.unreadMessages}
                                </span>
                            ) : null}
                        </Link>
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setUserMenu((v) => !v)}
                                className="flex items-center gap-2 rounded-lg py-1.5 pr-2 pl-1.5 hover:bg-slate-100"
                            >
                                <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-navy-900 text-xs font-bold text-white">
                                    {auth.user?.avatar ? (
                                        <img
                                            src={auth.user.avatar}
                                            alt=""
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        auth.user?.name?.[0]
                                    )}
                                </span>
                                <span className="hidden text-left sm:block">
                                    <span className="block text-sm leading-tight font-semibold">
                                        {auth.user?.name}
                                    </span>
                                    <span className="block text-[11px] text-slate-500">
                                        {auth.user?.role === 'admin'
                                            ? 'Администратор'
                                            : 'Редактор'}
                                    </span>
                                </span>
                                <ChevronDown className="h-4 w-4 text-slate-400" />
                            </button>
                            {userMenu && (
                                <>
                                    <button
                                        type="button"
                                        aria-label="close"
                                        className="fixed inset-0 z-10 cursor-default"
                                        onClick={() => setUserMenu(false)}
                                    />
                                    <div className="absolute right-0 z-20 mt-1 w-52 rounded-xl border border-slate-200 bg-white p-1.5 shadow-float">
                                        <Link
                                            href="/admin/profile"
                                            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-slate-100"
                                        >
                                            <UserCircle className="h-4 w-4" />{' '}
                                            Профиль
                                        </Link>
                                        <Link
                                            href="/logout"
                                            method="post"
                                            as="button"
                                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-rose-600 hover:bg-rose-50"
                                        >
                                            <LogOut className="h-4 w-4" /> Выйти
                                        </Link>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                <main className="px-4 py-6 sm:px-6 lg:px-8">
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-navy-900">
                                {title}
                            </h1>
                            {description && (
                                <p className="mt-1 text-sm text-slate-500">
                                    {description}
                                </p>
                            )}
                        </div>
                        {actions && (
                            <div className="flex flex-wrap items-center gap-2">
                                {actions}
                            </div>
                        )}
                    </div>
                    {children}
                </main>
            </div>

            <FlashToasts />
        </div>
    );
}

function SidebarLink({
    href,
    active,
    icon,
    badge,
    children,
}: {
    href: string;
    active: boolean;
    icon: ReactNode;
    badge?: number;
    children: ReactNode;
}) {
    return (
        <Link
            href={href}
            className={cn(
                'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition',
                active
                    ? 'bg-white/10 text-white'
                    : 'text-navy-200 hover:bg-white/5 hover:text-white',
            )}
        >
            <span className={cn(active ? 'text-gold-400' : 'text-navy-400')}>
                {icon}
            </span>
            <span className="flex-1">{children}</span>
            {badge ? (
                <span className="rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {badge}
                </span>
            ) : null}
        </Link>
    );
}

function groupNavigation(
    items: AdminNavItem[],
): Record<string, AdminNavItem[]> {
    const groups: Record<string, AdminNavItem[]> = {};

    for (const item of items) {
        (groups[item.group] ??= []).push(item);
    }

    return groups;
}
