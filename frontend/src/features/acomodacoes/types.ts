export type NomeAcomodacao =
  | 'Casal Simples'
  | 'Familia Simples'
  | 'Familia Mais'
  | 'Familia Super'
  | 'Solteiro Simples'
  | 'Solteiro Mais'

export const NOME_ACOMODACAO_OPTIONS: NomeAcomodacao[] = [
  'Casal Simples',
  'Familia Simples',
  'Familia Mais',
  'Familia Super',
  'Solteiro Simples',
  'Solteiro Mais',
]

export type AcomodacaoDTO = {
  id: number
  nome: string
  camaSolteiro: number
  camaCasal: number
  suite: number
  climatizacao: boolean
  garagem: number
}

export type AcomodacaoPayload = {
  nome: NomeAcomodacao
  camaSolteiro: number
  camaCasal: number
  suite: number
  climatizacao: boolean
  garagem: number
}

export type AcomodacaoFormValues = {
  nome: NomeAcomodacao
  camaSolteiro: string
  camaCasal: string
  suite: string
  climatizacao: boolean
  garagem: string
}

export function criarFormularioVazio(): AcomodacaoFormValues {
  return {
    nome: NOME_ACOMODACAO_OPTIONS[0],
    camaSolteiro: '',
    camaCasal: '',
    suite: '',
    climatizacao: false,
    garagem: '',
  }
}

export function formularioParaPayload(formulario: AcomodacaoFormValues): AcomodacaoPayload {
  return {
    nome: formulario.nome,
    camaSolteiro: Number(formulario.camaSolteiro),
    camaCasal: Number(formulario.camaCasal),
    suite: Number(formulario.suite),
    climatizacao: formulario.climatizacao,
    garagem: Number(formulario.garagem),
  }
}