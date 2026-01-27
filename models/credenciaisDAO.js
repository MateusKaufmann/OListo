module.exports = class UsuariosDAO {
    constructor() {
        //Usado no login e cadastro
        this.email = null;
        this.senha = null;
        //Usado somente no cadastro
        this.nome_completo = null;
        this.senhaConfirma = null;
        //Usado somente na página do perfil
        this.id = null;
    }
    setEmail(e) {
        this.email = e;
    }
    setSenha(s) {
        this.senha = s;
    }
    setNome_Completo(n) {
        this.nome_completo = n;
    }
    setSenha_Confirma(sc) {
        this.senhaConfirma = sc;
    }
    setID(id) {
        this.id = id;
    }
    //Fazer Login
    login(connection, callback) {
        console.log("Modulo LoginDAO inciado");
        console.log(this.email);
        console.log(this.senha);
        if (this.email && this.senha) {
            connection.query("select * from usuarios where email=?", [this.email], (erro, resultado) => {
                if (erro) throw erro;
                if (!resultado[0]) {
                    return callback("user_inexistente");
                } else {
                    if (resultado[0]['senha'] == this.senha) {
                        return callback(resultado);
                    } else {
                        return callback("senha_incorreta");
                    }
                }

            });
        } else {
            return callback("campos_invalidos");
        }
    };
    //Cadastro de novo usuário
    cadastro(connection, callback) {
        connection.query("select * from usuarios where email=?", [this.email], (erro, resultado) => {
            if (erro) throw erro;
            if (resultado[0]) {
                return callback("user_existente");
            } else {
                let caminho_foto = 'uploads/fotos/padraoProfile.png';

                connection.query("insert usuarios (id, email, `senha`, apelido, nome_completo, data_nascimento, data_ingresso, biografia, caminho_foto, administrador) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [null, this.email, this.senha, this.apelido, this.nome_completo, this.data_nascimento, this.dataAtual, this.biografia, caminho_foto, false], (erro) => {
                    if (erro) throw erro;
                    connection.query("select * from usuarios where email=?", [this.email], (erro, resultado) => {
                        if (erro) throw erro;
                        return callback(resultado);
                    });

                })


            }
        });
    };
    //Busca por usuário na tela de perfil
    busca(connection, callback) {
        connection.query("select * from usuarios where id=?", [this.id], (erro, dados_perfil) => {
            if (erro) throw erro;
            if (!dados_perfil[0]) {
                return callback("user_inexistente");
            } else {
                return callback(dados_perfil);
            }
        });
    };
    //Atualização da foto do usuário
    atualizarFoto(connection, callback) {
        connection.query("UPDATE usuarios SET caminho_foto =? WHERE id = ?", [this.caminho_foto, this.id], (erro) => {
            if (erro) throw erro;
            return callback(true);
        });
    };
    //Atualização de dados do usuário
    atualizarDados(connection, callback) {
        if (this.senha) {
            connection.query("update usuarios set biografia = ?, senha = ?, apelido = ? where id = ?", [this.biografia, this.senha, this.apelido, this.id], (erro) => {
                if (erro) throw erro;
                return callback(true);
            });
        } else {
            connection.query("update usuarios set biografia = ?, apelido = ? where id = ?", [this.biografia, this.apelido, this.id], (erro) => {
                if (erro) throw erro;
                return callback(true);
            });
        };
    };
    //Busca por usuários administradores na tela de conteúdos de uma disciplina
    buscaAdmin(connection, callback) {
        connection.query("select * from usuarios where administrador = true", (erro, users) => {
            if (erro) throw erro;
            return callback(users);

        });
    };

}
