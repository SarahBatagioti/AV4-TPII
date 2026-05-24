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
  dataInicio: string
  dataFim: string
}

export type HospedagemFormValues = {
  acomodacaoId: string
  hospedesIds: string[]
  clienteSelecionadoId: string
  dataInicio: string
  dataFim: string
}

export type HospedagemPayload = {
  acomodacaoId: number
  hospedesIds: number[]
  dataInicio: string
  dataFim: string
}

export function criarFormularioVazio(): HospedagemFormValues {
  return {
    acomodacaoId: '',
    hospedesIds: [],
    clienteSelecionadoId: '',
    dataInicio: '',
    dataFim: '',
  }
}

export function formularioParaPayload(formulario: HospedagemFormValues): HospedagemPayload {
  return {
    acomodacaoId: Number(formulario.acomodacaoId),
    hospedesIds: formulario.hospedesIds.map((id) => Number(id)),
    dataInicio: formulario.dataInicio,
    dataFim: formulario.dataFim,
  }
}

export function hospedagemParaFormulario(hospedagem: HospedagemDTO): HospedagemFormValues {
  return {
    acomodacaoId: String(hospedagem.acomodacao.id),
    hospedesIds: hospedagem.hospedes.map((hospede) => String(hospede.id)),
    clienteSelecionadoId: '',
    dataInicio: hospedagem.dataInicio.slice(0, 10),
    dataFim: hospedagem.dataFim.slice(0, 10),
  }
}
