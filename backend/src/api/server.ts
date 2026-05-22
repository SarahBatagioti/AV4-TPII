import { createServer, IncomingMessage, ServerResponse } from "http"
import { carregarDadosIniciais } from "../dados/dadosIniciais"
import Armazem from "../armazenamento/armazem"
import Cliente from "../modelos/cliente"
import Acomodacao from "../modelos/acomodacao"
import { NomeAcomodacao } from "../enumeracoes/nomeAcomodacao"
import Documento from "../modelos/documento"
import Endereco from "../modelos/endereco"
import Telefone from "../modelos/telefone"
import Hospedagem from "../modelos/hospedagem"

const PORTA = Number(process.env.PORT ?? 3333)

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

type AcomodacaoDTO = {
    id: number
    nome: string
    camaSolteiro: number
    camaCasal: number
    suite: number
    climatizacao: boolean
    garagem: number
}

type AcomodacaoPayload = {
    nome: NomeAcomodacao
    camaSolteiro: number
    camaCasal: number
    suite: number
    climatizacao: boolean
    garagem: number
}

type HospedagemDTO = {
    id: number
    acomodacao: AcomodacaoDTO
    hospedes: ClienteDTO[]
}

type HospedagemPayload = {
    acomodacaoId: number
    hospedesIds: number[]
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

function lerCorpoJSON<T>(requisicao: IncomingMessage): Promise<T> {
    return new Promise((resolve, reject) => {
        let texto = ""

        requisicao.on("data", (parte: Buffer) => {
            texto += parte.toString("utf-8")
        })
        requisicao.on("end", () => {
            try {
                resolve(JSON.parse(texto) as T)
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

function acomodacaoParaDTO(acomodacao: Acomodacao, indice: number): AcomodacaoDTO {
    return {
        id: indice + 1,
        nome: acomodacao.NomeAcomodacao,
        camaSolteiro: acomodacao.CamaSolteiro,
        camaCasal: acomodacao.CamaCasal,
        suite: acomodacao.Suite,
        climatizacao: acomodacao.Climatizacao,
        garagem: acomodacao.Garagem
    }
}

function acomodacaoPayloadValido(payload: AcomodacaoPayload): boolean {
    return typeof payload.nome === "string"
        && typeof payload.camaSolteiro === "number"
        && typeof payload.camaCasal === "number"
        && typeof payload.suite === "number"
        && typeof payload.climatizacao === "boolean"
        && typeof payload.garagem === "number"
        && payload.camaSolteiro >= 0
        && payload.camaCasal >= 0
        && payload.suite >= 0
        && payload.garagem >= 0
}

function nomeAcomodacaoEhValido(nome: string): nome is NomeAcomodacao {
    return [
        "Casal Simples",
        "Familia Simples",
        "Familia Mais",
        "Familia Super",
        "Solteiro Simples",
        "Solteiro Mais"
    ].includes(nome)
}

function aplicarDadosAcomodacao(acomodacao: Acomodacao, payload: AcomodacaoPayload): void {
    acomodacao.NomeAcomodacao = payload.nome
    acomodacao.CamaSolteiro = payload.camaSolteiro
    acomodacao.CamaCasal = payload.camaCasal
    acomodacao.Suite = payload.suite
    acomodacao.Climatizacao = payload.climatizacao
    acomodacao.Garagem = payload.garagem
}

function hospedagemParaDTO(hospedagem: Hospedagem, indice: number): HospedagemDTO {
    const armazem = Armazem.obterInstancia()
    const acomodacoes = armazem.obterAcomodacoes()
    const acomodacaoIndice = acomodacoes.indexOf(hospedagem.Acomodacao)

    return {
        id: indice + 1,
        acomodacao: acomodacaoParaDTO(hospedagem.Acomodacao, acomodacaoIndice >= 0 ? acomodacaoIndice : 0),
        hospedes: hospedagem.Hospedes.map(clienteParaDTO)
    }
}

function hospedagemPayloadValido(payload: HospedagemPayload): boolean {
    return Number.isInteger(payload.acomodacaoId) && Array.isArray(payload.hospedesIds) && payload.hospedesIds.length > 0
        && payload.hospedesIds.every((id) => Number.isInteger(id))
        && new Set(payload.hospedesIds).size === payload.hospedesIds.length
}

function validarHospedagem(
    armazem: Armazem,
    payload: HospedagemPayload,
    hospedagemAtual?: Hospedagem
): { acomodacao?: Acomodacao; hospedes?: Cliente[]; erro?: string } {
    if (!hospedagemPayloadValido(payload)) {
        return { erro: "Informe ao menos um hospede valido para a hospedagem." }
    }

    const acomodacao = armazem.buscarAcomodacaoPorId(payload.acomodacaoId)
    if (!acomodacao) {
        return { erro: "Acomodacao invalida." }
    }

    const acomodacaoEmUso = hospedagemAtual
        ? armazem.acomodacaoEstaEmUsoPorOutraHospedagem(acomodacao, hospedagemAtual)
        : armazem.acomodacaoEstaEmUso(acomodacao)

    if (acomodacaoEmUso) {
        return { erro: "A acomodacao informada ja esta vinculada a outra hospedagem ativa." }
    }

    const hospedes: Cliente[] = []

    for (const clienteId of payload.hospedesIds) {
        const cliente = armazem.buscarClientePorId(clienteId)

        if (!cliente) {
            return { erro: `Cliente ${clienteId} nao encontrado.` }
        }

        const clienteJaHospedado = hospedagemAtual
            ? armazem.clienteEstaHospedadoEmOutraHospedagem(cliente.id, hospedagemAtual)
            : armazem.clienteEstaHospedado(cliente.id)

        if (clienteJaHospedado) {
            return { erro: `O cliente ${cliente.nome} ja esta vinculado a uma hospedagem ativa.` }
        }

        hospedes.push(cliente)
    }

    return { acomodacao, hospedes }
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

    if (metodo === "GET" && segmentos.length === 1 && segmentos[0] === "acomodacoes") {
        const acomodacoes = Armazem.obterInstancia().obterAcomodacoes().map(acomodacaoParaDTO)
        responderJSON(resposta, 200, acomodacoes)
        return
    }

    if (metodo === "POST" && segmentos.length === 1 && segmentos[0] === "acomodacoes") {
        try {
            const payload = await lerCorpoJSON<AcomodacaoPayload>(requisicao)

            if (!acomodacaoPayloadValido(payload) || !nomeAcomodacaoEhValido(payload.nome)) {
                responderJSON(resposta, 400, { mensagem: "Informe dados válidos para a acomodação." })
                return
            }

            const acomodacao = new Acomodacao(
                payload.nome,
                payload.camaSolteiro,
                payload.camaCasal,
                payload.suite,
                payload.climatizacao,
                payload.garagem
            )

            const armazem = Armazem.obterInstancia()
            armazem.cadastrarAcomodacao(acomodacao)
            responderJSON(resposta, 201, acomodacaoParaDTO(acomodacao, armazem.obterAcomodacoes().length - 1))
            return
        } catch {
            responderJSON(resposta, 400, { mensagem: "Nao foi possivel processar o corpo da requisicao." })
            return
        }
    }

    if (segmentos.length === 2 && segmentos[0] === "acomodacoes") {
        const id = Number(segmentos[1])
        if (Number.isNaN(id)) {
            responderJSON(resposta, 400, { mensagem: "ID invalido." })
            return
        }

        const armazem = Armazem.obterInstancia()
        const acomodacao = armazem.buscarAcomodacaoPorId(id)

        if (!acomodacao) {
            responderJSON(resposta, 404, { mensagem: "Acomodacao nao encontrada." })
            return
        }

        if (metodo === "PUT") {
            try {
                const payload = await lerCorpoJSON<AcomodacaoPayload>(requisicao)

                if (!acomodacaoPayloadValido(payload) || !nomeAcomodacaoEhValido(payload.nome)) {
                    responderJSON(resposta, 400, { mensagem: "Informe dados validos para a acomodacao." })
                    return
                }

                aplicarDadosAcomodacao(acomodacao, payload)
                responderJSON(resposta, 200, acomodacaoParaDTO(acomodacao, id - 1))
                return
            } catch {
                responderJSON(resposta, 400, { mensagem: "Nao foi possivel processar o corpo da requisicao." })
                return
            }
        }

        if (metodo === "DELETE") {
            const removido = armazem.removerAcomodacao(id)
            if (!removido) {
                responderJSON(resposta, 400, { mensagem: "Nao foi possivel remover a acomodacao." })
                return
            }

            responderSemConteudo(resposta, 204)
            return
        }
    }

    if (metodo === "GET" && segmentos.length === 1 && segmentos[0] === "hospedagens") {
        const hospedagens = Armazem.obterInstancia().obterHospedagensAtuais().map(hospedagemParaDTO)
        responderJSON(resposta, 200, hospedagens)
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
            const payload = await lerCorpoJSON<ClientePayload>(requisicao)
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
                const payload = await lerCorpoJSON<ClientePayload>(requisicao)
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

    if (metodo === "POST" && segmentos.length === 1 && segmentos[0] === "hospedagens") {
        try {
            const payload = await lerCorpoJSON<HospedagemPayload>(requisicao)
            const armazem = Armazem.obterInstancia()
            const validacao = validarHospedagem(armazem, payload)
            if (validacao.erro || !validacao.acomodacao || !validacao.hospedes) {
                responderJSON(resposta, 400, { mensagem: validacao.erro ?? "Nao foi possivel validar a hospedagem." })
                return
            }

            const hospedagem = new Hospedagem(validacao.acomodacao)
            validacao.hospedes.forEach(cliente => hospedagem.adicionarHospede(cliente))

            armazem.cadastrarHospedagem(hospedagem)
            responderJSON(resposta, 201, hospedagemParaDTO(hospedagem, armazem.obterHospedagensAtuais().length - 1))
            return
        } catch {
            responderJSON(resposta, 400, { mensagem: "Nao foi possivel processar o corpo da requisicao." })
            return
        }
    }

    if (segmentos.length === 2 && segmentos[0] === "hospedagens") {
        const id = Number(segmentos[1])
        if (Number.isNaN(id)) {
            responderJSON(resposta, 400, { mensagem: "ID invalido." })
            return
        }

        const armazem = Armazem.obterInstancia()
        const hospedagem = armazem.buscarHospedagemPorId(id)

        if (!hospedagem) {
            responderJSON(resposta, 404, { mensagem: "Hospedagem nao encontrada." })
            return
        }

        if (metodo === "PUT") {
            try {
                const payload = await lerCorpoJSON<HospedagemPayload>(requisicao)
                const validacao = validarHospedagem(armazem, payload, hospedagem)

                if (validacao.erro || !validacao.acomodacao || !validacao.hospedes) {
                    responderJSON(resposta, 400, { mensagem: validacao.erro ?? "Nao foi possivel validar a hospedagem." })
                    return
                }

                hospedagem.Acomodacao = validacao.acomodacao
                hospedagem.limparHospedes()
                validacao.hospedes.forEach(cliente => hospedagem.adicionarHospede(cliente))

                responderJSON(resposta, 200, hospedagemParaDTO(hospedagem, id - 1))
                return
            } catch {
                responderJSON(resposta, 400, { mensagem: "Nao foi possivel processar o corpo da requisicao." })
                return
            }
        }

        if (metodo === "DELETE") {
            const removido = armazem.removerHospedagem(id)
            if (!removido) {
                responderJSON(resposta, 400, { mensagem: "Nao foi possivel remover a hospedagem." })
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

servidor.on("error", (erro: NodeJS.ErrnoException) => {
    if (erro.code === "EADDRINUSE") {
        console.error(`A porta ${PORTA} já está em uso. Finalize o processo atual ou inicie a API com outro PORT.`)
        process.exit(1)
    }

    throw erro
})

servidor.listen(PORTA, () => {
    console.log(`API Atlantis rodando em http://localhost:${PORTA}`)
})
