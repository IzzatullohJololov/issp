import { router, usePage } from '@inertiajs/react';
import { RotateCcw, Trash2 } from 'lucide-react';
import { useConfirm } from '@/components/admin/confirm';
import { DynamicIcon } from '@/components/icon';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { AdminLayout } from '@/layouts/admin-layout';
import { formatDateTime } from '@/lib/format';

type Group = {
    slug: string;
    title: string;
    icon: string;
    items: { id: number; title: string; deleted_at: string | null }[];
};

export default function TrashIndex({ groups }: { groups: Group[] }) {
    const { auth } = usePage().props;
    const { confirm, dialog } = useConfirm();
    const total = groups.reduce((sum, group) => sum + group.items.length, 0);

    const empty = () =>
        confirm({
            title: 'Очистить корзину?',
            description: `Все ${total} записей будут удалены безвозвратно.`,
            confirmLabel: 'Очистить',
            danger: true,
            onConfirm: () => router.delete('/admin/trash'),
        });

    const forceDelete = (slug: string, id: number, title: string) =>
        confirm({
            title: 'Удалить безвозвратно?',
            description: title,
            confirmLabel: 'Удалить навсегда',
            danger: true,
            onConfirm: () =>
                router.delete(`/admin/${slug}/${id}/force`, {
                    preserveScroll: true,
                }),
        });

    return (
        <AdminLayout
            title="Корзина"
            description={`${total} удалённых записей`}
            breadcrumbs={[
                { label: 'Панель', href: '/admin' },
                { label: 'Корзина' },
            ]}
            actions={
                auth.user?.role === 'admin' && total > 0 ? (
                    <Button variant="danger" onClick={empty}>
                        <Trash2 className="h-4 w-4" /> Очистить корзину
                    </Button>
                ) : undefined
            }
        >
            {dialog}
            {groups.length === 0 ? (
                <EmptyState
                    title="Корзина пуста"
                    icon={<Trash2 className="h-6 w-6" />}
                />
            ) : (
                <div className="grid gap-5 lg:grid-cols-2">
                    {groups.map((group) => (
                        <section key={group.slug} className="card">
                            <h2 className="flex items-center gap-2 border-b border-slate-200 px-5 py-3 text-sm font-bold text-navy-900">
                                <DynamicIcon
                                    name={group.icon}
                                    className="h-4 w-4 text-slate-400"
                                />{' '}
                                {group.title}
                                <span className="ml-auto text-xs font-semibold text-slate-400">
                                    {group.items.length}
                                </span>
                            </h2>
                            <ul className="divide-y divide-slate-100">
                                {group.items.map((item) => (
                                    <li
                                        key={item.id}
                                        className="flex items-center gap-3 px-5 py-2.5"
                                    >
                                        <span className="min-w-0 flex-1">
                                            <span className="block truncate text-sm font-medium text-slate-800">
                                                {item.title}
                                            </span>
                                            <span className="block text-xs text-slate-400">
                                                {formatDateTime(
                                                    item.deleted_at,
                                                )}
                                            </span>
                                        </span>
                                        <button
                                            type="button"
                                            title="Восстановить"
                                            onClick={() =>
                                                router.post(
                                                    `/admin/${group.slug}/${item.id}/restore`,
                                                    {},
                                                    { preserveScroll: true },
                                                )
                                            }
                                            className="rounded-md p-1.5 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700"
                                        >
                                            <RotateCcw className="h-4 w-4" />
                                        </button>
                                        <button
                                            type="button"
                                            title="Удалить навсегда"
                                            onClick={() =>
                                                forceDelete(
                                                    group.slug,
                                                    item.id,
                                                    item.title,
                                                )
                                            }
                                            className="rounded-md p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    ))}
                </div>
            )}
        </AdminLayout>
    );
}
