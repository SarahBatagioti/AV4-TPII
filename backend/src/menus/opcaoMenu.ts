import Menu from "../interfaces/menu"
import Processo from "../processos/processo"

export default class OpcaoMenu implements Menu {
    public titulo: string
    private processo: Processo

    constructor(titulo: string, processo: Processo) {
        this.titulo = titulo
        this.processo = processo
    }

    public executar(): void {
        this.processo.processar()
    }
}
