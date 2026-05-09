import { TipoDocumento } from "../enumeracoes/tipoDocumento"
import Cliente from "../modelos/cliente"
import Documento from "../modelos/documento"
import Endereco from "../modelos/endereco"
import Telefone from "../modelos/telefone"
import Entrada from "../teste/entrada"

export function lerTipoDocumento(entrada: Entrada, mensagem: string = 'Tipo de documento (CPF, RG ou Passaporte)'): TipoDocumento {
    let tipoDocumentoTexto = entrada.receberTexto(mensagem).trim().toLowerCase()
    if (tipoDocumentoTexto === 'rg') {
        return TipoDocumento.RG
    }
    if (tipoDocumentoTexto === 'passaporte') {
        return TipoDocumento.Passaporte
    }

    return TipoDocumento.CPF
}

export function criarEndereco(entrada: Entrada): Endereco {
    return new Endereco(
        entrada.receberTexto('Rua'),
        entrada.receberTexto('Bairro'),
        entrada.receberTexto('Cidade'),
        entrada.receberTexto('Estado'),
        entrada.receberTexto('País'),
        entrada.receberTexto('Código postal')
    )
}

export function criarDocumento(entrada: Entrada, mensagemTipo?: string): Documento {
    return new Documento(
        entrada.receberTexto('Número do documento'),
        lerTipoDocumento(entrada, mensagemTipo),
        entrada.receberData('Data de expedição do documento')
    )
}

export function criarTelefone(entrada: Entrada): Telefone {
    return new Telefone(
        entrada.receberTexto('DDD'),
        entrada.receberTexto('Número de telefone')
    )
}

export function imprimirCliente(cliente: Cliente): void {
    const titular = cliente.titular ? `${cliente.titular.nome} (ID ${cliente.titular.id})` : 'Não possui'
    console.log(`ID: ${cliente.id}`)
    console.log(`Nome: ${cliente.nome}`)
    console.log(`Nome social: ${cliente.nomeSocial}`)
    console.log(`Nascimento: ${cliente.dataNascimento.toLocaleDateString('pt-BR')}`)
    console.log(`Cadastro: ${cliente.dataCadastro.toLocaleDateString('pt-BR')}`)
    console.log(`Documento principal: ${cliente.documentos[0]?.tipo ?? 'Não informado'} - ${cliente.documentos[0]?.numero ?? 'Sem número'}`)
    console.log(`Telefones: ${cliente.telefones.map(telefone => `(${telefone.ddd}) ${telefone.numero}`).join(', ') || 'Nenhum'}`)
    console.log(`Titular: ${titular}`)
    console.log(`Dependentes: ${cliente.dependentes.map(dependente => `${dependente.nome} (ID ${dependente.id})`).join(', ') || 'Nenhum'}`)
    console.log('---')
}
