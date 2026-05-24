import Hospedagem from "../modelos/hospedagem"

export default class ImpressorHospedagem {
    private hospedagem: Hospedagem

    constructor(hospedagem: Hospedagem) {
        this.hospedagem = hospedagem
    }

    public imprimir(): string {
        const hospedes = this.hospedagem.Hospedes
            .map(hospede => `ID ${hospede.id} - ${hospede.nome}`)
            .join(', ')

        return [
            `Tipo de acomodação: ${this.hospedagem.Acomodacao.NomeAcomodacao}`,
            `Hóspedes: ${hospedes || 'Nenhum hóspede vinculado'}`
        ].join('\n')
    }
}
