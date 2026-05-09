import Cliente from "../modelos/cliente"
import Processo from "./processo"
import { criarDocumento, criarEndereco, criarTelefone } from "./utilitarios"

export default class CadastrarTitular extends Processo {
    public processar(): void {
        console.log('\nCadastro de cliente titular')
        const cliente = new Cliente(
            this.armazem.gerarId(),
            this.entrada.receberTexto('Nome do cliente'),
            this.entrada.receberTexto('Nome social do cliente'),
            this.entrada.receberData('Data de nascimento do cliente'),
            criarEndereco(this.entrada)
        )

        cliente.adicionarDocumento(criarDocumento(this.entrada))
        cliente.adicionarTelefone(criarTelefone(this.entrada))
        this.armazem.cadastrarCliente(cliente)

        console.log(`Cliente titular cadastrado com sucesso. ID gerado: ${cliente.id}`)
    }
}
