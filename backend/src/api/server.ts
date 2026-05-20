import { createServer, IncomingMessage, ServerResponse } from "http"
import { carregarDadosIniciais } from "../dados/dadosIniciais"
import Armazem from "../armazenamento/armazem"
import Cliente from "../modelos/cliente"

const PORTA = 3333

type ClienteDTO = {
    id: number
    nome: string
    nomeSocial: string
    dataNascimento: string
    dataCadastro: string
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

function responderJSON(resposta: ServerResponse, statusCode: number, body: unknown): void {
    resposta.writeHead(statusCode, {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
    })
    resposta.end(JSON.stringify(body))
}

function clienteParaDTO(cliente: Cliente): ClienteDTO {
    return {
        id: cliente.id,
        nome: cliente.nome,
        nomeSocial: cliente.nomeSocial,
        dataNascimento: cliente.dataNascimento.toISOString(),
        dataCadastro: cliente.dataCadastro.toISOString(),
        ehDependente: cliente.ehDependente,
        titularId: cliente.titular?.id,
        dependentesIds: cliente.dependentes.map(dependente => dependente.id),
        telefones: cliente.telefones.map(telefone => ({
            ddd: telefone.ddd,
            numero: telefone.numero
        })),
        documentos: cliente.documentos.map(documento => ({
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

carregarDadosIniciais()

const servidor = createServer((requisicao: IncomingMessage, resposta: ServerResponse) => {
    const metodo = requisicao.method ?? "GET"
    const url = requisicao.url ?? "/"

    if (metodo === "OPTIONS") {
        responderJSON(resposta, 204, null)
        return
    }

    if (metodo === "GET" && url === "/health") {
        responderJSON(resposta, 200, { status: "ok" })
        return
    }

    if (metodo === "GET" && url === "/clientes") {
        const clientes = Armazem.obterInstancia().obterClientes().map(clienteParaDTO)
        responderJSON(resposta, 200, clientes)
        return
    }

    responderJSON(resposta, 404, { mensagem: "Rota nao encontrada" })
})

servidor.listen(PORTA, () => {
    console.log(`API Atlantis rodando em http://localhost:${PORTA}`)
})
