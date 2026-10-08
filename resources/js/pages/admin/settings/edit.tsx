import { useForm } from '@inertiajs/react';
import { Plus, Save, Trash2 } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    FieldError,
    HelpText,
    Input,
    Label,
    Textarea,
} from '@/components/ui/form';
import { AdminLayout } from '@/layouts/admin-layout';
import { asString, cn } from '@/lib/utils';
import type { Locale } from '@/types';

type Field = {
    key: string;
    label: string;
    type: string;
    translatable?: boolean;
    help?: string;
};
type Groups = Record<string, { title: string; fields: Field[] }>;
type StatRow = { value: string; label: { ru: string; en: string } };
type LinkRow = { label: string; url: string };

const LOCALES: Locale[] = ['ru', 'en'];

export default function SettingsEdit({
    groups,
    values,
}: {
    groups: Groups;
    values: Record<string, unknown>;
}) {
    const [tab, setTab] = useState(Object.keys(groups)[0] ?? 'general');
    const [locale, setLocale] = useState<Locale>('ru');

    // Settings are schema-driven; the exact shape is only known at runtime.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const initial: Record<string, any> = {};
    for (const group of Object.values(groups)) {
        for (const field of group.fields) {
            const value = values[field.key];
            if (field.translatable) {
                const translations = (
                    value && typeof value === 'object'
                        ? value
                        : { ru: value ?? '' }
                ) as Record<string, string>;
                initial[field.key] = {
                    ru: translations.ru ?? '',
                    en: translations.en ?? '',
                };
            } else if (field.type === 'stats' || field.type === 'links') {
                initial[field.key] = Array.isArray(value) ? value : [];
            } else {
                initial[field.key] = value ?? '';
            }
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const form = useForm<{ values: Record<string, any> }>({ values: initial });

    const set = (key: string, value: unknown) =>
        form.setData('values', { ...form.data.values, [key]: value });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.put('/admin/settings', { preserveScroll: true });
    };

    return (
        <AdminLayout
            title="Настройки сайта"
            description="Название, контакты, соцсети, подвал и SEO"
            breadcrumbs={[
                { label: 'Панель', href: '/admin' },
                { label: 'Настройки' },
            ]}
            actions={
                <div className="inline-flex rounded-lg bg-slate-200 p-0.5">
                    {LOCALES.map((l) => (
                        <button
                            key={l}
                            type="button"
                            onClick={() => setLocale(l)}
                            className={cn(
                                'rounded-md px-3 py-1 text-xs font-bold uppercase',
                                locale === l
                                    ? 'bg-white text-navy-900 shadow-sm'
                                    : 'text-slate-600',
                            )}
                        >
                            {l}
                        </button>
                    ))}
                </div>
            }
        >
            <form onSubmit={submit} className="grid gap-6 lg:grid-cols-12">
                <nav className="lg:col-span-3">
                    <div className="card p-2">
                        {Object.entries(groups).map(([key, group]) => (
                            <button
                                key={key}
                                type="button"
                                onClick={() => setTab(key)}
                                className={cn(
                                    'block w-full rounded-lg px-3 py-2 text-left text-sm font-semibold transition',
                                    tab === key
                                        ? 'bg-navy-900 text-white'
                                        : 'text-slate-700 hover:bg-slate-100',
                                )}
                            >
                                {group.title}
                            </button>
                        ))}
                    </div>
                </nav>
                <div className="space-y-5 lg:col-span-9">
                    <div className="card p-6">
                        <h2 className="mb-5 text-base font-bold text-navy-900">
                            {groups[tab]?.title}
                        </h2>
                        <div className="space-y-5">
                            {groups[tab]?.fields.map((field) => (
                                <SettingField
                                    key={field.key}
                                    field={field}
                                    locale={locale}
                                    value={form.data.values[field.key]}
                                    onChange={(v) => set(field.key, v)}
                                    error={
                                        (form.errors as Record<string, string>)[
                                            `values.${field.key}`
                                        ]
                                    }
                                />
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center justify-end gap-3">
                        {form.recentlySuccessful && (
                            <span className="text-sm font-medium text-emerald-600">
                                Сохранено
                            </span>
                        )}
                        <Button type="submit" loading={form.processing}>
                            <Save className="h-4 w-4" /> Сохранить настройки
                        </Button>
                    </div>
                </div>
            </form>
        </AdminLayout>
    );
}

function SettingField({
    field,
    locale,
    value,
    onChange,
    error,
}: {
    field: Field;
    locale: Locale;
    value: unknown;
    onChange: (value: unknown) => void;
    error?: string;
}) {
    if (field.translatable) {
        const translations = (value ?? { ru: '', en: '' }) as Record<
            string,
            string
        >;
        const update = (text: string) =>
            onChange({ ...translations, [locale]: text });
        const Control = field.type === 'textarea' ? Textarea : Input;

        return (
            <div>
                <Label>
                    {field.label}{' '}
                    <span className="ml-1 rounded bg-slate-100 px-1 py-0.5 text-[10px] font-bold text-slate-500 uppercase">
                        {locale}
                    </span>
                </Label>
                <Control
                    value={translations[locale] ?? ''}
                    onChange={(e) => update(e.target.value)}
                />
                <HelpText>{field.help}</HelpText>
                <FieldError message={error} />
            </div>
        );
    }

    if (field.type === 'stats') {
        const rows = (value ?? []) as StatRow[];
        const update = (next: StatRow[]) => onChange(next);

        return (
            <div>
                <Label>{field.label}</Label>
                <div className="space-y-2">
                    {rows.map((row, index) => (
                        <div key={index} className="flex gap-2">
                            <Input
                                value={row.value}
                                onChange={(e) =>
                                    update(
                                        rows.map((r, i) =>
                                            i === index
                                                ? {
                                                      ...r,
                                                      value: e.target.value,
                                                  }
                                                : r,
                                        ),
                                    )
                                }
                                placeholder="500+"
                                className="w-28"
                            />
                            <Input
                                value={row.label?.[locale] ?? ''}
                                onChange={(e) =>
                                    update(
                                        rows.map((r, i) =>
                                            i === index
                                                ? {
                                                      ...r,
                                                      label: {
                                                          ...r.label,
                                                          [locale]:
                                                              e.target.value,
                                                      },
                                                  }
                                                : r,
                                        ),
                                    )
                                }
                                placeholder={`Подпись (${locale})`}
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                    update(rows.filter((_, i) => i !== index))
                                }
                            >
                                <Trash2 className="h-4 w-4 text-rose-600" />
                            </Button>
                        </div>
                    ))}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            update([
                                ...rows,
                                { value: '', label: { ru: '', en: '' } },
                            ])
                        }
                    >
                        <Plus className="h-4 w-4" /> Добавить показатель
                    </Button>
                </div>
                <HelpText>{field.help}</HelpText>
            </div>
        );
    }

    if (field.type === 'links') {
        const rows = (value ?? []) as LinkRow[];
        const update = (next: LinkRow[]) => onChange(next);

        return (
            <div>
                <Label>{field.label}</Label>
                <div className="space-y-2">
                    {rows.map((row, index) => (
                        <div key={index} className="flex gap-2">
                            <Input
                                value={row.label}
                                onChange={(e) =>
                                    update(
                                        rows.map((r, i) =>
                                            i === index
                                                ? {
                                                      ...r,
                                                      label: e.target.value,
                                                  }
                                                : r,
                                        ),
                                    )
                                }
                                placeholder="Telegram"
                                className="w-40"
                            />
                            <Input
                                value={row.url}
                                onChange={(e) =>
                                    update(
                                        rows.map((r, i) =>
                                            i === index
                                                ? { ...r, url: e.target.value }
                                                : r,
                                        ),
                                    )
                                }
                                placeholder="https://t.me/…"
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                    update(rows.filter((_, i) => i !== index))
                                }
                            >
                                <Trash2 className="h-4 w-4 text-rose-600" />
                            </Button>
                        </div>
                    ))}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            update([...rows, { label: '', url: '' }])
                        }
                    >
                        <Plus className="h-4 w-4" /> Добавить ссылку
                    </Button>
                </div>
            </div>
        );
    }

    if (field.type === 'code' || field.type === 'textarea') {
        return (
            <div>
                <Label>{field.label}</Label>
                <Textarea
                    value={asString(value)}
                    onChange={(e) => onChange(e.target.value)}
                    className={cn(field.type === 'code' && 'font-mono text-xs')}
                    rows={field.type === 'code' ? 6 : 3}
                />
                <HelpText>{field.help}</HelpText>
                <FieldError message={error} />
            </div>
        );
    }

    return (
        <div>
            <Label>{field.label}</Label>
            <Input
                type={
                    field.type === 'number'
                        ? 'number'
                        : field.type === 'email'
                          ? 'email'
                          : field.type === 'url'
                            ? 'url'
                            : 'text'
                }
                value={asString(value)}
                onChange={(e) => onChange(e.target.value)}
            />
            <HelpText>{field.help}</HelpText>
            <FieldError message={error} />
        </div>
    );
}
