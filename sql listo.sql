-- ===============================
-- TABELA USUÁRIOS
-- ===============================
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha CHAR(32) NOT NULL -- MD5 gerado no backend
);

-- ===============================
-- TABELA ESTOQUES (1 por usuário)
-- ===============================
CREATE TABLE estoques (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,

    nome VARCHAR(100) NOT NULL DEFAULT 'Meu Estoque',
    ultima_revisao DATETIME NULL,

    CONSTRAINT fk_estoque_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE
);

-- ===============================
-- TABELA ITENS DO ESTOQUE
-- ===============================
CREATE TABLE itens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    estoque_id INT NOT NULL,

    nome VARCHAR(100) NOT NULL,
    categoria VARCHAR(50) NOT NULL,

    unidade_medida ENUM('unidade','g','kg','ml','l','pacote') NOT NULL,

    quantidade_ideal DECIMAL(10,2) NOT NULL,
    estoque_atual DECIMAL(10,2) NOT NULL,

    -- Controle de consumo simples
    duracao_total_dias INT NULL, -- 100% → 0% em X dias
    percentual_alerta INT NOT NULL DEFAULT 30,

    ultima_compra DATE NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT fk_item_estoque
        FOREIGN KEY (estoque_id)
        REFERENCES estoques(id)
        ON DELETE CASCADE
);

INSERT INTO usuarios (nome, email, senha)
VALUES ('Mateus Kaufmann', 'mateusbkaufmann@gmail.com', '81dc9bdb52d04dc20036dbd8313ed055');
