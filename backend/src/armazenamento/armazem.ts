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

    public buscarAcomodacaoPorId(id: number): Acomodacao | undefined {
        return this.acomodacoes[id - 1]
    }

    public cadastrarHospedagem(hospedagem: Hospedagem): void {
        this.hospedagensAtuais.push(hospedagem)
    }

    public obterHospedagensAtuais(): Hospedagem[] {
        return this.hospedagensAtuais
    }

    public buscarHospedagemPorId(id: number): Hospedagem | undefined {
        return this.hospedagensAtuais[id - 1]
    }

    public acomodacaoEstaEmUso(acomodacao: Acomodacao): boolean {
        return this.hospedagensAtuais.some(hospedagem => hospedagem.Acomodacao === acomodacao)
    }

    public acomodacaoEstaEmUsoPorOutraHospedagem(acomodacao: Acomodacao, hospedagemAtual: Hospedagem): boolean {
        return this.hospedagensAtuais.some(hospedagem => hospedagem !== hospedagemAtual && hospedagem.Acomodacao === acomodacao)
    }

    public clienteEstaHospedado(id: number): boolean {
        return this.hospedagensAtuais.some(hospedagem => hospedagem.contemHospede(id))
    }

    public clienteEstaHospedadoEmOutraHospedagem(id: number, hospedagemAtual: Hospedagem): boolean {
        return this.hospedagensAtuais.some(hospedagem => hospedagem !== hospedagemAtual && hospedagem.contemHospede(id))
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

    public removerAcomodacao(id: number): boolean {
        const acomodacao = this.buscarAcomodacaoPorId(id)
        if (!acomodacao) {
            return false
        }

        if (this.acomodacaoEstaEmUso(acomodacao)) {
            return false
        }

        this.acomodacoes = this.acomodacoes.filter((_, indice) => indice !== id - 1)
        return true
    }

    public removerHospedagem(id: number): boolean {
        const hospedagem = this.buscarHospedagemPorId(id)
        if (!hospedagem) {
            return false
        }

        this.hospedagensAtuais = this.hospedagensAtuais.filter((_, indice) => indice !== id - 1)
        return true
    }
}
