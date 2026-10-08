import { router } from '@inertiajs/react';
import {
    Archive,
    ArchiveRestore,
    ArrowLeft,
    CheckCheck,
    Mail,
    MailOpen,
    Reply,
    Trash2,
} from 'lucide-react';
import { useConfirm } from '@/components/admin/confirm';
import { Button } from '@/components/ui/button';
import { AdminLayout } from '@/layouts/admin-layout';
import { formatDateTime } from '@/lib/format';

type Message = {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    subject: string | null;
    body: string;
    ip: string | null;
    is_read: boolean;
    is_archived: boolean;
    replied_at: string | null;
    created_at: string;
};

export default function MessageShow({ message }: { message: Message }) {
    const { confirm, dialog } = useConfirm();
    const act = (action: string) =>
        router.put(
            `/admin/messages/${message.id}`,
            { action },
            { preserveScroll: true },
        );

    const destroy = () =>
        confirm({
            title: 'Удалить сообщение?',
            confirmLabel: 'Удалить',
            danger: true,
            onConfirm: () => router.delete(`/admin/messages/${message.id}`),
        });

    const replyHref = `mailto:${message.email}?subject=${encodeURIComponent(`Re: ${message.subject ?? 'Ваше обращение'}`)}`;

    return (
        <AdminLayout
            title={message.subject || 'Без темы'}
            breadcrumbs={[
                { label: 'Панель', href: '/admin' },
                { label: 'Сообщения', href: '/admin/messages' },
                { label: `#${message.id}` },
            ]}
            actions={
                <Button variant="ghost" href="/admin/messages">
                    <ArrowLeft className="h-4 w-4" /> К списку
                </Button>
            }
        >
            {dialog}
            <div className="grid gap-6 lg:grid-cols-12">
                <article className="card p-6 lg:col-span-8">
                    <div className="flex items-start gap-4 border-b border-slate-200 pb-5">
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-navy-900 text-lg font-bold text-gold-400">
                            {message.name[0]}
                        </span>
                        <div className="min-w-0 flex-1">
                            <p className="font-bold text-navy-900">
                                {message.name}
                            </p>
                            <p className="text-sm text-slate-600">
                                <a
                                    href={`mailto:${message.email}`}
                                    className="text-navy-600 hover:underline"
                                >
                                    {message.email}
                                </a>
                                {message.phone && ` · ${message.phone}`}
                            </p>
                        </div>
                        <p className="shrink-0 text-xs text-slate-400">
                            {formatDateTime(message.created_at)}
                        </p>
                    </div>
                    <div className="mt-5 text-[15px] leading-relaxed whitespace-pre-wrap text-slate-800">
                        {message.body}
                    </div>
                </article>
                <aside className="space-y-3 lg:col-span-4">
                    <div className="space-y-2 card p-4">
                        <Button
                            href={replyHref}
                            external
                            className="w-full"
                            onClick={() => act('replied')}
                        >
                            <Reply className="h-4 w-4" /> Ответить по e-mail
                        </Button>
                        {!message.replied_at && (
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => act('replied')}
                            >
                                <CheckCheck className="h-4 w-4" /> Отметить
                                «отвечено»
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() =>
                                act(message.is_read ? 'unread' : 'read')
                            }
                        >
                            {message.is_read ? (
                                <Mail className="h-4 w-4" />
                            ) : (
                                <MailOpen className="h-4 w-4" />
                            )}
                            {message.is_read
                                ? 'Отметить непрочитанным'
                                : 'Отметить прочитанным'}
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() =>
                                act(
                                    message.is_archived
                                        ? 'unarchive'
                                        : 'archive',
                                )
                            }
                        >
                            {message.is_archived ? (
                                <ArchiveRestore className="h-4 w-4" />
                            ) : (
                                <Archive className="h-4 w-4" />
                            )}
                            {message.is_archived
                                ? 'Вернуть из архива'
                                : 'В архив'}
                        </Button>
                        <Button
                            variant="ghost"
                            className="w-full text-rose-600 hover:bg-rose-50"
                            onClick={destroy}
                        >
                            <Trash2 className="h-4 w-4" /> Удалить
                        </Button>
                    </div>
                    <dl className="space-y-2 card p-4 text-xs text-slate-500">
                        <div className="flex justify-between">
                            <dt>Статус</dt>
                            <dd className="font-semibold text-slate-700">
                                {message.is_archived
                                    ? 'в архиве'
                                    : message.is_read
                                      ? 'прочитано'
                                      : 'новое'}
                            </dd>
                        </div>
                        {message.replied_at && (
                            <div className="flex justify-between">
                                <dt>Отвечено</dt>
                                <dd className="text-slate-700">
                                    {formatDateTime(message.replied_at)}
                                </dd>
                            </div>
                        )}
                        {message.ip && (
                            <div className="flex justify-between">
                                <dt>IP</dt>
                                <dd className="font-mono text-slate-700">
                                    {message.ip}
                                </dd>
                            </div>
                        )}
                    </dl>
                </aside>
            </div>
        </AdminLayout>
    );
}
