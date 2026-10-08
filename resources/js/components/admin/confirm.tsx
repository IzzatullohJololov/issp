import { AlertTriangle } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';

export function useConfirm() {
    const [state, setState] = useState<{
        open: boolean;
        title: string;
        description?: ReactNode;
        confirmLabel?: string;
        danger?: boolean;
        onConfirm: () => void;
    }>({ open: false, title: '', onConfirm: () => undefined });

    const confirm = (options: {
        title: string;
        description?: ReactNode;
        confirmLabel?: string;
        danger?: boolean;
        onConfirm: () => void;
    }) => setState({ ...options, open: true });

    const close = () => setState((current) => ({ ...current, open: false }));

    const dialog = (
        <Modal
            open={state.open}
            onClose={close}
            size="sm"
            footer={
                <>
                    <Button variant="ghost" onClick={close}>
                        Отмена
                    </Button>
                    <Button
                        variant={state.danger ? 'danger' : 'primary'}
                        onClick={() => {
                            state.onConfirm();
                            close();
                        }}
                    >
                        {state.confirmLabel ?? 'Подтвердить'}
                    </Button>
                </>
            }
        >
            <div className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                    <AlertTriangle className="h-5 w-5" />
                </span>
                <div>
                    <h3 className="text-base font-bold text-navy-900">
                        {state.title}
                    </h3>
                    {state.description && (
                        <div className="mt-1 text-sm text-slate-600">
                            {state.description}
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );

    return { confirm, dialog };
}
