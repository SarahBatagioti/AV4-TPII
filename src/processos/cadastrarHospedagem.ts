import Hospedagem from "../modelos/hospedagem"
import Processo from "./processo"

export default class CadastrarHospedagem extends Processo {
    public processar(): void {
        console.log('\nCadastro de hospedagem')

        const acomodacoes = this.armazem.obterAcomodacoes()
        if (acomodacoes.length === 0) {
            console.log('Nenhuma acomodacao cadastrada.')
            return
        }

        console.log('Acomodacoes disponiveis:')
        acomodacoes.forEach((acomodacao, indice) => {
            console.log(`${indice + 1} - ${acomodacao.NomeAcomodacao}`)
        })

        const indiceAcomodacao = this.entrada.receberNumero('Escolha o numero da acomodacao')
        const acomodacao = acomodacoes[indiceAcomodacao - 1]
        if (!acomodacao) {
            console.log('Acomodacao invalida.')
            return
        }

        const clientes = this.armazem.obterClientes()
        if (clientes.length === 0) {
            console.log('Nenhum cliente cadastrado para hospedar.')
            return
        }

        console.log('Clientes cadastrados:')
        clientes.forEach(cliente => {
            const situacao = this.armazem.clienteEstaHospedado(cliente.id) ? ' - hospedado' : ''
            console.log(`ID ${cliente.id} - ${cliente.nome}${situacao}`)
        })

        const hospedagem = new Hospedagem(acomodacao)
        let adicionandoHospedes = true

        while (adicionandoHospedes) {
            const clienteId = this.entrada.receberNumero('Informe o ID do hospede')
            const cliente = this.armazem.buscarClientePorId(clienteId)

            if (!cliente) {
                console.log('Cliente nao encontrado.')
            } else if (this.armazem.clienteEstaHospedado(cliente.id)) {
                console.log('Este cliente ja esta vinculado a uma hospedagem ativa.')
            } else if (hospedagem.contemHospede(cliente.id)) {
                console.log('Este cliente ja foi adicionado nesta hospedagem.')
            } else {
                hospedagem.adicionarHospede(cliente)
                console.log(`Hospede ${cliente.nome} vinculado com sucesso.`)
            }

            adicionandoHospedes = this.entrada.receberConfirmacao('Deseja adicionar outro hospede? (s/n)')
        }

        if (hospedagem.Hospedes.length === 0) {
            console.log('Hospedagem cancelada. Nenhum hospede valido foi informado.')
            return
        }

        this.armazem.cadastrarHospedagem(hospedagem)
        console.log('Hospedagem cadastrada com sucesso.')
    }
}
