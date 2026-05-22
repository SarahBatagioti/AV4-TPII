import { useEffect, useMemo, useState } from 'react'
import { Modal } from '../../components/ui/Modal'
import {
  NOME_ACOMODACAO_OPTIONS,
  acomodacaoParaFormulario,
  criarFormularioVazio,
  formatarNomeAcomodacao,
  type AcomodacaoDTO,
  type AcomodacaoFormValues,
  formularioParaPayload,
} from './types'

type AcomodacaoFormModalProps = {
  open: boolean
  initialAcomodacao: AcomodacaoDTO | null
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

export function AcomodacaoFormModal({ open, initialAcomodacao, onClose, onSubmit }: AcomodacaoFormModalProps) {
  const [formulario, setFormulario] = useState<AcomodacaoFormValues>(() => criarFormularioVazio())
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    if (!open) {
      return
    }

    setErro(null)
    setEnviando(false)
    setFormulario(initialAcomodacao ? acomodacaoParaFormulario(initialAcomodacao) : criarFormularioVazio())
  }, [initialAcomodacao, open])

  const ehEdicao = Boolean(initialAcomodacao)
  const titulo = useMemo(() => (ehEdicao ? 'Editar Acomodação' : 'Cadastrar Acomodação'), [ehEdicao])
  const descricao = useMemo(
    () => (
      ehEdicao
        ? 'Atualize o tipo da acomodação e sua composição para refletir a configuração correta no sistema.'
        : 'Informe o tipo da acomodação e sua composição para adicioná-la à lista exibida na tela.'
    ),
    [ehEdicao],
  )

  function atualizarCampo<K extends keyof AcomodacaoFormValues>(campo: K, valor: AcomodacaoFormValues[K]) {
    setFormulario((atual) => ({ ...atual, [campo]: valor }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErro(null)
    setEnviando(true)

    try {
      await onSubmit(initialAcomodacao?.id ?? null, formularioParaPayload(formulario))
      onClose()
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível salvar a acomodação.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Modal
      open={open}
      title={titulo}
      description={descricao}
      size="md"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="secondary-button" onClick={onClose} disabled={enviando}>
            Cancelar
          </button>
          <button type="submit" form="acomodacao-form" className="primary-button" disabled={enviando}>
            {enviando ? 'Salvando...' : 'Salvar acomodação'}
          </button>
        </>
      }
    >
      <form id="acomodacao-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <Field label="Tipo da acomodação" span={6}>
            <select value={formulario.nome} onChange={(event) => atualizarCampo('nome', event.target.value as AcomodacaoFormValues['nome'])} required>
              {NOME_ACOMODACAO_OPTIONS.map((opcao) => (
                <option key={opcao} value={opcao}>
                  {formatarNomeAcomodacao(opcao)}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Camas de solteiro" span={3}>
            <input
              type="number"
              min="0"
              step="1"
              value={formulario.camaSolteiro}
              onChange={(event) => atualizarCampo('camaSolteiro', event.target.value)}
              placeholder="0"
              required
            />
          </Field>

          <Field label="Camas de casal" span={3}>
            <input
              type="number"
              min="0"
              step="1"
              value={formulario.camaCasal}
              onChange={(event) => atualizarCampo('camaCasal', event.target.value)}
              placeholder="0"
              required
            />
          </Field>

          <Field label="Suítes" span={3}>
            <input
              type="number"
              min="0"
              step="1"
              value={formulario.suite}
              onChange={(event) => atualizarCampo('suite', event.target.value)}
              placeholder="0"
              required
            />
          </Field>

          <Field label="Garagens" span={3}>
            <input
              type="number"
              min="0"
              step="1"
              value={formulario.garagem}
              onChange={(event) => atualizarCampo('garagem', event.target.value)}
              placeholder="0"
              required
            />
          </Field>

          <Field label="Climatização" span={6}>
            <button
              type="button"
              className={`secondary-button acomodacao-toggle${formulario.climatizacao ? ' acomodacao-toggle--active' : ''}`}
              onClick={() => atualizarCampo('climatizacao', !formulario.climatizacao)}
            >
              {formulario.climatizacao ? 'Com climatização' : 'Sem climatização'}
            </button>
          </Field>
        </div>

        {erro ? <div className="alert-box">{erro}</div> : null}
      </form>
    </Modal>
  )
}
