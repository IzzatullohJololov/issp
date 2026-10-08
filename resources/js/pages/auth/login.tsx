import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, LogIn } from 'lucide-react';
import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox, FieldError, Input, Label } from '@/components/ui/form';
import { Logo } from '@/layouts/site-layout';

export default function Login() {
    const { name, flash } = usePage().props;
    const form = useForm({ email: '', password: '', remember: false });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.post('/login', { onFinish: () => form.reset('password') });
    };

    return (
        <div className="flex min-h-screen bg-navy-950">
            <Head title="Вход" />
            <div className="relative hidden flex-1 items-end overflow-hidden p-12 lg:flex">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(43,90,168,0.5),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_rgba(217,158,20,0.25),_transparent_50%)]" />
                <div className="relative max-w-md text-white">
                    <Logo light />
                    <h1 className="mt-6 font-serif text-4xl leading-tight font-bold">
                        {name}
                    </h1>
                    <p className="mt-3 text-navy-200">
                        Панель управления сайтом института.
                    </p>
                </div>
            </div>
            <div className="flex w-full flex-col justify-center bg-white px-6 py-12 sm:px-12 lg:w-[520px]">
                <Link
                    href="/"
                    className="mb-10 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-navy-900"
                >
                    <ArrowLeft className="h-4 w-4" /> На сайт
                </Link>
                <h2 className="font-serif text-3xl font-bold text-navy-900">
                    Вход в панель
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                    Используйте учётную запись редактора или администратора.
                </p>

                {flash?.error && (
                    <div className="mt-6 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                        {flash.error}
                    </div>
                )}

                <form onSubmit={submit} className="mt-8 space-y-5">
                    <div>
                        <Label htmlFor="email">E-mail</Label>
                        <Input
                            id="email"
                            type="email"
                            autoComplete="username"
                            autoFocus
                            value={form.data.email}
                            onChange={(e) =>
                                form.setData('email', e.target.value)
                            }
                            invalid={Boolean(form.errors.email)}
                        />
                        <FieldError message={form.errors.email} />
                    </div>
                    <div>
                        <Label htmlFor="password">Пароль</Label>
                        <Input
                            id="password"
                            type="password"
                            autoComplete="current-password"
                            value={form.data.password}
                            onChange={(e) =>
                                form.setData('password', e.target.value)
                            }
                            invalid={Boolean(form.errors.password)}
                        />
                        <FieldError message={form.errors.password} />
                    </div>
                    <Checkbox
                        checked={form.data.remember}
                        onChange={(checked) =>
                            form.setData('remember', checked)
                        }
                        label="Запомнить меня"
                    />
                    <Button
                        type="submit"
                        size="lg"
                        className="w-full"
                        loading={form.processing}
                    >
                        <LogIn className="h-4 w-4" /> Войти
                    </Button>
                </form>
            </div>
        </div>
    );
}
