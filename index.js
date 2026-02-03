//-------------------CARREGANDO MÓDULOS-------------------//

const express = require('express');
const mysql = require('mysql2');
const app = express();
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');
const md5 = require('md5');
const formidable = require('formidable');
const port = 3000;

//-------------------CONFIGURAÇÃO DE MÓDULOS-------------------//

app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: 'loop-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 // 1 dia
    }
}));

//-------------------BANCO DE DADOS---------------//

//<><><><><><><><><><><><>CONEXÃO COM O BANCO DE DADOS<><><><><><><><><><><><>//
const connection = mysql.createPool({
    connectionLimit: 4,
    host: "mysql-3f2310f6-mateusbkaufmann-d608.h.aivencloud.com",
    user: "avnadmin",
    password: "AVNS_rU9KmbSXihka-J3-GSL",
    database: "loop",
    port: "25420",
    ssl: {
        rejectUnauthorized: false
    }
});

connection.getConnection((err, conn) => {
    if (err) {
        console.error('❌ Erro ao conectar no MySQL:', err);
    } else {
        console.log('✅ Conectado ao MySQL da Aiven');
        conn.release();
    }
});

//<><><><><><><><><><><><>IMPORTAR MODELS<><><><><><><><><><><><>//

const credenciaisDAO = require('./models/credenciaisDAO');
const consultasEstoqueDAO = require('./models/consultasEstoqueDAO');

//-------------------ROTAS-------------------//

//rota da homepage integrada ao login
app.get('/', function (req, res) {
    if (req.session.logged == true) {
        res.redirect('/dashboard');
    } else {
        res.render('login', { data: { stts: null } });
    }
});

app.get('/logout', function (req, res) {
    req.session.destroy((err) => {
        if (err) {
            console.error('Erro ao destruir sessão:', err);
        }
        res.redirect('/');
    });
});


//post de autenticação 
app.post('/autenticar', function (req, res) {
    let usuarios = new credenciaisDAO();
    console.log(req.body);
    if (req.body.email && req.body.senha) {
        usuarios.setEmail(req.body.email);
        usuarios.setSenha(md5(req.body.senha));
        usuarios.login(connection, function (resultado) {
            if (resultado == "user_inexistente") {
                res.render('login', { data: { stts: "Usuário não encontrado." } });
            } else if (resultado == "senha_incorreta") {
                res.render('login', { data: { stts: "Senha incorreta." } });
            } else {
                req.session.data_user = resultado[0];
                req.session.logged = true;
                res.redirect('/');
            }
        });
    } else {
        res.render('login', { data: { stts: "Preencha todos os campos." } });
    }
});

app.get('/dashboard', (req, res) => {

    if (!req.session.logged) return res.redirect('/');

    const estoqueDAO = new consultasEstoqueDAO();
    estoqueDAO.setUsuarioID(req.session.data_user.id);

    estoqueDAO.buscarEstoqueUsuario(connection, itens => {
        // itens já chegam com:
        // estoqueEstimado, percentualAtual, abaixoDoAlerta, previsaoFim, consumoMedio
        res.render('dashboard', {
            data: {
                dados_usuario: req.session.data_user,
                estoque: itens
            }
        });
    });
});


app.get('/itens', (req, res) => {

    if (!req.session.logged) return res.redirect('/');

    const estoqueDAO = new consultasEstoqueDAO();
    estoqueDAO.setUsuarioID(req.session.data_user.id);

    estoqueDAO.buscarEstoqueUsuario(connection, itens => {
        res.render('todosItens', {
            data: {
                dados_usuario: req.session.data_user,
                estoque: itens,
            }
        });
    });
});

app.post('/atualizar-estoque', (req, res) => {
    if (!req.session.logged) return res.status(401).json({ success: false, message: 'Não autenticado' });

    const { itens } = req.body;
    const usuarioId = req.session.data_user.id;
    const dataRegistro = new Date().toISOString().split('T')[0];

    if (!itens || itens.length === 0) {
        return res.json({ success: false, message: 'Nenhum item para atualizar' });
    }

    const queries = itens.map(item => {
        return new Promise((resolve, reject) => {
            const sql = `
                INSERT INTO estoque_registros 
                (usuario_id, item_id, data_registro, quantidade_prevista, quantidade_encontrada, quantidade_comprada, preco_unitario, quantidade_resultante)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;
            const values = [
                usuarioId,
                item.item_id,
                dataRegistro,
                item.quantidade_prevista,
                item.quantidade_encontrada,
                item.quantidade_comprada,
                item.preco_unitario || 0,
                item.quantidade_resultante
            ];

            connection.query(sql, values, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    });

    Promise.all(queries)
        .then(() => {
            res.json({ success: true, message: 'Estoque atualizado com sucesso' });
        })
        .catch(err => {
            console.error('Erro ao atualizar estoque:', err);
            res.json({ success: false, message: 'Erro ao salvar no banco de dados' });
        });
});

app.get('/api/item/:id', (req, res) => {
    if (!req.session.logged) return res.status(401).json({ success: false, message: 'Não autenticado' });

    const itemId = req.params.id;
    const usuarioId = req.session.data_user.id;

    const sql = 'SELECT * FROM estoque_itens WHERE id = ? AND usuario_id = ?';
    connection.query(sql, [itemId, usuarioId], (err, resultado) => {
        if (err) {
            console.error('Erro ao buscar item:', err);
            return res.status(500).json({ success: false, message: 'Erro ao buscar item' });
        }
        if (resultado.length === 0) {
            return res.status(404).json({ success: false, message: 'Item não encontrado' });
        }
        res.json(resultado[0]);
    });
});

app.post('/api/item', (req, res) => {
    if (!req.session.logged) return res.status(401).json({ success: false, message: 'Não autenticado' });

    const usuarioId = req.session.data_user.id;
    const { nome, categoria, unidade_medida, quantidade_ideal, percentual_alerta, prioridade, consumo_mensuravel } = req.body;

    const sqlItem = `
        INSERT INTO estoque_itens 
        (usuario_id, nome, categoria, unidade_medida, quantidade_ideal, percentual_alerta, prioridade, consumo_mensuravel, ativo)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE)
    `;

    connection.query(sqlItem, [usuarioId, nome, categoria, unidade_medida, quantidade_ideal, percentual_alerta, prioridade, consumo_mensuravel], (err, resultado) => {
        if (err) {
            console.error('Erro ao criar item:', err);
            return res.status(500).json({ success: false, message: 'Erro ao criar item' });
        }

        const novoItemId = resultado.insertId;
        const dataRegistro = new Date().toISOString().split('T')[0];
        
        const sqlRegistro = `
            INSERT INTO estoque_registros 
            (usuario_id, item_id, data_registro, quantidade_prevista, quantidade_encontrada, quantidade_comprada, preco_unitario, quantidade_resultante)
            VALUES (?, ?, ?, 0, 0, 0, 0, 0)
        `;

        connection.query(sqlRegistro, [usuarioId, novoItemId, dataRegistro], (err2) => {
            if (err2) {
                console.error('Erro ao criar registro inicial:', err2);
                return res.status(500).json({ success: false, message: 'Item criado, mas erro ao criar registro inicial' });
            }
            res.json({ success: true, message: 'Item adicionado com sucesso', itemId: novoItemId });
        });
    });
});

app.put('/api/item/:id', (req, res) => {
    if (!req.session.logged) return res.status(401).json({ success: false, message: 'Não autenticado' });

    const itemId = req.params.id;
    const usuarioId = req.session.data_user.id;
    const { nome, categoria, unidade_medida, quantidade_ideal, percentual_alerta, prioridade, consumo_mensuravel } = req.body;

    const sql = `
        UPDATE estoque_itens 
        SET nome = ?, categoria = ?, unidade_medida = ?, quantidade_ideal = ?, 
            percentual_alerta = ?, prioridade = ?, consumo_mensuravel = ?
        WHERE id = ? AND usuario_id = ?
    `;

    connection.query(sql, [nome, categoria, unidade_medida, quantidade_ideal, percentual_alerta, prioridade, consumo_mensuravel, itemId, usuarioId], (err, resultado) => {
        if (err) {
            console.error('Erro ao atualizar item:', err);
            return res.status(500).json({ success: false, message: 'Erro ao atualizar item' });
        }
        if (resultado.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Item não encontrado' });
        }
        res.json({ success: true, message: 'Item atualizado com sucesso' });
    });
});

app.delete('/api/item/:id', (req, res) => {
    if (!req.session.logged) return res.status(401).json({ success: false, message: 'Não autenticado' });

    const itemId = req.params.id;
    const usuarioId = req.session.data_user.id;

    const sql = 'DELETE FROM estoque_itens WHERE id = ? AND usuario_id = ?';
    connection.query(sql, [itemId, usuarioId], (err, resultado) => {
        if (err) {
            console.error('Erro ao excluir item:', err);
            return res.status(500).json({ success: false, message: 'Erro ao excluir item' });
        }
        if (resultado.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Item não encontrado' });
        }
        res.json({ success: true, message: 'Item excluído com sucesso' });
    });
});





app.listen(port, () => {
    console.log(`Sistema inicializado no endereço http://localhost:${port}`);
});

app.get('/cadastrar', (req, res) => {
    res.render('cadastrar')
});