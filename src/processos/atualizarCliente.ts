import Processo from "./processo"
import { lerTipoDocumento } from "./utilitarios"

export default class AtualizarCliente extends Processo {
    public processar(): void {
        console.log('\nAtualização de cliente')
        const id = this.entrada.receberNumero('Informe o ID do cliente')
        const cliente = this.armazem.buscarClientePorId(id)
        if (!cliente) {
            console.log('Cliente não encontrado.')
            return
        }

        const nome = this.entrada.receberTexto(`Nome do cliente [${cliente.nome}]`).trim() || cliente.nome
        const nomeSocial = this.entrada.receberTexto(`Nome social do cliente [${cliente.nomeSocial}]`).trim() || cliente.nomeSocial
        const alterarNascimento = this.entrada.receberConfirmacao('Deseja alterar a data de nascimento? (s/n)')
        const dataNascimento = alterarNascimento
            ? this.entrada.receberData('Nova data de nascimento do cliente')
            : cliente.dataNascimento

        cliente.atualizarDados(nome, nomeSocial, dataNascimento)

        if (this.entrada.receberConfirmacao('Deseja alterar o endereço? (s/n)')) {
            cliente.endereco.rua = this.entrada.receberTexto(`Rua [${cliente.endereco.rua}]`).trim() || cliente.endereco.rua
            cliente.endereco.bairro = this.entrada.receberTexto(`Bairro [${cliente.endereco.bairro}]`).trim() || cliente.endereco.bairro
            cliente.endereco.cidade = this.entrada.receberTexto(`Cidade [${cliente.endereco.cidade}]`).trim() || cliente.endereco.cidade
            cliente.endereco.estado = this.entrada.receberTexto(`Estado [${cliente.endereco.estado}]`).trim() || cliente.endereco.estado
            cliente.endereco.pais = this.entrada.receberTexto(`País [${cliente.endereco.pais}]`).trim() || cliente.endereco.pais
            cliente.endereco.codigoPostal = this.entrada.receberTexto(`Código postal [${cliente.endereco.codigoPostal}]`).trim() || cliente.endereco.codigoPostal
        }

        const telefonePrincipal = cliente.telefones[0]
        if (telefonePrincipal && this.entrada.receberConfirmacao('Deseja alterar o telefone principal? (s/n)')) {
            telefonePrincipal.ddd = this.entrada.receberTexto(`DDD [${telefonePrincipal.ddd}]`).trim() || telefonePrincipal.ddd
            telefonePrincipal.numero = this.entrada.receberTexto(`Número [${telefonePrincipal.numero}]`).trim() || telefonePrincipal.numero
        }

        const documentoPrincipal = cliente.documentos[0]
        if (documentoPrincipal && this.entrada.receberConfirmacao('Deseja alterar o documento principal? (s/n)')) {
            documentoPrincipal.numero = this.entrada.receberTexto(`Número do documento [${documentoPrincipal.numero}]`).trim() || documentoPrincipal.numero
            documentoPrincipal.tipo = lerTipoDocumento(this.entrada, 'Tipo de documento (CPF, RG ou Passaporte)')
            documentoPrincipal.dataExpedicao = this.entrada.receberData('Data de expedição do documento')
        }

        console.log('Cliente atualizado com sucesso.')
    }
}
