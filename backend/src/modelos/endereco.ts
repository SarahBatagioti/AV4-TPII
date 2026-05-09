import Prototipo from "../interfaces/prototipo"

export default class Endereco implements Prototipo {
    public rua: string
    public bairro: string
    public cidade: string
    public estado: string
    public pais: string
    public codigoPostal: string

    constructor(
        rua: string = '',
        bairro: string = '',
        cidade: string = '',
        estado: string = '',
        pais: string = '',
        codigoPostal: string = ''
    ) {
        this.rua = rua
        this.bairro = bairro
        this.cidade = cidade
        this.estado = estado
        this.pais = pais
        this.codigoPostal = codigoPostal
    }

    public clonar(): Prototipo {
        let endereco = new Endereco()
        endereco.rua = this.rua
        endereco.bairro = this.bairro
        endereco.cidade = this.cidade
        endereco.estado = this.estado
        endereco.pais = this.pais
        endereco.codigoPostal = this.codigoPostal
        return endereco
    }
}
