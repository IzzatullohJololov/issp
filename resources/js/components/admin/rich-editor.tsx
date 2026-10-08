import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import {
    Table,
    TableCell,
    TableHeader,
    TableRow,
} from '@tiptap/extension-table';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
    Bold,
    Code,
    Heading2,
    Heading3,
    Image as ImageIcon,
    Italic,
    Link2,
    List,
    ListOrdered,
    Minus,
    Quote,
    Redo2,
    Table as TableIcon,
    Underline,
    Undo2,
    Unlink,
} from 'lucide-react';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { MediaPicker } from '@/components/admin/media-picker';
import { cn } from '@/lib/utils';

export function RichEditor({
    value,
    onChange,
    placeholder,
    invalid,
}: {
    value: string;
    onChange: (html: string) => void;
    placeholder?: string;
    invalid?: boolean;
}) {
    const [pickerOpen, setPickerOpen] = useState(false);
    const [html, setHtml] = useState(false);
    const lastEmitted = useRef(value);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({ heading: { levels: [2, 3, 4] } }),
            Link.configure({ openOnClick: false, autolink: true }),
            Image.configure({ inline: false, allowBase64: false }),
            Table.configure({ resizable: false }),
            TableRow,
            TableHeader,
            TableCell,
        ],
        content: value || '',
        editorProps: {
            attributes: { class: 'editor-content' },
        },
        onUpdate: ({ editor }) => {
            const next = editor.isEmpty ? '' : editor.getHTML();
            lastEmitted.current = next;
            onChange(next);
        },
    });

    useEffect(() => {
        if (editor && value !== lastEmitted.current) {
            lastEmitted.current = value;
            editor.commands.setContent(value || '', { emitUpdate: false });
        }
    }, [value, editor]);

    if (!editor) {
        return <div className="h-80 animate-pulse rounded-lg bg-slate-100" />;
    }

    const setLink = () => {
        const previous = editor.getAttributes('link').href as
            | string
            | undefined;
        const url = window.prompt('Адрес ссылки', previous ?? 'https://');

        if (url === null) {
            return;
        }

        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();

            return;
        }

        editor
            .chain()
            .focus()
            .extendMarkRange('link')
            .setLink({ href: url })
            .run();
    };

    return (
        <div
            className={cn(
                'overflow-hidden rounded-lg border bg-white',
                invalid
                    ? 'border-rose-400'
                    : 'border-slate-300 focus-within:border-navy-500',
            )}
        >
            <div className="flex flex-wrap items-center gap-0.5 border-b border-slate-200 bg-slate-50 px-2 py-1.5">
                <ToolButton
                    title="Отменить"
                    onClick={() => editor.chain().focus().undo().run()}
                >
                    <Undo2 className="h-4 w-4" />
                </ToolButton>
                <ToolButton
                    title="Повторить"
                    onClick={() => editor.chain().focus().redo().run()}
                >
                    <Redo2 className="h-4 w-4" />
                </ToolButton>
                <Divider />
                <ToolButton
                    title="Заголовок 2"
                    active={editor.isActive('heading', { level: 2 })}
                    onClick={() =>
                        editor.chain().focus().toggleHeading({ level: 2 }).run()
                    }
                >
                    <Heading2 className="h-4 w-4" />
                </ToolButton>
                <ToolButton
                    title="Заголовок 3"
                    active={editor.isActive('heading', { level: 3 })}
                    onClick={() =>
                        editor.chain().focus().toggleHeading({ level: 3 }).run()
                    }
                >
                    <Heading3 className="h-4 w-4" />
                </ToolButton>
                <Divider />
                <ToolButton
                    title="Жирный"
                    active={editor.isActive('bold')}
                    onClick={() => editor.chain().focus().toggleBold().run()}
                >
                    <Bold className="h-4 w-4" />
                </ToolButton>
                <ToolButton
                    title="Курсив"
                    active={editor.isActive('italic')}
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                >
                    <Italic className="h-4 w-4" />
                </ToolButton>
                <ToolButton
                    title="Зачёркнутый"
                    active={editor.isActive('strike')}
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                >
                    <Underline className="h-4 w-4" />
                </ToolButton>
                <ToolButton
                    title="Код"
                    active={editor.isActive('code')}
                    onClick={() => editor.chain().focus().toggleCode().run()}
                >
                    <Code className="h-4 w-4" />
                </ToolButton>
                <Divider />
                <ToolButton
                    title="Список"
                    active={editor.isActive('bulletList')}
                    onClick={() =>
                        editor.chain().focus().toggleBulletList().run()
                    }
                >
                    <List className="h-4 w-4" />
                </ToolButton>
                <ToolButton
                    title="Нумерованный список"
                    active={editor.isActive('orderedList')}
                    onClick={() =>
                        editor.chain().focus().toggleOrderedList().run()
                    }
                >
                    <ListOrdered className="h-4 w-4" />
                </ToolButton>
                <ToolButton
                    title="Цитата"
                    active={editor.isActive('blockquote')}
                    onClick={() =>
                        editor.chain().focus().toggleBlockquote().run()
                    }
                >
                    <Quote className="h-4 w-4" />
                </ToolButton>
                <ToolButton
                    title="Разделитель"
                    onClick={() =>
                        editor.chain().focus().setHorizontalRule().run()
                    }
                >
                    <Minus className="h-4 w-4" />
                </ToolButton>
                <Divider />
                <ToolButton
                    title="Ссылка"
                    active={editor.isActive('link')}
                    onClick={setLink}
                >
                    <Link2 className="h-4 w-4" />
                </ToolButton>
                {editor.isActive('link') && (
                    <ToolButton
                        title="Убрать ссылку"
                        onClick={() => editor.chain().focus().unsetLink().run()}
                    >
                        <Unlink className="h-4 w-4" />
                    </ToolButton>
                )}
                <ToolButton
                    title="Изображение"
                    onClick={() => setPickerOpen(true)}
                >
                    <ImageIcon className="h-4 w-4" />
                </ToolButton>
                <ToolButton
                    title="Таблица"
                    onClick={() =>
                        editor
                            .chain()
                            .focus()
                            .insertTable({
                                rows: 3,
                                cols: 3,
                                withHeaderRow: true,
                            })
                            .run()
                    }
                >
                    <TableIcon className="h-4 w-4" />
                </ToolButton>
                {editor.isActive('table') && (
                    <>
                        <Divider />
                        <TextButton
                            onClick={() =>
                                editor.chain().focus().addRowAfter().run()
                            }
                        >
                            + строка
                        </TextButton>
                        <TextButton
                            onClick={() =>
                                editor.chain().focus().addColumnAfter().run()
                            }
                        >
                            + столбец
                        </TextButton>
                        <TextButton
                            onClick={() =>
                                editor.chain().focus().deleteRow().run()
                            }
                        >
                            − строка
                        </TextButton>
                        <TextButton
                            onClick={() =>
                                editor.chain().focus().deleteColumn().run()
                            }
                        >
                            − столбец
                        </TextButton>
                        <TextButton
                            onClick={() =>
                                editor.chain().focus().deleteTable().run()
                            }
                        >
                            удалить таблицу
                        </TextButton>
                    </>
                )}
                <span className="flex-1" />
                <TextButton active={html} onClick={() => setHtml((v) => !v)}>
                    HTML
                </TextButton>
            </div>
            {html ? (
                <textarea
                    className="min-h-[320px] w-full px-4 py-3 font-mono text-xs leading-relaxed outline-none"
                    value={value}
                    onChange={(event) => {
                        lastEmitted.current = event.target.value;
                        onChange(event.target.value);
                        editor.commands.setContent(event.target.value, {
                            emitUpdate: false,
                        });
                    }}
                />
            ) : (
                <EditorContent editor={editor} data-placeholder={placeholder} />
            )}
            <MediaPicker
                open={pickerOpen}
                onClose={() => setPickerOpen(false)}
                onSelect={(media) => {
                    editor
                        .chain()
                        .focus()
                        .setImage({ src: media.url, alt: media.alt ?? '' })
                        .run();
                    setPickerOpen(false);
                }}
                imagesOnly
            />
        </div>
    );
}

function ToolButton({
    children,
    onClick,
    active,
    title,
}: {
    children: ReactNode;
    onClick: () => void;
    active?: boolean;
    title: string;
}) {
    return (
        <button
            type="button"
            title={title}
            onMouseDown={(event) => event.preventDefault()}
            onClick={onClick}
            className={cn(
                'rounded-md p-1.5 text-slate-600 transition hover:bg-slate-200 hover:text-navy-900',
                active &&
                    'bg-navy-900 text-white hover:bg-navy-800 hover:text-white',
            )}
        >
            {children}
        </button>
    );
}

function TextButton({
    children,
    onClick,
    active,
}: {
    children: ReactNode;
    onClick: () => void;
    active?: boolean;
}) {
    return (
        <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={onClick}
            className={cn(
                'rounded-md px-2 py-1 text-[11px] font-bold tracking-wide text-slate-600 uppercase hover:bg-slate-200',
                active && 'bg-navy-900 text-white hover:bg-navy-800',
            )}
        >
            {children}
        </button>
    );
}

function Divider() {
    return <span className="mx-1 h-5 w-px bg-slate-300" />;
}
