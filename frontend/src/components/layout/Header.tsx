import logoAtlantis from '../../assets/logoAtlantis.png'
import { AppButton } from './AppButton'
import { navigationItems } from './navigation'

export function Header() {
  return (
    <header className="topbar">
      <a className="brand" href="/" aria-label="Atlantis">
        <img src={logoAtlantis} alt="Logo Atlantis" className="brand-logo" />
      </a>

      <nav className="topbar-actions" aria-label="Navegação principal">
        {navigationItems.map((item) => (
          <AppButton key={item.label} label={item.label} />
        ))}
      </nav>
    </header>
  )
}