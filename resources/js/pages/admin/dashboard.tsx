import { Link } from '@inertiajs/react';
import { ArrowRight, Mail, PenLine } from 'lucide-react';
import { DynamicIcon } from '@/components/icon';
import { AdminLayout } from '@/layouts/admin-layout';
import { formatDateTime, relativeTime } from '@/lib/format';

type Props = {
    stats: {
        label: string;
        value: number;
        sub: string;
        href: string;
        icon: string;
    }[];
    unreadMessages: {
        id: number;
        name: string;
        email: string;
        subject: string | null;
        created_at: string;
    }[];
    drafts: { id: number; title: string; updated_at: string | null }[];
    upcomingEvents: {
        id: number;
        title: string;
        type: string;
        starts_at: string;
    }[];
    activity: {
        id: number;
        action: string;
        description: string | null;
        subject: string | null;
        user: string | null;
        created_at: string;
    }[];
    newsByMonth: { month: string; count: number }[];
};

const actionLabels: Record<string, string> = {
    created: 'создал(а)',
    updated: 'изменил(а)',
    deleted: 'удалил(а)',
    trashed: 'переместил(а) в корзину',
    restored: 'восстановил(а)',
    login: 'вошёл(ла) в панель',
    logout: 'вышел(ла)',
    uploaded: 'загрузил(а)',
};

export default function Dashboard({
    stats,
    unreadMessages,
    drafts,
    upcomingEvents,
    activity,
    newsByMonth,
}: Props) {
    const max = Math.max(1, ...newsByMonth.map((row) => row.count));

    return (
        <AdminLayout
            title="Обзор"
            description="Состояние сайта и последние действия"
        >
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {stats.map((stat) => (
                    <Link
                        key={stat.label}
                        href={stat.href}
                        className="group flex items-center gap-4 card p-5 transition hover:-translate-y-0.5 hover:shadow-float"
                    >
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-navy-900 text-gold-400">
                            <DynamicIcon name={stat.icon} className="h-5 w-5" />
                        </span>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-slate-500">
                                {stat.label}
                            </p>
                            <p className="font-serif text-3xl font-bold text-navy-900">
                                {stat.value}
                            </p>
                            <p className="text-xs text-slate-400">{stat.sub}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:text-navy-600" />
                    </Link>
                ))}
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-12">
                <section className="card p-5 lg:col-span-7">
                    <h2 className="text-sm font-bold text-navy-900">
                        Публикации новостей за 12 месяцев
                    </h2>
                    <div className="mt-6 flex h-44 items-end gap-2">
                        {newsByMonth.map((row, index) => (
                            <div
                                key={index}
                                className="group flex flex-1 flex-col items-center gap-2"
                            >
                                <span className="text-[10px] font-bold text-slate-500 opacity-0 transition group-hover:opacity-100">
                                    {row.count}
                                </span>
                                <div
                                    className="flex w-full items-end"
                                    style={{ height: '120px' }}
                                >
                                    <div
                                        className="w-full rounded-t-md bg-navy-900/80 transition group-hover:bg-navy-600"
                                        style={{
                                            height: `${Math.max(4, (row.count / max) * 100)}%`,
                                        }}
                                        title={`${row.month}: ${row.count}`}
                                    />
                                </div>
                                <span className="text-[10px] font-semibold text-slate-400 uppercase">
                                    {row.month}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="card lg:col-span-5">
                    <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
                        <h2 className="text-sm font-bold text-navy-900">
                            Непрочитанные сообщения
                        </h2>
                        <Link
                            href="/admin/messages?status=unread"
                            className="text-xs font-semibold text-navy-600 hover:underline"
                        >
                            Все
                        </Link>
                    </div>
                    {unreadMessages.length === 0 ? (
                        <p className="px-5 py-8 text-center text-sm text-slate-400">
                            Новых сообщений нет
                        </p>
                    ) : (
                        <ul className="divide-y divide-slate-100">
                            {unreadMessages.map((message) => (
                                <li key={message.id}>
                                    <Link
                                        href={`/admin/messages/${message.id}`}
                                        className="flex items-start gap-3 px-5 py-3 hover:bg-slate-50"
                                    >
                                        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                                            <Mail className="h-4 w-4" />
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="block truncate text-sm font-semibold text-navy-900">
                                                {message.subject || 'Без темы'}
                                            </span>
                                            <span className="block truncate text-xs text-slate-500">
                                                {message.name} · {message.email}
                                            </span>
                                        </span>
                                        <span className="shrink-0 text-xs text-slate-400">
                                            {relativeTime(message.created_at)}
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <section className="card lg:col-span-4">
                    <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
                        <h2 className="text-sm font-bold text-navy-900">
                            Черновики новостей
                        </h2>
                        <Link
                            href="/admin/news?filter[is_published]=0"
                            className="text-xs font-semibold text-navy-600 hover:underline"
                        >
                            Все
                        </Link>
                    </div>
                    {drafts.length === 0 ? (
                        <p className="px-5 py-8 text-center text-sm text-slate-400">
                            Черновиков нет
                        </p>
                    ) : (
                        <ul className="divide-y divide-slate-100">
                            {drafts.map((draft) => (
                                <li key={draft.id}>
                                    <Link
                                        href={`/admin/news/${draft.id}/edit`}
                                        className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50"
                                    >
                                        <PenLine className="h-4 w-4 shrink-0 text-gold-500" />
                                        <span className="min-w-0 flex-1 truncate text-sm font-medium text-navy-900">
                                            {draft.title}
                                        </span>
                                        <span className="shrink-0 text-xs text-slate-400">
                                            {relativeTime(draft.updated_at)}
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <section className="card lg:col-span-4">
                    <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
                        <h2 className="text-sm font-bold text-navy-900">
                            Ближайшие события
                        </h2>
                        <Link
                            href="/admin/events"
                            className="text-xs font-semibold text-navy-600 hover:underline"
                        >
                            Все
                        </Link>
                    </div>
                    {upcomingEvents.length === 0 ? (
                        <p className="px-5 py-8 text-center text-sm text-slate-400">
                            Событий нет
                        </p>
                    ) : (
                        <ul className="divide-y divide-slate-100">
                            {upcomingEvents.map((event) => (
                                <li key={event.id}>
                                    <Link
                                        href={`/admin/events/${event.id}/edit`}
                                        className="block px-5 py-3 hover:bg-slate-50"
                                    >
                                        <span className="block truncate text-sm font-medium text-navy-900">
                                            {event.title}
                                        </span>
                                        <span className="block text-xs text-slate-500">
                                            {event.type} ·{' '}
                                            {formatDateTime(event.starts_at)}
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <section className="card lg:col-span-4">
                    <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
                        <h2 className="text-sm font-bold text-navy-900">
                            Последние действия
                        </h2>
                        <Link
                            href="/admin/activity"
                            className="text-xs font-semibold text-navy-600 hover:underline"
                        >
                            Журнал
                        </Link>
                    </div>
                    <ul className="divide-y divide-slate-100">
                        {activity.length === 0 && (
                            <li className="px-5 py-8 text-center text-sm text-slate-400">
                                Пока пусто
                            </li>
                        )}
                        {activity.map((log) => (
                            <li key={log.id} className="px-5 py-2.5 text-xs">
                                <span className="font-semibold text-navy-900">
                                    {log.user ?? 'Система'}
                                </span>{' '}
                                <span className="text-slate-500">
                                    {actionLabels[log.action] ?? log.action}
                                </span>{' '}
                                {log.description && (
                                    <span className="text-slate-700">
                                        «{log.description}»
                                    </span>
                                )}
                                <span className="block text-[10px] text-slate-400">
                                    {relativeTime(log.created_at)}
                                </span>
                            </li>
                        ))}
                    </ul>
                </section>
            </div>
        </AdminLayout>
    );
}
