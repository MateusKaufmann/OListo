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







app.listen(port, () => {
    console.log(`Sistema inicializado no endereço http://localhost:${port}`);
});

app.get('/cadastrar', (req, res) => {
    res.render('cadastrar')
});