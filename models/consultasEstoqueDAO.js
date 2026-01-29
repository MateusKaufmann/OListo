module.exports = class consultasEstoqueDAO {
    constructor() {
        this.usuario_id = null;
    }

    setUsuarioID(id) {
        this.usuario_id = id;
    }

    buscarEstoqueUsuario(connection, callback) {
        if (!this.usuario_id) {
            return callback("usuario_invalido");
        }

        const sql = `
            SELECT
                e.id, 
                e.nome, 
                e.categoria, 
                e.unidade_medida,
                e.quantidade_ideal, 
                e.percentual_alerta, 
                e.prioridade, 
                e.consumo_mensuravel,
                (
                    SELECT DATE_FORMAT(MAX(r2.data_registro), '%Y-%m-%d')
                    FROM estoque_registros r2
                    WHERE r2.item_id = e.id AND r2.quantidade_comprada > 0
                ) AS data_ultima_compra,
                (
                    SELECT JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'data', DATE_FORMAT(r.data_registro, '%Y-%m-%d'),
                            'encontrada', r.quantidade_encontrada,
                            'resultante', r.quantidade_resultante,
                            'comprada', r.quantidade_comprada,
                            'preco', r.preco_unitario
                        )
                    )
                    FROM estoque_registros r
                    WHERE r.item_id = e.id
                    ORDER BY r.data_registro ASC
                ) AS registros
            FROM estoque_itens e
            WHERE e.usuario_id = ? AND e.ativo = TRUE
            ORDER BY e.prioridade DESC
        `;

        connection.query(sql, [this.usuario_id], (erro, resultado) => {
            if (erro) return callback(erro);

            const hojeStr = new Date().toISOString().split('T')[0];

            const itensTratados = resultado.map(item => {
                if (typeof item.registros === 'string') {
                    item.registros = JSON.parse(item.registros);
                }
                item.registros = item.registros || [];

                item.quantidade_ideal = Number(item.quantidade_ideal);
                item.percentual_alerta = Number(item.percentual_alerta);

                // ============================
                // 1️⃣ CONSUMO MÉDIO
                // ============================
                let consumoMedio = null;

                if (item.registros.length >= 2 && item.consumo_mensuravel) {
                    const consumosPorDia = [];
                    for (let i = 1; i < item.registros.length; i++) {
                        const ant = item.registros[i - 1];
                        const atu = item.registros[i];

                        const dias = (new Date(atu.data) - new Date(ant.data)) / 86400000;
                        const consumo = Number(ant.resultante) - Number(atu.encontrada);

                        if (dias > 0 && consumo >= 0) {
                            consumosPorDia.push(consumo / dias);
                        }
                    }

                    if (consumosPorDia.length > 0) {
                        consumoMedio = consumosPorDia.reduce((a, b) => a + b, 0) / consumosPorDia.length;
                    }
                }

                item.consumoMedio = consumoMedio;

                // ============================
                // 2️⃣ ESTOQUE ESTIMADO
                // ============================
                let estoqueEstimado = 0;
                let previsaoFim = "Sem previsão";
                let ultimaDeclaracao = "Nenhum registro";

                if (item.registros.length > 0) {
                    const ultimo = item.registros[item.registros.length - 1];
                    const dataUltimoStr = ultimo.data;
                    ultimaDeclaracao = `${ultimo.resultante} ${item.unidade_medida} em ${dataUltimoStr}`;
                    
                    estoqueEstimado = Number(ultimo.resultante);

                    if (hojeStr > dataUltimoStr && consumoMedio && item.consumo_mensuravel) {
                        const diffDias = Math.floor((new Date(hojeStr) - new Date(dataUltimoStr)) / 86400000);
                        estoqueEstimado -= (consumoMedio * diffDias);
                    }

                    if (estoqueEstimado < 0) estoqueEstimado = 0;

                    if (consumoMedio > 0 && estoqueEstimado > 0) {
                        const diasRestantes = estoqueEstimado / consumoMedio;
                        const dFim = new Date();
                        dFim.setDate(dFim.getDate() + Math.ceil(diasRestantes));
                        previsaoFim = dFim.toLocaleDateString('pt-BR');
                    }
                }

                item.estoqueEstimado = Number(estoqueEstimado.toFixed(2));
                item.percentualAtual = item.quantidade_ideal > 0 
                    ? Number(((estoqueEstimado / item.quantidade_ideal) * 100).toFixed(2)) 
                    : 0;
                item.abaixoDoAlerta = item.percentualAtual <= item.percentual_alerta;
                item.previsaoFim = previsaoFim;

                // ============================
                // LOG DE DEPURAÇÃO ATUALIZADO
                // ============================
                console.log(`[${item.nome.toUpperCase()}]`);
                console.log(` > Total de Atualizações: ${item.registros.length}`);
                console.log(` > Última Declaração: ${ultimaDeclaracao}`);
                console.log(` > Média de Consumo: ${item.consumoMedio ? item.consumoMedio.toFixed(4) : 'N/A'} ${item.unidade_medida}/dia`);
                console.log(` > Estoque Estimado Hoje: ${item.estoqueEstimado} ${item.unidade_medida}`);
                console.log(`-------------------------------------------`);

                return item;
            });

            callback(itensTratados);
        });
    }
};