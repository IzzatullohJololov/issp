import { router, useForm } from '@inertiajs/react';
import {
    ChevronDown,
    ChevronRight,
    ChevronUp,
    CornerDownRight,
    Pencil,
    Plus,
    Trash2,
} from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { useConfirm } from '@/components/admin/confirm';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FieldError, Input, Label, Select, Switch } from '@/components/ui/form';
import { Modal } from '@/components/ui/modal';
import { AdminLayout } from '@/layouts/admin-layout';
import { cn } from '@/lib/utils';
import type { Translatable } from '@/types';

type MenuRow = { id: number; location: string; name: string };
type Item = {
    id: number;
    parent_id: number | null;
    label: Translatable;
    url: string | null;
    target: string;
    sort_order: number;
    is_active: boolean;
};

type Props = {
    menus: MenuRow[];
    current: MenuRow | null;
    items: Item[];
    suggestions: { label: string; url: string }[];
};

type ItemForm = {
    label: { ru: string; en: string };
    url: string;
    target: string;
    is_active: boolean;
    parent_id: number | null;
};

export default function MenusIndex({
    menus,
    current,
    items,
    suggestions,
}: Props) {
    const [editing, setEditing] = useState<Item | null | 'new'>(null);
    const { confirm, dialog } = useConfirm();

    const form = useForm<ItemForm>({
        label: { ru: '', en: '' },
        url: '',
        target: '_self',
        is_active: true,
        parent_id: null,
    });

    const openNew = (parentId: number | null = null) => {
        form.setData({
            label: { ru: '', en: '' },
            url: '',
            target: '_self',
            is_active: true,
            parent_id: parentId,
        });
        form.clearErrors();
        setEditing('new');
    };

    const openEdit = (item: Item) => {
        form.setData({
            label: { ru: item.label.ru ?? '', en: item.label.en ?? '' },
            url: item.url ?? '',
            target: item.target,
            is_active: item.is_active,
            parent_id: item.parent_id,
        });
        form.clearErrors();
        setEditing(item);
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();
        if (!current) {
            return;
        }

        const options = {
            preserveScroll: true,
            onSuccess: () => setEditing(null),
        };

        if (editing === 'new') {
            form.post(`/admin/menus/${current.id}/items`, options);
        } else if (editing) {
            form.put(`/admin/menus/${current.id}/items/${editing.id}`, options);
        }
    };

    const destroy = (item: Item) =>
        confirm({
            title: 'Удалить пункт меню?',
            description: `«${item.label.ru}» и все вложенные пункты будут удалены.`,
            confirmLabel: 'Удалить',
            danger: true,
            onConfirm: () =>
                router.delete(`/admin/menus/${current?.id}/items/${item.id}`, {
                    preserveScroll: true,
                }),
        });

    const siblings = (parentId: number | null) =>
        items
            .filter((item) => item.parent_id === parentId)
            .sort((a, b) => a.sort_order - b.sort_order);

    const move = (item: Item, direction: -1 | 1) => {
        const list = siblings(item.parent_id);
        const index = list.findIndex((i) => i.id === item.id);
        const swapWith = list[index + direction];

        if (!swapWith || !current) {
            return;
        }

        const payload = list.map((i, position) => ({
            id: i.id,
            parent_id: i.parent_id,
            sort_order:
                i.id === item.id
                    ? position + direction + 1
                    : i.id === swapWith.id
                      ? position - direction + 1
                      : position + 1,
        }));

        router.post(
            `/admin/menus/${current.id}/reorder`,
            { items: payload },
            { preserveScroll: true },
        );
    };

    const renderTree = (parentId: number | null, depth = 0) =>
        siblings(parentId).map((item, index, list) => (
            <li key={item.id}>
                <div
                    className={cn(
                        'flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2',
                        !item.is_active && 'opacity-60',
                    )}
                    style={{ marginLeft: depth * 28 }}
                >
                    {depth > 0 && (
                        <CornerDownRight className="h-4 w-4 text-slate-300" />
                    )}
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-navy-900">
                            {item.label.ru}{' '}
                            {item.label.en && (
                                <span className="font-normal text-slate-400">
                                    / {item.label.en}
                                </span>
                            )}
                        </p>
                        <p className="truncate font-mono text-[11px] text-slate-500">
                            {item.url || '—'}
                        </p>
                    </div>
                    {!item.is_active && <Badge tone="slate">скрыт</Badge>}
                    {item.target === '_blank' && (
                        <Badge tone="blue">новое окно</Badge>
                    )}
                    <div className="flex items-center gap-0.5">
                        <IconBtn
                            title="Выше"
                            disabled={index === 0}
                            onClick={() => move(item, -1)}
                        >
                            <ChevronUp className="h-4 w-4" />
                        </IconBtn>
                        <IconBtn
                            title="Ниже"
                            disabled={index === list.length - 1}
                            onClick={() => move(item, 1)}
                        >
                            <ChevronDown className="h-4 w-4" />
                        </IconBtn>
                        {depth < 2 && (
                            <IconBtn
                                title="Добавить вложенный"
                                onClick={() => openNew(item.id)}
                            >
                                <Plus className="h-4 w-4" />
                            </IconBtn>
                        )}
                        <IconBtn
                            title="Редактировать"
                            onClick={() => openEdit(item)}
                        >
                            <Pencil className="h-4 w-4" />
                        </IconBtn>
                        <IconBtn
                            title="Удалить"
                            danger
                            onClick={() => destroy(item)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </IconBtn>
                    </div>
                </div>
                <ul className="mt-2 space-y-2">
                    {renderTree(item.id, depth + 1)}
                </ul>
            </li>
        ));

    const parentOptions = items.filter(
        (item) =>
            item.parent_id === null &&
            (editing === 'new' || (editing && item.id !== editing.id)),
    );

    return (
        <AdminLayout
            title="Меню сайта"
            description="Структура навигации в шапке и подвале"
            breadcrumbs={[
                { label: 'Панель', href: '/admin' },
                { label: 'Меню' },
            ]}
            actions={
                <Button onClick={() => openNew(null)} disabled={!current}>
                    <Plus className="h-4 w-4" /> Добавить пункт
                </Button>
            }
        >
            {dialog}

            <div className="mb-4 inline-flex rounded-lg bg-slate-200 p-1">
                {menus.map((menu) => (
                    <button
                        key={menu.id}
                        type="button"
                        onClick={() =>
                            router.get(
                                '/admin/menus',
                                { menu: menu.location },
                                { preserveState: false },
                            )
                        }
                        className={cn(
                            'rounded-md px-4 py-1.5 text-sm font-semibold transition',
                            current?.id === menu.id
                                ? 'bg-white text-navy-900 shadow-sm'
                                : 'text-slate-600 hover:text-navy-900',
                        )}
                    >
                        {menu.name}
                    </button>
                ))}
            </div>

            <div className="card p-4">
                {items.length === 0 ? (
                    <p className="py-10 text-center text-sm text-slate-400">
                        В этом меню пока нет пунктов.
                    </p>
                ) : (
                    <ul className="space-y-2">{renderTree(null)}</ul>
                )}
            </div>

            <Modal
                open={editing !== null}
                onClose={() => setEditing(null)}
                title={
                    editing === 'new'
                        ? 'Новый пункт меню'
                        : 'Редактирование пункта'
                }
                footer={
                    <>
                        <Button
                            variant="ghost"
                            onClick={() => setEditing(null)}
                        >
                            Отмена
                        </Button>
                        <Button
                            onClick={() =>
                                submit(
                                    new Event('submit') as unknown as FormEvent,
                                )
                            }
                            loading={form.processing}
                        >
                            Сохранить
                        </Button>
                    </>
                }
            >
                <form onSubmit={submit} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <Label required>Название (RU)</Label>
                            <Input
                                value={form.data.label.ru}
                                onChange={(e) =>
                                    form.setData('label', {
                                        ...form.data.label,
                                        ru: e.target.value,
                                    })
                                }
                                invalid={Boolean(
                                    (form.errors as Record<string, string>)[
                                        'label.ru'
                                    ],
                                )}
                            />
                            <FieldError
                                message={
                                    (form.errors as Record<string, string>)[
                                        'label.ru'
                                    ]
                                }
                            />
                        </div>
                        <div>
                            <Label>Название (EN)</Label>
                            <Input
                                value={form.data.label.en}
                                onChange={(e) =>
                                    form.setData('label', {
                                        ...form.data.label,
                                        en: e.target.value,
                                    })
                                }
                            />
                        </div>
                    </div>
                    <div>
                        <Label>Ссылка</Label>
                        <Input
                            value={form.data.url}
                            onChange={(e) =>
                                form.setData('url', e.target.value)
                            }
                            placeholder="/news или https://…"
                            list="menu-suggestions"
                            invalid={Boolean(form.errors.url)}
                        />
                        <datalist id="menu-suggestions">
                            {suggestions.map((s) => (
                                <option key={s.url} value={s.url}>
                                    {s.label}
                                </option>
                            ))}
                        </datalist>
                        <FieldError message={form.errors.url} />
                        <div className="mt-2 flex flex-wrap gap-1">
                            {suggestions.slice(0, 8).map((s) => (
                                <button
                                    key={s.url}
                                    type="button"
                                    onClick={() => form.setData('url', s.url)}
                                    className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 hover:bg-navy-50 hover:text-navy-900"
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <Label>Родительский пункт</Label>
                            <Select
                                value={form.data.parent_id ?? ''}
                                onChange={(e) =>
                                    form.setData(
                                        'parent_id',
                                        e.target.value
                                            ? Number(e.target.value)
                                            : null,
                                    )
                                }
                            >
                                <option value="">— верхний уровень —</option>
                                {parentOptions.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.label.ru}
                                    </option>
                                ))}
                            </Select>
                        </div>
                        <div>
                            <Label>Открывать</Label>
                            <Select
                                value={form.data.target}
                                onChange={(e) =>
                                    form.setData('target', e.target.value)
                                }
                            >
                                <option value="_self">В этом окне</option>
                                <option value="_blank">В новом окне</option>
                            </Select>
                        </div>
                    </div>
                    <Switch
                        checked={form.data.is_active}
                        onChange={(v) => form.setData('is_active', v)}
                        label="Показывать на сайте"
                    />
                    <button type="submit" className="hidden" />
                </form>
            </Modal>
        </AdminLayout>
    );
}

function IconBtn({
    children,
    onClick,
    title,
    danger,
    disabled,
}: {
    children: React.ReactNode;
    onClick: () => void;
    title: string;
    danger?: boolean;
    disabled?: boolean;
}) {
    return (
        <button
            type="button"
            title={title}
            disabled={disabled}
            onClick={onClick}
            className={cn(
                'rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-navy-900 disabled:opacity-30',
                danger && 'hover:bg-rose-50 hover:text-rose-600',
            )}
        >
            {children}
        </button>
    );
}

export { ChevronRight };
