import type { AcomodacaoDTO, AcomodacaoPayload } from './types'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3333'

async function requestJSON<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  })

  if (!response.ok) {
    let message = 'Não foi possível concluir a operação.'
    try {
      const body = (await response.json()) as { mensagem?: string }
      message = body.mensagem ?? message
    } catch {
      // Mantém a mensagem padrão quando a resposta não for JSON.
    }

    throw new Error(message)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

export function listarAcomodacoes(): Promise<AcomodacaoDTO[]> {
  return requestJSON<AcomodacaoDTO[]>('/acomodacoes')
}

export function cadastrarAcomodacao(payload: AcomodacaoPayload): Promise<AcomodacaoDTO> {
  return requestJSON<AcomodacaoDTO>('/acomodacoes', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
