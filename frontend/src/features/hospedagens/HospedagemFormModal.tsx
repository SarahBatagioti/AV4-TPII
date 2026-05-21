import { useEffect, useMemo, useState } from 'react'
import { Modal } from '../../components/ui/Modal'
import type { ClienteDTO } from '../clientes/types'
import { criarFormularioVazio, formularioParaPayload, type AcomodacaoDTO, type HospedagemFormValues } from './types'

type HospedagemFormModalProps = {
  open: boolean
  acomodacoes: AcomodacaoDTO[]
  clientesDisponiveis: ClienteDTO[]
  onClose: () => void
  onSubmit: (payload: ReturnType<typeof formularioParaPayload>) => Promise<void>
}

function Field({
  label,
  children,
  span = 6,
}: {
  label: string
  children: React.ReactNode
  span?: 12 | 6 | 5 | 4 | 3
}) {
  return (
    <div className={`form-field form-field--span-${span}`}>
      <label>{label}</label>
      {children}
    </div>
  )
}

function formatarAcomodacao(acomodacao: AcomodacaoDTO): string {
  return [
    `${acomodacao.nome}`,
    `${acomodacao.camaSolteiro} solteiro(s)`,
    `${acomodacao.camaCasal} casal(is)`,
    `${acomodacao.suite} suíte(s)`,
    acomodacao.climatizacao ? 'Climatização' : 'Sem climatização',
    `${acomodacao.garagem} vaga(s)`,
  ].join(' • ')
}

export function HospedagemFormModal({ open, acomodacoes, clientesDisponiveis, onClose, onSubmit }: HospedagemFormModalProps) {
  const [formulario, setFormulario] = useState<HospedagemFormValues>(() => criarFormularioVazio())
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    if (!open) {
      return
    }

    setErro(null)
    setEnviando(false)
    setFormulario({
      ...criarFormularioVazio(),
      acomodacaoId: acomodacoes[0]?.id ? String(acomodacoes[0].id) : '',
    })
  }, [acomodacoes, open])

  const titulo = useMemo(() => 'Cadastrar Hospedagem', [])
  const descricao = useMemo(
    () => 'Escolha a acomodação, adicione os hóspedes disponíveis e salve a nova hospedagem.',
    [],
  )

  function atualizarCampo<K extends keyof HospedagemFormValues>(campo: K, valor: HospedagemFormValues[K]) {
    setFormulario((atual) => ({ ...atual, [campo]: valor }))
  }

  function adicionarHospede() {
    if (!formulario.clienteSelecionadoId) {
      return
    }

    setFormulario((atual) => {
      if (atual.hospedesIds.includes(atual.clienteSelecionadoId)) {
        return atual
      }

      return {
        ...atual,
        hospedesIds: [...atual.hospedesIds, atual.clienteSelecionadoId],
        clienteSelecionadoId: '',
      }
    })
  }

  function removerHospede(clienteId: string) {
    setFormulario((atual) => ({
      ...atual,
      hospedesIds: atual.hospedesIds.filter((id) => id !== clienteId),
    }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErro(null)

    if (formulario.hospedesIds.length === 0) {
      setErro('Adicione ao menos um hóspede para salvar a hospedagem.')
      return
    }

    setEnviando(true)

    try {
      await onSubmit(formularioParaPayload(formulario))
      onClose()
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Nao foi possivel salvar a hospedagem.')
    } finally {
      setEnviando(false)
    }
  }

  const clientesSelecionados = clientesDisponiveis.filter((cliente) => formulario.hospedesIds.includes(String(cliente.id)))

  return (
    <Modal
      open={open}
      title={titulo}
      description={descricao}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="secondary-button" onClick={onClose} disabled={enviando}>
            Cancelar
          </button>
          <button type="submit" form="hospedagem-form" className="primary-button" disabled={enviando || acomodacoes.length === 0}>
            {enviando ? 'Salvando...' : 'Salvar hospedagem'}
          </button>
        </>
      }
    >
      <form id="hospedagem-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <Field label="Acomodação" span={6}>
            <select value={formulario.acomodacaoId} onChange={(event) => atualizarCampo('acomodacaoId', event.target.value)} required>
              <option value="">Selecione uma acomodação</option>
              {acomodacoes.map((acomodacao) => (
                <option key={acomodacao.id} value={acomodacao.id}>
                  {formatarAcomodacao(acomodacao)}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Cliente disponível" span={6}>
            <select
              value={formulario.clienteSelecionadoId}
              onChange={(event) => atualizarCampo('clienteSelecionadoId', event.target.value)}
              disabled={clientesDisponiveis.length === 0}
            >
              <option value="">{clientesDisponiveis.length === 0 ? 'Nenhum cliente disponível' : 'Selecione um cliente'}</option>
              {clientesDisponiveis.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nome} - ID {cliente.id}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Adicionar hóspede" span={6}>
            <button type="button" className="secondary-button" onClick={adicionarHospede} disabled={!formulario.clienteSelecionadoId || clientesDisponiveis.length === 0}>
              Adicionar hóspede
            </button>
          </Field>

          <Field label="Hóspedes da hospedagem" span={12}>
            {clientesSelecionados.length > 0 ? (
              <div className="selection-list">
                {clientesSelecionados.map((cliente) => (
                  <div className="selection-item" key={cliente.id}>
                    <div className="selection-item__meta">
                      <strong>{cliente.nome}</strong>
                      <span className="cell-muted">ID {cliente.id}</span>
                    </div>

                    <button type="button" className="icon-button" title={`Remover ${cliente.nome}`} aria-label={`Remover ${cliente.nome}`} onClick={() => removerHospede(String(cliente.id))}>
                      ×
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="form-helper">Adicione os hóspedes antes de salvar a hospedagem.</p>
            )}
          </Field>
        </div>

        {erro ? <div className="alert-box">{erro}</div> : null}
        {acomodacoes.length === 0 ? <div className="alert-box">Não existe acomodação cadastrada para iniciar uma hospedagem.</div> : null}
        {clientesDisponiveis.length === 0 ? <div className="alert-box">Não existe cliente disponível para hospedagem no momento.</div> : null}
      </form>
    </Modal>
  )
}
