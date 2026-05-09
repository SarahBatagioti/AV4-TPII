import Armazem from "../armazenamento/armazem"
import Entrada from "../teste/entrada"

export default abstract class Processo {
    protected entrada: Entrada
    protected armazem: Armazem

    constructor() {
        this.entrada = new Entrada()
        this.armazem = Armazem.obterInstancia()
    }

    public abstract processar(): void
}
