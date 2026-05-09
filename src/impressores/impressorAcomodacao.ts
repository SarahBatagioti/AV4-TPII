import Acomodacao from "../modelos/acomodacao"

export default class ImpressorAcomodacao {
    private acomodacao: Acomodacao

    constructor(acomodacao: Acomodacao) {
        this.acomodacao = acomodacao
    }

    public imprimir(): string {
        return [
            `Tipo de acomodacao: ${this.acomodacao.NomeAcomodacao}`,
            `- Camas de solteiro: ${this.acomodacao.CamaSolteiro}`,
            `- Camas de casal: ${this.acomodacao.CamaCasal}`,
            `- Suites: ${this.acomodacao.Suite}`,
            `- Climatizacao: ${this.acomodacao.Climatizacao ? 'Sim' : 'Nao'}`,
            `- Garagens: ${this.acomodacao.Garagem}`
        ].join('\n')
    }
}
