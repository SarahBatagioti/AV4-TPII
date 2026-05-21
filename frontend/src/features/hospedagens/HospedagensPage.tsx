import { useEffect, useMemo, useState } from 'react'
import { PaginatedTable } from '../../components/ui/PaginatedTable'
import { listarClientes } from '../clientes/clienteApi'
import type { ClienteDTO } from '../clientes/types'
import { type AcomodacaoDTO, type HospedagemDTO } from './types'
import { cadastrarHospedagem, listarAcomodacoes, listarHospedagens } from './hospedagemApi'
import { HospedagemFormModal } from './HospedagemFormModal'

const PAGE_SIZE = 5

function formatarClimatizacao(valor: boolean): string {
  return valor ? 'Sim' : 'Nao'
}

function renderHospedes(hospedagem: HospedagemDTO): string {
  if (hospedagem.hospedes.length === 0) {
    return 'Nenhum hóspede'
  }

  const nomes = hospedagem.hospedes.map((hospede) => hospede.nome)
  return nomes.length > 3 ? `${nomes.slice(0, 3).join(', ')} e mais ${nomes.length - 3}` : nomes.join(', ')
}

function formatarAcomodacao(acomodacao: AcomodacaoDTO): string {
  return [
    `${acomodacao.camaSolteiro} solteiro(s)`,
    `${acomodacao.camaCasal} casal(is)`,
    `${acomodacao.suite} suíte(s)`,
    `${acomodacao.garagem} vaga(s)`,
  ].join(' • ')
}

export function HospedagensPage() {
  const [hospedagens, setHospedagens] = useState<HospedagemDTO[]>([])
  const [acomodacoes, setAcomodacoes] = useState<AcomodacaoDTO[]>([])
  const [clientes, setClientes] = useState<ClienteDTO[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [pagina, setPagina] = useState(1)
  const [modalCadastroAberto, setModalCadastroAberto] = useState(false)

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

  useEffect(() => {
    const totalPaginas = Math.max(1, Math.ceil(hospedagens.length / PAGE_SIZE))
    if (pagina > totalPaginas) {
      setPagina(totalPaginas)
    }
  }, [hospedagens.length, pagina])

  const clientesDisponiveis = useMemo(
    () => clientes.filter((cliente) => !hospedagens.some((hospedagem) => hospedagem.hospedes.some((hospede) => hospede.id === cliente.id))),
    [clientes, hospedagens],
  )

  function abrirCadastro() {
    setModalCadastroAberto(true)
  }

  async function salvarHospedagemNoBackend(payload: Parameters<typeof cadastrarHospedagem>[0]) {
    await cadastrarHospedagem(payload)
    await carregarDados()
    setPagina(1)
  }

  const colunas = [
    {
      header: 'ID',
      render: (hospedagem: HospedagemDTO) => <strong>{hospedagem.id}</strong>,
    },
    {
      header: 'Acomodação',
      render: (hospedagem: HospedagemDTO) => (
        <div className="cell-stack">
          <strong>{hospedagem.acomodacao.nome}</strong>
          <span className="cell-muted">{formatarAcomodacao(hospedagem.acomodacao)}</span>
        </div>
      ),
    },
    {
      header: 'Hóspedes',
      render: (hospedagem: HospedagemDTO) => (
        <div className="cell-stack">
          <strong>{renderHospedes(hospedagem)}</strong>
          <span className="cell-muted">{hospedagem.hospedes.length} hóspede(s) vinculado(s)</span>
        </div>
      ),
    },
    {
      header: 'Detalhes',
      render: (hospedagem: HospedagemDTO) => (
        <div className="cell-stack">
          <span className="tag">Climatização: {formatarClimatizacao(hospedagem.acomodacao.climatizacao)}</span>
          <span className="cell-muted">Garagem: {hospedagem.acomodacao.garagem}</span>
        </div>
      ),
    },
  ]

  return (
    <section className="clientes-page hospedagem-page">
      <div className="page-header">
        <div className="page-title-block">
          <span className="page-kicker">Hospedagem</span>
          <h1 className="page-title">Gestão de Hospedagens</h1>
          <p className="page-subtitle">
            Acompanhe as hospedagens ativas e cadastre novas reservas usando as acomodações e clientes já cadastrados.
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
        <PaginatedTable
          items={hospedagens}
          columns={colunas}
          rowKey={(hospedagem) => hospedagem.id}
          page={pagina}
          pageSize={PAGE_SIZE}
          onPageChange={setPagina}
          renderActions={() => <span className="cell-muted">—</span>}
          emptyTitle="Nenhuma hospedagem ativa"
          emptyDescription="Use o botão Cadastrar Hospedagem para registrar a primeira hospedagem ativa."
        />
      ) : null}

      <HospedagemFormModal
        open={modalCadastroAberto}
        acomodacoes={acomodacoes}
        clientesDisponiveis={clientesDisponiveis}
        onClose={() => setModalCadastroAberto(false)}
        onSubmit={salvarHospedagemNoBackend}
      />
    </section>
  )
}
