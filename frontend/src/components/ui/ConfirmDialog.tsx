import { Modal } from './Modal'

type ConfirmDialogProps = {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  loading?: boolean
  onConfirm: () => void
  onClose: () => void
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Excluir',
  loading = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      title={title}
      description="A ação não poderá ser desfeita."
      size="sm"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="secondary-button" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="primary-button" onClick={onConfirm} disabled={loading}>
            {loading ? 'Excluindo...' : confirmLabel}
          </button>
        </>
      }
    >
      <div className="confirm-content">
        <p className="confirm-lead">{message}</p>
      </div>
    </Modal>
  )
}
