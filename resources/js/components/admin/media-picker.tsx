import { FileIcon, Loader2, Search, UploadCloud } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { formatBytes } from '@/lib/format';
import { cn } from '@/lib/utils';

export type MediaFile = {
    id: number;
    url: string;
    file_name: string;
    mime_type: string | null;
    is_image: boolean;
    size: number;
    width: number | null;
    height: number | null;
    alt: string | null;
    folder: string;
    uploader?: string | null;
    created_at: string | null;
};

type Response = { data: MediaFile[]; next_page_url: string | null };

function csrfToken(): string {
    return decodeURIComponent(
        document.cookie
            .split('; ')
            .find((row) => row.startsWith('XSRF-TOKEN='))
            ?.split('=')[1] ?? '',
    );
}

/**
 * Fetch a page of the media library as JSON (the admin media index
 * responds with Inertia props; we read them via the X-Inertia header).
 */
async function fetchMedia(url: string): Promise<Response> {
    const response = await fetch(url, {
        headers: {
            'X-Inertia': 'true',
            'X-Inertia-Version': '',
            'X-Requested-With': 'XMLHttpRequest',
            Accept: 'application/json',
        },
        credentials: 'same-origin',
    });

    const payload = (await response.json()) as { props: { items: Response } };

    return payload.props.items;
}

export function MediaPicker({
    open,
    onClose,
    onSelect,
    imagesOnly = false,
}: {
    open: boolean;
    onClose: () => void;
    onSelect: (media: MediaFile) => void;
    imagesOnly?: boolean;
}) {
    const [items, setItems] = useState<MediaFile[]>([]);
    const [next, setNext] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [search, setSearch] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const buildUrl = (query: string) => {
        const params = new URLSearchParams();
        if (imagesOnly) {
            params.set('type', 'image');
        }
        if (query) {
            params.set('search', query);
        }

        return `/admin/media?${params.toString()}`;
    };

    const load = async (url: string, append = false) => {
        setLoading(true);
        try {
            const page = await fetchMedia(url);
            setItems((current) =>
                append ? [...current, ...page.data] : page.data,
            );
            setNext(page.next_page_url);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            void load(buildUrl(''));
            setSearch('');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const upload = async (files: FileList | null) => {
        if (!files || files.length === 0) {
            return;
        }

        setUploading(true);
        const form = new FormData();
        Array.from(files).forEach((file) => form.append('files[]', file));

        try {
            const response = await fetch('/admin/media', {
                method: 'POST',
                body: form,
                headers: {
                    'X-XSRF-TOKEN': csrfToken(),
                    'X-Requested-With': 'XMLHttpRequest',
                    Accept: 'application/json',
                },
                credentials: 'same-origin',
            });

            if (response.ok) {
                const payload = (await response.json()) as {
                    files: MediaFile[];
                };
                setItems((current) => [...payload.files, ...current]);
            }
        } finally {
            setUploading(false);
            if (inputRef.current) {
                inputRef.current.value = '';
            }
        }
    };

    return (
        <Modal open={open} onClose={onClose} title="Медиатека" size="xl">
            <div className="mb-4 flex flex-wrap items-center gap-2">
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        void load(buildUrl(search));
                    }}
                    className="relative flex-1"
                >
                    <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Поиск по имени файла"
                        className="h-10 w-full rounded-lg border border-slate-300 pr-3 pl-9 text-sm focus-ring"
                    />
                </form>
                <input
                    ref={inputRef}
                    type="file"
                    multiple
                    accept={imagesOnly ? 'image/*' : undefined}
                    className="hidden"
                    onChange={(event) => void upload(event.target.files)}
                />
                <Button
                    variant="secondary"
                    onClick={() => inputRef.current?.click()}
                    loading={uploading}
                >
                    <UploadCloud className="h-4 w-4" /> Загрузить
                </Button>
            </div>

            {items.length === 0 && !loading && (
                <p className="py-12 text-center text-sm text-slate-500">
                    Файлов пока нет. Загрузите первый файл.
                </p>
            )}

            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
                {items.map((media) => (
                    <button
                        key={media.id}
                        type="button"
                        onClick={() => onSelect(media)}
                        className={cn(
                            'group relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-slate-50 focus-ring transition hover:border-navy-500',
                        )}
                        title={media.file_name}
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
                                <FileIcon className="h-7 w-7" />
                                <span className="line-clamp-2 text-[10px] font-semibold">
                                    {media.file_name}
                                </span>
                            </span>
                        )}
                        <span className="absolute inset-x-0 bottom-0 truncate bg-navy-950/70 px-1.5 py-1 text-left text-[10px] text-white opacity-0 transition group-hover:opacity-100">
                            {media.file_name} · {formatBytes(media.size)}
                        </span>
                    </button>
                ))}
            </div>

            <div className="mt-4 flex justify-center">
                {loading && (
                    <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                )}
                {!loading && next && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => void load(next, true)}
                    >
                        Показать ещё
                    </Button>
                )}
            </div>
        </Modal>
    );
}
