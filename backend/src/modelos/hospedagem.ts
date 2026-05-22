import Acomodacao from "./acomodacao"
import Cliente from "./cliente"

export default class Hospedagem {
    private acomodacao: Acomodacao
    private hospedes: Cliente[] = []

    constructor(acomodacao: Acomodacao) {
        this.acomodacao = acomodacao
    }

    public get Acomodacao(): Acomodacao {
        return this.acomodacao
    }

    public set Acomodacao(acomodacao: Acomodacao) {
        this.acomodacao = acomodacao
    }

    public get Hospedes(): Cliente[] {
        return this.hospedes
    }

    public adicionarHospede(cliente: Cliente): void {
        this.hospedes.push(cliente)
    }

    public removerHospede(clienteId: number): void {
        this.hospedes = this.hospedes.filter(hospede => hospede.id !== clienteId)
    }

    public limparHospedes(): void {
        this.hospedes = []
    }

    public contemHospede(clienteId: number): boolean {
        return this.hospedes.some(hospede => hospede.id === clienteId)
    }
}
