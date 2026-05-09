import Processo from "./processo"
import { imprimirCliente } from "./utilitarios"

export default class ListarTitularDeDependente extends Processo {
    public processar(): void {
        console.log('\nTitular por dependente')
        const dependentes = this.armazem.buscarClientesDependentes()
        if (dependentes.length === 0) {
            console.log('Nenhum dependente cadastrado.')
            return
        }

        dependentes.forEach(cliente => console.log(`ID ${cliente.id} - ${cliente.nome}`))
        const dependenteId = this.entrada.receberNumero('Informe o ID do dependente')
        const dependente = this.armazem.buscarClientePorId(dependenteId)

        if (!dependente || !dependente.ehDependente || !dependente.titular) {
            console.log('Dependente não encontrado.')
            return
        }

        imprimirCliente(dependente.titular)
    }
}
