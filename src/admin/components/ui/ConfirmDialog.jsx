import { useState } from 'react'
import Modal from './Modal'
import Button from './Button'

/**
 * Confirmations name the thing being changed and what the change does. "Are you
 * sure?" told nobody anything, so every message here states the consequence.
 */
export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Delete',
  busyLabel = 'Deleting…',
  danger = true,
}) {
  const [busy, setBusy] = useState(false)

  const confirm = async () => {
    setBusy(true)
    try {
      await onConfirm()
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={busy ? () => {} : onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button onClick={onClose} disabled={busy} data-dialog-dismiss="true">Cancel</Button>
          <Button variant={danger ? 'danger' : 'primary'} onClick={confirm} busy={busy} busyLabel={busyLabel}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm" style={{ color: 'var(--adm-silk-dim)' }}>{message}</p>
    </Modal>
  )
}
