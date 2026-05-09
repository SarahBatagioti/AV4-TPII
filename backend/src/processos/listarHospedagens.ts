import ImpressorHospedagem from "../impressores/impressorHospedagem"
import Processo from "./processo"

export default class ListarHospedagens extends Processo {
    public processar(): void {
        console.log('\nHospedagens atuais')
        const hospedagens = this.armazem.obterHospedagensAtuais()
        if (hospedagens.length === 0) {
            console.log('Nenhuma hospedagem ativa.')
            return
        }

        hospedagens.forEach(hospedagem => {
            console.log('---')
            console.log(new ImpressorHospedagem(hospedagem).imprimir())
        })
        console.log('---')
    }
}
