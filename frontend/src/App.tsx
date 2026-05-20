import './App.css'
import { Header } from './components/layout/Header'

function App() {
  return (
    <div className="app-shell">
      <Header />

      <main className="page-content">
        <section className="hero-card">
          <span className="eyebrow">Atlantis</span>
          <h1>Single Page Application</h1>
          <p>
            A navegação principal já está preparada com os acessos para Cliente e Hospedagem.
          </p>
        </section>
      </main>
    </div>
  )
}

export default App
