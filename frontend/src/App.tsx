import { useState } from 'react'
import './App.css'
import { Header } from './components/layout/Header'
import { AcomodacoesPage } from './features/acomodacoes/AcomodacoesPage'
import { ClientesPage } from './features/clientes/ClientesPage'
import { HospedagensPage } from './features/hospedagens/HospedagensPage'

type Section = 'clientes' | 'hospedagem' | 'acomodacoes'

function App() {
  const [activeSection, setActiveSection] = useState<Section>('clientes')

  return (
    <div className="app-shell">
      <Header activeSection={activeSection} onNavigate={(section) => setActiveSection(section as Section)} />

      <main className="page-content">
        {activeSection === 'clientes' ? (
          <ClientesPage />
        ) : activeSection === 'hospedagem' ? (
          <HospedagensPage />
        ) : (
          <AcomodacoesPage />
        )}
      </main>
    </div>
  )
}

export default App
