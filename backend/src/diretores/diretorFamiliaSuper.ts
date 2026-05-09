import Diretor from "../abstracoes/diretor"
import ConstrutorAcomodacao from "../construtores/construtorAcomodacao"
import { NomeAcomodacao } from "../enumeracoes/nomeAcomodacao"
import Acomodacao from "../modelos/acomodacao"

export default class DiretorFamiliaSuper extends Diretor<Acomodacao> {
    constructor() {
        super()
        this.construtor = new ConstrutorAcomodacao()
    }

    public construir(): Acomodacao {
        const construtor = this.construtor as ConstrutorAcomodacao
        construtor.NomeAcomodacao = NomeAcomodacao.FamiliaSuper
        construtor.CamaSolteiro = 6
        construtor.CamaCasal = 2
        construtor.Suite = 3
        construtor.Climatizacao = true
        construtor.Garagem = 2
        return construtor.construir()
    }
}
