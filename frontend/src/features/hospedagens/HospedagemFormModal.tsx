import { useEffect, useMemo, useState } from 'react'
import { Modal } from '../../components/ui/Modal'
import { formatarNomeAcomodacao } from '../acomodacoes/types'
import type { ClienteDTO } from '../clientes/types'
import {
  criarFormularioVazio,
  formularioParaPayload,
  hospedagemParaFormulario,
  type AcomodacaoDTO,
  type HospedagemDTO,
  type HospedagemFormValues,
} from './types'

type HospedagemFormModalProps = {
  open: boolean
  initialHospedagem: HospedagemDTO | null
  acomodacoes: AcomodacaoDTO[]
  clientesSelecionaveis: ClienteDTO[]
  onClose: () => void
  onSubmit: (id: number | null, payload: ReturnType<typeof formularioParaPayload>) => Promise<void>
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
    `${formatarNomeAcomodacao(acomodacao.nome)}`,
    `${acomodacao.camaSolteiro} solteiro(s)`,
    `${acomodacao.camaCasal} casal(is)`,
    `${acomodacao.suite} suite(s)`,
    acomodacao.climatizacao ? 'Climatizacao' : 'Sem climatizacao',
    `${acomodacao.garagem} vaga(s)`,
  ].join(' - ')
}

export function HospedagemFormModal({ open, initialHospedagem, acomodacoes, clientesSelecionaveis, onClose, onSubmit }: HospedagemFormModalProps) {
  const [formulario, setFormulario] = useState<HospedagemFormValues>(() => criarFormularioVazio())
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    if (!open) {
      return
    }

    setErro(null)
    setEnviando(false)
    setFormulario(
      initialHospedagem
        ? hospedagemParaFormulario(initialHospedagem)
        : {
            ...criarFormularioVazio(),
            acomodacaoId: acomodacoes[0]?.id ? String(acomodacoes[0].id) : '',
          },
    )
  }, [acomodacoes, initialHospedagem, open])

  const ehEdicao = Boolean(initialHospedagem)
  const titulo = useMemo(() => (ehEdicao ? 'Editar Hospedagem' : 'Cadastrar Hospedagem'), [ehEdicao])
  const descricao = useMemo(
    () => (
      ehEdicao
        ? 'Atualize a acomodacao e a lista de hospedes vinculados a esta hospedagem ativa.'
        : 'Escolha a acomodacao, adicione os hospedes disponiveis e salve a nova hospedagem.'
    ),
    [ehEdicao],
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
      setErro('Adicione ao menos um hospede para salvar a hospedagem.')
      return
    }

    setEnviando(true)

    try {
      await onSubmit(initialHospedagem?.id ?? null, formularioParaPayload(formulario))
      onClose()
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Nao foi possivel salvar a hospedagem.')
    } finally {
      setEnviando(false)
    }
  }

  const clientesSelecionados = clientesSelecionaveis.filter((cliente) => formulario.hospedesIds.includes(String(cliente.id)))

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
          <Field label="Acomodacao" span={6}>
            <select value={formulario.acomodacaoId} onChange={(event) => atualizarCampo('acomodacaoId', event.target.value)} required>
              <option value="">Selecione uma acomodacao</option>
              {acomodacoes.map((acomodacao) => (
                <option key={acomodacao.id} value={acomodacao.id}>
                  {formatarAcomodacao(acomodacao)}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Cliente disponivel" span={6}>
            <select
              value={formulario.clienteSelecionadoId}
              onChange={(event) => atualizarCampo('clienteSelecionadoId', event.target.value)}
              disabled={clientesSelecionaveis.length === 0}
            >
              <option value="">{clientesSelecionaveis.length === 0 ? 'Nenhum cliente disponivel' : 'Selecione um cliente'}</option>
              {clientesSelecionaveis.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nome} - ID {cliente.id}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Adicionar hospede" span={6}>
            <button type="button" className="secondary-button" onClick={adicionarHospede} disabled={!formulario.clienteSelecionadoId || clientesSelecionaveis.length === 0}>
              Adicionar hospede
            </button>
          </Field>

          <Field label="Hospedes da hospedagem" span={12}>
            {clientesSelecionados.length > 0 ? (
              <div className="selection-list">
                {clientesSelecionados.map((cliente) => (
                  <div className="selection-item" key={cliente.id}>
                    <div className="selection-item__meta">
                      <strong>{cliente.nome}</strong>
                      <span className="cell-muted">ID {cliente.id}</span>
                    </div>

                    <button type="button" className="icon-button" title={`Remover ${cliente.nome}`} aria-label={`Remover ${cliente.nome}`} onClick={() => removerHospede(String(cliente.id))}>
                      x
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="form-helper">Adicione os hospedes antes de salvar a hospedagem.</p>
            )}
          </Field>
        </div>

        {erro ? <div className="alert-box">{erro}</div> : null}
        {acomodacoes.length === 0 ? <div className="alert-box">Nao existe acomodacao cadastrada para iniciar uma hospedagem.</div> : null}
        {clientesSelecionaveis.length === 0 ? <div className="alert-box">Nao existe cliente disponivel para hospedagem no momento.</div> : null}
      </form>
    </Modal>
  )
}
