import { useState } from 'react'
import logoAtlantis from '../../assets/logoAtlantis.png'
import { AppButton } from './AppButton'
import { navigationItems } from './navigation'

type HeaderProps = {
  activeSection: string
  onNavigate: (section: string) => void
}

export function Header({ activeSection, onNavigate }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  function handleNavigate(section: string) {
    onNavigate(section)
    setMobileMenuOpen(false)
  }

  return (
    <header className="topbar">
      <a className="brand" href="/" aria-label="Atlantis">
        <img src={logoAtlantis} alt="Logo Atlantis" className="brand-logo" />
      </a>

      <button
        type="button"
        className={`topbar-menu-button${mobileMenuOpen ? ' topbar-menu-button--open' : ''}`}
        aria-label="Abrir menu de navegacao"
        aria-expanded={mobileMenuOpen}
        aria-controls="topbar-navigation"
        onClick={() => setMobileMenuOpen((current) => !current)}
      >
        <span />
        <span />
        <span />
      </button>

      <nav
        id="topbar-navigation"
        className={`topbar-actions${mobileMenuOpen ? ' topbar-actions--open' : ''}`}
        aria-label="Navegacao principal"
      >
        {navigationItems.map((item) => (
          <AppButton
            key={item.id}
            label={item.label}
            active={activeSection === item.id}
            onClick={() => handleNavigate(item.id)}
          />
        ))}
      </nav>
    </header>
  )
}
