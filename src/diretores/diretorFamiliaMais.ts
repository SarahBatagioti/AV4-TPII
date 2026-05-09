import Diretor from "../abstracoes/diretor"
import ConstrutorAcomodacao from "../construtores/construtorAcomodacao"
import { NomeAcomodacao } from "../enumeracoes/nomeAcomodacao"
import Acomodacao from "../modelos/acomodacao"

export default class DiretorFamiliaMais extends Diretor<Acomodacao> {
    constructor() {
        super()
        this.construtor = new ConstrutorAcomodacao()
    }

    public construir(): Acomodacao {
        const construtor = this.construtor as ConstrutorAcomodacao
        construtor.NomeAcomodacao = NomeAcomodacao.FamiliaMais
        construtor.CamaSolteiro = 5
        construtor.CamaCasal = 1
        construtor.Suite = 2
        construtor.Climatizacao = true
        construtor.Garagem = 2
        return construtor.construir()
    }
}
