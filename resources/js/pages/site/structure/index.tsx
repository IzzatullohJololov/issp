import { Link } from '@inertiajs/react';
import { Building2 } from 'lucide-react';
import { LabCard, PersonCard } from '@/components/site/cards';
import { PageHero, RichText, SectionHeading } from '@/components/site/section';
import { SiteLayout } from '@/layouts/site-layout';
import { useTranslation } from '@/lib/i18n';
import type {
    LabCard as LabCardType,
    PersonCard as PersonCardType,
} from '@/types';

type Department = {
    id: number;
    slug: string;
    name: string;
    description: string | null;
    head: PersonCardType | null;
    laboratories: LabCardType[];
};

export default function StructureIndex({
    management,
    departments,
    otherLabs,
}: {
    management: PersonCardType[];
    departments: Department[];
    otherLabs: LabCardType[];
}) {
    const { t } = useTranslation();
    const totalLabs =
        departments.reduce((sum, d) => sum + d.laboratories.length, 0) +
        otherLabs.length;

    return (
        <SiteLayout title={t('structure')}>
            <PageHero
                eyebrow={t('about')}
                title={t('structure')}
                description={`${totalLabs} ${t('labs_count')}`}
                breadcrumbs={[
                    { label: t('home'), href: '/' },
                    { label: t('structure') },
                ]}
            >
                <div className="mt-8 flex flex-wrap gap-2">
                    {departments.map((department) => (
                        <a
                            key={department.id}
                            href={`#${department.slug}`}
                            className="rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-sm font-semibold text-navy-100 transition hover:border-gold-400 hover:text-white"
                        >
                            {department.name}
                        </a>
                    ))}
                </div>
            </PageHero>

            <div className="container-site py-12">
                {management.length > 0 && (
                    <section className="mb-16">
                        <SectionHeading
                            eyebrow={t('management')}
                            title={t('management')}
                            action="/people?group=management"
                            actionLabel={t('see_all')}
                        />
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {management.slice(0, 6).map((person) => (
                                <PersonCard
                                    key={person.id}
                                    item={person}
                                    showLab={false}
                                />
                            ))}
                        </div>
                    </section>
                )}

                {departments.map((department) => (
                    <section
                        key={department.id}
                        id={department.slug}
                        className="mb-16 scroll-mt-28"
                    >
                        <div className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <p className="inline-flex items-center gap-2 eyebrow text-gold-600">
                                    <Building2 className="h-4 w-4" />
                                    {t('departments')}
                                </p>
                                <h2 className="mt-2 font-serif text-3xl font-bold text-navy-900">
                                    {department.name}
                                </h2>
                                {department.description && (
                                    <RichText
                                        html={department.description}
                                        className="mt-3 max-w-2xl text-base"
                                    />
                                )}
                            </div>
                            {department.head && (
                                <Link
                                    href={department.head.url}
                                    className="text-sm text-slate-600"
                                >
                                    <span className="block eyebrow text-slate-400">
                                        {t('head')}
                                    </span>
                                    <span className="font-semibold text-navy-900 hover:underline">
                                        {department.head.full_name}
                                    </span>
                                </Link>
                            )}
                        </div>
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {department.laboratories.map((lab) => (
                                <LabCard key={lab.id} item={lab} />
                            ))}
                        </div>
                    </section>
                ))}

                {otherLabs.length > 0 && (
                    <section className="mb-16">
                        <SectionHeading title={t('other_labs')} />
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {otherLabs.map((lab) => (
                                <LabCard key={lab.id} item={lab} />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </SiteLayout>
    );
}
