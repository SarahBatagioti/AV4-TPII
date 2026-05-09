import promptSync from "prompt-sync";
export default class Entrada {
    private prompt = promptSync({ sigint: true })

    public receberNumero(mensagem: string): number {
        while (true) {
            let valor = this.prompt(`${mensagem}: `)
            let numero = Number(valor)
            if (!Number.isNaN(numero)) {
                return numero
            }

            console.log('Digite um número válido.')
        }
    }

    public receberTexto(mensagem: string): string {
        let texto = this.prompt(`${mensagem}: `)
        return texto
    }

    public receberData(mensagem: string): Date {
        let texto = this.prompt(`${mensagem} (dd/MM/yyyy): `)
        let partes = texto.split('/')
        let ano = new Number(partes[2])
        let mes = new Number(partes[1])
        let dia = new Number(partes[0])
        let data = new Date(ano.valueOf(), mes.valueOf() - 1, dia.valueOf(), 12)
        return data
    }

    public receberConfirmacao(mensagem: string): boolean {
        let resposta = this.receberTexto(mensagem).trim().toLowerCase()
        return resposta === 's' || resposta === 'sim'
    }
}
