import { useEffect, useMemo, useState } from 'react'
import { PaginatedTable } from '../../components/ui/PaginatedTable'
import { cadastrarAcomodacao, listarAcomodacoes } from './acomodacaoApi'
import { AcomodacaoFormModal } from './AcomodacaoFormModal'
import type { AcomodacaoDTO } from './types'

const PAGE_SIZE = 5

function formatarClimatizacao(valor: boolean): string {
  return valor ? 'Com climatização' : 'Sem climatização'
}

function formatarResumo(acomodacao: AcomodacaoDTO): string {
  return [
    `${acomodacao.camaSolteiro} solteiro(s)`,
    `${acomodacao.camaCasal} casal(is)`,
    `${acomodacao.suite} suíte(s)`,
    `${acomodacao.garagem} vaga(s)`,
  ].join(' • ')
}

export function AcomodacoesPage() {
  const [acomodacoes, setAcomodacoes] = useState<AcomodacaoDTO[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [pagina, setPagina] = useState(1)
  const [modalCadastroAberto, setModalCadastroAberto] = useState(false)

  async function carregarAcomodacoes() {
    setCarregando(true)
    setErro(null)

    try {
      const dados = await listarAcomodacoes()
      setAcomodacoes(dados)
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Nao foi possivel carregar as acomodacoes.')
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    void carregarAcomodacoes()
  }, [])

  useEffect(() => {
    const totalPaginas = Math.max(1, Math.ceil(acomodacoes.length / PAGE_SIZE))
    if (pagina > totalPaginas) {
      setPagina(totalPaginas)
    }
  }, [acomodacoes.length, pagina])

  function abrirCadastro() {
    setModalCadastroAberto(true)
  }

  async function salvarAcomodacaoNoBackend(payload: Parameters<typeof cadastrarAcomodacao>[0]) {
    await cadastrarAcomodacao(payload)
    await carregarAcomodacoes()
    setPagina(1)
  }

  const colunas = useMemo(
    () => [
      {
        header: 'ID',
        render: (acomodacao: AcomodacaoDTO) => <strong>{acomodacao.id}</strong>,
      },
      {
        header: 'Acomodação',
        render: (acomodacao: AcomodacaoDTO) => (
          <div className="cell-stack">
            <strong>{acomodacao.nome}</strong>
            <span className="cell-muted">{formatarResumo(acomodacao)}</span>
          </div>
        ),
      },
      {
        header: 'Detalhes',
        render: (acomodacao: AcomodacaoDTO) => (
          <div className="cell-stack">
            <span className="tag">{formatarClimatizacao(acomodacao.climatizacao)}</span>
            <span className="cell-muted">Garagem: {acomodacao.garagem}</span>
          </div>
        ),
      },
    ],
    [],
  )

  return (
    <section className="clientes-page acomodacoes-page">
      <div className="page-header">
        <div className="page-title-block">
          <span className="page-kicker">Acomodações</span>
          <h1 className="page-title">Gestão de Acomodações</h1>
          <p className="page-subtitle">
            Consulte as acomodações já cadastradas e adicione novas opções pelo formulário da tela.
          </p>
        </div>

        <div className="toolbar">
          <button type="button" className="nav-button clientes-action-button" onClick={abrirCadastro}>
            Cadastrar Acomodação
          </button>
        </div>
      </div>

      {erro ? <div className="alert-box">{erro}</div> : null}
      {carregando ? <div className="section-card empty-state"><h3>Carregando acomodações...</h3><p>Aguarde enquanto buscamos os dados no backend.</p></div> : null}

      {!carregando ? (
        <PaginatedTable
          items={acomodacoes}
          columns={colunas}
          rowKey={(acomodacao) => acomodacao.id}
          page={pagina}
          pageSize={PAGE_SIZE}
          onPageChange={setPagina}
          renderActions={() => <span className="cell-muted">—</span>}
          emptyTitle="Nenhuma acomodação cadastrada"
          emptyDescription="Use o botão Cadastrar Acomodação para incluir a primeira opção no painel."
          itemLabel="acomodações"
        />
      ) : null}

      <AcomodacaoFormModal
        open={modalCadastroAberto}
        onClose={() => setModalCadastroAberto(false)}
        onSubmit={salvarAcomodacaoNoBackend}
      />
    </section>
  )
}