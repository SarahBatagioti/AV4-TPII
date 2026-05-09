import Menu from "../interfaces/menu"
import OpcaoMenu from "../menus/opcaoMenu"
import { carregarDadosIniciais } from "../dados/dadosIniciais"
import AtualizarCliente from "../processos/atualizarCliente"
import CadastrarDependente from "../processos/cadastrarDependente"
import CadastrarHospedagem from "../processos/cadastrarHospedagem"
import CadastrarTitular from "../processos/cadastrarTitular"
import ListarAcomodacoes from "../processos/listarAcomodacoes"
import ListarClientes from "../processos/listarClientes"
import ListarDependentesDeTitular from "../processos/listarDependentesDeTitular"
import ListarHospedagens from "../processos/listarHospedagens"
import ListarTitularDeDependente from "../processos/listarTitularDeDependente"
import RemoverCliente from "../processos/removerCliente"
import Entrada from "./entrada"

carregarDadosIniciais()

const emCI = !!process.env.CI && process.env.CI.toLowerCase() !== 'false'
const entrada = new Entrada()

const opcoes: Map<number, Menu> = new Map([
    [1, new OpcaoMenu('Cadastrar cliente titular', new CadastrarTitular())],
    [2, new OpcaoMenu('Cadastrar cliente dependente', new CadastrarDependente())],
    [3, new OpcaoMenu('Listar todos os clientes', new ListarClientes())],
    [4, new OpcaoMenu('Atualizar cliente', new AtualizarCliente())],
    [5, new OpcaoMenu('Remover cliente', new RemoverCliente())],
    [6, new OpcaoMenu('Listar dependentes de um titular', new ListarDependentesDeTitular())],
    [7, new OpcaoMenu('Listar titular de um dependente', new ListarTitularDeDependente())],
    [8, new OpcaoMenu('Listar acomodacoes', new ListarAcomodacoes())],
    [9, new OpcaoMenu('Registrar hospedagem', new CadastrarHospedagem())],
    [10, new OpcaoMenu('Listar hospedagens atuais', new ListarHospedagens())]
])

function exibirCabecalho(): void {
    console.log('==========================================================')
    console.log('Atlantis - Simplifique sua gestao, mergulhe na eficiencia')
    console.log('==========================================================')
}

function exibirMenu(): void {
    opcoes.forEach((menu, indice) => console.log(`${indice} - ${menu.titulo}`))
    console.log('0 - Sair')
}

function executarModoCI(): void {
    exibirCabecalho()
    console.log('Execucao em CI detectada. Resumo inicial do sistema:')
    new ListarAcomodacoes().processar()
    new ListarClientes().processar()
    new ListarHospedagens().processar()
}

function executarModoInterativo(): void {
    exibirCabecalho()
    let executando = true

    while (executando) {
        console.log('')
        exibirMenu()
        const opcao = entrada.receberNumero('Escolha uma opcao')

        if (opcao === 0) {
            executando = false
            console.log('Encerrando o Atlantis CLI.')
            continue
        }

        const menu = opcoes.get(opcao)
        if (!menu) {
            console.log('Opcao invalida.')
            continue
        }

        menu.executar()
    }
}

if (emCI) {
    executarModoCI()
} else {
    executarModoInterativo()
}
