import { useEffect, useMemo, useState } from 'react'
import { Modal } from '../../components/ui/Modal'
import {
  DOCUMENTO_OPTIONS,
  clienteParaFormulario,
  criarFormularioVazio,
  formatarCodigoPostal,
  formatarDdd,
  formatarNumeroDocumento,
  formatarTelefone,
  formularioParaPayload,
  type ClienteDTO,
  type ClienteFormValues,
} from './types'

type ClienteFormModalProps = {
  open: boolean
  initialCliente: ClienteDTO | null
  titulares: ClienteDTO[]
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

export function ClienteFormModal({ open, initialCliente, titulares, onClose, onSubmit }: ClienteFormModalProps) {
  const [formulario, setFormulario] = useState<ClienteFormValues>(() => criarFormularioVazio())
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    if (!open) {
      return
    }

    setErro(null)
    setEnviando(false)
    setFormulario(initialCliente ? clienteParaFormulario(initialCliente) : criarFormularioVazio())
  }, [initialCliente, open])

  const ehEdicao = Boolean(initialCliente)

  const titulo = useMemo(() => (ehEdicao ? 'Editar Cliente' : 'Cadastrar Cliente'), [ehEdicao])
  const descricao = useMemo(
    () => (formulario.tipo === 'titular' ? 'Preencha os dados do cliente titular.' : 'Preencha os dados do dependente e vincule ao titular responsável.'),
    [formulario.tipo],
  )

  function atualizarCampo<K extends keyof ClienteFormValues>(campo: K, valor: ClienteFormValues[K]) {
    setFormulario((atual) => ({ ...atual, [campo]: valor }))
  }

  function atualizarDocumentoTipo(tipoDocumento: string) {
    setFormulario((atual) => ({
      ...atual,
      documentoTipo: tipoDocumento,
      documentoNumero: formatarNumeroDocumento(atual.documentoNumero, tipoDocumento),
    }))
  }

  function atualizarDocumentoNumero(numero: string) {
    setFormulario((atual) => ({
      ...atual,
      documentoNumero: formatarNumeroDocumento(numero, atual.documentoTipo),
    }))
  }

  function atualizarDdd(ddd: string) {
    setFormulario((atual) => ({
      ...atual,
      ddd: formatarDdd(ddd),
    }))
  }

  function atualizarTelefone(numero: string) {
    setFormulario((atual) => ({
      ...atual,
      numeroTelefone: formatarTelefone(numero),
    }))
  }

  function atualizarCodigoPostal(codigoPostal: string) {
    setFormulario((atual) => ({
      ...atual,
      codigoPostal: formatarCodigoPostal(codigoPostal),
    }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErro(null)
    setEnviando(true)

    try {
      await onSubmit(initialCliente?.id ?? null, formularioParaPayload(formulario))
      onClose()
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Nao foi possivel salvar o cliente.')
    } finally {
      setEnviando(false)
    }
  }

  const titularInvalido = formulario.tipo === 'dependente' && titulares.length === 0

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
          <button type="submit" form="cliente-form" className="primary-button" disabled={enviando || titularInvalido}>
            {enviando ? 'Salvando...' : 'Salvar cliente'}
          </button>
        </>
      }
    >
      <form id="cliente-form" onSubmit={handleSubmit}>
        <div className="form-tabs" role="tablist" aria-label="Tipo de cliente">
          <button
            type="button"
            className={`form-tab${formulario.tipo === 'titular' ? ' form-tab--active' : ''}`}
            onClick={() => atualizarCampo('tipo', 'titular')}
          >
            Titular
          </button>
          <button
            type="button"
            className={`form-tab${formulario.tipo === 'dependente' ? ' form-tab--active' : ''}`}
            onClick={() => atualizarCampo('tipo', 'dependente')}
          >
            Dependente
          </button>
        </div>

        <div className="form-grid">
          <Field label="Nome" span={6}>
            <input value={formulario.nome} onChange={(event) => atualizarCampo('nome', event.target.value)} placeholder="Nome completo" required />
          </Field>

          <Field label="Nome social" span={6}>
            <input value={formulario.nomeSocial} onChange={(event) => atualizarCampo('nomeSocial', event.target.value)} placeholder="Nome social" required />
          </Field>

          <Field label="Data de nascimento" span={4}>
            <input type="date" value={formulario.dataNascimento} onChange={(event) => atualizarCampo('dataNascimento', event.target.value)} required />
          </Field>

          <Field label="Documento" span={4}>
            <select value={formulario.documentoTipo} onChange={(event) => atualizarDocumentoTipo(event.target.value)}>
              {DOCUMENTO_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option === 'Cadastro de Pessoas Física' ? 'CPF' : option}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Número do documento" span={4}>
            <input
              value={formulario.documentoNumero}
              onChange={(event) => atualizarDocumentoNumero(event.target.value)}
              placeholder={formulario.documentoTipo === 'Cadastro de Pessoas Física' ? '000.000.000-00' : formulario.documentoTipo === 'Registro Geral' ? '00.000.000-0' : 'AA000000'}
              inputMode={formulario.documentoTipo === 'Passaporte' ? 'text' : 'numeric'}
              autoComplete="off"
              required
            />
          </Field>

          <Field label="Data de expedição do documento" span={4}>
            <input type="date" value={formulario.documentoDataExpedicao} onChange={(event) => atualizarCampo('documentoDataExpedicao', event.target.value)} required />
          </Field>

          <Field label="DDD" span={3}>
            <input value={formulario.ddd} onChange={(event) => atualizarDdd(event.target.value)} placeholder="00" inputMode="numeric" maxLength={2} required />
          </Field>

          <Field label="Telefone" span={5}>
            <input
              value={formulario.numeroTelefone}
              onChange={(event) => atualizarTelefone(event.target.value)}
              placeholder="00000-0000"
              inputMode="numeric"
              maxLength={10}
              required
            />
          </Field>

          {formulario.tipo === 'dependente' ? (
            <Field label="Titular responsável" span={4}>
              <select value={formulario.titularId} onChange={(event) => atualizarCampo('titularId', event.target.value)} required>
                <option value="">Selecione um titular</option>
                {titulares.map((titular) => (
                  <option key={titular.id} value={titular.id}>
                    {titular.nome} - ID {titular.id}
                  </option>
                ))}
              </select>
              {titulares.length === 0 ? <p className="form-helper">Cadastre ao menos um titular antes de criar dependentes.</p> : null}
            </Field>
          ) : (
            <div className="form-field form-field--span-4">
              <label>Titular responsável</label>
              <input value="Não se aplica para titular" readOnly />
            </div>
          )}

          <Field label="Rua" span={6}>
            <input value={formulario.rua} onChange={(event) => atualizarCampo('rua', event.target.value)} required />
          </Field>

          <Field label="Bairro" span={6}>
            <input value={formulario.bairro} onChange={(event) => atualizarCampo('bairro', event.target.value)} required />
          </Field>

          <Field label="Cidade" span={4}>
            <input value={formulario.cidade} onChange={(event) => atualizarCampo('cidade', event.target.value)} required />
          </Field>

          <Field label="Estado" span={4}>
            <input value={formulario.estado} onChange={(event) => atualizarCampo('estado', event.target.value)} required />
          </Field>

          <Field label="País" span={4}>
            <input value={formulario.pais} onChange={(event) => atualizarCampo('pais', event.target.value)} required />
          </Field>

          <Field label="Código postal" span={4}>
            <input
              value={formulario.codigoPostal}
              onChange={(event) => atualizarCodigoPostal(event.target.value)}
              placeholder="00000-000"
              inputMode="numeric"
              maxLength={9}
              required
            />
          </Field>
        </div>

        {erro ? <div className="alert-box">{erro}</div> : null}
        {titularInvalido ? <div className="alert-box">Não existe titular disponível para vincular este dependente.</div> : null}
      </form>
    </Modal>
  )
}