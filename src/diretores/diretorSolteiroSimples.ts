import Diretor from "../abstracoes/diretor"
import ConstrutorAcomodacao from "../construtores/construtorAcomodacao"
import { NomeAcomodacao } from "../enumeracoes/nomeAcomodacao"
import Acomodacao from "../modelos/acomodacao"

export default class DiretorSolteiroSimples extends Diretor<Acomodacao> {
    constructor() {
        super()
        this.construtor = new ConstrutorAcomodacao()
    }

    public construir(): Acomodacao {
        const construtor = this.construtor as ConstrutorAcomodacao
        construtor.NomeAcomodacao = NomeAcomodacao.SolteiroSimples
        construtor.CamaSolteiro = 1
        construtor.CamaCasal = 0
        construtor.Suite = 1
        construtor.Climatizacao = true
        construtor.Garagem = 0
        return construtor.construir()
    }
}
