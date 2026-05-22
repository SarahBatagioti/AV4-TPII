export type ClienteTipo = 'titular' | 'dependente'

export type ClienteDTO = {
  id: number
  nome: string
  nomeSocial: string
  dataNascimento: string
  dataCadastro: string
  tipo: ClienteTipo
  ehDependente: boolean
  titularId?: number
  dependentesIds: number[]
  telefones: Array<{
    ddd: string
    numero: string
  }>
  documentos: Array<{
    numero: string
    tipo: string
    dataExpedicao: string
  }>
  endereco: {
    rua: string
    bairro: string
    cidade: string
    estado: string
    pais: string
    codigoPostal: string
  }
}

export type ClienteFormValues = {
  tipo: ClienteTipo
  nome: string
  nomeSocial: string
  dataNascimento: string
  titularId: string
  documentoNumero: string
  documentoTipo: string
  documentoDataExpedicao: string
  ddd: string
  numeroTelefone: string
  rua: string
  bairro: string
  cidade: string
  estado: string
  pais: string
  codigoPostal: string
}

export type ClientePayload = {
  tipo: ClienteTipo
  nome: string
  nomeSocial: string
  dataNascimento: string
  titularId?: number | null
  documento: {
    numero: string
    tipo: string
    dataExpedicao: string
  }
  telefone: {
    ddd: string
    numero: string
  }
  endereco: {
    rua: string
    bairro: string
    cidade: string
    estado: string
    pais: string
    codigoPostal: string
  }
}

export const DOCUMENTO_OPTIONS = [
  'Cadastro de Pessoas Física',
  'Registro Geral',
  'Passaporte',
]

export function criarFormularioVazio(): ClienteFormValues {
  return {
    tipo: 'titular',
    nome: '',
    nomeSocial: '',
    dataNascimento: '',
    titularId: '',
    documentoNumero: '',
    documentoTipo: DOCUMENTO_OPTIONS[0],
    documentoDataExpedicao: '',
    ddd: '',
    numeroTelefone: '',
    rua: '',
    bairro: '',
    cidade: '',
    estado: '',
    pais: '',
    codigoPostal: '',
  }
}

function extrairDigitos(valor: string): string {
  return valor.replace(/\D/g, '')
}

function extrairAlfanumericos(valor: string): string {
  return valor.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
}

export function formatarNumeroDocumento(numero: string, tipoDocumento: string): string {
  const valorLimpo = numero.trim()

  if (tipoDocumento === DOCUMENTO_OPTIONS[1]) {
    const digitos = extrairDigitos(valorLimpo).slice(0, 9)
    return digitos
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2}\.\d{3})(\d)/, '$1.$2')
      .replace(/^(\d{2}\.\d{3}\.\d{3})(\d)/, '$1-$2')
  }

  if (tipoDocumento === DOCUMENTO_OPTIONS[2]) {
    return extrairAlfanumericos(valorLimpo).slice(0, 8)
  }

  const digitos = extrairDigitos(valorLimpo).slice(0, 11)
  return digitos
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3}\.\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3}\.\d{3}\.\d{3})(\d)/, '$1-$2')
}

export function formatarDdd(valor: string): string {
  return extrairDigitos(valor).slice(0, 2)
}

export function formatarTelefone(valor: string): string {
  const digitos = extrairDigitos(valor).slice(0, 9)
  return digitos.replace(/^(\d{5})(\d)/, '$1-$2')
}

export function formatarCodigoPostal(valor: string): string {
  const digitos = extrairDigitos(valor).slice(0, 8)
  return digitos.replace(/^(\d{5})(\d)/, '$1-$2')
}

export function normalizarNumeroDocumento(numero: string, tipoDocumento: string): string {
  if (tipoDocumento === DOCUMENTO_OPTIONS[2]) {
    return extrairAlfanumericos(numero).slice(0, 8)
  }

  if (tipoDocumento === DOCUMENTO_OPTIONS[1]) {
    return extrairDigitos(numero).slice(0, 9)
  }

  return extrairDigitos(numero).slice(0, 11)
}

export function normalizarDdd(valor: string): string {
  return extrairDigitos(valor).slice(0, 2)
}

export function normalizarTelefone(valor: string): string {
  return extrairDigitos(valor).slice(0, 9)
}

export function normalizarCodigoPostal(valor: string): string {
  return extrairDigitos(valor).slice(0, 8)
}

export function formatarDataInput(dataISO: string): string {
  if (!dataISO) {
    return ''
  }

  return new Date(dataISO).toISOString().slice(0, 10)
}

export function clienteParaFormulario(cliente: ClienteDTO): ClienteFormValues {
  return {
    tipo: cliente.tipo,
    nome: cliente.nome,
    nomeSocial: cliente.nomeSocial,
    dataNascimento: formatarDataInput(cliente.dataNascimento),
    titularId: cliente.titularId ? String(cliente.titularId) : '',
    documentoNumero: formatarNumeroDocumento(cliente.documentos[0]?.numero ?? '', cliente.documentos[0]?.tipo ?? DOCUMENTO_OPTIONS[0]),
    documentoTipo: cliente.documentos[0]?.tipo ?? DOCUMENTO_OPTIONS[0],
    documentoDataExpedicao: formatarDataInput(cliente.documentos[0]?.dataExpedicao ?? ''),
    ddd: formatarDdd(cliente.telefones[0]?.ddd ?? ''),
    numeroTelefone: formatarTelefone(cliente.telefones[0]?.numero ?? ''),
    rua: cliente.endereco.rua,
    bairro: cliente.endereco.bairro,
    cidade: cliente.endereco.cidade,
    estado: cliente.endereco.estado,
    pais: cliente.endereco.pais,
    codigoPostal: formatarCodigoPostal(cliente.endereco.codigoPostal),
  }
}

export function formularioParaPayload(formulario: ClienteFormValues): ClientePayload {
  return {
    tipo: formulario.tipo,
    nome: formulario.nome.trim(),
    nomeSocial: formulario.nomeSocial.trim(),
    dataNascimento: formulario.dataNascimento,
    titularId: formulario.tipo === 'dependente' && formulario.titularId ? Number(formulario.titularId) : null,
    documento: {
      numero: normalizarNumeroDocumento(formulario.documentoNumero, formulario.documentoTipo),
      tipo: formulario.documentoTipo,
      dataExpedicao: formulario.documentoDataExpedicao,
    },
    telefone: {
      ddd: normalizarDdd(formulario.ddd),
      numero: normalizarTelefone(formulario.numeroTelefone),
    },
    endereco: {
      rua: formulario.rua.trim(),
      bairro: formulario.bairro.trim(),
      cidade: formulario.cidade.trim(),
      estado: formulario.estado.trim(),
      pais: formulario.pais.trim(),
      codigoPostal: normalizarCodigoPostal(formulario.codigoPostal),
    },
  }
}
