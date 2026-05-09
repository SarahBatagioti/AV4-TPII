import ImpressorAcomodacao from "../impressores/impressorAcomodacao"
import Processo from "./processo"

export default class ListarAcomodacoes extends Processo {
    public processar(): void {
        console.log('\nAcomodacoes cadastradas')
        const acomodacoes = this.armazem.obterAcomodacoes()
        if (acomodacoes.length === 0) {
            console.log('Nenhuma acomodacao cadastrada.')
            return
        }

        acomodacoes.forEach(acomodacao => {
            console.log('---')
            console.log(new ImpressorAcomodacao(acomodacao).imprimir())
        })
        console.log('---')
    }
}
