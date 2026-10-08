import { Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, ExternalLink, Save, Trash2 } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { useConfirm } from '@/components/admin/confirm';
import { RichEditor } from '@/components/admin/rich-editor';
import { TagsInput } from '@/components/admin/tags-input';
import {
    type ExistingFile,
    UploadField,
} from '@/components/admin/upload-field';
import { Button } from '@/components/ui/button';
import {
    FieldError,
    HelpText,
    Input,
    Label,
    Select,
    Switch,
    Textarea,
} from '@/components/ui/form';
import { AdminLayout } from '@/layouts/admin-layout';
import { formatDateTime } from '@/lib/format';
import { asString, cn } from '@/lib/utils';
import type { FieldSchema, Locale, ResourceSchema } from '@/types';

// The generic resource form is schema-driven, so its shape is only known at runtime.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FormValues = Record<string, any>;

type Props = {
    schema: ResourceSchema;
    item: Record<string, unknown> & { id: number | null };
    meta?: {
        created_at: string | null;
        updated_at: string | null;
        deleted_at: string | null;
        url: string | null;
    };
};

export default function ResourceForm({ schema, item, meta }: Props) {
    const isEdit = item.id !== null;
    const base = `/admin/${schema.slug}`;
    const [locale, setLocale] = useState<Locale>(schema.defaultLocale);
    const { confirm, dialog } = useConfirm();

    const fields = schema.fields.filter((field) => field.onForm);
    const sections = Object.entries(schema.sections).filter(([key]) =>
        fields.some((field) => field.section === key),
    );

    const initial: FormValues = { _after: 'index' };
    for (const field of fields) {
        if (field.type === 'image' || field.type === 'file') {
            initial[field.name] = null;
            initial[`${field.name}_remove`] = false;
        } else {
            initial[field.name] =
                item[field.name] ??
                (field.translatable
                    ? Object.fromEntries(schema.locales.map((l) => [l, '']))
                    : field.type === 'tags'
                      ? []
                      : field.type === 'boolean'
                        ? false
                        : '');
        }
    }

    const form = useForm<FormValues>(initial);

    const submit = (after: string) => (event?: FormEvent) => {
        event?.preventDefault();
        form.transform((data) => ({ ...data, _after: after }));

        if (isEdit) {
            form.put(`${base}/${item.id}`, {
                preserveScroll: true,
                forceFormData: true,
            });
        } else {
            form.post(base, { preserveScroll: true, forceFormData: true });
        }
    };

    const destroy = () =>
        confirm({
            title: schema.softDeletes
                ? 'Переместить в корзину?'
                : 'Удалить запись?',
            confirmLabel: 'Удалить',
            danger: true,
            onConfirm: () => router.delete(`${base}/${item.id}`),
        });

    const errorFor = (name: string) => {
        const errors = form.errors as Record<string, string | undefined>;

        return (
            errors[name] ??
            schema.locales.map((l) => errors[`${name}.${l}`]).find(Boolean)
        );
    };

    const hasLocaleError = (l: Locale) =>
        Object.keys(form.errors).some((key) => key.endsWith(`.${l}`));

    const hasTranslatable = fields.some((field) => field.translatable);

    return (
        <AdminLayout
            title={
                isEdit
                    ? `${schema.singular}: редактирование`
                    : `${schema.singular}: создание`
            }
            breadcrumbs={[
                { label: 'Панель', href: '/admin' },
                { label: schema.title, href: base },
                { label: isEdit ? 'Редактирование' : 'Создание' },
            ]}
            actions={
                <>
                    {meta?.url && (
                        <a
                            href={meta.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-slate-600 hover:bg-slate-200"
                        >
                            <ExternalLink className="h-4 w-4" /> На сайте
                        </a>
                    )}
                    <Button variant="ghost" href={base}>
                        <ArrowLeft className="h-4 w-4" /> К списку
                    </Button>
                </>
            }
        >
            {dialog}

            <form
                onSubmit={submit('index')}
                className="grid gap-6 lg:grid-cols-12"
            >
                <div className="space-y-6 lg:col-span-8">
                    {hasTranslatable && (
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                                Язык контента:
                            </span>
                            <div className="inline-flex rounded-lg bg-slate-200 p-0.5">
                                {schema.locales.map((l) => (
                                    <button
                                        key={l}
                                        type="button"
                                        onClick={() => setLocale(l)}
                                        className={cn(
                                            'relative rounded-md px-3 py-1 text-xs font-bold uppercase transition',
                                            locale === l
                                                ? 'bg-white text-navy-900 shadow-sm'
                                                : 'text-slate-600 hover:text-navy-900',
                                        )}
                                    >
                                        {l}
                                        {hasLocaleError(l) && (
                                            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-rose-500" />
                                        )}
                                    </button>
                                ))}
                            </div>
                            <span className="text-xs text-slate-400">
                                Поля с переводом заполняются для каждого языка;
                                русский обязателен.
                            </span>
                        </div>
                    )}

                    {sections.map(([key, title]) => {
                        const sectionFields = fields.filter(
                            (field) => field.section === key,
                        );

                        return (
                            <section key={key} className="card">
                                <h2 className="border-b border-slate-200 px-5 py-3 text-sm font-bold text-navy-900">
                                    {title}
                                </h2>
                                <div className="grid gap-5 p-5 sm:grid-cols-6">
                                    {sectionFields.map((field) => (
                                        <div
                                            key={field.name}
                                            className={cn(
                                                field.width === 'half'
                                                    ? 'sm:col-span-3'
                                                    : field.width === 'third'
                                                      ? 'sm:col-span-2'
                                                      : 'sm:col-span-6',
                                            )}
                                        >
                                            <FieldControl
                                                field={field}
                                                locale={locale}
                                                value={form.data[field.name]}
                                                existing={
                                                    (item[
                                                        field.name
                                                    ] as ExistingFile) ?? null
                                                }
                                                removed={Boolean(
                                                    form.data[
                                                        `${field.name}_remove`
                                                    ],
                                                )}
                                                onChange={(value) =>
                                                    form.setData(
                                                        field.name,
                                                        value,
                                                    )
                                                }
                                                onRemove={(removed) =>
                                                    form.setData(
                                                        `${field.name}_remove`,
                                                        removed,
                                                    )
                                                }
                                                error={errorFor(field.name)}
                                                locales={schema.locales}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </section>
                        );
                    })}
                </div>

                <aside className="space-y-4 lg:col-span-4">
                    <div className="sticky top-20 card p-5">
                        <div className="flex flex-col gap-2">
                            <Button
                                type="submit"
                                loading={form.processing}
                                size="lg"
                            >
                                <Save className="h-4 w-4" /> Сохранить
                            </Button>
                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => submit('continue')()}
                                    disabled={form.processing}
                                >
                                    Сохранить и остаться
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => submit('new')()}
                                    disabled={form.processing}
                                >
                                    Сохранить и новая
                                </Button>
                            </div>
                        </div>
                        {form.isDirty && (
                            <p className="mt-3 text-xs text-gold-700">
                                Есть несохранённые изменения.
                            </p>
                        )}

                        {isEdit && meta && (
                            <dl className="mt-5 space-y-2 border-t border-slate-200 pt-4 text-xs text-slate-500">
                                <div className="flex justify-between gap-2">
                                    <dt>ID</dt>
                                    <dd className="font-mono text-slate-700">
                                        #{item.id}
                                    </dd>
                                </div>
                                {meta.created_at && (
                                    <div className="flex justify-between gap-2">
                                        <dt>Создано</dt>
                                        <dd className="text-slate-700">
                                            {formatDateTime(meta.created_at)}
                                        </dd>
                                    </div>
                                )}
                                {meta.updated_at && (
                                    <div className="flex justify-between gap-2">
                                        <dt>Изменено</dt>
                                        <dd className="text-slate-700">
                                            {formatDateTime(meta.updated_at)}
                                        </dd>
                                    </div>
                                )}
                                {meta.deleted_at && (
                                    <div className="flex justify-between gap-2 text-rose-600">
                                        <dt>В корзине с</dt>
                                        <dd>
                                            {formatDateTime(meta.deleted_at)}
                                        </dd>
                                    </div>
                                )}
                            </dl>
                        )}

                        {isEdit && (
                            <div className="mt-5 border-t border-slate-200 pt-4">
                                <Button
                                    variant="ghost"
                                    className="w-full text-rose-600 hover:bg-rose-50"
                                    onClick={destroy}
                                >
                                    <Trash2 className="h-4 w-4" />{' '}
                                    {schema.softDeletes
                                        ? 'В корзину'
                                        : 'Удалить'}
                                </Button>
                            </div>
                        )}
                    </div>
                    <p className="px-1 text-xs text-slate-400">
                        Раздел:{' '}
                        <Link
                            href={base}
                            className="font-semibold text-slate-600 hover:underline"
                        >
                            {schema.title}
                        </Link>
                    </p>
                </aside>
            </form>
        </AdminLayout>
    );
}

function FieldControl({
    field,
    locale,
    locales,
    value,
    existing,
    removed,
    onChange,
    onRemove,
    error,
}: {
    field: FieldSchema;
    locale: Locale;
    locales: Locale[];
    value: unknown;
    existing: ExistingFile;
    removed: boolean;
    onChange: (value: unknown) => void;
    onRemove: (removed: boolean) => void;
    error?: string;
}) {
    const id = `field-${field.name}`;

    if (field.translatable) {
        const translations = (value ?? {}) as Record<string, string>;
        const current = translations[locale] ?? '';
        const update = (text: string) =>
            onChange({
                ...Object.fromEntries(
                    locales.map((l) => [l, translations[l] ?? '']),
                ),
                [locale]: text,
            });
        const label = (
            <Label
                htmlFor={id}
                required={field.required && locale === locales[0]}
            >
                {field.label}{' '}
                <span className="ml-1 rounded bg-slate-100 px-1 py-0.5 text-[10px] font-bold text-slate-500 uppercase">
                    {locale}
                </span>
            </Label>
        );

        if (field.type === 'richtext') {
            return (
                <div>
                    {label}
                    <RichEditor
                        key={locale}
                        value={current}
                        onChange={update}
                        placeholder={field.placeholder ?? undefined}
                        invalid={Boolean(error)}
                    />
                    <HelpText>{field.help}</HelpText>
                    <FieldError message={error} />
                </div>
            );
        }

        if (field.type === 'textarea') {
            return (
                <div>
                    {label}
                    <Textarea
                        id={id}
                        rows={field.rows ?? 4}
                        value={current}
                        onChange={(e) => update(e.target.value)}
                        placeholder={field.placeholder ?? undefined}
                        invalid={Boolean(error)}
                    />
                    <HelpText>{field.help}</HelpText>
                    <FieldError message={error} />
                </div>
            );
        }

        return (
            <div>
                {label}
                <Input
                    id={id}
                    value={current}
                    onChange={(e) => update(e.target.value)}
                    placeholder={field.placeholder ?? undefined}
                    invalid={Boolean(error)}
                />
                <HelpText>{field.help}</HelpText>
                <FieldError message={error} />
            </div>
        );
    }

    switch (field.type) {
        case 'boolean':
            return (
                <div className="pt-6">
                    <Switch
                        checked={Boolean(value)}
                        onChange={(checked) => onChange(checked)}
                        label={field.label}
                        description={field.help ?? undefined}
                    />
                    <FieldError message={error} />
                </div>
            );
        case 'textarea':
            return (
                <div>
                    <Label htmlFor={id} required={field.required}>
                        {field.label}
                    </Label>
                    <Textarea
                        id={id}
                        rows={field.rows ?? 4}
                        value={asString(value)}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={field.placeholder ?? undefined}
                        invalid={Boolean(error)}
                    />
                    <HelpText>{field.help}</HelpText>
                    <FieldError message={error} />
                </div>
            );
        case 'richtext':
            return (
                <div>
                    <Label htmlFor={id} required={field.required}>
                        {field.label}
                    </Label>
                    <RichEditor
                        value={asString(value)}
                        onChange={(html) => onChange(html)}
                        invalid={Boolean(error)}
                    />
                    <HelpText>{field.help}</HelpText>
                    <FieldError message={error} />
                </div>
            );
        case 'select':
        case 'relation':
            return (
                <div>
                    <Label htmlFor={id} required={field.required}>
                        {field.label}
                    </Label>
                    <Select
                        id={id}
                        value={asString(value)}
                        onChange={(e) =>
                            onChange(
                                e.target.value === '' ? null : e.target.value,
                            )
                        }
                        invalid={Boolean(error)}
                    >
                        <option value="">
                            {field.required ? '— выберите —' : '— не выбрано —'}
                        </option>
                        {field.options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </Select>
                    <HelpText>{field.help}</HelpText>
                    <FieldError message={error} />
                </div>
            );
        case 'image':
        case 'file':
            return (
                <div>
                    <Label required={field.required}>{field.label}</Label>
                    <UploadField
                        type={field.type}
                        value={existing}
                        file={(value as File | null) ?? null}
                        onFile={(file) => onChange(file)}
                        removed={removed}
                        onRemove={onRemove}
                    />
                    <HelpText>{field.help}</HelpText>
                    <FieldError message={error} />
                </div>
            );
        case 'tags':
            return (
                <div>
                    <Label required={field.required}>{field.label}</Label>
                    <TagsInput
                        value={(value as string[]) ?? []}
                        onChange={(tags) => onChange(tags)}
                        placeholder={
                            field.placeholder ?? 'Введите и нажмите Enter'
                        }
                    />
                    <HelpText>{field.help}</HelpText>
                    <FieldError message={error} />
                </div>
            );
        case 'number':
            return (
                <div>
                    <Label htmlFor={id} required={field.required}>
                        {field.label}
                    </Label>
                    <Input
                        id={id}
                        type="number"
                        value={asString(value)}
                        onChange={(e) =>
                            onChange(
                                e.target.value === ''
                                    ? null
                                    : Number(e.target.value),
                            )
                        }
                        invalid={Boolean(error)}
                    />
                    <HelpText>{field.help}</HelpText>
                    <FieldError message={error} />
                </div>
            );
        case 'date':
        case 'datetime':
            return (
                <div>
                    <Label htmlFor={id} required={field.required}>
                        {field.label}
                    </Label>
                    <Input
                        id={id}
                        type={field.type === 'date' ? 'date' : 'datetime-local'}
                        value={asString(value)}
                        onChange={(e) => onChange(e.target.value || null)}
                        invalid={Boolean(error)}
                    />
                    <HelpText>{field.help}</HelpText>
                    <FieldError message={error} />
                </div>
            );
        default:
            return (
                <div>
                    <Label htmlFor={id} required={field.required}>
                        {field.label}
                    </Label>
                    <Input
                        id={id}
                        type={
                            field.type === 'email'
                                ? 'email'
                                : field.type === 'url'
                                  ? 'url'
                                  : 'text'
                        }
                        value={asString(value)}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={field.placeholder ?? undefined}
                        invalid={Boolean(error)}
                        className={cn(
                            field.type === 'slug' && 'font-mono text-xs',
                        )}
                    />
                    <HelpText>{field.help}</HelpText>
                    <FieldError message={error} />
                </div>
            );
    }
}
