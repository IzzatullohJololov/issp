export type Locale = 'ru' | 'en';

export type Translatable = Partial<Record<Locale, string>>;

export type AuthUser = {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'editor';
    avatar: string | null;
};

export type MenuItemNode = {
    id: number;
    label: string;
    url: string;
    target: string;
    children: MenuItemNode[];
};

export type SiteData = {
    name: string;
    fullName: string;
    tagline: string;
    address: string;
    phone: string;
    fax: string;
    email: string;
    workingHours: string;
    mapUrl: string;
    social: { label: string; url: string }[];
    footerText: string;
    founded: number;
    menus: { header: MenuItemNode[]; footer: MenuItemNode[] };
};

export type AdminNavItem = {
    slug: string;
    title: string;
    icon: string;
    group: string;
    order: number;
    href: string;
};

export type SharedProps = {
    name: string;
    locale: Locale;
    locales: Record<Locale, string>;
    auth: { user: AuthUser | null };
    flash: { success?: string | null; error?: string | null };
    site: SiteData | null;
    admin: { navigation: AdminNavItem[]; unreadMessages: number } | null;
    errors: Record<string, string>;
    [key: string]: unknown;
};

export type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

export type Paginated<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: PaginationLink[];
    next_page_url: string | null;
    prev_page_url: string | null;
};

export type NewsCard = {
    id: number;
    slug: string;
    url: string;
    title: string;
    excerpt: string | null;
    cover: string | null;
    is_pinned: boolean;
    published_at: string | null;
    category: { slug: string; name: string; color: string | null } | null;
};

export type NewsItem = NewsCard & {
    body: string | null;
    views: number;
    source_url: string | null;
};

export type EventCard = {
    id: number;
    slug: string;
    url: string;
    type: string;
    type_label: string;
    title: string;
    speaker: string | null;
    speaker_affiliation: string | null;
    location: string | null;
    starts_at: string;
    ends_at: string | null;
    cover: string | null;
};

export type EventItem = EventCard & {
    description: string | null;
    registration_url: string | null;
    laboratory: LabCard | null;
};

export type PersonCard = {
    id: number;
    slug: string;
    url: string;
    full_name: string;
    position: string | null;
    degree: string | null;
    management_role: string | null;
    photo: string | null;
    email: string | null;
    phone: string | null;
    laboratory: { slug: string; url: string; name: string } | null;
};

export type PersonItem = PersonCard & {
    bio: string | null;
    room: string | null;
    orcid: string | null;
    is_management: boolean;
    is_council_member: boolean;
};

export type LabCard = {
    id: number;
    slug: string;
    url: string;
    name: string;
    short_name: string | null;
    head: PersonCard | null;
    cover: string | null;
    department: { slug: string; name: string } | null;
};

export type LabItem = LabCard & {
    description: string | null;
    research_areas: string[];
    phone: string | null;
    email: string | null;
    room: string | null;
    website: string | null;
};

export type PublicationItem = {
    id: number;
    type: string;
    type_label: string;
    title: string;
    authors: string;
    journal: string | null;
    year: number;
    volume: string | null;
    pages: string | null;
    doi: string | null;
    doi_url: string | null;
    url: string | null;
    is_featured: boolean;
    laboratory: { slug: string; name: string } | null;
};

export type DocumentItem = {
    id: number;
    title: string;
    category: string;
    category_label: string;
    url: string;
    file_name: string;
    size: string;
    mime_type: string | null;
    published_at: string | null;
};

export type VacancyItem = {
    id: number;
    slug: string;
    url: string;
    title: string;
    description: string | null;
    requirements: string[];
    salary: string | null;
    contact_email: string | null;
    deadline: string | null;
    laboratory: { slug: string; url: string; name: string } | null;
};

export type PageLink = {
    id: number;
    slug: string;
    url: string;
    title: string;
};

export type PageItem = PageLink & {
    excerpt: string | null;
    body: string | null;
    template: string;
    cover: string | null;
    meta_title: string | null;
    meta_description: string | null;
    updated_at: string | null;
};

export type Option = { value: string | number; label: string };

export type FieldSchema = {
    name: string;
    label: string;
    type:
        | 'text'
        | 'slug'
        | 'textarea'
        | 'richtext'
        | 'number'
        | 'boolean'
        | 'date'
        | 'datetime'
        | 'email'
        | 'url'
        | 'select'
        | 'relation'
        | 'image'
        | 'file'
        | 'tags';
    translatable: boolean;
    required: boolean;
    options: Option[];
    help: string | null;
    placeholder: string | null;
    onIndex: boolean;
    onForm: boolean;
    sortable: boolean;
    filterable: boolean;
    width: 'full' | 'half' | 'third';
    section: string;
    default: unknown;
    rows: number | null;
};

export type ResourceSchema = {
    slug: string;
    title: string;
    singular: string;
    icon: string;
    group: string;
    sections: Record<string, string>;
    softDeletes: boolean;
    sortableRows: boolean;
    fields: FieldSchema[];
    defaultSort: [string, string];
    locales: Locale[];
    defaultLocale: Locale;
};

export type ResourceRow = {
    id: number;
    created_at: string | null;
    updated_at: string | null;
    deleted_at: string | null;
    _title: string;
    _url: string | null;
    [key: string]: unknown;
};
