import {
    Activity,
    Atom,
    BookOpen,
    Briefcase,
    Building2,
    Calendar,
    Cpu,
    File,
    FileText,
    FlaskConical,
    FolderOpen,
    Gem,
    Image,
    Layers,
    Link as LinkIcon,
    type LucideIcon,
    type LucideProps,
    Magnet,
    Microscope,
    Newspaper,
    Snowflake,
    Sun,
    Tags,
    Thermometer,
    Users,
    Waves,
    Zap,
} from 'lucide-react';

const icons: Record<string, LucideIcon> = {
    atom: Atom,
    magnet: Magnet,
    thermometer: Thermometer,
    layers: Layers,
    microscope: Microscope,
    cpu: Cpu,
    zap: Zap,
    gem: Gem,
    waves: Waves,
    flask: FlaskConical,
    'flask-conical': FlaskConical,
    sun: Sun,
    snowflake: Snowflake,
    newspaper: Newspaper,
    tags: Tags,
    calendar: Calendar,
    'file-text': FileText,
    file: File,
    image: Image,
    building: Building2,
    users: Users,
    'book-open': BookOpen,
    'folder-open': FolderOpen,
    briefcase: Briefcase,
    link: LinkIcon,
    activity: Activity,
};

export function DynamicIcon({
    name,
    ...props
}: { name: string | null | undefined } & Omit<LucideProps, 'name'>) {
    const Component = (name && icons[name]) || Atom;

    return <Component {...props} />;
}
