import { Link, router } from '@inertiajs/react';
import {
    Archive,
    CheckCheck,
    Mail,
    MailOpen,
    Search,
    Trash2,
} from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { useConfirm } from '@/components/admin/confirm';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Checkbox } from '@/components/ui/form';
import { Pagination } from '@/components/ui/pagination';
import { AdminLayout } from '@/layouts/admin-layout';
import { relativeTime } from '@/lib/format';
import { cn, formString } from '@/lib/utils';
import type { Paginated } from '@/types';

type Message = {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    subject: string | null;
    body: string;
    is_read: boolean;
    is_archived: boolean;
    replied_at: string | null;
    created_at: string;
};

type Props = {
    items: Paginated<Message>;
    query: { status: string; search: string };
    counts: { inbox: number; unread: number; archived: number };
};

export default function MessagesIndex({ items, query, counts }: Props) {
    const [selected, setSelected] = useState<number[]>([]);
    const { confirm, dialog } = useConfirm();

    const visit = (next: Partial<Props['query']>) =>
        router.get(
            '/admin/messages',
            { ...query, ...next },
            { preserveState: true, preserveScroll: true },
        );

    const bulk = (action: string) => {
        const run = () =>
            router.post(
                '/admin/messages/bulk',
                { action, ids: selected },
                { preserveScroll: true, onSuccess: () => setSelected([]) },
            );

        if (action === 'delete') {
            confirm({
                title: `Удалить сообщений: ${selected.length}?`,
                confirmLabel: 'Удалить',
                danger: true,
                onConfirm: run,
            });
        } else {
            run();
        }
    };

    const tabs = [
        { key: 'inbox', label: 'Входящие', count: counts.inbox },
        { key: 'unread', label: 'Непрочитанные', count: counts.unread },
        { key: 'archived', label: 'Архив', count: counts.archived },
    ];

    return (
        <AdminLayout
            title="Сообщения"
            description="Обращения через форму обратной связи"
            breadcrumbs={[
                { label: 'Панель', href: '/admin' },
                { label: 'Сообщения' },
            ]}
        >
            {dialog}

            <div className="card">
                <div className="flex flex-col gap-3 border-b border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="inline-flex rounded-lg bg-slate-200 p-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => visit({ status: tab.key })}
                                className={cn(
                                    'rounded-md px-3 py-1.5 text-sm font-semibold transition',
                                    query.status === tab.key
                                        ? 'bg-white text-navy-900 shadow-sm'
                                        : 'text-slate-600',
                                )}
                            >
                                {tab.label}{' '}
                                <span className="ml-1 text-xs text-slate-400">
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </div>
                    <form
                        onSubmit={(event: FormEvent<HTMLFormElement>) => {
                            event.preventDefault();
                            visit({
                                search: formString(
                                    new FormData(event.currentTarget),
                                    'search',
                                ),
                            });
                        }}
                        className="relative w-full lg:w-80"
                    >
                        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            name="search"
                            defaultValue={query.search}
                            placeholder="Поиск по имени, e-mail, тексту"
                            className="h-10 w-full rounded-lg border border-slate-300 pr-3 pl-9 text-sm focus-ring"
                        />
                    </form>
                </div>

                {selected.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-navy-50 px-4 py-2 text-sm">
                        <span className="font-semibold">
                            Выбрано: {selected.length}
                        </span>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => bulk('read')}
                        >
                            <CheckCheck className="h-4 w-4" /> Прочитано
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => bulk('archive')}
                        >
                            <Archive className="h-4 w-4" /> В архив
                        </Button>
                        <Button
                            size="sm"
                            variant="danger"
                            onClick={() => bulk('delete')}
                        >
                            <Trash2 className="h-4 w-4" /> Удалить
                        </Button>
                    </div>
                )}

                {items.data.length === 0 ? (
                    <div className="p-6">
                        <EmptyState
                            title="Сообщений нет"
                            icon={<Mail className="h-6 w-6" />}
                        />
                    </div>
                ) : (
                    <ul className="divide-y divide-slate-100">
                        {items.data.map((message) => (
                            <li
                                key={message.id}
                                className={cn(
                                    'flex items-start gap-3 px-4 py-3 transition hover:bg-slate-50',
                                    !message.is_read && 'bg-gold-50/40',
                                )}
                            >
                                <div className="pt-1">
                                    <Checkbox
                                        checked={selected.includes(message.id)}
                                        onChange={(c) =>
                                            setSelected((cur) =>
                                                c
                                                    ? [...cur, message.id]
                                                    : cur.filter(
                                                          (id) =>
                                                              id !== message.id,
                                                      ),
                                            )
                                        }
                                        label=""
                                    />
                                </div>
                                <span
                                    className={cn(
                                        'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                                        message.is_read
                                            ? 'bg-slate-100 text-slate-400'
                                            : 'bg-navy-900 text-gold-400',
                                    )}
                                >
                                    {message.is_read ? (
                                        <MailOpen className="h-4 w-4" />
                                    ) : (
                                        <Mail className="h-4 w-4" />
                                    )}
                                </span>
                                <Link
                                    href={`/admin/messages/${message.id}`}
                                    className="min-w-0 flex-1"
                                >
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={cn(
                                                'truncate text-sm',
                                                message.is_read
                                                    ? 'font-medium text-slate-700'
                                                    : 'font-bold text-navy-900',
                                            )}
                                        >
                                            {message.subject || 'Без темы'}
                                        </span>
                                        {message.replied_at && (
                                            <span className="rounded bg-emerald-50 px-1.5 text-[10px] font-bold text-emerald-700 uppercase">
                                                отвечено
                                            </span>
                                        )}
                                    </div>
                                    <p className="truncate text-xs text-slate-500">
                                        {message.name} &lt;{message.email}&gt; —{' '}
                                        {message.body}
                                    </p>
                                </Link>
                                <span className="shrink-0 pt-1 text-xs text-slate-400">
                                    {relativeTime(message.created_at)}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}

                <div className="border-t border-slate-200 px-4 py-3">
                    <Pagination paginator={items} />
                </div>
            </div>
        </AdminLayout>
    );
}
