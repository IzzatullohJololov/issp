import { Check } from 'lucide-react';
import type {
    InputHTMLAttributes,
    ReactNode,
    SelectHTMLAttributes,
    TextareaHTMLAttributes,
} from 'react';
import { cn } from '@/lib/utils';

export function Label({
    children,
    htmlFor,
    required,
    className,
}: {
    children: ReactNode;
    htmlFor?: string;
    required?: boolean;
    className?: string;
}) {
    return (
        <label
            htmlFor={htmlFor}
            className={cn(
                'mb-1.5 block text-sm font-semibold text-slate-700',
                className,
            )}
        >
            {children}
            {required && <span className="ml-0.5 text-rose-500">*</span>}
        </label>
    );
}

export function FieldError({ message }: { message?: string | null }) {
    if (!message) {
        return null;
    }

    return <p className="mt-1.5 text-xs font-medium text-rose-600">{message}</p>;
}

export function HelpText({ children }: { children?: ReactNode }) {
    if (!children) {
        return null;
    }

    return <p className="mt-1.5 text-xs text-slate-500">{children}</p>;
}

const control =
    'focus-ring w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-navy-500 disabled:bg-slate-50 disabled:text-slate-500';

export function Input({
    className,
    invalid,
    ...props
}: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
    return (
        <input
            className={cn(
                control,
                'h-10',
                invalid && 'border-rose-400 focus:border-rose-500',
                className,
            )}
            {...props}
        />
    );
}

export function Textarea({
    className,
    invalid,
    ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
    return (
        <textarea
            className={cn(
                control,
                'min-h-[96px] py-2 leading-relaxed',
                invalid && 'border-rose-400 focus:border-rose-500',
                className,
            )}
            {...props}
        />
    );
}

export function Select({
    className,
    invalid,
    children,
    ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }) {
    return (
        <select
            className={cn(
                control,
                'h-10 appearance-none bg-[url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2716%27 height=%2716%27 fill=%27none%27 stroke=%27%2364748b%27 stroke-width=%272%27 viewBox=%270 0 24 24%27%3E%3Cpath d=%27m6 9 6 6 6-6%27/%3E%3C/svg%3E")] bg-[length:16px] bg-[position:right_0.6rem_center] bg-no-repeat pr-9',
                invalid && 'border-rose-400 focus:border-rose-500',
                className,
            )}
            {...props}
        >
            {children}
        </select>
    );
}

export function Checkbox({
    checked,
    onChange,
    label,
    description,
    name,
    disabled,
}: {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label: ReactNode;
    description?: ReactNode;
    name?: string;
    disabled?: boolean;
}) {
    return (
        <label
            className={cn(
                'flex cursor-pointer items-start gap-3',
                disabled && 'cursor-not-allowed opacity-60',
            )}
        >
            <span className="relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
                <input
                    type="checkbox"
                    name={name}
                    className="peer sr-only"
                    checked={checked}
                    disabled={disabled}
                    onChange={(event) => onChange(event.target.checked)}
                />
                <span className="absolute inset-0 rounded-md border border-slate-300 bg-white transition peer-checked:border-navy-900 peer-checked:bg-navy-900 peer-focus-visible:ring-2 peer-focus-visible:ring-gold-400" />
                <Check
                    className={cn(
                        'relative h-3.5 w-3.5 text-white transition',
                        checked ? 'opacity-100' : 'opacity-0',
                    )}
                    strokeWidth={3}
                />
            </span>
            <span>
                <span className="block text-sm font-medium text-slate-800">
                    {label}
                </span>
                {description && (
                    <span className="block text-xs text-slate-500">
                        {description}
                    </span>
                )}
            </span>
        </label>
    );
}

export function Switch({
    checked,
    onChange,
    label,
    description,
    disabled,
}: {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: ReactNode;
    description?: ReactNode;
    disabled?: boolean;
}) {
    return (
        <label
            className={cn(
                'flex cursor-pointer items-center gap-3',
                disabled && 'cursor-not-allowed opacity-60',
            )}
        >
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                disabled={disabled}
                onClick={() => onChange(!checked)}
                className={cn(
                    'focus-ring relative h-6 w-11 shrink-0 rounded-full transition',
                    checked ? 'bg-emerald-500' : 'bg-slate-300',
                )}
            >
                <span
                    className={cn(
                        'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition',
                        checked && 'translate-x-5',
                    )}
                />
            </button>
            {label && (
                <span>
                    <span className="block text-sm font-medium text-slate-800">
                        {label}
                    </span>
                    {description && (
                        <span className="block text-xs text-slate-500">
                            {description}
                        </span>
                    )}
                </span>
            )}
        </label>
    );
}
