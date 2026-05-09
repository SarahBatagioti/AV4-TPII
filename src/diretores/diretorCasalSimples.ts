import Diretor from "../abstracoes/diretor"
import ConstrutorAcomodacao from "../construtores/construtorAcomodacao"
import { NomeAcomodacao } from "../enumeracoes/nomeAcomodacao"
import Acomodacao from "../modelos/acomodacao"

export default class DiretorCasalSimples extends Diretor<Acomodacao> {
    constructor() {
        super()
        this.construtor = new ConstrutorAcomodacao()
    }

    public construir(): Acomodacao {
        const construtor = this.construtor as ConstrutorAcomodacao
        construtor.NomeAcomodacao = NomeAcomodacao.CasalSimples
        construtor.CamaSolteiro = 0
        construtor.CamaCasal = 1
        construtor.Suite = 1
        construtor.Climatizacao = true
        construtor.Garagem = 1
        return construtor.construir()
    }
}
