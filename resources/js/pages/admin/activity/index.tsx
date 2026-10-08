import { router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import type { FormEvent } from 'react';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Select } from '@/components/ui/form';
import { Pagination } from '@/components/ui/pagination';
import { AdminLayout } from '@/layouts/admin-layout';
import { formatDateTime } from '@/lib/format';
import type { Paginated } from '@/types';
import { formString } from '@/lib/utils';

type Log = {
    id: number;
    action: string;
    description: string | null;
    subject: string | null;
    subject_id: number | null;
    properties: Record<string, unknown> | null;
    user: string | null;
    ip: string | null;
    created_at: string;
};

const tones: Record<string, string> = {
    created: 'emerald',
    updated: 'blue',
    deleted: 'rose',
    trashed: 'amber',
    restored: 'violet',
    login: 'slate',
    logout: 'slate',
    uploaded: 'blue',
};

const labels: Record<string, string> = {
    created: 'создание',
    updated: 'изменение',
    deleted: 'удаление',
    trashed: 'в корзину',
    restored: 'восстановление',
    login: 'вход',
    logout: 'выход',
    uploaded: 'загрузка',
};

const subjects: Record<string, string> = {
    News: 'Новость',
    Event: 'Событие',
    Page: 'Страница',
    Person: 'Сотрудник',
    Laboratory: 'Лаборатория',
    Department: 'Отдел',
    Publication: 'Публикация',
    Document: 'Документ',
    Vacancy: 'Вакансия',
    Slide: 'Баннер',
    Link: 'Ссылка',
    Category: 'Рубрика',
    ResearchArea: 'Направление',
    MenuItem: 'Пункт меню',
    Media: 'Файл',
    User: 'Пользователь',
};

export default function ActivityIndex({
    items,
    users,
    actions,
    query,
}: {
    items: Paginated<Log>;
    users: { id: number; name: string }[];
    actions: string[];
    query: { user?: string; action?: string; search?: string };
}) {
    const visit = (next: Partial<typeof query>) =>
        router.get(
            '/admin/activity',
            Object.fromEntries(
                Object.entries({ ...query, ...next }).filter(([, v]) => v),
            ),
            { preserveState: true, preserveScroll: true },
        );

    return (
        <AdminLayout
            title="Журнал действий"
            description="Кто и что изменял в панели управления"
            breadcrumbs={[
                { label: 'Панель', href: '/admin' },
                { label: 'Журнал' },
            ]}
        >
            <div className="card">
                <div className="flex flex-col gap-3 border-b border-slate-200 p-4 lg:flex-row">
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
                        className="relative flex-1"
                    >
                        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            name="search"
                            defaultValue={query.search ?? ''}
                            placeholder="Поиск по описанию"
                            className="h-10 w-full rounded-lg border border-slate-300 pr-3 pl-9 text-sm focus-ring"
                        />
                    </form>
                    <Select
                        value={query.user ?? ''}
                        onChange={(e) => visit({ user: e.target.value })}
                        className="w-auto"
                    >
                        <option value="">Все пользователи</option>
                        {users.map((user) => (
                            <option key={user.id} value={user.id}>
                                {user.name}
                            </option>
                        ))}
                    </Select>
                    <Select
                        value={query.action ?? ''}
                        onChange={(e) => visit({ action: e.target.value })}
                        className="w-auto"
                    >
                        <option value="">Все действия</option>
                        {actions.map((action) => (
                            <option key={action} value={action}>
                                {labels[action] ?? action}
                            </option>
                        ))}
                    </Select>
                </div>
                {items.data.length === 0 ? (
                    <div className="p-6">
                        <EmptyState title="Записей нет" />
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50 text-left text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                                <th className="px-4 py-3">Когда</th>
                                <th className="px-3 py-3">Пользователь</th>
                                <th className="px-3 py-3">Действие</th>
                                <th className="px-3 py-3">Объект</th>
                                <th className="px-3 py-3">Детали</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {items.data.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-2.5 text-xs whitespace-nowrap text-slate-500">
                                        {formatDateTime(log.created_at)}
                                    </td>
                                    <td className="px-3 py-2.5 font-medium text-navy-900">
                                        {log.user ?? (
                                            <span className="text-slate-400">
                                                Система
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-3 py-2.5">
                                        <Badge
                                            tone={tones[log.action] ?? 'slate'}
                                        >
                                            {labels[log.action] ?? log.action}
                                        </Badge>
                                    </td>
                                    <td className="px-3 py-2.5">
                                        {log.subject && (
                                            <span className="text-xs text-slate-500">
                                                {subjects[log.subject] ??
                                                    log.subject}
                                                {log.subject_id
                                                    ? ` #${log.subject_id}`
                                                    : ''}
                                                :{' '}
                                            </span>
                                        )}
                                        <span className="text-slate-800">
                                            {log.description}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2.5 text-xs text-slate-500">
                                        {Array.isArray(
                                            log.properties?.changed,
                                        ) &&
                                            (log.properties.changed as string[])
                                                .length > 0 && (
                                                <span>
                                                    поля:{' '}
                                                    {(
                                                        log.properties
                                                            .changed as string[]
                                                    ).join(', ')}
                                                </span>
                                            )}
                                        {log.ip && (
                                            <span className="ml-2 font-mono text-slate-400">
                                                {log.ip}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                <div className="border-t border-slate-200 px-4 py-3">
                    <Pagination paginator={items} />
                </div>
            </div>
        </AdminLayout>
    );
}
