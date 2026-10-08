import { Link, router, usePage } from '@inertiajs/react';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import type { FormEvent } from 'react';
import { useConfirm } from '@/components/admin/confirm';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { AdminLayout } from '@/layouts/admin-layout';
import { formatDateTime, relativeTime } from '@/lib/format';
import type { Paginated } from '@/types';
import { formString } from '@/lib/utils';

type User = {
    id: number;
    name: string;
    email: string;
    role: string;
    position: string | null;
    is_active: boolean;
    last_login_at: string | null;
    created_at: string | null;
};

export default function UsersIndex({
    items,
    query,
    roles,
}: {
    items: Paginated<User>;
    query: { search: string };
    roles: Record<string, string>;
}) {
    const { auth } = usePage().props;
    const { confirm, dialog } = useConfirm();

    const destroy = (user: User) =>
        confirm({
            title: `Удалить пользователя ${user.name}?`,
            confirmLabel: 'Удалить',
            danger: true,
            onConfirm: () => router.delete(`/admin/users/${user.id}`),
        });

    return (
        <AdminLayout
            title="Пользователи"
            description="Учётные записи панели управления"
            breadcrumbs={[
                { label: 'Панель', href: '/admin' },
                { label: 'Пользователи' },
            ]}
            actions={
                <Button href="/admin/users/create">
                    <Plus className="h-4 w-4" /> Добавить
                </Button>
            }
        >
            {dialog}
            <div className="card">
                <form
                    onSubmit={(event: FormEvent<HTMLFormElement>) => {
                        event.preventDefault();
                        router.get(
                            '/admin/users',
                            {
                                search: formString(
                                    new FormData(event.currentTarget),
                                    'search',
                                ),
                            },
                            { preserveState: true },
                        );
                    }}
                    className="relative border-b border-slate-200 p-4"
                >
                    <Search className="pointer-events-none absolute top-1/2 left-7 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                        name="search"
                        defaultValue={query.search}
                        placeholder="Поиск по имени или e-mail"
                        className="h-10 w-full rounded-lg border border-slate-300 pr-3 pl-9 text-sm focus-ring"
                    />
                </form>
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-left text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                            <th className="px-4 py-3">Пользователь</th>
                            <th className="px-3 py-3">Роль</th>
                            <th className="px-3 py-3">Статус</th>
                            <th className="px-3 py-3">Последний вход</th>
                            <th className="px-3 py-3 text-right">Действия</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {items.data.map((user) => (
                            <tr key={user.id} className="hover:bg-slate-50">
                                <td className="px-4 py-3">
                                    <Link
                                        href={`/admin/users/${user.id}/edit`}
                                        className="font-semibold text-navy-900 hover:text-navy-600"
                                    >
                                        {user.name}
                                    </Link>
                                    <p className="text-xs text-slate-500">
                                        {user.email}
                                        {user.position && ` · ${user.position}`}
                                    </p>
                                </td>
                                <td className="px-3 py-3">
                                    <Badge
                                        tone={
                                            user.role === 'admin'
                                                ? 'gold'
                                                : 'blue'
                                        }
                                    >
                                        {roles[user.role] ?? user.role}
                                    </Badge>
                                </td>
                                <td className="px-3 py-3">
                                    <Badge
                                        tone={
                                            user.is_active ? 'emerald' : 'slate'
                                        }
                                    >
                                        {user.is_active
                                            ? 'активен'
                                            : 'отключён'}
                                    </Badge>
                                </td>
                                <td
                                    className="px-3 py-3 text-xs text-slate-500"
                                    title={formatDateTime(user.last_login_at)}
                                >
                                    {user.last_login_at
                                        ? relativeTime(user.last_login_at)
                                        : '—'}
                                </td>
                                <td className="px-3 py-3">
                                    <div className="flex justify-end gap-1">
                                        <Link
                                            href={`/admin/users/${user.id}/edit`}
                                            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-200 hover:text-navy-900"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Link>
                                        {auth.user?.id !== user.id && (
                                            <button
                                                type="button"
                                                onClick={() => destroy(user)}
                                                className="rounded-md p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="border-t border-slate-200 px-4 py-3">
                    <Pagination paginator={items} />
                </div>
            </div>
        </AdminLayout>
    );
}
