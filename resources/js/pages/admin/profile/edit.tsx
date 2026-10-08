import { useForm } from '@inertiajs/react';
import { KeyRound, Save } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { UploadField } from '@/components/admin/upload-field';
import { Button } from '@/components/ui/button';
import { FieldError, Input, Label } from '@/components/ui/form';
import { AdminLayout } from '@/layouts/admin-layout';
import { formatDateTime } from '@/lib/format';

type Profile = {
    name: string;
    email: string;
    position: string | null;
    avatar: string | null;
    last_login_at: string | null;
};

export default function ProfileEdit({ profile }: { profile: Profile }) {
    const [removed, setRemoved] = useState(false);
    const form = useForm<{
        name: string;
        email: string;
        position: string;
        avatar: File | null;
    }>({
        name: profile.name,
        email: profile.email,
        position: profile.position ?? '',
        avatar: null,
    });
    const password = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.post('/admin/profile', {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => form.setData('avatar', null),
        });
    };

    const submitPassword = (event: FormEvent) => {
        event.preventDefault();
        password.put('/admin/profile/password', {
            preserveScroll: true,
            onSuccess: () => password.reset(),
        });
    };

    return (
        <AdminLayout
            title="Профиль"
            description={
                profile.last_login_at
                    ? `Последний вход: ${formatDateTime(profile.last_login_at)}`
                    : undefined
            }
            breadcrumbs={[
                { label: 'Панель', href: '/admin' },
                { label: 'Профиль' },
            ]}
        >
            <div className="grid gap-6 lg:grid-cols-2">
                <form onSubmit={submit} className="space-y-5 card p-6">
                    <h2 className="text-base font-bold text-navy-900">
                        Личные данные
                    </h2>
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
                        <Label htmlFor="position">Должность</Label>
                        <Input
                            id="position"
                            value={form.data.position}
                            onChange={(e) =>
                                form.setData('position', e.target.value)
                            }
                        />
                    </div>
                    <div>
                        <Label>Аватар</Label>
                        <UploadField
                            type="image"
                            value={
                                profile.avatar
                                    ? {
                                          path: profile.avatar,
                                          url: profile.avatar,
                                      }
                                    : null
                            }
                            file={form.data.avatar}
                            onFile={(file) => form.setData('avatar', file)}
                            removed={removed}
                            onRemove={setRemoved}
                        />
                        <FieldError message={form.errors.avatar} />
                    </div>
                    <div className="flex justify-end border-t border-slate-200 pt-5">
                        <Button type="submit" loading={form.processing}>
                            <Save className="h-4 w-4" /> Сохранить
                        </Button>
                    </div>
                </form>

                <form onSubmit={submitPassword} className="space-y-5 card p-6">
                    <h2 className="text-base font-bold text-navy-900">
                        Смена пароля
                    </h2>
                    <div>
                        <Label htmlFor="current_password" required>
                            Текущий пароль
                        </Label>
                        <Input
                            id="current_password"
                            type="password"
                            autoComplete="current-password"
                            value={password.data.current_password}
                            onChange={(e) =>
                                password.setData(
                                    'current_password',
                                    e.target.value,
                                )
                            }
                            invalid={Boolean(password.errors.current_password)}
                        />
                        <FieldError
                            message={password.errors.current_password}
                        />
                    </div>
                    <div>
                        <Label htmlFor="password" required>
                            Новый пароль
                        </Label>
                        <Input
                            id="password"
                            type="password"
                            autoComplete="new-password"
                            value={password.data.password}
                            onChange={(e) =>
                                password.setData('password', e.target.value)
                            }
                            invalid={Boolean(password.errors.password)}
                        />
                        <FieldError message={password.errors.password} />
                    </div>
                    <div>
                        <Label htmlFor="password_confirmation" required>
                            Повтор нового пароля
                        </Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            autoComplete="new-password"
                            value={password.data.password_confirmation}
                            onChange={(e) =>
                                password.setData(
                                    'password_confirmation',
                                    e.target.value,
                                )
                            }
                        />
                    </div>
                    <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-5">
                        {password.recentlySuccessful && (
                            <span className="text-sm text-emerald-600">
                                Пароль изменён
                            </span>
                        )}
                        <Button
                            type="submit"
                            variant="outline"
                            loading={password.processing}
                        >
                            <KeyRound className="h-4 w-4" /> Изменить пароль
                        </Button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
