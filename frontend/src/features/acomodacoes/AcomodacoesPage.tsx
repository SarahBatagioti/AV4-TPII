import { useEffect, useMemo, useState } from 'react'
import { PaginatedTable } from '../../components/ui/PaginatedTable'
import { cadastrarAcomodacao, listarAcomodacoes } from './acomodacaoApi'
import { AcomodacaoFormModal } from './AcomodacaoFormModal'
import type { AcomodacaoDTO } from './types'

const PAGE_SIZE = 5

function formatarClimatizacao(valor: boolean): string {
  return valor ? 'Contém' : 'Não contém'
}

function formatarQuantidade(valor: number, singular: string, plural: string): string | null {
  if (valor === 0) {
    return null
  }

  return `${valor} ${valor === 1 ? singular : plural}`
}

function formatarCamas(acomodacao: AcomodacaoDTO): string {
  const camas = [
    formatarQuantidade(acomodacao.camaSolteiro, 'solteiro', 'solteiros'),
    formatarQuantidade(acomodacao.camaCasal, 'casal', 'casais'),
  ].filter((item): item is string => item !== null)

  return camas.length > 0 ? camas.join(', ') : '-'
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
        header: 'Tipo de acomodação',
        render: (acomodacao: AcomodacaoDTO) => <strong>{acomodacao.nome}</strong>,
      },
      {
        header: 'Camas',
        render: (acomodacao: AcomodacaoDTO) => <span className="cell-compact">{formatarCamas(acomodacao)}</span>,
      },
      {
        header: 'Suítes',
        render: (acomodacao: AcomodacaoDTO) => <span className="cell-compact">{acomodacao.suite}</span>,
      },
      {
        header: 'Garagem',
        render: (acomodacao: AcomodacaoDTO) => <span className="cell-compact">{acomodacao.garagem}</span>,
      },
      {
        header: 'Climatização',
        render: (acomodacao: AcomodacaoDTO) => (
          <span className={`status-flag ${acomodacao.climatizacao ? 'status-flag--positive' : 'status-flag--negative'}`}>
            {formatarClimatizacao(acomodacao.climatizacao)}
          </span>
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