type AppButtonProps = {
  label: string
}

export function AppButton({ label }: AppButtonProps) {
  return (
    <button type="button" className="nav-button">
      {label}
    </button>
  )
}
