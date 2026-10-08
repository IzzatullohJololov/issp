import { FileText, ImagePlus, Trash2, UploadCloud } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { formatBytes } from '@/lib/format';

export type ExistingFile = { path: string; url: string } | null;

export function UploadField({
    value,
    file,
    onFile,
    removed,
    onRemove,
    type,
    accept,
}: {
    value: ExistingFile;
    file: File | null;
    onFile: (file: File | null) => void;
    removed: boolean;
    onRemove: (removed: boolean) => void;
    type: 'image' | 'file';
    accept?: string;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [dragging, setDragging] = useState(false);

    useEffect(() => {
        if (!file || type !== 'image') {
            setPreview(null);

            return;
        }

        const url = URL.createObjectURL(file);
        setPreview(url);

        return () => URL.revokeObjectURL(url);
    }, [file, type]);

    const current = file ? preview : removed ? null : (value?.url ?? null);
    const isImage = type === 'image';

    const choose = (list: FileList | null) => {
        const picked = list?.[0] ?? null;
        onFile(picked);
        if (picked) {
            onRemove(false);
        }
    };

    return (
        <div>
            <input
                ref={inputRef}
                type="file"
                accept={accept ?? (isImage ? 'image/*' : undefined)}
                className="hidden"
                onChange={(event) => choose(event.target.files)}
            />
            <div
                onDragOver={(event) => {
                    event.preventDefault();
                    setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(event) => {
                    event.preventDefault();
                    setDragging(false);
                    choose(event.dataTransfer.files);
                }}
                className={`flex gap-4 rounded-lg border-2 border-dashed p-4 transition ${
                    dragging
                        ? 'border-navy-500 bg-navy-50'
                        : 'border-slate-300 bg-slate-50'
                }`}
            >
                {isImage ? (
                    <div className="flex h-28 w-40 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white ring-1 ring-slate-200">
                        {current ? (
                            <img
                                src={current}
                                alt=""
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <ImagePlus className="h-8 w-8 text-slate-300" />
                        )}
                    </div>
                ) : (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-white ring-1 ring-slate-200">
                        <FileText className="h-7 w-7 text-slate-400" />
                    </div>
                )}
                <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
                    {file ? (
                        <p className="truncate text-sm font-semibold text-navy-900">
                            {file.name}{' '}
                            <span className="font-normal text-slate-500">
                                · {formatBytes(file.size)}
                            </span>
                        </p>
                    ) : current && value ? (
                        <a
                            href={value.url}
                            target="_blank"
                            rel="noreferrer"
                            className="truncate text-sm font-semibold text-navy-600 hover:underline"
                        >
                            {value.path.split('/').pop()}
                        </a>
                    ) : (
                        <p className="text-sm text-slate-500">
                            Перетащите файл сюда или выберите на диске
                        </p>
                    )}
                    <div className="flex flex-wrap gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => inputRef.current?.click()}
                        >
                            <UploadCloud className="h-4 w-4" />{' '}
                            {current ? 'Заменить' : 'Выбрать'}
                        </Button>
                        {(file || (value && !removed)) && (
                            <Button
                                size="sm"
                                variant="ghost"
                                className="text-rose-600"
                                onClick={() => {
                                    if (file) {
                                        onFile(null);
                                        if (inputRef.current) {
                                            inputRef.current.value = '';
                                        }
                                    } else {
                                        onRemove(true);
                                    }
                                }}
                            >
                                <Trash2 className="h-4 w-4" /> Удалить
                            </Button>
                        )}
                        {removed && !file && (
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => onRemove(false)}
                            >
                                Отменить удаление
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
