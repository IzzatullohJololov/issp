import { Link, router } from '@inertiajs/react';
import {
    ArchiveRestore,
    ArrowDown,
    ArrowUp,
    ArrowUpDown,
    Check,
    Copy,
    ExternalLink,
    GripVertical,
    Pencil,
    Plus,
    RotateCcw,
    Search,
    Trash2,
    X,
} from 'lucide-react';
import { type DragEvent, type FormEvent, useState } from 'react';
import { useConfirm } from '@/components/admin/confirm';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Checkbox, Select } from '@/components/ui/form';
import { Pagination } from '@/components/ui/pagination';
import { AdminLayout } from '@/layouts/admin-layout';
import { formatShortDate, relativeTime } from '@/lib/format';
import { asString, cn } from '@/lib/utils';
import type {
    FieldSchema,
    Paginated,
    ResourceRow,
    ResourceSchema,
} from '@/types';

type Query = {
    search: string;
    filter: Record<string, string>;
    sort: string;
    trashed: boolean;
    per_page: number;
};

type Props = {
    schema: ResourceSchema;
    items: Paginated<ResourceRow>;
    query: Query;
    trashedCount: number;
};

export default function ResourceIndex({
    schema,
    items,
    query,
    trashedCount,
}: Props) {
    const [selected, setSelected] = useState<number[]>([]);
    const [search, setSearch] = useState(query.search);
    const [order, setOrder] = useState<number[]>(
        items.data.map((row) => row.id),
    );
    const [dragId, setDragId] = useState<number | null>(null);
    const { confirm, dialog } = useConfirm();

    const base = `/admin/${schema.slug}`;
    const columns = schema.fields.filter((field) => field.onIndex);
    const filterable = schema.fields.filter((field) => field.filterable);
    const rows =
        schema.sortableRows && !query.sort
            ? order
                  .map((id) => items.data.find((row) => row.id === id))
                  .filter((row): row is ResourceRow => Boolean(row))
            : items.data;

    const visit = (next: Partial<Query>) => {
        const merged = { ...query, ...next };
        const params: Record<string, string | number | boolean> = {};

        if (merged.search) {
            params.search = merged.search;
        }
        if (merged.sort) {
            params.sort = merged.sort;
        }
        if (merged.trashed) {
            params.trashed = 1;
        }
        if (merged.per_page !== 20) {
            params.per_page = merged.per_page;
        }
        Object.entries(merged.filter).forEach(([key, value]) => {
            if (value !== '' && value !== undefined && value !== null) {
                params[`filter[${key}]`] = value;
            }
        });

        router.get(base, params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
        setSelected([]);
    };

    const submitSearch = (event: FormEvent) => {
        event.preventDefault();
        visit({ search });
    };

    const toggleSort = (field: FieldSchema) => {
        if (!field.sortable) {
            return;
        }

        const current = query.sort;
        const next =
            current === field.name
                ? `-${field.name}`
                : current === `-${field.name}`
                  ? ''
                  : field.name;
        visit({ sort: next });
    };

    const bulk = (action: string) => {
        const run = () =>
            router.post(
                `${base}/bulk`,
                { action, ids: selected },
                { preserveScroll: true, onSuccess: () => setSelected([]) },
            );

        if (action === 'delete' || action === 'force_delete') {
            confirm({
                title:
                    action === 'force_delete'
                        ? 'Удалить безвозвратно?'
                        : 'Удалить выбранные записи?',
                description: `Выбрано записей: ${selected.length}.`,
                confirmLabel: 'Удалить',
                danger: true,
                onConfirm: run,
            });

            return;
        }

        run();
    };

    const destroy = (row: ResourceRow) =>
        confirm({
            title: schema.softDeletes
                ? 'Переместить в корзину?'
                : 'Удалить запись?',
            description: row._title,
            confirmLabel: 'Удалить',
            danger: true,
            onConfirm: () =>
                router.delete(`${base}/${row.id}`, { preserveScroll: true }),
        });

    const forceDestroy = (row: ResourceRow) =>
        confirm({
            title: 'Удалить безвозвратно?',
            description: `«${row._title}» будет удалена без возможности восстановления.`,
            confirmLabel: 'Удалить навсегда',
            danger: true,
            onConfirm: () =>
                router.delete(`${base}/${row.id}/force`, {
                    preserveScroll: true,
                }),
        });

    const toggle = (row: ResourceRow, field: FieldSchema) =>
        router.post(
            `${base}/${row.id}/toggle`,
            { field: field.name },
            { preserveScroll: true },
        );

    const allSelected =
        rows.length > 0 && rows.every((row) => selected.includes(row.id));

    const onDrop = (targetId: number) => {
        if (dragId === null || dragId === targetId) {
            return;
        }

        const next = order.filter((id) => id !== dragId);
        next.splice(next.indexOf(targetId), 0, dragId);
        setOrder(next);
        setDragId(null);
        router.post(
            `${base}/reorder`,
            { ids: next },
            { preserveScroll: true, preserveState: true },
        );
    };

    return (
        <AdminLayout
            title={schema.title}
            description={`${items.total} записей${query.trashed ? ' в корзине' : ''}`}
            breadcrumbs={[
                { label: 'Панель', href: '/admin' },
                { label: schema.title },
            ]}
            actions={
                <>
                    {schema.softDeletes && (
                        <Button
                            variant={query.trashed ? 'secondary' : 'ghost'}
                            onClick={() => visit({ trashed: !query.trashed })}
                        >
                            <Trash2 className="h-4 w-4" />
                            Корзина{' '}
                            {trashedCount > 0 && (
                                <span className="rounded-full bg-slate-200 px-1.5 text-xs">
                                    {trashedCount}
                                </span>
                            )}
                        </Button>
                    )}
                    <Button href={`${base}/create`}>
                        <Plus className="h-4 w-4" /> Добавить
                    </Button>
                </>
            }
        >
            {dialog}

            <div className="card">
                {/* Toolbar */}
                <div className="flex flex-col gap-3 border-b border-slate-200 p-4 lg:flex-row lg:items-center">
                    <form onSubmit={submitSearch} className="relative flex-1">
                        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Поиск…"
                            className="h-10 w-full rounded-lg border border-slate-300 bg-white pr-9 pl-9 text-sm focus-ring"
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearch('');
                                    visit({ search: '' });
                                }}
                                className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-700"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </form>
                    <div className="flex flex-wrap items-center gap-2">
                        {filterable.map((field) => (
                            <Select
                                key={field.name}
                                value={query.filter[field.name] ?? ''}
                                onChange={(event) =>
                                    visit({
                                        filter: {
                                            ...query.filter,
                                            [field.name]: event.target.value,
                                        },
                                    })
                                }
                                className="w-auto min-w-[150px]"
                            >
                                <option value="">{field.label}: все</option>
                                {field.type === 'boolean' ? (
                                    <>
                                        <option value="1">Да</option>
                                        <option value="0">Нет</option>
                                    </>
                                ) : (
                                    field.options.map((option) => (
                                        <option
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </option>
                                    ))
                                )}
                            </Select>
                        ))}
                        <Select
                            value={query.per_page}
                            onChange={(event) =>
                                visit({ per_page: Number(event.target.value) })
                            }
                            className="w-auto"
                        >
                            {[10, 20, 50, 100].map((n) => (
                                <option key={n} value={n}>
                                    {n} / стр.
                                </option>
                            ))}
                        </Select>
                    </div>
                </div>

                {/* Bulk bar */}
                {selected.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-navy-50 px-4 py-2 text-sm">
                        <span className="font-semibold text-navy-900">
                            Выбрано: {selected.length}
                        </span>
                        <span className="mx-1 h-4 w-px bg-navy-200" />
                        {query.trashed ? (
                            <>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => bulk('restore')}
                                >
                                    <ArchiveRestore className="h-4 w-4" />{' '}
                                    Восстановить
                                </Button>
                                <Button
                                    size="sm"
                                    variant="danger"
                                    onClick={() => bulk('force_delete')}
                                >
                                    <Trash2 className="h-4 w-4" /> Удалить
                                    навсегда
                                </Button>
                            </>
                        ) : (
                            <>
                                {schema.fields.some(
                                    (f) => f.name === 'is_published',
                                ) && (
                                    <>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => bulk('publish')}
                                        >
                                            Опубликовать
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => bulk('unpublish')}
                                        >
                                            Снять с публикации
                                        </Button>
                                    </>
                                )}
                                {schema.fields.some(
                                    (f) => f.name === 'is_active',
                                ) && (
                                    <>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => bulk('activate')}
                                        >
                                            Включить
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => bulk('deactivate')}
                                        >
                                            Выключить
                                        </Button>
                                    </>
                                )}
                                <Button
                                    size="sm"
                                    variant="danger"
                                    onClick={() => bulk('delete')}
                                >
                                    <Trash2 className="h-4 w-4" /> Удалить
                                </Button>
                            </>
                        )}
                        <button
                            type="button"
                            onClick={() => setSelected([])}
                            className="ml-auto text-xs font-semibold text-slate-500 hover:text-slate-800"
                        >
                            Снять выделение
                        </button>
                    </div>
                )}

                {/* Table */}
                {rows.length === 0 ? (
                    <div className="p-6">
                        <EmptyState
                            title={
                                query.trashed
                                    ? 'Корзина пуста'
                                    : 'Записей пока нет'
                            }
                            description={
                                query.search
                                    ? 'Попробуйте изменить запрос или фильтры.'
                                    : undefined
                            }
                            action={
                                !query.trashed && (
                                    <Button href={`${base}/create`}>
                                        <Plus className="h-4 w-4" /> Добавить{' '}
                                        {schema.singular.toLowerCase()}
                                    </Button>
                                )
                            }
                        />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50 text-left text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                                    <th className="w-10 px-4 py-3">
                                        <Checkbox
                                            checked={allSelected}
                                            onChange={(checked) =>
                                                setSelected(
                                                    checked
                                                        ? rows.map(
                                                              (row) => row.id,
                                                          )
                                                        : [],
                                                )
                                            }
                                            label=""
                                        />
                                    </th>
                                    {schema.sortableRows && !query.trashed && (
                                        <th className="w-8" />
                                    )}
                                    {columns.map((field) => (
                                        <th
                                            key={field.name}
                                            className="px-3 py-3 whitespace-nowrap"
                                        >
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    toggleSort(field)
                                                }
                                                className={cn(
                                                    'inline-flex items-center gap-1',
                                                    field.sortable &&
                                                        'hover:text-navy-900',
                                                )}
                                                disabled={!field.sortable}
                                            >
                                                {field.label}
                                                {field.sortable &&
                                                    (query.sort ===
                                                    field.name ? (
                                                        <ArrowUp className="h-3 w-3" />
                                                    ) : query.sort ===
                                                      `-${field.name}` ? (
                                                        <ArrowDown className="h-3 w-3" />
                                                    ) : (
                                                        <ArrowUpDown className="h-3 w-3 opacity-40" />
                                                    ))}
                                            </button>
                                        </th>
                                    ))}
                                    <th className="px-3 py-3 whitespace-nowrap">
                                        {query.trashed ? 'Удалено' : 'Изменено'}
                                    </th>
                                    <th className="w-40 px-3 py-3 text-right">
                                        Действия
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {rows.map((row) => (
                                    <tr
                                        key={row.id}
                                        className={cn(
                                            'group transition hover:bg-slate-50',
                                            selected.includes(row.id) &&
                                                'bg-navy-50/60',
                                            dragId === row.id && 'opacity-40',
                                        )}
                                        draggable={
                                            schema.sortableRows &&
                                            !query.trashed &&
                                            !query.sort
                                        }
                                        onDragStart={() => setDragId(row.id)}
                                        onDragOver={(event: DragEvent) =>
                                            event.preventDefault()
                                        }
                                        onDrop={() => onDrop(row.id)}
                                        onDragEnd={() => setDragId(null)}
                                    >
                                        <td className="px-4 py-2.5">
                                            <Checkbox
                                                checked={selected.includes(
                                                    row.id,
                                                )}
                                                onChange={(checked) =>
                                                    setSelected((current) =>
                                                        checked
                                                            ? [
                                                                  ...current,
                                                                  row.id,
                                                              ]
                                                            : current.filter(
                                                                  (id) =>
                                                                      id !==
                                                                      row.id,
                                                              ),
                                                    )
                                                }
                                                label=""
                                            />
                                        </td>
                                        {schema.sortableRows &&
                                            !query.trashed && (
                                                <td className="cursor-grab px-1 text-slate-300 active:cursor-grabbing">
                                                    <GripVertical className="h-4 w-4" />
                                                </td>
                                            )}
                                        {columns.map((field, index) => (
                                            <td
                                                key={field.name}
                                                className={cn(
                                                    'px-3 py-2.5 align-middle',
                                                    index === 0 &&
                                                        'min-w-[220px]',
                                                )}
                                            >
                                                <CellValue
                                                    row={row}
                                                    field={field}
                                                    primary={index === 0}
                                                    editUrl={`${base}/${row.id}/edit`}
                                                    onToggle={() =>
                                                        toggle(row, field)
                                                    }
                                                    readOnly={query.trashed}
                                                />
                                            </td>
                                        ))}
                                        <td
                                            className="px-3 py-2.5 text-xs whitespace-nowrap text-slate-500"
                                            title={formatShortDate(
                                                row.deleted_at ??
                                                    row.updated_at,
                                            )}
                                        >
                                            {relativeTime(
                                                query.trashed
                                                    ? row.deleted_at
                                                    : row.updated_at,
                                            )}
                                        </td>
                                        <td className="px-3 py-2.5">
                                            <div className="flex items-center justify-end gap-1 opacity-70 transition group-hover:opacity-100">
                                                {query.trashed ? (
                                                    <>
                                                        <IconButton
                                                            title="Восстановить"
                                                            onClick={() =>
                                                                router.post(
                                                                    `${base}/${row.id}/restore`,
                                                                    {},
                                                                    {
                                                                        preserveScroll: true,
                                                                    },
                                                                )
                                                            }
                                                        >
                                                            <RotateCcw className="h-4 w-4" />
                                                        </IconButton>
                                                        <IconButton
                                                            title="Удалить навсегда"
                                                            danger
                                                            onClick={() =>
                                                                forceDestroy(
                                                                    row,
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </IconButton>
                                                    </>
                                                ) : (
                                                    <>
                                                        {row._url && (
                                                            <a
                                                                href={row._url}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                title="Открыть на сайте"
                                                                className="rounded-md p-1.5 text-slate-500 hover:bg-slate-200 hover:text-navy-900"
                                                            >
                                                                <ExternalLink className="h-4 w-4" />
                                                            </a>
                                                        )}
                                                        <IconButton
                                                            title="Дублировать"
                                                            onClick={() =>
                                                                router.post(
                                                                    `${base}/${row.id}/duplicate`,
                                                                )
                                                            }
                                                        >
                                                            <Copy className="h-4 w-4" />
                                                        </IconButton>
                                                        <Link
                                                            href={`${base}/${row.id}/edit`}
                                                            title="Редактировать"
                                                            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-200 hover:text-navy-900"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Link>
                                                        <IconButton
                                                            title="Удалить"
                                                            danger
                                                            onClick={() =>
                                                                destroy(row)
                                                            }
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </IconButton>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="border-t border-slate-200 px-4 py-3">
                    <Pagination paginator={items} />
                </div>
            </div>
        </AdminLayout>
    );
}

function IconButton({
    children,
    onClick,
    title,
    danger,
}: {
    children: React.ReactNode;
    onClick: () => void;
    title: string;
    danger?: boolean;
}) {
    return (
        <button
            type="button"
            title={title}
            onClick={onClick}
            className={cn(
                'rounded-md p-1.5 text-slate-500 hover:bg-slate-200 hover:text-navy-900',
                danger && 'hover:bg-rose-50 hover:text-rose-600',
            )}
        >
            {children}
        </button>
    );
}

function CellValue({
    row,
    field,
    primary,
    editUrl,
    onToggle,
    readOnly,
}: {
    row: ResourceRow;
    field: FieldSchema;
    primary: boolean;
    editUrl: string;
    onToggle: () => void;
    readOnly: boolean;
}) {
    const value = row[field.name];

    if (field.type === 'boolean') {
        const on = Boolean(value);

        return (
            <button
                type="button"
                disabled={readOnly}
                onClick={onToggle}
                className={cn(
                    'inline-flex h-6 w-6 items-center justify-center rounded-full transition',
                    on
                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                        : 'bg-slate-100 text-slate-400 hover:bg-slate-200',
                )}
                title={
                    on
                        ? 'Да (нажмите, чтобы выключить)'
                        : 'Нет (нажмите, чтобы включить)'
                }
            >
                {on ? (
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                ) : (
                    <X className="h-3.5 w-3.5" strokeWidth={3} />
                )}
            </button>
        );
    }

    if (field.type === 'image') {
        return value ? (
            <img
                src={asString(value)}
                alt=""
                className="h-10 w-14 rounded-md object-cover ring-1 ring-slate-200"
            />
        ) : (
            <span className="block h-10 w-14 rounded-md bg-slate-100" />
        );
    }

    if (field.type === 'file') {
        return value ? (
            <a
                href={asString(value)}
                target="_blank"
                rel="noreferrer"
                className="text-navy-600 hover:underline"
            >
                файл
            </a>
        ) : (
            <span className="text-slate-300">—</span>
        );
    }

    const text = asString(value) === '' ? '—' : asString(value);

    if (primary) {
        return (
            <Link
                href={editUrl}
                className="line-clamp-2 font-semibold text-navy-900 hover:text-navy-600"
            >
                {text}
            </Link>
        );
    }

    return <span className="line-clamp-2 max-w-xs text-slate-700">{text}</span>;
}
