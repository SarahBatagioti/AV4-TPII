import Acomodacao from "../modelos/acomodacao"

export default class ImpressorAcomodacao {
    private acomodacao: Acomodacao

    constructor(acomodacao: Acomodacao) {
        this.acomodacao = acomodacao
    }

    public imprimir(): string {
        return [
            `Tipo de acomodação: ${this.acomodacao.NomeAcomodacao}`,
            `- Camas de solteiro: ${this.acomodacao.CamaSolteiro}`,
            `- Camas de casal: ${this.acomodacao.CamaCasal}`,
            `- Suítes: ${this.acomodacao.Suite}`,
            `- Climatização: ${this.acomodacao.Climatizacao ? 'Sim' : 'Não'}`,
            `- Garagens: ${this.acomodacao.Garagem}`
        ].join('\n')
    }
}
