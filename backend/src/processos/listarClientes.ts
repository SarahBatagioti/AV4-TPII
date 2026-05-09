import Processo from "./processo"
import { imprimirCliente } from "./utilitarios"

export default class ListarClientes extends Processo {
    public processar(): void {
        console.log('\nClientes cadastrados')
        const clientes = this.armazem.obterClientes()
        if (clientes.length === 0) {
            console.log('Nenhum cliente cadastrado.')
            return
        }

        clientes.forEach(imprimirCliente)
    }
}
