import Hospedagem from "../modelos/hospedagem"
import Processo from "./processo"

export default class CadastrarHospedagem extends Processo {
    public processar(): void {
        console.log('\nCadastro de hospedagem')

        const acomodacoes = this.armazem.obterAcomodacoes()
        if (acomodacoes.length === 0) {
            console.log('Nenhuma acomodação cadastrada.')
            return
        }

        console.log('Acomodações disponíveis:')
        acomodacoes.forEach((acomodacao, indice) => {
            console.log(`${indice + 1} - ${acomodacao.NomeAcomodacao}`)
        })

        const indiceAcomodacao = this.entrada.receberNumero('Escolha o número da acomodação')
        const acomodacao = acomodacoes[indiceAcomodacao - 1]
        if (!acomodacao) {
            console.log('Acomodação inválida.')
            return
        }

        const clientes = this.armazem.obterClientes()
        if (clientes.length === 0) {
            console.log('Nenhum cliente cadastrado para hospedar.')
            return
        }

        const dataInicio = this.entrada.receberData('Informe a data de início da hospedagem')
        const dataFim = this.entrada.receberData('Informe a data de fim da hospedagem')

        if (dataFim <= dataInicio) {
            console.log('A data fim deve ser posterior à data de início.')
            return
        }

        console.log('Clientes cadastrados:')
        clientes.forEach(cliente => {
            const situacao = this.armazem.clienteEstaHospedado(cliente.id) ? ' - hospedado' : ''
            console.log(`ID ${cliente.id} - ${cliente.nome}${situacao}`)
        })

        const hospedagem = new Hospedagem(acomodacao, dataInicio, dataFim)
        let adicionandoHospedes = true

        while (adicionandoHospedes) {
            const clienteId = this.entrada.receberNumero('Informe o ID do hóspede')
            const cliente = this.armazem.buscarClientePorId(clienteId)

            if (!cliente) {
                console.log('Cliente não encontrado.')
            } else if (this.armazem.clienteEstaHospedado(cliente.id)) {
                console.log('Este cliente já está vinculado a uma hospedagem ativa.')
            } else if (hospedagem.contemHospede(cliente.id)) {
                console.log('Este cliente já foi adicionado nesta hospedagem.')
            } else {
                hospedagem.adicionarHospede(cliente)
                console.log(`Hóspede ${cliente.nome} vinculado com sucesso.`)
            }

            adicionandoHospedes = this.entrada.receberConfirmacao('Deseja adicionar outro hóspede? (s/n)')
        }

        if (hospedagem.Hospedes.length === 0) {
            console.log('Hospedagem cancelada. Nenhum hóspede válido foi informado.')
            return
        }

        this.armazem.cadastrarHospedagem(hospedagem)
        console.log('Hospedagem cadastrada com sucesso.')
    }
}
