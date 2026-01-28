-- =========================
-- RESET TOTAL (SEM DÓ)
-- =========================
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS estoque_registros;
DROP TABLE IF EXISTS estoque_itens;
DROP TABLE IF EXISTS compras_itens;
DROP TABLE IF EXISTS usuarios;

SET FOREIGN_KEY_CHECKS = 1;

-- =========================
-- USUÁRIOS
-- =========================
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha CHAR(32) NOT NULL
);

-- =========================
-- ITENS DO ESTOQUE
-- =========================
CREATE TABLE estoque_itens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,

    nome VARCHAR(100) NOT NULL,
    categoria VARCHAR(50),
    unidade_medida VARCHAR(20),

    quantidade_ideal DECIMAL(10,2) NOT NULL,
    percentual_alerta DECIMAL(5,2) NOT NULL,

    prioridade TINYINT NOT NULL DEFAULT 2,
    -- 1 baixa | 2 média | 3 alta | 4 crítica

    consumo_mensuravel BOOLEAN NOT NULL DEFAULT TRUE,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT fk_estoque_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE
);

-- =========================
-- REGISTROS DE ESTOQUE (APRENDIZADO)
-- =========================
CREATE TABLE estoque_registros (
    id INT AUTO_INCREMENT PRIMARY KEY,

    usuario_id INT NOT NULL,
    item_id INT NOT NULL,

    data_registro DATE NOT NULL,

    -- O que o sistema ACHAVA que tinha
    quantidade_prevista DECIMAL(10,2) NOT NULL,

    -- O que o usuário DISSE que realmente tinha
    quantidade_encontrada DECIMAL(10,2) NOT NULL,

    -- O quanto foi comprado no mercado
    quantidade_comprada DECIMAL(10,2) NOT NULL,

    -- VALOR UNITÁRIO DA COMPRA (NOVIDADE)
    preco_unitario DECIMAL(10,2) NOT NULL DEFAULT 0.00,

    -- Quantidade final no armário (encontrada + comprada)
    quantidade_resultante DECIMAL(10,2) NOT NULL,

    CONSTRAINT fk_registro_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_registro_item
        FOREIGN KEY (item_id)
        REFERENCES estoque_itens(id)
        ON DELETE CASCADE
);

-- =========================
-- DADOS DE TESTE
-- =========================

-- Usuário
INSERT INTO usuarios (nome, email, senha)
VALUES ('Ap 920', 'luma@gmail.com', '21692ca6b24df43d5a0c30e64e8867f1');


INSERT INTO estoque_itens (usuario_id, nome, categoria, unidade_medida, quantidade_ideal, percentual_alerta, prioridade, consumo_mensuravel, ativo) VALUES
-- ALIMENTOS (TRUE)
(1,'Arroz Integral','Alimentos','kg',5,20,3,TRUE,TRUE),
(1,'Feijão Preto','Alimentos','kg',4,25,3,TRUE,TRUE),
(1,'Açúcar','Alimentos','kg',3,30,2,TRUE,TRUE),
(1,'Café Gourmet','Alimentos','pacote',4,30,4,TRUE,TRUE),
(1,'Óleo de Soja','Alimentos','L',3,25,3,TRUE,TRUE),
(1,'Azeite Extra','Alimentos','unidade',2,40,2,TRUE,TRUE),
(1,'Macarrão','Alimentos','pacote',5,30,2,TRUE,TRUE),
(1,'Leite Integral','Alimentos','unidade',12,25,4,TRUE,TRUE),
(1,'Ovos','Alimentos','dúzia',3,40,3,TRUE,TRUE),
(1,'Peito Frango','Alimentos','kg',4,30,3,TRUE,TRUE),
(1,'Pão Forma','Alimentos','pacote',2,50,3,TRUE,TRUE),
(1,'Manteiga','Alimentos','unidade',2,30,3,TRUE,TRUE),
(1,'Iogurte','Alimentos','unidade',6,30,2,TRUE,TRUE),
(1,'Queijo','Alimentos','kg',1,40,3,TRUE,TRUE),
(1,'Presunto','Alimentos','kg',1,40,2,TRUE,TRUE),
(1,'Cebola','Alimentos','kg',2,40,2,TRUE,TRUE),
(1,'Alho','Alimentos','pacote',1,50,2,TRUE,TRUE),
(1,'Batata','Alimentos','kg',5,30,2,TRUE,TRUE),
(1,'Cenoura','Alimentos','kg',2,30,2,TRUE,TRUE),
(1,'Maionese','Alimentos','unidade',2,30,2,TRUE,TRUE),
-- HIGIENE (TRUE)
(1,'Papel Higiênico','Higiene','unidade',12,30,4,TRUE,TRUE),
(1,'Sabonete','Higiene','unidade',8,30,3,TRUE,TRUE),
(1,'Creme Dental','Higiene','unidade',4,40,4,TRUE,TRUE),
(1,'Shampoo','Higiene','unidade',2,30,2,TRUE,TRUE),
(1,'Desodorante','Higiene','unidade',3,30,3,TRUE,TRUE),
(1,'Condicionador','Higiene','unidade',2,30,2,TRUE,TRUE),
(1,'Absorvente','Higiene','pacote',3,40,3,TRUE,TRUE),
(1,'Enxaguante','Higiene','unidade',2,30,2,TRUE,TRUE),
(1,'Papel Toalha','Higiene','unidade',4,30,2,TRUE,TRUE),
(1,'Guardanapo','Higiene','pacote',3,30,1,TRUE,TRUE),
-- LIMPEZA (TRUE)
(1,'Sabão Pó','Limpeza','kg',3,30,3,TRUE,TRUE),
(1,'Detergente','Limpeza','unidade',5,30,3,TRUE,TRUE),
(1,'Água Sanitária','Limpeza','L',2,50,3,TRUE,TRUE),
(1,'Amaciante','Limpeza','L',2,30,2,TRUE,TRUE),
(1,'Desinfetante','Limpeza','L',3,30,2,TRUE,TRUE),
(1,'Limpador Multi','Limpeza','unidade',3,30,2,TRUE,TRUE),
(1,'Sabão Líquido','Limpeza','L',3,30,3,TRUE,TRUE),
(1,'Saco Lixo 50L','Limpeza','pacote',3,30,3,TRUE,TRUE),
(1,'Saco Lixo 30L','Limpeza','pacote',3,30,2,TRUE,TRUE),
(1,'Esponja Louça','Limpeza','unidade',4,40,2,TRUE,TRUE),
-- OUTROS / REPOSIÇÃO (FALSE - Não Mensurável)
(1,'Lâmpada LED','Outro','unidade',4,50,2,FALSE,TRUE),
(1,'Pilha AA','Outro','unidade',8,25,2,FALSE,TRUE),
(1,'Pilha AAA','Outro','unidade',8,25,2,FALSE,TRUE),
(1,'Vinho Tinto','Outro','unidade',4,25,1,FALSE,TRUE),
(1,'Whisky','Outro','unidade',1,20,1,FALSE,TRUE),
(1,'Inseticida','Limpeza','unidade',2,50,2,FALSE,TRUE),
(1,'Repelente','Higiene','unidade',2,50,2,FALSE,TRUE),
(1,'Fita Isolante','Outro','unidade',1,100,1,FALSE,TRUE),
(1,'Fita Crepe','Outro','unidade',1,100,1,FALSE,TRUE),
(1,'Filtro Barro','Outro','unidade',2,50,1,FALSE,TRUE),
(1,'Resistência','Outro','unidade',1,100,3,FALSE,TRUE),
(1,'Vela Filtro','Outro','unidade',2,50,2,FALSE,TRUE),
(1,'Fio Dental','Higiene','unidade',2,20,2,FALSE,TRUE),
(1,'Algodão','Higiene','unidade',1,20,1,FALSE,TRUE),
(1,'Mel','Alimentos','unidade',1,20,2,FALSE,TRUE),
(1,'Fermento','Alimentos','unidade',1,50,2,FALSE,TRUE),
(1,'Vinagre Maçã','Alimentos','unidade',1,30,2,FALSE,TRUE),
(1,'Esponja Aço','Limpeza','pacote',2,30,1,FALSE,TRUE),
(1,'Sal Refinado','Alimentos','kg',2,50,2,FALSE,TRUE),
(1,'Cabo HDMI','Outro','unidade',1,50,1,FALSE,TRUE),
-- COMPLETANDO 80 ITENS (TRUE)
(1,'Cereal','Alimentos','pacote',2,30,2,TRUE,TRUE),
(1,'Aveia','Alimentos','unidade',2,30,2,TRUE,TRUE),
(1,'Chá','Alimentos','caixa',3,20,1,TRUE,TRUE),
(1,'Gelatina','Alimentos','pacote',6,20,1,TRUE,TRUE),
(1,'Leite Cond.','Alimentos','unidade',4,30,2,TRUE,TRUE),
(1,'Creme Leite','Alimentos','unidade',4,30,2,TRUE,TRUE),
(1,'Chocolate Pó','Alimentos','unidade',1,30,2,TRUE,TRUE),
(1,'Atum Lata','Alimentos','unidade',4,30,2,TRUE,TRUE),
(1,'Sardinha Lata','Alimentos','unidade',4,30,1,TRUE,TRUE),
(1,'Ervilha','Alimentos','unidade',3,30,1,TRUE,TRUE),
(1,'Milho Conserva','Alimentos','unidade',3,30,1,TRUE,TRUE),
(1,'Farinha Trigo','Alimentos','kg',2,30,2,TRUE,TRUE),
(1,'Farinha Mand.','Alimentos','kg',1,30,2,TRUE,TRUE),
(1,'Milho Pipoca','Alimentos','pacote',2,20,1,TRUE,TRUE),
(1,'Batata Doce','Alimentos','kg',3,30,2,TRUE,TRUE),
(1,'Ketchup','Alimentos','unidade',1,30,1,TRUE,TRUE),
(1,'Mostarda','Alimentos','unidade',1,30,1,TRUE,TRUE),
(1,'Biscoito Sal','Alimentos','pacote',3,30,2,TRUE,TRUE),
(1,'Cerveja','Outro','unidade',12,30,1,TRUE,TRUE),
(1,'Suco','Alimentos','L',4,30,2,TRUE,TRUE);

-- ==========================================================
-- FORÇA TAREFA: CARGA MASSIVA DE EVENTOS (320+ REGISTROS)
-- ==========================================================


-- 1. CARGA INICIAL (Garante preço para TODOS os 80 itens)
-- Isso evita "Preço não disponível" no sistema
INSERT INTO estoque_registros (usuario_id, item_id, data_registro, quantidade_prevista, quantidade_encontrada, quantidade_comprada, preco_unitario, quantidade_resultante) VALUES
(1,1,'2025-08-01',5,0,5,18.90,5), (1,2,'2025-08-01',4,0,4,7.50,4), (1,3,'2025-08-01',3,0,3,4.20,3), (1,4,'2025-08-01',4,0,4,14.50,4),
(1,5,'2025-08-01',3,0,3,7.90,3), (1,6,'2025-08-01',2,0,2,26.00,2), (1,7,'2025-08-01',5,0,5,3.50,5), (1,8,'2025-08-01',12,0,12,3.80,12),
(1,9,'2025-08-01',3,0,3,9.50,3), (1,10,'2025-08-01',4,0,4,22.00,4), (1,11,'2025-08-01',12,0,12,16.90,12), (1,12,'2025-08-01',8,0,8,2.10,8),
(1,13,'2025-08-01',4,0,4,4.50,4), (1,14,'2025-08-01',2,0,2,14.00,2), (1,15,'2025-08-01',3,0,3,9.90,3), (1,16,'2025-08-01',3,0,3,15.00,3),
(1,17,'2025-08-01',2,0,2,28.00,2), (1,18,'2025-08-01',2,0,2,11.50,2), (1,19,'2025-08-01',3,0,3,16.00,3), (1,20,'2025-08-01',4,0,4,5.50,4),
(1,21,'2025-08-01',12,0,12,18.50,12), (1,22,'2025-08-01',8,0,8,2.50,8), (1,23,'2025-08-01',4,0,4,5.80,4), (1,24,'2025-08-01',2,0,2,14.50,2),
(1,25,'2025-08-01',3,0,3,9.80,3), (1,26,'2025-08-01',2,0,2,13.50,2), (1,27,'2025-08-01',3,0,3,15.90,3), (1,28,'2025-08-01',2,0,2,10.20,2),
(1,29,'2025-08-01',4,0,4,4.90,4), (1,30,'2025-08-01',3,0,3,2.50,3), (1,31,'2025-08-01',3,0,3,12.50,3), (1,32,'2025-08-01',5,0,5,1.95,5),
(1,33,'2025-08-01',2,0,2,6.50,2), (1,34,'2025-08-01',2,0,2,10.90,2), (1,35,'2025-08-01',3,0,3,8.50,3), (1,36,'2025-08-01',3,0,3,12.00,3),
(1,37,'2025-08-01',3,0,3,15.90,3), (1,38,'2025-08-01',3,0,3,12.50,3), (1,39,'2025-08-01',3,0,3,8.90,3), (1,40,'2025-08-01',4,0,4,2.20,4),
(1,41,'2025-08-01',4,0,4,9.90,4), (1,42,'2025-08-01',8,0,8,12.50,8), (1,43,'2025-08-01',8,0,8,12.50,8), (1,44,'2025-08-01',4,0,4,35.00,4),
(1,45,'2025-08-01',1,0,1,180.00,1), (1,46,'2025-08-01',2,0,2,9.50,2), (1,47,'2025-08-01',2,0,2,15.90,2), (1,48,'2025-08-01',1,0,1,12.00,1),
(1,49,'2025-08-01',1,0,1,8.50,1), (1,50,'2025-08-01',2,0,2,19.90,2), (1,51,'2025-08-01',1,0,1,45.00,1), (1,52,'2025-08-01',2,0,2,22.00,2),
(1,53,'2025-08-01',2,0,2,7.50,2), (1,54,'2025-08-01',1,0,1,9.80,1), (1,55,'2025-08-01',1,0,1,18.00,1), (1,56,'2025-08-01',1,0,1,6.50,1),
(1,57,'2025-08-01',1,0,1,5.20,1), (1,58,'2025-08-01',2,0,2,3.50,2), (1,59,'2025-08-01',2,0,2,2.80,2), (1,60,'2025-08-01',1,0,1,32.00,1),
(1,61,'2025-08-01',2,0,2,11.50,2), (1,62,'2025-08-01',2,0,2,7.90,2), (1,63,'2025-08-01',3,0,3,4.50,3), (1,64,'2025-08-01',6,0,6,2.20,6),
(1,65,'2025-08-01',4,0,4,5.90,4), (1,66,'2025-08-01',4,0,4,4.20,4), (1,67,'2025-08-01',1,0,1,12.50,1), (1,68,'2025-08-01',4,0,4,7.80,4),
(1,69,'2025-08-01',4,0,4,4.50,4), (1,70,'2025-08-01',3,0,3,3.20,3), (1,71,'2025-08-01',3,0,3,3.20,3), (1,72,'2025-08-01',2,0,2,6.50,2),
(1,73,'2025-08-01',1,0,1,8.90,1), (1,74,'2025-08-01',2,0,2,4.50,2), (1,75,'2025-08-01',3,0,3,6.20,3), (1,76,'2025-08-01',1,0,1,8.50,1),
(1,77,'2025-08-01',1,0,1,6.20,1), (1,78,'2025-08-01',3,0,3,4.10,3), (1,79,'2025-08-01',12,0,12,3.20,12), (1,80,'2025-08-01',4,0,4,6.50,4);

-- 2. HISTÓRICO DE REPOSIÇÃO (Itens Essenciais - Compras Mensais)
-- Simulando compras de Setembro, Outubro, Novembro e Dezembro
INSERT INTO estoque_registros (usuario_id, item_id, data_registro, quantidade_prevista, quantidade_encontrada, quantidade_comprada, preco_unitario, quantidade_resultante) VALUES
-- Arroz
(1,1,'2025-10-05',5,1,4,19.50,5), (1,1,'2025-12-05',5,1,4,21.00,5),
-- Feijão
(1,2,'2025-10-05',4,0.5,4,8.20,4.5), (1,2,'2025-12-05',4,1,3,9.50,4),
-- Café (Quinzenal)
(1,4,'2025-09-01',4,1,3,15.20,4), (1,4,'2025-10-01',4,0.5,4,16.50,4.5), (1,4,'2025-11-01',4.5,1,3,17.90,4), (1,4,'2025-12-01',4,0.8,4,19.20,4.8), (1,4,'2026-01-01',4.8,1,3,20.50,4),
-- Leite (Semanal)
(1,8,'2025-11-01',12,2,12,4.10,14), (1,8,'2025-11-08',14,4,10,4.25,14), (1,8,'2025-11-15',14,3,12,4.40,15), (1,8,'2025-11-22',15,5,10,4.60,15),
(1,8,'2025-12-01',15,4,12,4.80,16), (1,8,'2025-12-08',16,6,10,5.00,16), (1,8,'2025-12-15',16,5,12,5.20,17), (1,8,'2026-01-05',17,4,12,5.40,16),
-- Papel Higiênico
(1,11,'2025-10-15',12,2,12,18.00,14), (1,11,'2025-12-15',14,3,12,21.50,15),
-- Ovos
(1,9,'2025-11-05',3,0.5,3,10.20,3.5), (1,9,'2025-12-05',3.5,1,3,11.50,4), (1,9,'2026-01-05',4,0.5,3,12.90,3.5),
-- Detergente
(1,32,'2025-11-10',5,1,4,2.10,5), (1,32,'2025-12-10',5,0.5,5,2.40,5.5), (1,32,'2026-01-10',5.5,1,4,2.70,5),
-- Sabão Pó
(1,31,'2025-11-15',3,0.5,3,14.50,3.5), (1,31,'2026-01-15',3.5,1,3,17.20,4);

-- 3. REPOSIÇÃO DE ITENS "OUTROS" (Falso Mensurável)
-- Compras esporádicas para garantir preço médio
INSERT INTO estoque_registros (usuario_id, item_id, data_registro, quantidade_prevista, quantidade_encontrada, quantidade_comprada, preco_unitario, quantidade_resultante) VALUES
(1,44,'2025-11-01',4,1,3,38.00,4), (1,44,'2026-01-10',4,2,2,42.00,4), -- Vinho
(1,41,'2025-10-10',4,3,1,11.90,4), (1,41,'2025-12-15',4,2,2,13.50,4), -- Lâmpada
(1,51,'2025-11-20',1,0,1,49.90,1), -- Resistência
(1,79,'2026-01-10',12,4,12,3.50,16), (1,79,'2026-01-20',16,6,12,3.80,18); -- Cerveja

-- 4. ESTADO ATUAL (Auditoria de Jan/2026 - Críticos e Alertas)
-- Isso vai fazer o Dashboard brilhar com itens precisando de compra
INSERT INTO estoque_registros (usuario_id, item_id, data_registro, quantidade_prevista, quantidade_encontrada, quantidade_comprada, preco_unitario, quantidade_resultante) VALUES
(1,1,'2026-01-28',5,0.8,0,0,0.8),    -- Arroz (Crítico)
(1,8,'2026-01-28',16,2.5,0,0,2.5),   -- Leite (Crítico)
(1,4,'2026-01-28',4,0.4,0,0,0.4),    -- Café (Crítico)
(1,11,'2026-01-28',15,3.2,0,0,3.2),  -- Papel Hig. (Crítico)
(1,9,'2026-01-28',3.5,0.6,0,0,0.6),  -- Ovos (Crítico)
(1,32,'2026-01-28',5,0.5,0,0,0.5),   -- Detergente (Crítico)
(1,12,'2026-01-28',8,2.1,0,0,2.1),   -- Sabonete (Alerta)
(1,13,'2026-01-28',4,1.2,0,0,1.2),   -- Creme Dental (Alerta)
(1,21,'2026-01-28',12,3.5,0,0,3.5),  -- Batata (Alerta)
(1,16,'2026-01-28',3,0.8,0,0,0.8),   -- Cebola (Crítico)
(1,17,'2026-01-28',2,0.3,0,0,0.3),   -- Alho (Crítico)
(1,41,'2026-01-28',4,1.0,0,0,1.0),   -- Lâmpada (Outro - Crítico)
(1,44,'2026-01-28',4,0.5,0,0,0.5);   -- Vinho (Outro - Crítico)