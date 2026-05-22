import type { ClienteDTO } from '../clientes/types'

export type AcomodacaoDTO = {
  id: number
  nome: string
  camaSolteiro: number
  camaCasal: number
  suite: number
  climatizacao: boolean
  garagem: number
}

export type HospedagemDTO = {
  id: number
  acomodacao: AcomodacaoDTO
  hospedes: ClienteDTO[]
}

export type HospedagemFormValues = {
  acomodacaoId: string
  hospedesIds: string[]
  clienteSelecionadoId: string
}

export type HospedagemPayload = {
  acomodacaoId: number
  hospedesIds: number[]
}

export function criarFormularioVazio(): HospedagemFormValues {
  return {
    acomodacaoId: '',
    hospedesIds: [],
    clienteSelecionadoId: '',
  }
}

export function formularioParaPayload(formulario: HospedagemFormValues): HospedagemPayload {
  return {
    acomodacaoId: Number(formulario.acomodacaoId),
    hospedesIds: formulario.hospedesIds.map((id) => Number(id)),
  }
}

export function hospedagemParaFormulario(hospedagem: HospedagemDTO): HospedagemFormValues {
  return {
    acomodacaoId: String(hospedagem.acomodacao.id),
    hospedesIds: hospedagem.hospedes.map((hospede) => String(hospede.id)),
    clienteSelecionadoId: '',
  }
}
