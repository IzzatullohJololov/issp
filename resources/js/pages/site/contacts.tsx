import { useForm, usePage } from '@inertiajs/react';
import { Clock, Mail, MapPin, Phone, Printer, Send } from 'lucide-react';
import type { FormEvent } from 'react';
import { PageHero } from '@/components/site/section';
import { Button } from '@/components/ui/button';
import { FieldError, Input, Label, Textarea } from '@/components/ui/form';
import { SiteLayout } from '@/layouts/site-layout';
import { useTranslation } from '@/lib/i18n';

export default function Contacts({ mapUrl }: { mapUrl: string | null }) {
    const { site, flash } = usePage().props;
    const { t } = useTranslation();

    const form = useForm({
        name: '',
        email: '',
        phone: '',
        subject: '',
        body: '',
        website: '',
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.post('/contacts', {
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    };

    return (
        <SiteLayout title={t('contacts')}>
            <PageHero
                eyebrow={t('about')}
                title={t('contacts')}
                description={site?.fullName}
                breadcrumbs={[
                    { label: t('home'), href: '/' },
                    { label: t('contacts') },
                ]}
                compact
            />
            <div className="container-site grid gap-10 py-12 lg:grid-cols-12">
                <div className="space-y-6 lg:col-span-5">
                    <div className="card p-6">
                        <ul className="space-y-5 text-sm">
                            {site?.address && (
                                <ContactRow
                                    icon={<MapPin className="h-5 w-5" />}
                                    label={t('address')}
                                >
                                    <span className="whitespace-pre-line">
                                        {site.address}
                                    </span>
                                </ContactRow>
                            )}
                            {site?.phone && (
                                <ContactRow
                                    icon={<Phone className="h-5 w-5" />}
                                    label={t('phone')}
                                >
                                    <a
                                        href={`tel:${site.phone.replace(/[^+\d]/g, '')}`}
                                        className="hover:underline"
                                    >
                                        {site.phone}
                                    </a>
                                </ContactRow>
                            )}
                            {site?.fax && (
                                <ContactRow
                                    icon={<Printer className="h-5 w-5" />}
                                    label={t('fax')}
                                >
                                    {site.fax}
                                </ContactRow>
                            )}
                            {site?.email && (
                                <ContactRow
                                    icon={<Mail className="h-5 w-5" />}
                                    label={t('email')}
                                >
                                    <a
                                        href={`mailto:${site.email}`}
                                        className="text-navy-600 hover:underline"
                                    >
                                        {site.email}
                                    </a>
                                </ContactRow>
                            )}
                            {site?.workingHours && (
                                <ContactRow
                                    icon={<Clock className="h-5 w-5" />}
                                    label={t('working_hours')}
                                >
                                    {site.workingHours}
                                </ContactRow>
                            )}
                        </ul>
                    </div>
                    {mapUrl && (
                        <div className="overflow-hidden card">
                            <iframe
                                src={mapUrl}
                                title={t('map')}
                                className="h-72 w-full border-0"
                                loading="lazy"
                                allowFullScreen
                            />
                        </div>
                    )}
                </div>

                <div className="lg:col-span-7">
                    <div className="card p-6 sm:p-8">
                        <h2 className="font-serif text-2xl font-bold text-navy-900">
                            {t('write_us')}
                        </h2>
                        {flash?.success && (
                            <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
                                {flash.success}
                            </div>
                        )}
                        <form
                            onSubmit={submit}
                            className="mt-6 grid gap-5 sm:grid-cols-2"
                        >
                            <div>
                                <Label htmlFor="name" required>
                                    {t('your_name')}
                                </Label>
                                <Input
                                    id="name"
                                    value={form.data.name}
                                    onChange={(e) =>
                                        form.setData('name', e.target.value)
                                    }
                                    invalid={Boolean(form.errors.name)}
                                    autoComplete="name"
                                />
                                <FieldError message={form.errors.name} />
                            </div>
                            <div>
                                <Label htmlFor="email" required>
                                    {t('your_email')}
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={form.data.email}
                                    onChange={(e) =>
                                        form.setData('email', e.target.value)
                                    }
                                    invalid={Boolean(form.errors.email)}
                                    autoComplete="email"
                                />
                                <FieldError message={form.errors.email} />
                            </div>
                            <div>
                                <Label htmlFor="phone">{t('phone')}</Label>
                                <Input
                                    id="phone"
                                    value={form.data.phone}
                                    onChange={(e) =>
                                        form.setData('phone', e.target.value)
                                    }
                                    autoComplete="tel"
                                />
                                <FieldError message={form.errors.phone} />
                            </div>
                            <div>
                                <Label htmlFor="subject">{t('subject')}</Label>
                                <Input
                                    id="subject"
                                    value={form.data.subject}
                                    onChange={(e) =>
                                        form.setData('subject', e.target.value)
                                    }
                                />
                                <FieldError message={form.errors.subject} />
                            </div>
                            <div className="sm:col-span-2">
                                <Label htmlFor="body" required>
                                    {t('message')}
                                </Label>
                                <Textarea
                                    id="body"
                                    rows={6}
                                    value={form.data.body}
                                    onChange={(e) =>
                                        form.setData('body', e.target.value)
                                    }
                                    invalid={Boolean(form.errors.body)}
                                />
                                <FieldError message={form.errors.body} />
                            </div>
                            <input
                                type="text"
                                name="website"
                                value={form.data.website}
                                onChange={(e) =>
                                    form.setData('website', e.target.value)
                                }
                                className="hidden"
                                tabIndex={-1}
                                autoComplete="off"
                                aria-hidden
                            />
                            <div className="sm:col-span-2">
                                <Button
                                    type="submit"
                                    size="lg"
                                    loading={form.processing}
                                >
                                    <Send className="h-4 w-4" />
                                    {form.processing ? t('sending') : t('send')}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </SiteLayout>
    );
}

function ContactRow({
    icon,
    label,
    children,
}: {
    icon: React.ReactNode;
    label: string;
    children: React.ReactNode;
}) {
    return (
        <li className="flex gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-900 text-gold-400">
                {icon}
            </span>
            <div>
                <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                    {label}
                </p>
                <p className="mt-0.5 font-medium text-navy-900">{children}</p>
            </div>
        </li>
    );
}
