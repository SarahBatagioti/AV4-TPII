import { useEffect, useMemo, useState } from 'react'
import { PaginatedTable } from '../../components/ui/PaginatedTable'
import { cadastrarAcomodacao, listarAcomodacoes } from './acomodacaoApi'
import { AcomodacaoFormModal } from './AcomodacaoFormModal'
import { formatarNomeAcomodacao, type AcomodacaoDTO } from './types'

const PAGE_SIZE = 5

function normalizarBusca(valor: string): string {
  return valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

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

function obterValoresUnicos(acomodacoes: AcomodacaoDTO[], campo: keyof Pick<AcomodacaoDTO, 'camaSolteiro' | 'camaCasal' | 'suite' | 'garagem'>): number[] {
  return [...new Set(acomodacoes.map((acomodacao) => acomodacao[campo]))].sort((a, b) => a - b)
}

export function AcomodacoesPage() {
  const [acomodacoes, setAcomodacoes] = useState<AcomodacaoDTO[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [pagina, setPagina] = useState(1)
  const [busca, setBusca] = useState('')
  const [camaSolteiroFiltro, setCamaSolteiroFiltro] = useState('')
  const [camaCasalFiltro, setCamaCasalFiltro] = useState('')
  const [suiteFiltro, setSuiteFiltro] = useState('todas')
  const [garagemFiltro, setGaragemFiltro] = useState('todas')
  const [climatizacaoFiltro, setClimatizacaoFiltro] = useState('todas')
  const [modalCadastroAberto, setModalCadastroAberto] = useState(false)

  async function carregarAcomodacoes() {
    setCarregando(true)
    setErro(null)

    try {
      const dados = await listarAcomodacoes()
      setAcomodacoes(dados)
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível carregar as acomodações.')
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    void carregarAcomodacoes()
  }, [])

  const opcoesCamaSolteiro = useMemo(() => obterValoresUnicos(acomodacoes, 'camaSolteiro'), [acomodacoes])
  const opcoesCamaCasal = useMemo(() => obterValoresUnicos(acomodacoes, 'camaCasal'), [acomodacoes])
  const opcoesSuite = useMemo(() => obterValoresUnicos(acomodacoes, 'suite'), [acomodacoes])
  const opcoesGaragem = useMemo(() => obterValoresUnicos(acomodacoes, 'garagem'), [acomodacoes])

  const acomodacoesFiltradas = useMemo(() => {
    const termoBusca = normalizarBusca(busca)

    return acomodacoes.filter((acomodacao) => {
      if (termoBusca && !normalizarBusca(formatarNomeAcomodacao(acomodacao.nome)).includes(termoBusca)) {
        return false
      }

      if (camaSolteiroFiltro !== '' && acomodacao.camaSolteiro !== Number(camaSolteiroFiltro)) {
        return false
      }

      if (camaCasalFiltro !== '' && acomodacao.camaCasal !== Number(camaCasalFiltro)) {
        return false
      }

      if (suiteFiltro !== 'todas' && acomodacao.suite !== Number(suiteFiltro)) {
        return false
      }

      if (garagemFiltro !== 'todas' && acomodacao.garagem !== Number(garagemFiltro)) {
        return false
      }

      if (climatizacaoFiltro === 'contem' && !acomodacao.climatizacao) {
        return false
      }

      if (climatizacaoFiltro === 'nao-contem' && acomodacao.climatizacao) {
        return false
      }

      return true
    })
  }, [acomodacoes, busca, camaCasalFiltro, camaSolteiroFiltro, climatizacaoFiltro, garagemFiltro, suiteFiltro])

  useEffect(() => {
    const totalPaginas = Math.max(1, Math.ceil(acomodacoesFiltradas.length / PAGE_SIZE))
    if (pagina > totalPaginas) {
      setPagina(totalPaginas)
    }
  }, [acomodacoesFiltradas.length, pagina])

  useEffect(() => {
    setPagina(1)
  }, [busca, camaCasalFiltro, camaSolteiroFiltro, climatizacaoFiltro, garagemFiltro, suiteFiltro])

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
        render: (acomodacao: AcomodacaoDTO) => <strong>{formatarNomeAcomodacao(acomodacao.nome)}</strong>,
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

  const haFiltrosAtivos =
    busca.trim() !== '' ||
    camaSolteiroFiltro !== '' ||
    camaCasalFiltro !== '' ||
    suiteFiltro !== 'todas' ||
    garagemFiltro !== 'todas' ||
    climatizacaoFiltro !== 'todas'
  const emptyTitle = haFiltrosAtivos ? 'Nenhuma acomodação encontrada' : 'Nenhuma acomodação cadastrada'
  const emptyDescription = haFiltrosAtivos
    ? 'Ajuste os filtros para visualizar outras acomodações cadastradas.'
    : 'Use o botão Cadastrar Acomodação para incluir a primeira opção disponível no sistema.'

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
        <>
          <div className="filters-card">
            <div className="filters-bar">
              <div className="form-field filter-field filter-field--search">
                <label htmlFor="acomodacoes-busca">Buscar por tipo de acomodação</label>
                <input
                  id="acomodacoes-busca"
                  value={busca}
                  onChange={(event) => setBusca(event.target.value)}
                  placeholder="Ex.: Família Super"
                />
              </div>

              <div className="form-field filter-field filter-field--xs">
                <label htmlFor="acomodacoes-solteiro">Cama de solteiro</label>
                <select id="acomodacoes-solteiro" value={camaSolteiroFiltro} onChange={(event) => setCamaSolteiroFiltro(event.target.value)}>
                  <option value="">Todas</option>
                  {opcoesCamaSolteiro.map((quantidade) => (
                    <option key={quantidade} value={quantidade}>
                      {quantidade}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field filter-field filter-field--xs">
                <label htmlFor="acomodacoes-casal">Cama de casal</label>
                <select id="acomodacoes-casal" value={camaCasalFiltro} onChange={(event) => setCamaCasalFiltro(event.target.value)}>
                  <option value="">Todas</option>
                  {opcoesCamaCasal.map((quantidade) => (
                    <option key={quantidade} value={quantidade}>
                      {quantidade}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field filter-field filter-field--xs">
                <label htmlFor="acomodacoes-suite">Suítes</label>
                <select id="acomodacoes-suite" value={suiteFiltro} onChange={(event) => setSuiteFiltro(event.target.value)}>
                  <option value="todas">Todas</option>
                  {opcoesSuite.map((quantidade) => (
                    <option key={quantidade} value={quantidade}>
                      {quantidade}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field filter-field filter-field--xs">
                <label htmlFor="acomodacoes-garagem">Vagas na garagem</label>
                <select id="acomodacoes-garagem" value={garagemFiltro} onChange={(event) => setGaragemFiltro(event.target.value)}>
                  <option value="todas">Todas</option>
                  {opcoesGaragem.map((quantidade) => (
                    <option key={quantidade} value={quantidade}>
                      {quantidade}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field filter-field filter-field--sm">
                <label htmlFor="acomodacoes-climatizacao">Climatização</label>
                <select id="acomodacoes-climatizacao" value={climatizacaoFiltro} onChange={(event) => setClimatizacaoFiltro(event.target.value)}>
                  <option value="todas">Todos</option>
                  <option value="contem">Contém</option>
                  <option value="nao-contem">Não contém</option>
                </select>
              </div>
            </div>
          </div>

          <PaginatedTable
            items={acomodacoesFiltradas}
            columns={colunas}
            rowKey={(acomodacao) => acomodacao.id}
            page={pagina}
            pageSize={PAGE_SIZE}
            onPageChange={setPagina}
            emptyTitle={emptyTitle}
            emptyDescription={emptyDescription}
            itemLabel="acomodações"
          />
        </>
      ) : null}

      <AcomodacaoFormModal
        open={modalCadastroAberto}
        onClose={() => setModalCadastroAberto(false)}
        onSubmit={salvarAcomodacaoNoBackend}
      />
    </section>
  )
}
