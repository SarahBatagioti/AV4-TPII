import { NomeAcomodacao } from "../enumeracoes/nomeAcomodacao"

export default class Acomodacao {
    private nomeAcomodacao: NomeAcomodacao
    private camaSolteiro: number
    private camaCasal: number
    private suite: number
    private climatizacao: boolean
    private garagem: number

    constructor(
        nomeAcomodacao: NomeAcomodacao,
        camaSolteiro: number,
        camaCasal: number,
        suite: number,
        climatizacao: boolean,
        garagem: number
    ) {
        this.nomeAcomodacao = nomeAcomodacao
        this.camaSolteiro = camaSolteiro
        this.camaCasal = camaCasal
        this.suite = suite
        this.climatizacao = climatizacao
        this.garagem = garagem
    }

    public get NomeAcomodacao(): NomeAcomodacao {
        return this.nomeAcomodacao
    }

    public set NomeAcomodacao(nomeAcomodacao: NomeAcomodacao) {
        this.nomeAcomodacao = nomeAcomodacao
    }

    public get CamaSolteiro(): number {
        return this.camaSolteiro
    }

    public set CamaSolteiro(camaSolteiro: number) {
        this.camaSolteiro = camaSolteiro
    }

    public get CamaCasal(): number {
        return this.camaCasal
    }

    public set CamaCasal(camaCasal: number) {
        this.camaCasal = camaCasal
    }

    public get Suite(): number {
        return this.suite
    }

    public set Suite(suite: number) {
        this.suite = suite
    }

    public get Climatizacao(): boolean {
        return this.climatizacao
    }

    public set Climatizacao(climatizacao: boolean) {
        this.climatizacao = climatizacao
    }

    public get Garagem(): number {
        return this.garagem
    }

    public set Garagem(garagem: number) {
        this.garagem = garagem
    }
}
