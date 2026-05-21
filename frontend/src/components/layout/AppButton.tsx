type AppButtonProps = {
  label: string
  active?: boolean
  onClick?: () => void
}

export function AppButton({ label, active = false, onClick }: AppButtonProps) {
  return (
    <button type="button" className={`nav-button${active ? ' nav-button--active' : ''}`} onClick={onClick}>
      {label}
    </button>
  )
}
