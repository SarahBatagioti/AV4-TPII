import Documento from "./documento"
import Endereco from "./endereco"
import Telefone from "./telefone"

export default class Cliente {
    public nome: string
    public nomeSocial: string
    public dataNascimento: Date
    public dataCadastro: Date
    public telefones: Telefone[] = []
    public endereco: Endereco
    public documentos: Documento[] = []
    public dependentes: Cliente[] = []
    public titular?: Cliente
    public id: number

    constructor(id: number, nome: string = '', nomeSocial: string = '', dataNascimento: Date = new Date(), endereco: Endereco = new Endereco()) {
        this.id = id
        this.nome = nome
        this.nomeSocial = nomeSocial
        this.dataNascimento = dataNascimento
        this.dataCadastro = new Date()
        this.endereco = endereco
    }

    public get ehDependente(): boolean {
        return this.titular !== undefined
    }

    public adicionarDocumento(documento: Documento): void {
        this.documentos.push(documento)
    }

    public adicionarTelefone(telefone: Telefone): void {
        this.telefones.push(telefone)
    }

    public adicionarDependente(dependente: Cliente): void {
        dependente.titular = this
        this.dependentes.push(dependente)
    }

    public removerDependente(dependenteId: number): void {
        this.dependentes = this.dependentes.filter(dependente => dependente.id !== dependenteId)
    }

    public atualizarDados(nome: string, nomeSocial: string, dataNascimento: Date): void {
        this.nome = nome
        this.nomeSocial = nomeSocial
        this.dataNascimento = dataNascimento
    }

}
