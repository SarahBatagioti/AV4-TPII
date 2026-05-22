import { useEffect, useMemo, useState } from 'react'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { PaginatedTable } from '../../components/ui/PaginatedTable'
import { formatarNomeAcomodacao } from '../acomodacoes/types'
import { listarClientes } from '../clientes/clienteApi'
import type { ClienteDTO } from '../clientes/types'
import { type AcomodacaoDTO, type HospedagemDTO } from './types'
import { excluirHospedagem, listarAcomodacoes, listarHospedagens, salvarHospedagem } from './hospedagemApi'
import { HospedagemFormModal } from './HospedagemFormModal'

const PAGE_SIZE = 5

function normalizarBusca(valor: string): string {
  return valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function formatarClimatizacao(valor: boolean): string {
  return valor ? 'Sim' : 'Nao'
}

function renderHospedes(hospedagem: HospedagemDTO): string {
  if (hospedagem.hospedes.length === 0) {
    return 'Nenhum hospede'
  }

  const nomes = hospedagem.hospedes.map((hospede) => hospede.nome)
  return nomes.length > 3 ? `${nomes.slice(0, 3).join(', ')} e mais ${nomes.length - 3}` : nomes.join(', ')
}

function formatarAcomodacao(acomodacao: AcomodacaoDTO): string {
  return [
    `${acomodacao.camaSolteiro} solteiro(s)`,
    `${acomodacao.camaCasal} casal(is)`,
    `${acomodacao.suite} suite(s)`,
    `${acomodacao.garagem} vaga(s)`,
  ].join(' - ')
}

function EditIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M11.5 1.75a1.77 1.77 0 0 1 2.5 2.5l-1 1-2.5-2.5 1-1Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="m10 3.75-7 7v2.5h2.5l7-7" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  )
}

function DeleteIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2.5 4h11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M5.5 4V2.8c0-.44.36-.8.8-.8h3.4c.44 0 .8.36.8.8V4" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M5.2 4l.56 9.1c.04.55.49.97 1.04.97h2.4c.55 0 1-.42 1.04-.97L10.8 4" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  )
}

function ActionButton({
  title,
  danger = false,
  onClick,
  children,
}: {
  title: string
  danger?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button type="button" className={`icon-button${danger ? ' icon-button--danger' : ''}`} title={title} aria-label={title} onClick={onClick}>
      {children}
    </button>
  )
}

export function HospedagensPage() {
  const [hospedagens, setHospedagens] = useState<HospedagemDTO[]>([])
  const [acomodacoes, setAcomodacoes] = useState<AcomodacaoDTO[]>([])
  const [clientes, setClientes] = useState<ClienteDTO[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [pagina, setPagina] = useState(1)
  const [buscaHospede, setBuscaHospede] = useState('')
  const [acomodacaoFiltro, setAcomodacaoFiltro] = useState('todas')
  const [hospedagemEmEdicao, setHospedagemEmEdicao] = useState<HospedagemDTO | null>(null)
  const [modalCadastroAberto, setModalCadastroAberto] = useState(false)
  const [hospedagemParaExcluir, setHospedagemParaExcluir] = useState<HospedagemDTO | null>(null)
  const [excluindo, setExcluindo] = useState(false)

  async function carregarDados() {
    setCarregando(true)
    setErro(null)

    try {
      const [hospedagensDados, acomodacoesDados, clientesDados] = await Promise.all([
        listarHospedagens(),
        listarAcomodacoes(),
        listarClientes(),
      ])

      setHospedagens(hospedagensDados)
      setAcomodacoes(acomodacoesDados)
      setClientes(clientesDados)
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Nao foi possivel carregar as hospedagens.')
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    void carregarDados()
  }, [])

  const hospedagensFiltradas = useMemo(() => {
    const termoBusca = normalizarBusca(buscaHospede)

    return hospedagens.filter((hospedagem) => {
      if (acomodacaoFiltro !== 'todas' && String(hospedagem.acomodacao.id) !== acomodacaoFiltro) {
        return false
      }

      if (!termoBusca) {
        return true
      }

      return hospedagem.hospedes.some((hospede) => normalizarBusca(hospede.nome).includes(termoBusca))
    })
  }, [acomodacaoFiltro, buscaHospede, hospedagens])

  useEffect(() => {
    const totalPaginas = Math.max(1, Math.ceil(hospedagensFiltradas.length / PAGE_SIZE))
    if (pagina > totalPaginas) {
      setPagina(totalPaginas)
    }
  }, [hospedagensFiltradas.length, pagina])

  useEffect(() => {
    setPagina(1)
  }, [acomodacaoFiltro, buscaHospede])

  const clientesDisponiveis = useMemo(
    () => clientes.filter((cliente) => !hospedagens.some((hospedagem) => hospedagem.hospedes.some((hospede) => hospede.id === cliente.id))),
    [clientes, hospedagens],
  )

  const clientesSelecionaveis = useMemo(() => {
    if (!hospedagemEmEdicao) {
      return clientesDisponiveis
    }

    const hospedesAtuaisIds = new Set(hospedagemEmEdicao.hospedes.map((hospede) => hospede.id))

    return clientes.filter((cliente) => {
      if (hospedesAtuaisIds.has(cliente.id)) {
        return true
      }

      return !hospedagens.some((hospedagem) => hospedagem.id !== hospedagemEmEdicao.id && hospedagem.hospedes.some((hospede) => hospede.id === cliente.id))
    })
  }, [clientes, clientesDisponiveis, hospedagemEmEdicao, hospedagens])

  function abrirCadastro() {
    setHospedagemEmEdicao(null)
    setModalCadastroAberto(true)
  }

  function abrirEdicao(hospedagem: HospedagemDTO) {
    setHospedagemEmEdicao(hospedagem)
    setModalCadastroAberto(true)
  }

  async function salvarHospedagemNoBackend(id: number | null, payload: Parameters<typeof salvarHospedagem>[1]) {
    await salvarHospedagem(id, payload)
    await carregarDados()
    setPagina(1)
  }

  async function confirmarExclusao() {
    if (!hospedagemParaExcluir) {
      return
    }

    setExcluindo(true)
    setErro(null)

    try {
      await excluirHospedagem(hospedagemParaExcluir.id)
      setHospedagemParaExcluir(null)
      await carregarDados()
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Nao foi possivel excluir a hospedagem.')
    } finally {
      setExcluindo(false)
    }
  }

  const colunas = [
    {
      header: 'ID',
      render: (hospedagem: HospedagemDTO) => <strong>{hospedagem.id}</strong>,
    },
    {
      header: 'Acomodacao',
      render: (hospedagem: HospedagemDTO) => (
        <div className="cell-stack">
          <strong>{formatarNomeAcomodacao(hospedagem.acomodacao.nome)}</strong>
          <span className="cell-muted">{formatarAcomodacao(hospedagem.acomodacao)}</span>
        </div>
      ),
    },
    {
      header: 'Hospedes',
      render: (hospedagem: HospedagemDTO) => (
        <div className="cell-stack">
          <strong>{renderHospedes(hospedagem)}</strong>
          <span className="cell-muted">{hospedagem.hospedes.length} hospede(s) vinculado(s)</span>
        </div>
      ),
    },
    {
      header: 'Detalhes',
      render: (hospedagem: HospedagemDTO) => (
        <div className="cell-stack">
          <span className="tag">Climatizacao: {formatarClimatizacao(hospedagem.acomodacao.climatizacao)}</span>
          <span className="cell-muted">Garagem: {hospedagem.acomodacao.garagem}</span>
        </div>
      ),
    },
  ]

  const haFiltrosAtivos = buscaHospede.trim() !== '' || acomodacaoFiltro !== 'todas'
  const emptyTitle = haFiltrosAtivos ? 'Nenhuma hospedagem encontrada' : 'Nenhuma hospedagem cadastrada'
  const emptyDescription = haFiltrosAtivos
    ? 'Ajuste os filtros para visualizar outras hospedagens cadastradas.'
    : 'Use o botao Cadastrar Hospedagem para registrar a primeira hospedagem no sistema.'

  return (
    <section className="clientes-page hospedagem-page">
      <div className="page-header">
        <div className="page-title-block">
          <span className="page-kicker">Hospedagem</span>
          <h1 className="page-title">Gestao de Hospedagens</h1>
          <p className="page-subtitle">
            Acompanhe as hospedagens ativas e cadastre, edite ou exclua reservas usando as acomodacoes e clientes ja cadastrados.
          </p>
        </div>

        <div className="toolbar">
          <button type="button" className="nav-button clientes-action-button" onClick={abrirCadastro} disabled={acomodacoes.length === 0 || clientesDisponiveis.length === 0}>
            Cadastrar Hospedagem
          </button>
        </div>
      </div>

      {erro ? <div className="alert-box">{erro}</div> : null}
      {carregando ? <div className="section-card empty-state"><h3>Carregando hospedagens...</h3><p>Aguarde enquanto buscamos os dados no backend.</p></div> : null}

      {!carregando ? (
        <>
          <div className="filters-card">
            <div className="filters-bar">
              <div className="form-field filter-field filter-field--search">
                <label htmlFor="hospedagens-busca">Buscar por nome de hospede</label>
                <input
                  id="hospedagens-busca"
                  value={buscaHospede}
                  onChange={(event) => setBuscaHospede(event.target.value)}
                  placeholder="Ex.: Maria"
                />
              </div>

              <div className="form-field filter-field filter-field--md">
                <label htmlFor="hospedagens-acomodacao">Acomodacao</label>
                <select id="hospedagens-acomodacao" value={acomodacaoFiltro} onChange={(event) => setAcomodacaoFiltro(event.target.value)}>
                  <option value="todas">Todas</option>
                  {acomodacoes.map((acomodacao) => (
                    <option key={acomodacao.id} value={acomodacao.id}>
                      {formatarNomeAcomodacao(acomodacao.nome)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <PaginatedTable
            items={hospedagensFiltradas}
            columns={colunas}
            rowKey={(hospedagem) => hospedagem.id}
            page={pagina}
            pageSize={PAGE_SIZE}
            onPageChange={setPagina}
            renderActions={(hospedagem) => (
              <div className="actions-group">
                <ActionButton title="Editar hospedagem" onClick={() => abrirEdicao(hospedagem)}>
                  <EditIcon />
                </ActionButton>
                <ActionButton title="Excluir hospedagem" danger onClick={() => setHospedagemParaExcluir(hospedagem)}>
                  <DeleteIcon />
                </ActionButton>
              </div>
            )}
            emptyTitle={emptyTitle}
            emptyDescription={emptyDescription}
            itemLabel="hospedagens"
          />
        </>
      ) : null}

      <HospedagemFormModal
        open={modalCadastroAberto}
        initialHospedagem={hospedagemEmEdicao}
        acomodacoes={acomodacoes}
        clientesSelecionaveis={clientesSelecionaveis}
        onClose={() => {
          setModalCadastroAberto(false)
          setHospedagemEmEdicao(null)
        }}
        onSubmit={salvarHospedagemNoBackend}
      />

      <ConfirmDialog
        open={Boolean(hospedagemParaExcluir)}
        title="Excluir hospedagem"
        message={
          hospedagemParaExcluir
            ? `Tem certeza que deseja excluir a hospedagem da acomodacao ${formatarNomeAcomodacao(hospedagemParaExcluir.acomodacao.nome)}?`
            : 'Tem certeza que deseja excluir esta hospedagem?'
        }
        confirmLabel={excluindo ? 'Excluindo...' : 'Excluir'}
        loading={excluindo}
        onConfirm={confirmarExclusao}
        onClose={() => setHospedagemParaExcluir(null)}
      />
    </section>
  )
}
