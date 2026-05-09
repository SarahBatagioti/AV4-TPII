import { TipoDocumento } from "../enumeracoes/tipoDocumento"

export default class Documento {
    public numero: string
    public tipo: TipoDocumento
    public dataExpedicao: Date

    constructor(numero: string = '', tipo: TipoDocumento = TipoDocumento.CPF, dataExpedicao: Date = new Date()) {
        this.numero = numero
        this.tipo = tipo
        this.dataExpedicao = dataExpedicao
    }
}
