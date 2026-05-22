import { useEffect, useMemo, useState } from 'react'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { PaginatedTable } from '../../components/ui/PaginatedTable'
import { excluirCliente, listarClientes, salvarCliente } from './clienteApi'
import { ClienteFormModal } from './ClienteFormModal'
import { formatarNumeroDocumento, formatarTelefone as formatarNumeroTelefone, type ClienteDTO } from './types'

const PAGE_SIZE = 5
const CLIENTE_TIPO_OPTIONS = [
  { value: 'todos', label: 'Todos' },
  { value: 'titular', label: 'Titular' },
  { value: 'dependente', label: 'Dependente' },
] as const

function normalizarBusca(valor: string): string {
  return valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function formatarData(dataISO: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(dataISO))
}

function formatarTelefone(ddd: string, numero: string): string {
  if (!numero || numero === '-') {
    return '-'
  }

  if (!ddd || ddd === '-') {
    return numero
  }

  return `(${ddd}) ${formatarNumeroTelefone(numero)}`
}

function renderEndereco(cliente: ClienteDTO): string {
  return [cliente.endereco.rua, cliente.endereco.cidade, cliente.endereco.estado].filter(Boolean).join(' • ')
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

export function ClientesPage() {
  const [clientes, setClientes] = useState<ClienteDTO[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [pagina, setPagina] = useState(1)
  const [busca, setBusca] = useState('')
  const [tipoFiltro, setTipoFiltro] = useState<(typeof CLIENTE_TIPO_OPTIONS)[number]['value']>('todos')
  const [clienteEmEdicao, setClienteEmEdicao] = useState<ClienteDTO | null>(null)
  const [modalCadastroAberto, setModalCadastroAberto] = useState(false)
  const [clienteParaExcluir, setClienteParaExcluir] = useState<ClienteDTO | null>(null)
  const [excluindo, setExcluindo] = useState(false)

  async function carregarClientes() {
    setCarregando(true)
    setErro(null)

    try {
      const dados = await listarClientes()
      setClientes(dados)
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível carregar os clientes.')
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    void carregarClientes()
  }, [])

  const titulares = useMemo(
    () => clientes.filter((cliente) => cliente.tipo === 'titular' && cliente.id !== clienteEmEdicao?.id),
    [clienteEmEdicao?.id, clientes],
  )

  const clientesFiltrados = useMemo(() => {
    const termoBusca = normalizarBusca(busca)

    return clientes.filter((cliente) => {
      if (tipoFiltro !== 'todos' && cliente.tipo !== tipoFiltro) {
        return false
      }

      if (!termoBusca) {
        return true
      }

      const documento = cliente.documentos[0]
      const documentoFormatado = documento ? formatarNumeroDocumento(documento.numero, documento.tipo) : ''
      const camposBusca = [cliente.nome, documento?.numero ?? '', documentoFormatado]

      return camposBusca.some((campo) => normalizarBusca(campo).includes(termoBusca))
    })
  }, [busca, clientes, tipoFiltro])

  useEffect(() => {
    const totalPaginas = Math.max(1, Math.ceil(clientesFiltrados.length / PAGE_SIZE))
    if (pagina > totalPaginas) {
      setPagina(totalPaginas)
    }
  }, [clientesFiltrados.length, pagina])

  useEffect(() => {
    setPagina(1)
  }, [busca, tipoFiltro])

  function abrirCadastro() {
    setClienteEmEdicao(null)
    setModalCadastroAberto(true)
  }

  function abrirEdicao(cliente: ClienteDTO) {
    setClienteEmEdicao(cliente)
    setModalCadastroAberto(true)
  }

  async function salvarClienteNoBackend(id: number | null, payload: Parameters<typeof salvarCliente>[1]) {
    await salvarCliente(id, payload)
    await carregarClientes()
    setPagina(1)
  }

  async function confirmarExclusao() {
    if (!clienteParaExcluir) {
      return
    }

    setExcluindo(true)
    setErro(null)

    try {
      await excluirCliente(clienteParaExcluir.id)
      setClienteParaExcluir(null)
      await carregarClientes()
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível excluir o cliente.')
    } finally {
      setExcluindo(false)
    }
  }

  const colunas = [
    {
      header: 'ID',
      render: (cliente: ClienteDTO) => <strong>{cliente.id}</strong>,
    },
    {
      header: 'Cliente',
      render: (cliente: ClienteDTO) => (
        <div className="cell-stack">
          <strong>{cliente.nome}</strong>
          <span className="cell-muted">{cliente.nomeSocial}</span>
        </div>
      ),
    },
    {
      header: 'Tipo',
      render: (cliente: ClienteDTO) => <span className="tag">{cliente.tipo === 'titular' ? 'Titular' : 'Dependente'}</span>,
    },
    {
      header: 'Nascimento / Cadastro',
      render: (cliente: ClienteDTO) => (
        <div className="cell-stack">
          <span>{formatarData(cliente.dataNascimento)}</span>
          <span className="cell-muted">Cadastro: {formatarData(cliente.dataCadastro)}</span>
        </div>
      ),
    },
    {
      header: 'Documento',
      render: (cliente: ClienteDTO) => (
        <div className="cell-stack">
          <strong>
            {cliente.documentos[0]
              ? formatarNumeroDocumento(cliente.documentos[0].numero, cliente.documentos[0].tipo)
              : 'Sem documento'}
          </strong>
          <span className="cell-muted">{cliente.documentos[0]?.tipo ?? '-'}</span>
        </div>
      ),
    },
    {
      header: 'Telefone',
      render: (cliente: ClienteDTO) => <span>{formatarTelefone(cliente.telefones[0]?.ddd ?? '-', cliente.telefones[0]?.numero ?? '-')}</span>,
    },
    {
      header: 'Titular',
      render: (cliente: ClienteDTO) => {
        if (cliente.tipo === 'titular') {
          return <span className="cell-muted">Não possui</span>
        }

        const titular = clientes.find((atual) => atual.id === cliente.titularId)
        return (
          <div className="cell-stack">
            <strong>{titular?.nome ?? 'Titular não encontrado'}</strong>
            <span className="cell-muted">ID {cliente.titularId}</span>
          </div>
        )
      },
    },
    {
      header: 'Endereço',
      render: (cliente: ClienteDTO) => <span>{renderEndereco(cliente)}</span>,
    },
  ]

  const haFiltrosAtivos = busca.trim() !== '' || tipoFiltro !== 'todos'
  const emptyTitle = haFiltrosAtivos ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'
  const emptyDescription = haFiltrosAtivos
    ? 'Ajuste os filtros para visualizar outros clientes cadastrados.'
    : 'Use o botão Cadastrar Cliente para criar o primeiro registro e iniciar a gestão da base.'

  return (
    <section className="clientes-page">
      <div className="page-header">
        <div className="page-title-block">
          <span className="page-kicker">Clientes</span>
          <h1 className="page-title">Gestão de Clientes</h1>
          <p className="page-subtitle">
            Gerenciamento de titulares e dependentes: crie, liste, edite e remova registros de clientes.
          </p>
        </div>

        <div className="toolbar">
          <button type="button" className="nav-button clientes-action-button" onClick={abrirCadastro}>
            Cadastrar Cliente
          </button>
        </div>
      </div>

      {erro ? <div className="alert-box">{erro}</div> : null}
      {carregando ? <div className="section-card empty-state"><h3>Carregando clientes...</h3><p>Aguarde enquanto buscamos os dados no backend.</p></div> : null}

      {!carregando ? (
        <>
          <div className="filters-card">
            <div className="filters-bar">
              <div className="form-field filter-field filter-field--search">
                <label htmlFor="clientes-busca">Buscar por nome ou documento</label>
                <input
                  id="clientes-busca"
                  value={busca}
                  onChange={(event) => setBusca(event.target.value)}
                  placeholder="Ex.: Maria ou 123.456.789-00"
                />
              </div>

              <div className="form-field filter-field filter-field--sm">
                <label htmlFor="clientes-tipo">Tipo</label>
                <select id="clientes-tipo" value={tipoFiltro} onChange={(event) => setTipoFiltro(event.target.value as typeof tipoFiltro)}>
                  {CLIENTE_TIPO_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <PaginatedTable
            items={clientesFiltrados}
            columns={colunas}
            rowKey={(cliente) => cliente.id}
            page={pagina}
            pageSize={PAGE_SIZE}
            onPageChange={setPagina}
            renderActions={(cliente) => (
              <div className="actions-group">
                <ActionButton title="Editar cliente" onClick={() => abrirEdicao(cliente)}>
                  <EditIcon />
                </ActionButton>
                <ActionButton title="Excluir cliente" danger onClick={() => setClienteParaExcluir(cliente)}>
                  <DeleteIcon />
                </ActionButton>
              </div>
            )}
            emptyTitle={emptyTitle}
            emptyDescription={emptyDescription}
            itemLabel="clientes"
          />
        </>
      ) : null}

      <ClienteFormModal
        open={modalCadastroAberto}
        initialCliente={clienteEmEdicao}
        titulares={titulares}
        onClose={() => {
          setModalCadastroAberto(false)
          setClienteEmEdicao(null)
        }}
        onSubmit={salvarClienteNoBackend}
      />

      <ConfirmDialog
        open={Boolean(clienteParaExcluir)}
        title="Excluir cliente"
        message={clienteParaExcluir ? `Tem certeza que deseja excluir ${clienteParaExcluir.nome}?` : 'Tem certeza que deseja excluir este cliente?'}
        confirmLabel={excluindo ? 'Excluindo...' : 'Excluir'}
        loading={excluindo}
        onConfirm={confirmarExclusao}
        onClose={() => setClienteParaExcluir(null)}
      />
    </section>
  )
}
