import Cliente from "../modelos/cliente"
import Endereco from "../modelos/endereco"
import Telefone from "../modelos/telefone"
import Processo from "./processo"
import { criarDocumento } from "./utilitarios"

export default class CadastrarDependente extends Processo {
    public processar(): void {
        console.log('\nCadastro de cliente dependente')
        const titulares = this.armazem.buscarClientesTitulares()
        if (titulares.length === 0) {
            console.log('Nenhum titular cadastrado para vincular dependentes.')
            return
        }

        titulares.forEach(cliente => console.log(`ID ${cliente.id} - ${cliente.nome}`))
        const titularId = this.entrada.receberNumero('Informe o ID do titular')
        const titular = this.armazem.buscarClientePorId(titularId)
        if (!titular || titular.ehDependente) {
            console.log('Titular não encontrado.')
            return
        }

        const endereco = this.entrada.receberConfirmacao('Deseja clonar o endereço do titular? (s/n)')
            ? titular.endereco.clonar() as Endereco
            : new Endereco(
                this.entrada.receberTexto('Rua'),
                this.entrada.receberTexto('Bairro'),
                this.entrada.receberTexto('Cidade'),
                this.entrada.receberTexto('Estado'),
                this.entrada.receberTexto('País'),
                this.entrada.receberTexto('Código postal')
            )

        const dependente = new Cliente(
            this.armazem.gerarId(),
            this.entrada.receberTexto('Nome do dependente'),
            this.entrada.receberTexto('Nome social do dependente'),
            this.entrada.receberData('Data de nascimento do dependente'),
            endereco
        )

        dependente.adicionarDocumento(criarDocumento(this.entrada, 'Tipo de documento do dependente (CPF, RG ou Passaporte)'))

        if (this.entrada.receberConfirmacao('Deseja clonar os telefones do titular? (s/n)')) {
            titular.telefones.forEach(telefone => dependente.adicionarTelefone(telefone.clonar() as Telefone))
        } else {
            dependente.adicionarTelefone(new Telefone(
                this.entrada.receberTexto('DDD'),
                this.entrada.receberTexto('Número de telefone')
            ))
        }

        titular.adicionarDependente(dependente)
        this.armazem.cadastrarCliente(dependente)
        console.log(`Dependente cadastrado com sucesso. ID gerado: ${dependente.id}`)
    }
}
