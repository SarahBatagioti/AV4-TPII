import { NomeAcomodacao } from "../enumeracoes/nomeAcomodacao"
import Construtor from "../interfaces/construtor"
import Acomodacao from "../modelos/acomodacao"

export default class ConstrutorAcomodacao implements Construtor<Acomodacao> {
    private nomeAcomodacao: NomeAcomodacao = NomeAcomodacao.SolteiroSimples
    private camaSolteiro = 0
    private camaCasal = 0
    private suite = 0
    private climatizacao = false
    private garagem = 0

    public set NomeAcomodacao(nomeAcomodacao: NomeAcomodacao) {
        this.nomeAcomodacao = nomeAcomodacao
    }

    public set CamaSolteiro(camaSolteiro: number) {
        this.camaSolteiro = camaSolteiro
    }

    public set CamaCasal(camaCasal: number) {
        this.camaCasal = camaCasal
    }

    public set Suite(suite: number) {
        this.suite = suite
    }

    public set Climatizacao(climatizacao: boolean) {
        this.climatizacao = climatizacao
    }

    public set Garagem(garagem: number) {
        this.garagem = garagem
    }

    public construir(): Acomodacao {
        return new Acomodacao(
            this.nomeAcomodacao,
            this.camaSolteiro,
            this.camaCasal,
            this.suite,
            this.climatizacao,
            this.garagem
        )
    }
}
