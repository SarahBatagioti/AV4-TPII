import Acomodacao from "../modelos/acomodacao"
import Cliente from "../modelos/cliente"
import Hospedagem from "../modelos/hospedagem"

export default class Armazem {
    private static instancia: Armazem
    private clientes: Cliente[] = []
    private acomodacoes: Acomodacao[] = []
    private hospedagensAtuais: Hospedagem[] = []
    private ultimoId = 0

    private constructor() { }

    public static obterInstancia(): Armazem {
        if (!Armazem.instancia) {
            Armazem.instancia = new Armazem()
        }

        return Armazem.instancia
    }

    public gerarId(): number {
        this.ultimoId += 1
        return this.ultimoId
    }

    public cadastrarCliente(cliente: Cliente): void {
        this.clientes.push(cliente)
    }

    public obterClientes(): Cliente[] {
        return this.clientes
    }

    public cadastrarAcomodacao(acomodacao: Acomodacao): void {
        this.acomodacoes.push(acomodacao)
    }

    public obterAcomodacoes(): Acomodacao[] {
        return this.acomodacoes
    }

    public cadastrarHospedagem(hospedagem: Hospedagem): void {
        this.hospedagensAtuais.push(hospedagem)
    }

    public obterHospedagensAtuais(): Hospedagem[] {
        return this.hospedagensAtuais
    }

    public clienteEstaHospedado(id: number): boolean {
        return this.hospedagensAtuais.some(hospedagem => hospedagem.contemHospede(id))
    }

    public buscarClientePorId(id: number): Cliente | undefined {
        return this.clientes.find(cliente => cliente.id === id)
    }

    public buscarClientesTitulares(): Cliente[] {
        return this.clientes.filter(cliente => !cliente.ehDependente)
    }

    public buscarClientesDependentes(): Cliente[] {
        return this.clientes.filter(cliente => cliente.ehDependente)
    }

    public removerCliente(id: number): boolean {
        const cliente = this.buscarClientePorId(id)
        if (!cliente) {
            return false
        }

        if (this.clienteEstaHospedado(id)) {
            return false
        }

        if (cliente.titular) {
            cliente.titular.removerDependente(cliente.id)
        }

        cliente.dependentes.forEach(dependente => {
            dependente.titular = undefined
        })

        this.clientes = this.clientes.filter(atual => atual.id !== id)
        return true
    }
}
