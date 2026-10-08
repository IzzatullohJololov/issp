import { router, useForm } from '@inertiajs/react';
import {
    Check,
    Copy,
    FileIcon,
    Search,
    Trash2,
    UploadCloud,
    X,
} from 'lucide-react';
import { type FormEvent, useRef, useState } from 'react';
import { useConfirm } from '@/components/admin/confirm';
import type { MediaFile } from '@/components/admin/media-picker';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Input, Label, Select } from '@/components/ui/form';
import { Modal } from '@/components/ui/modal';
import { Pagination } from '@/components/ui/pagination';
import { AdminLayout } from '@/layouts/admin-layout';
import { formatBytes, formatDateTime } from '@/lib/format';
import { cn, formString } from '@/lib/utils';
import type { Paginated } from '@/types';

type Props = {
    items: Paginated<MediaFile>;
    folders: string[];
    query: { folder?: string; type?: string; search?: string };
    totalSize: number;
};

export default function MediaIndex({
    items,
    folders,
    query,
    totalSize,
}: Props) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [selected, setSelected] = useState<number[]>([]);
    const [active, setActive] = useState<MediaFile | null>(null);
    const [copied, setCopied] = useState(false);
    const { confirm, dialog } = useConfirm();

    const upload = useForm<{ files: File[]; folder: string }>({
        files: [],
        folder: query.folder ?? 'general',
    });
    const edit = useForm({ alt: '', folder: '' });

    const visit = (next: Partial<Props['query']>) =>
        router.get(
            '/admin/media',
            Object.fromEntries(
                Object.entries({ ...query, ...next }).filter(([, v]) => v),
            ),
            { preserveState: true, preserveScroll: true },
        );

    const onFiles = (list: FileList | null) => {
        if (!list || list.length === 0) {
            return;
        }

        upload.setData('files', Array.from(list));
        upload.post('/admin/media', {
            preserveScroll: true,
            forceFormData: true,
            onFinish: () => {
                upload.reset('files');
                if (inputRef.current) {
                    inputRef.current.value = '';
                }
            },
        });
    };

    const open = (media: MediaFile) => {
        setActive(media);
        edit.setData({ alt: media.alt ?? '', folder: media.folder });
        setCopied(false);
    };

    const copy = async (url: string) => {
        await navigator.clipboard.writeText(window.location.origin + url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    const destroyMany = () =>
        confirm({
            title: `Удалить файлов: ${selected.length}?`,
            description:
                'Файлы будут удалены с диска. Ссылки на них в материалах перестанут работать.',
            confirmLabel: 'Удалить',
            danger: true,
            onConfirm: () =>
                router.post(
                    '/admin/media/bulk-delete',
                    { ids: selected },
                    { preserveScroll: true, onSuccess: () => setSelected([]) },
                ),
        });

    const destroyOne = (media: MediaFile) =>
        confirm({
            title: 'Удалить файл?',
            description: media.file_name,
            confirmLabel: 'Удалить',
            danger: true,
            onConfirm: () =>
                router.delete(`/admin/media/${media.id}`, {
                    preserveScroll: true,
                    onSuccess: () => setActive(null),
                }),
        });

    return (
        <AdminLayout
            title="Медиатека"
            description={`${items.total} файлов · ${formatBytes(totalSize)}`}
            breadcrumbs={[
                { label: 'Панель', href: '/admin' },
                { label: 'Медиатека' },
            ]}
            actions={
                <>
                    <input
                        ref={inputRef}
                        type="file"
                        multiple
                        className="hidden"
                        onChange={(e) => onFiles(e.target.files)}
                    />
                    <Select
                        value={upload.data.folder}
                        onChange={(e) =>
                            upload.setData('folder', e.target.value)
                        }
                        className="w-auto"
                    >
                        {[...new Set(['general', ...folders])].map((folder) => (
                            <option key={folder} value={folder}>
                                папка: {folder}
                            </option>
                        ))}
                    </Select>
                    <Button
                        onClick={() => inputRef.current?.click()}
                        loading={upload.processing}
                    >
                        <UploadCloud className="h-4 w-4" /> Загрузить
                    </Button>
                </>
            }
        >
            {dialog}

            <div
                className="card"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                    e.preventDefault();
                    onFiles(e.dataTransfer.files);
                }}
            >
                <div className="flex flex-col gap-3 border-b border-slate-200 p-4 lg:flex-row lg:items-center">
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
                            placeholder="Поиск по имени файла"
                            className="h-10 w-full rounded-lg border border-slate-300 pr-3 pl-9 text-sm focus-ring"
                        />
                    </form>
                    <Select
                        value={query.folder ?? ''}
                        onChange={(e) => visit({ folder: e.target.value })}
                        className="w-auto"
                    >
                        <option value="">Все папки</option>
                        {folders.map((folder) => (
                            <option key={folder} value={folder}>
                                {folder}
                            </option>
                        ))}
                    </Select>
                    <Select
                        value={query.type ?? ''}
                        onChange={(e) => visit({ type: e.target.value })}
                        className="w-auto"
                    >
                        <option value="">Все типы</option>
                        <option value="image">Изображения</option>
                        <option value="file">Документы</option>
                    </Select>
                    {upload.progress && (
                        <div className="h-2 w-40 overflow-hidden rounded-full bg-slate-200">
                            <div
                                className="h-full bg-navy-600 transition-all"
                                style={{
                                    width: `${upload.progress.percentage ?? 0}%`,
                                }}
                            />
                        </div>
                    )}
                </div>

                {selected.length > 0 && (
                    <div className="flex items-center gap-3 border-b border-slate-200 bg-navy-50 px-4 py-2 text-sm">
                        <span className="font-semibold">
                            Выбрано: {selected.length}
                        </span>
                        <Button
                            size="sm"
                            variant="danger"
                            onClick={destroyMany}
                        >
                            <Trash2 className="h-4 w-4" /> Удалить
                        </Button>
                        <button
                            type="button"
                            onClick={() => setSelected([])}
                            className="ml-auto text-xs font-semibold text-slate-500"
                        >
                            Снять выделение
                        </button>
                    </div>
                )}

                {items.data.length === 0 ? (
                    <div className="p-6">
                        <EmptyState
                            title="Файлов пока нет"
                            description="Перетащите файлы сюда или нажмите «Загрузить»."
                            icon={<UploadCloud className="h-6 w-6" />}
                        />
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
                        {items.data.map((media) => {
                            const isSelected = selected.includes(media.id);

                            return (
                                <div
                                    key={media.id}
                                    className={cn(
                                        'group relative aspect-square overflow-hidden rounded-lg border bg-slate-50',
                                        isSelected
                                            ? 'border-navy-600 ring-2 ring-navy-200'
                                            : 'border-slate-200',
                                    )}
                                >
                                    <button
                                        type="button"
                                        onClick={() => open(media)}
                                        className="h-full w-full"
                                    >
                                        {media.is_image ? (
                                            <img
                                                src={media.url}
                                                alt={media.alt ?? ''}
                                                className="h-full w-full object-cover"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <span className="flex h-full w-full flex-col items-center justify-center gap-1 p-2 text-slate-500">
                                                <FileIcon className="h-8 w-8" />
                                                <span className="line-clamp-2 text-[10px] font-semibold">
                                                    {media.file_name}
                                                </span>
                                            </span>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setSelected((c) =>
                                                isSelected
                                                    ? c.filter(
                                                          (id) =>
                                                              id !== media.id,
                                                      )
                                                    : [...c, media.id],
                                            )
                                        }
                                        className={cn(
                                            'absolute top-1.5 left-1.5 flex h-6 w-6 items-center justify-center rounded-md border bg-white/90 transition',
                                            isSelected
                                                ? 'border-navy-600 bg-navy-900 text-white opacity-100'
                                                : 'border-slate-300 text-transparent opacity-0 group-hover:opacity-100',
                                        )}
                                    >
                                        <Check
                                            className="h-3.5 w-3.5"
                                            strokeWidth={3}
                                        />
                                    </button>
                                    <span className="absolute inset-x-0 bottom-0 truncate bg-navy-950/70 px-1.5 py-1 text-[10px] text-white opacity-0 transition group-hover:opacity-100">
                                        {media.file_name}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="border-t border-slate-200 px-4 py-3">
                    <Pagination paginator={items} />
                </div>
            </div>

            <Modal
                open={active !== null}
                onClose={() => setActive(null)}
                title={active?.file_name}
                size="lg"
            >
                {active && (
                    <div className="grid gap-5 md:grid-cols-2">
                        <div className="flex items-center justify-center rounded-lg bg-slate-100 p-3">
                            {active.is_image ? (
                                <img
                                    src={active.url}
                                    alt={active.alt ?? ''}
                                    className="max-h-80 rounded-md object-contain"
                                />
                            ) : (
                                <FileIcon className="h-20 w-20 text-slate-400" />
                            )}
                        </div>
                        <div className="space-y-4">
                            <dl className="space-y-1 text-xs text-slate-500">
                                <div className="flex justify-between">
                                    <dt>Тип</dt>
                                    <dd className="text-slate-700">
                                        {active.mime_type}
                                    </dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt>Размер</dt>
                                    <dd className="text-slate-700">
                                        {formatBytes(active.size)}
                                        {active.width
                                            ? ` · ${active.width}×${active.height}`
                                            : ''}
                                    </dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt>Загружено</dt>
                                    <dd className="text-slate-700">
                                        {formatDateTime(active.created_at)}
                                        {active.uploader
                                            ? ` · ${active.uploader}`
                                            : ''}
                                    </dd>
                                </div>
                            </dl>
                            <div>
                                <Label>Ссылка</Label>
                                <div className="flex gap-2">
                                    <Input
                                        readOnly
                                        value={active.url}
                                        className="font-mono text-xs"
                                    />
                                    <Button
                                        variant="outline"
                                        onClick={() => void copy(active.url)}
                                    >
                                        {copied ? (
                                            <Check className="h-4 w-4 text-emerald-600" />
                                        ) : (
                                            <Copy className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    edit.put(`/admin/media/${active.id}`, {
                                        preserveScroll: true,
                                        onSuccess: () => setActive(null),
                                    });
                                }}
                                className="space-y-3"
                            >
                                <div>
                                    <Label>Alt-текст</Label>
                                    <Input
                                        value={edit.data.alt}
                                        onChange={(e) =>
                                            edit.setData('alt', e.target.value)
                                        }
                                    />
                                </div>
                                <div>
                                    <Label>Папка</Label>
                                    <Input
                                        value={edit.data.folder}
                                        onChange={(e) =>
                                            edit.setData(
                                                'folder',
                                                e.target.value,
                                            )
                                        }
                                        pattern="[a-z0-9\-_]+"
                                    />
                                </div>
                                <div className="flex items-center justify-between gap-2 pt-2">
                                    <Button
                                        variant="ghost"
                                        className="text-rose-600 hover:bg-rose-50"
                                        onClick={() => destroyOne(active)}
                                    >
                                        <Trash2 className="h-4 w-4" /> Удалить
                                    </Button>
                                    <Button
                                        type="submit"
                                        loading={edit.processing}
                                    >
                                        Сохранить
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </Modal>
        </AdminLayout>
    );
}

export { X };
