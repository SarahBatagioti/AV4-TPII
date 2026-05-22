import type { ReactNode } from 'react'
import { useEffect, useId } from 'react'

type ModalSize = 'sm' | 'md' | 'lg'

type ModalProps = {
  open: boolean
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  size?: ModalSize
  onClose: () => void
}

export function Modal({ open, title, description, children, footer, size = 'lg', onClose }: ModalProps) {
  const titleId = useId()

  useEffect(() => {
    if (!open) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])

  if (!open) {
    return null
  }

  return (
    <div className="modal-overlay" role="presentation" onMouseDown={onClose}>
      <div className={`modal-card modal-card--${size}`} role="dialog" aria-modal="true" aria-labelledby={titleId} onMouseDown={(event) => event.stopPropagation()}>
        <header className="modal-header">
          <div className="modal-title-block">
            <h2 className="modal-title" id={titleId}>
              {title}
            </h2>
            {description ? <p className="modal-description">{description}</p> : null}
          </div>
        </header>

        <div className="modal-body">{children}</div>
        {footer ? <footer className="modal-footer">{footer}</footer> : null}
      </div>
    </div>
  )
}
