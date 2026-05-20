import { useState } from 'react'
import './App.css'

type Cliente = {
  id: number
  nome: string
  nomeSocial: string
  ehDependente: boolean
}

function App() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function listarClientes() {
    setCarregando(true)
    setErro(null)

    try {
      const resposta = await fetch('http://localhost:3333/clientes')
      if (!resposta.ok) {
        throw new Error(`Falha ao buscar clientes (status ${resposta.status})`)
      }

      const dados = (await resposta.json()) as Cliente[]
      setClientes(dados)
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : 'Erro inesperado ao buscar clientes'
      setErro(mensagem)
      setClientes([])
    } finally {
      setCarregando(false)
    }
  }

  return (
    <main className="container">
      <h1>Atlantis SPA - Teste de conexao</h1>

      <p className="subtitulo">
        Clique no botao para consumir o endpoint do backend e listar todos os clientes.
      </p>

      <button type="button" onClick={listarClientes} disabled={carregando}>
        {carregando ? 'Carregando...' : 'Listar clientes'}
      </button>

      {erro && <p className="erro">{erro}</p>}

      <section className="lista-clientes">
        <h2>Clientes encontrados: {clientes.length}</h2>

        {clientes.length === 0 ? (
          <p className="vazio">Nenhum cliente carregado ainda.</p>
        ) : (
          <ul>
            {clientes.map((cliente) => (
              <li key={cliente.id}>
                <strong>{cliente.nome}</strong>
                <span>Nome social: {cliente.nomeSocial || '-'}</span>
                <span>Tipo: {cliente.ehDependente ? 'Dependente' : 'Titular'}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}

export default App
