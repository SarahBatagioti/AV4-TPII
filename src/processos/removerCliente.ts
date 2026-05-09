import Processo from "./processo"

export default class RemoverCliente extends Processo {
    public processar(): void {
        console.log('\nRemocao de cliente')
        const id = this.entrada.receberNumero('Informe o ID do cliente a ser removido')
        const cliente = this.armazem.buscarClientePorId(id)
        if (!cliente) {
            console.log('Cliente nao encontrado.')
            return
        }

        if (!cliente.ehDependente && cliente.dependentes.length > 0) {
            console.log('Nao e possivel remover um titular com dependentes vinculados. Remova os dependentes antes.')
            return
        }

        if (this.armazem.clienteEstaHospedado(id)) {
            console.log('Nao e possivel remover um cliente com hospedagem ativa.')
            return
        }

        const removido = this.armazem.removerCliente(id)
        console.log(removido ? 'Cliente removido com sucesso.' : 'Nao foi possivel remover o cliente.')
    }
}
