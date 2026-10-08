import { X } from 'lucide-react';
import { type KeyboardEvent, useState } from 'react';

export function TagsInput({
    value,
    onChange,
    placeholder,
}: {
    value: string[];
    onChange: (value: string[]) => void;
    placeholder?: string;
}) {
    const [draft, setDraft] = useState('');

    const commit = () => {
        const tag = draft.trim();
        if (tag && !value.includes(tag)) {
            onChange([...value, tag]);
        }
        setDraft('');
    };

    const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' || event.key === ',') {
            event.preventDefault();
            commit();
        }
        if (event.key === 'Backspace' && draft === '' && value.length > 0) {
            onChange(value.slice(0, -1));
        }
    };

    return (
        <div className="flex min-h-10 flex-wrap items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2 py-1.5 focus-within:border-navy-500">
            {value.map((tag) => (
                <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-md bg-navy-50 px-2 py-0.5 text-xs font-semibold text-navy-800"
                >
                    {tag}
                    <button
                        type="button"
                        onClick={() => onChange(value.filter((t) => t !== tag))}
                        className="text-navy-400 hover:text-navy-900"
                    >
                        <X className="h-3 w-3" />
                    </button>
                </span>
            ))}
            <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={onKeyDown}
                onBlur={commit}
                placeholder={value.length === 0 ? placeholder : ''}
                className="min-w-[120px] flex-1 bg-transparent px-1 text-sm outline-none"
            />
        </div>
    );
}
