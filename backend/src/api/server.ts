import { createServer, IncomingMessage, ServerResponse } from "http"
import { carregarDadosIniciais } from "../dados/dadosIniciais"
import Armazem from "../armazenamento/armazem"
import Cliente from "../modelos/cliente"
import Documento from "../modelos/documento"
import Endereco from "../modelos/endereco"
import Telefone from "../modelos/telefone"

const PORTA = 3333

type ClienteTipo = "titular" | "dependente"

type ClienteDTO = {
    id: number
    nome: string
    nomeSocial: string
    dataNascimento: string
    dataCadastro: string
    tipo: ClienteTipo
    ehDependente: boolean
    titularId?: number
    dependentesIds: number[]
    telefones: {
        ddd: string
        numero: string
    }[]
    documentos: {
        numero: string
        tipo: string
        dataExpedicao: string
    }[]
    endereco: {
        rua: string
        bairro: string
        cidade: string
        estado: string
        pais: string
        codigoPostal: string
    }
}

type ClientePayload = {
    tipo: ClienteTipo
    nome: string
    nomeSocial: string
    dataNascimento: string
    titularId?: number | null
    documento: {
        numero: string
        tipo: string
        dataExpedicao: string
    }
    telefone: {
        ddd: string
        numero: string
    }
    endereco: {
        rua: string
        bairro: string
        cidade: string
        estado: string
        pais: string
        codigoPostal: string
    }
}

function adicionarCabecalhosCors(resposta: ServerResponse): void {
    resposta.setHeader("Access-Control-Allow-Origin", "*")
    resposta.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    resposta.setHeader("Access-Control-Allow-Headers", "Content-Type")
}

function responderJSON(resposta: ServerResponse, statusCode: number, body: unknown): void {
    adicionarCabecalhosCors(resposta)
    resposta.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" })
    resposta.end(JSON.stringify(body))
}

function responderSemConteudo(resposta: ServerResponse, statusCode: number): void {
    adicionarCabecalhosCors(resposta)
    resposta.writeHead(statusCode)
    resposta.end()
}

function lerCorpoJSON(requisicao: IncomingMessage): Promise<ClientePayload> {
    return new Promise((resolve, reject) => {
        let texto = ""

        requisicao.on("data", (parte: Buffer) => {
            texto += parte.toString("utf-8")
        })
        requisicao.on("end", () => {
            try {
                resolve(JSON.parse(texto) as ClientePayload)
            } catch (erro) {
                reject(erro)
            }
        })
        requisicao.on("error", reject)
    })
}

function clienteParaDTO(cliente: Cliente): ClienteDTO {
    return {
        id: cliente.id,
        nome: cliente.nome,
        nomeSocial: cliente.nomeSocial,
        dataNascimento: cliente.dataNascimento.toISOString(),
        dataCadastro: cliente.dataCadastro.toISOString(),
        tipo: cliente.ehDependente ? "dependente" : "titular",
        ehDependente: cliente.ehDependente,
        titularId: cliente.titular?.id,
        dependentesIds: cliente.dependentes.map((dependente) => dependente.id),
        telefones: cliente.telefones.map((telefone) => ({
            ddd: telefone.ddd,
            numero: telefone.numero
        })),
        documentos: cliente.documentos.map((documento) => ({
            numero: documento.numero,
            tipo: documento.tipo,
            dataExpedicao: documento.dataExpedicao.toISOString()
        })),
        endereco: {
            rua: cliente.endereco.rua,
            bairro: cliente.endereco.bairro,
            cidade: cliente.endereco.cidade,
            estado: cliente.endereco.estado,
            pais: cliente.endereco.pais,
            codigoPostal: cliente.endereco.codigoPostal
        }
    }
}

function converterPayloadParaEndereco(payload: ClientePayload): Endereco {
    return new Endereco(
        payload.endereco.rua,
        payload.endereco.bairro,
        payload.endereco.cidade,
        payload.endereco.estado,
        payload.endereco.pais,
        payload.endereco.codigoPostal
    )
}

function aplicarDadosBasicos(cliente: Cliente, payload: ClientePayload): void {
    cliente.nome = payload.nome
    cliente.nomeSocial = payload.nomeSocial
    cliente.dataNascimento = new Date(payload.dataNascimento)
    cliente.endereco = converterPayloadParaEndereco(payload)
    cliente.documentos = [
        new Documento(
            payload.documento.numero,
            payload.documento.tipo as never,
            new Date(payload.documento.dataExpedicao)
        )
    ]
    cliente.telefones = [
        new Telefone(
            payload.telefone.ddd,
            payload.telefone.numero
        )
    ]
}

function desvincularDeTitularAtual(cliente: Cliente): void {
    if (cliente.titular) {
        cliente.titular.removerDependente(cliente.id)
        cliente.titular = undefined
    }
}

function vincularDependente(cliente: Cliente, payload: ClientePayload): string | null {
    const armazem = Armazem.obterInstancia()

    if (cliente.dependentes.length > 0) {
        return "Nao e possivel transformar um titular com dependentes em dependente."
    }

    const titularId = payload.titularId
    if (titularId === undefined || titularId === null) {
        return "Titular obrigatório para cadastro de dependente."
    }

    const titular = armazem.buscarClientePorId(titularId)
    if (!titular || titular.ehDependente || titular.id === cliente.id) {
        return "Titular informado nao encontrado."
    }

    desvincularDeTitularAtual(cliente)
    titular.adicionarDependente(cliente)
    return null
}

function atualizarRelacionamento(cliente: Cliente, payload: ClientePayload): string | null {
    desvincularDeTitularAtual(cliente)

    if (payload.tipo === "titular") {
        return null
    }

    return vincularDependente(cliente, payload)
}

function criarCliente(payload: ClientePayload): { cliente?: Cliente; erro?: string } {
    const armazem = Armazem.obterInstancia()
    const cliente = new Cliente(
        armazem.gerarId(),
        payload.nome,
        payload.nomeSocial,
        new Date(payload.dataNascimento),
        converterPayloadParaEndereco(payload)
    )

    aplicarDadosBasicos(cliente, payload)

    if (payload.tipo === "dependente") {
        const erro = vincularDependente(cliente, payload)
        if (erro) {
            return { erro }
        }
    }

    return { cliente }
}

function encontrarSegmentos(url: string): string[] {
    return new URL(url, "http://localhost").pathname.split("/").filter(Boolean)
}

async function processarRequisicao(requisicao: IncomingMessage, resposta: ServerResponse): Promise<void> {
    const metodo = requisicao.method ?? "GET"
    const segmentos = encontrarSegmentos(requisicao.url ?? "/")

    if (metodo === "OPTIONS") {
        responderSemConteudo(resposta, 204)
        return
    }

    if (metodo === "GET" && segmentos.length === 1 && segmentos[0] === "health") {
        responderJSON(resposta, 200, { status: "ok" })
        return
    }

    if (metodo === "GET" && segmentos.length === 1 && segmentos[0] === "clientes") {
        const clientes = Armazem.obterInstancia().obterClientes().map(clienteParaDTO)
        responderJSON(resposta, 200, clientes)
        return
    }

    if (metodo === "GET" && segmentos.length === 2 && segmentos[0] === "clientes" && segmentos[1] === "titulares") {
        const clientes = Armazem.obterInstancia()
            .buscarClientesTitulares()
            .map(clienteParaDTO)
        responderJSON(resposta, 200, clientes)
        return
    }

    if (metodo === "POST" && segmentos.length === 1 && segmentos[0] === "clientes") {
        try {
            const payload = await lerCorpoJSON(requisicao)
            const resultado = criarCliente(payload)
            if (resultado.erro || !resultado.cliente) {
                responderJSON(resposta, 400, { mensagem: resultado.erro ?? "Dados invalidos." })
                return
            }

            Armazem.obterInstancia().cadastrarCliente(resultado.cliente)
            responderJSON(resposta, 201, clienteParaDTO(resultado.cliente))
            return
        } catch {
            responderJSON(resposta, 400, { mensagem: "Nao foi possivel processar o corpo da requisicao." })
            return
        }
    }

    if (segmentos.length === 2 && segmentos[0] === "clientes") {
        const id = Number(segmentos[1])
        if (Number.isNaN(id)) {
            responderJSON(resposta, 400, { mensagem: "ID invalido." })
            return
        }

        const armazem = Armazem.obterInstancia()
        const cliente = armazem.buscarClientePorId(id)

        if (!cliente) {
            responderJSON(resposta, 404, { mensagem: "Cliente nao encontrado." })
            return
        }

        if (metodo === "PUT") {
            try {
                const payload = await lerCorpoJSON(requisicao)
                const erroRelacionamento = atualizarRelacionamento(cliente, payload)

                if (erroRelacionamento) {
                    responderJSON(resposta, 400, { mensagem: erroRelacionamento })
                    return
                }

                aplicarDadosBasicos(cliente, payload)
                responderJSON(resposta, 200, clienteParaDTO(cliente))
                return
            } catch {
                responderJSON(resposta, 400, { mensagem: "Nao foi possivel processar o corpo da requisicao." })
                return
            }
        }

        if (metodo === "DELETE") {
            const removido = armazem.removerCliente(id)
            if (!removido) {
                responderJSON(resposta, 400, { mensagem: "Nao foi possivel remover o cliente." })
                return
            }

            responderSemConteudo(resposta, 204)
            return
        }
    }

    responderJSON(resposta, 404, { mensagem: "Rota nao encontrada" })
}

carregarDadosIniciais()

const servidor = createServer((requisicao: IncomingMessage, resposta: ServerResponse) => {
    void processarRequisicao(requisicao, resposta)
})

servidor.listen(PORTA, () => {
    console.log(`API Atlantis rodando em http://localhost:${PORTA}`)
})
