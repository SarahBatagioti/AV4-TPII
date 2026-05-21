import { useState } from 'react'
import './App.css'
import { Header } from './components/layout/Header'
import { ClientesPage } from './features/clientes/ClientesPage'

type Section = 'clientes' | 'hospedagem' | 'acomodacoes'

function App() {
  const [activeSection, setActiveSection] = useState<Section>('clientes')

  return (
    <div className="app-shell">
      <Header activeSection={activeSection} onNavigate={(section) => setActiveSection(section as Section)} />

      <main className="page-content">
        {activeSection === 'clientes' ? (
          <ClientesPage />
        ) : (
          <section className="hero-card hero-card--placeholder">
            <span className="eyebrow">Atlantis</span>
            <h1>{activeSection === 'hospedagem' ? 'Hospedagem' : 'Acomodações'}</h1>
            <p>
              Esta área pode receber a mesma arquitetura reutilizável aplicada em Clientes quando a tela for integrada.
            </p>
          </section>
        )}
      </main>
    </div>
  )
}

export default App
