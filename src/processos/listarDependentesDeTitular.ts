import Processo from "./processo"
import { imprimirCliente } from "./utilitarios"

export default class ListarDependentesDeTitular extends Processo {
    public processar(): void {
        console.log('\nDependentes por titular')
        const titulares = this.armazem.buscarClientesTitulares()
        if (titulares.length === 0) {
            console.log('Nenhum titular cadastrado.')
            return
        }

        titulares.forEach(cliente => console.log(`ID ${cliente.id} - ${cliente.nome}`))
        const titularId = this.entrada.receberNumero('Informe o ID do titular')
        const titular = this.armazem.buscarClientePorId(titularId)

        if (!titular || titular.ehDependente) {
            console.log('Titular não encontrado.')
            return
        }

        if (titular.dependentes.length === 0) {
            console.log('Este titular não possui dependentes.')
            return
        }

        titular.dependentes.forEach(imprimirCliente)
    }
}
