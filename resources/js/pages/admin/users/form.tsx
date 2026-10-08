import { useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import {
    FieldError,
    HelpText,
    Input,
    Label,
    Select,
    Switch,
} from '@/components/ui/form';
import { AdminLayout } from '@/layouts/admin-layout';

type User = {
    id: number;
    name: string;
    email: string;
    role: string;
    position: string | null;
    is_active: boolean;
};

export default function UserForm({
    item,
    roles,
}: {
    item: User | null;
    roles: Record<string, string>;
}) {
    const { auth } = usePage().props;
    const self = item?.id === auth.user?.id;

    const form = useForm({
        name: item?.name ?? '',
        email: item?.email ?? '',
        password: '',
        password_confirmation: '',
        role: item?.role ?? 'editor',
        position: item?.position ?? '',
        is_active: item?.is_active ?? true,
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        if (item) {
            form.put(`/admin/users/${item.id}`);
        } else {
            form.post('/admin/users');
        }
    };

    return (
        <AdminLayout
            title={item ? `Пользователь: ${item.name}` : 'Новый пользователь'}
            breadcrumbs={[
                { label: 'Панель', href: '/admin' },
                { label: 'Пользователи', href: '/admin/users' },
                { label: item ? 'Редактирование' : 'Создание' },
            ]}
            actions={
                <Button variant="ghost" href="/admin/users">
                    <ArrowLeft className="h-4 w-4" /> К списку
                </Button>
            }
        >
            <form onSubmit={submit} className="max-w-2xl space-y-5 card p-6">
                <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                        <Label htmlFor="name" required>
                            Имя
                        </Label>
                        <Input
                            id="name"
                            value={form.data.name}
                            onChange={(e) =>
                                form.setData('name', e.target.value)
                            }
                            invalid={Boolean(form.errors.name)}
                        />
                        <FieldError message={form.errors.name} />
                    </div>
                    <div>
                        <Label htmlFor="email" required>
                            E-mail
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            value={form.data.email}
                            onChange={(e) =>
                                form.setData('email', e.target.value)
                            }
                            invalid={Boolean(form.errors.email)}
                        />
                        <FieldError message={form.errors.email} />
                    </div>
                    <div>
                        <Label htmlFor="password" required={!item}>
                            Пароль
                        </Label>
                        <Input
                            id="password"
                            type="password"
                            autoComplete="new-password"
                            value={form.data.password}
                            onChange={(e) =>
                                form.setData('password', e.target.value)
                            }
                            invalid={Boolean(form.errors.password)}
                        />
                        <HelpText>
                            {item
                                ? 'Оставьте пустым, чтобы не менять.'
                                : 'Минимум 8 символов.'}
                        </HelpText>
                        <FieldError message={form.errors.password} />
                    </div>
                    <div>
                        <Label htmlFor="password_confirmation" required={!item}>
                            Повтор пароля
                        </Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            autoComplete="new-password"
                            value={form.data.password_confirmation}
                            onChange={(e) =>
                                form.setData(
                                    'password_confirmation',
                                    e.target.value,
                                )
                            }
                        />
                    </div>
                    <div>
                        <Label htmlFor="role" required>
                            Роль
                        </Label>
                        <Select
                            id="role"
                            value={form.data.role}
                            onChange={(e) =>
                                form.setData('role', e.target.value)
                            }
                            disabled={self}
                        >
                            {Object.entries(roles).map(([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </Select>
                        <HelpText>
                            Администратор управляет пользователями, настройками
                            и журналом; редактор — только контентом.
                        </HelpText>
                        <FieldError message={form.errors.role} />
                    </div>
                    <div>
                        <Label htmlFor="position">Должность</Label>
                        <Input
                            id="position"
                            value={form.data.position}
                            onChange={(e) =>
                                form.setData('position', e.target.value)
                            }
                        />
                    </div>
                </div>
                <Switch
                    checked={form.data.is_active}
                    onChange={(v) => form.setData('is_active', v)}
                    label="Учётная запись активна"
                    description="Отключённые пользователи не могут войти в панель."
                    disabled={self}
                />
                <div className="flex justify-end border-t border-slate-200 pt-5">
                    <Button type="submit" loading={form.processing}>
                        <Save className="h-4 w-4" /> Сохранить
                    </Button>
                </div>
            </form>
        </AdminLayout>
    );
}
