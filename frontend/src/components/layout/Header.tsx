import logoAtlantis from '../../assets/logoAtlantis.png'
import { AppButton } from './AppButton'
import { navigationItems } from './navigation'

type HeaderProps = {
  activeSection: string
  onNavigate: (section: string) => void
}

export function Header({ activeSection, onNavigate }: HeaderProps) {
  return (
    <header className="topbar">
      <a className="brand" href="/" aria-label="Atlantis">
        <img src={logoAtlantis} alt="Logo Atlantis" className="brand-logo" />
      </a>

      <nav className="topbar-actions" aria-label="Navegação principal">
        {navigationItems.map((item) => (
          <AppButton
            key={item.id}
            label={item.label}
            active={activeSection === item.id}
            onClick={() => onNavigate(item.id)}
          />
        ))}
      </nav>
    </header>
  )
}
