import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="p-6">
        <div className="mb-4 flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full ${
              danger ? 'bg-error-500/10' : 'bg-amber-500/10'
            }`}
          >
            <AlertTriangle className={`h-5 w-5 ${danger ? 'text-error-500' : 'text-amber-500'}`} />
          </div>
          <h2 className="text-lg font-semibold text-app">{title}</h2>
        </div>
        <p className="mb-6 text-sm text-muted">{message}</p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
