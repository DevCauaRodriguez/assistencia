-- =====================================================================
-- Schema do banco de dados: Sistema de Assistencia Automotiva
-- Derivado das queries SQL presentes nos controllers do backend.
-- SGBD alvo: MySQL 8+ (mysql2)
-- =====================================================================

CREATE DATABASE IF NOT EXISTS assistencia_auto
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE assistencia_auto;

-- =====================================================================
-- Tabelas base (sem dependencias de FK)
-- =====================================================================

-- Usuarios do sistema (operadores, tecnicos, administradores)
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  perfil ENUM('administrador', 'tecnico') NOT NULL DEFAULT 'tecnico',
  especializacao VARCHAR(255) NULL,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Prestadores de servico (empresas terceiras que executam os atendimentos)
CREATE TABLE IF NOT EXISTS prestadores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  cnpj VARCHAR(20) NOT NULL UNIQUE,
  telefone VARCHAR(20) NULL,
  email VARCHAR(255) NULL,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Categorias de chamado (tipo de servico)
CREATE TABLE IF NOT EXISTS categorias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL UNIQUE,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Solicitantes (clientes/cooperados que abrem os chamados)
CREATE TABLE IF NOT EXISTS solicitantes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  cpf_cnpj VARCHAR(20) NOT NULL UNIQUE,
  telefone VARCHAR(20) NOT NULL,
  cooperativa VARCHAR(255) NULL,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Configuracao de SLA por prioridade
CREATE TABLE IF NOT EXISTS sla_config (
  id INT AUTO_INCREMENT PRIMARY KEY,
  prioridade ENUM('Imediata', 'Alta', 'Média', 'Baixa', 'Programada') NOT NULL UNIQUE,
  tempo_resolucao_minutos INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- Tabelas dependentes
-- =====================================================================

-- Empresas / seguradoras (vinculadas opcionalmente a um prestador)
CREATE TABLE IF NOT EXISTS empresas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  cnpj VARCHAR(20) NULL,
  telefone VARCHAR(20) NULL,
  email VARCHAR(255) NULL,
  prestador_id INT NULL,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_empresas_prestador
    FOREIGN KEY (prestador_id) REFERENCES prestadores(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Chamados (registro central do atendimento)
CREATE TABLE IF NOT EXISTS chamados (
  id INT AUTO_INCREMENT PRIMARY KEY,
  protocolo VARCHAR(50) NOT NULL UNIQUE,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT NULL,
  prioridade ENUM('Imediata', 'Alta', 'Média', 'Baixa', 'Programada') NOT NULL,
  status ENUM('aberto', 'em_andamento', 'aguardando_cliente', 'finalizado') NOT NULL DEFAULT 'aberto',

  categoria_id INT NULL,
  empresa_id INT NULL,

  -- Dados da seguradora / cliente
  protocolo_seguradora VARCHAR(255) NULL,
  nome_cliente VARCHAR(255) NULL,
  telefone_cliente VARCHAR(20) NULL,
  cooperativa_cliente VARCHAR(255) NULL,
  criancas_menores_12 BOOLEAN NULL DEFAULT FALSE,
  idosos_acima_65 BOOLEAN NULL DEFAULT FALSE,

  -- Responsaveis
  usuario_criador_id INT NULL,
  tecnico_responsavel_id INT NULL,

  -- SLA e datas
  sla_prazo DATETIME NULL,
  data_abertura DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  data_inicio_atendimento DATETIME NULL,
  data_conclusao DATETIME NULL,
  tempo_resolucao INT NULL,               -- em minutos
  etapa_atual INT NULL,                   -- etapa corrente do fluxo de guincho/reboque

  -- Localizacao
  localizacao VARCHAR(255) NULL,
  localizacao_origem VARCHAR(255) NULL,
  localizacao_destino VARCHAR(255) NULL,
  ponto_referencia VARCHAR(255) NULL,

  -- Dados do veiculo
  tipo_veiculo VARCHAR(100) NULL,
  placa_veiculo VARCHAR(20) NULL,
  marca_veiculo VARCHAR(100) NULL,
  modelo_veiculo VARCHAR(100) NULL,
  cor_veiculo VARCHAR(50) NULL,
  chassi_veiculo VARCHAR(50) NULL,
  transmissao_automatica BOOLEAN NULL,
  acessorios_veiculo TEXT NULL,

  -- Dados especificos de veiculo pesado / cavalo mecanico
  tipo_cavalo_mecanico VARCHAR(100) NULL,
  quantidade_eixos INT NULL,
  comprimento VARCHAR(50) NULL,
  altura VARCHAR(50) NULL,
  tipo_teto VARCHAR(100) NULL,
  desatrelado BOOLEAN NULL,

  -- Ocorrencia
  tipo_ocorrencia VARCHAR(100) NULL,
  tipo_pane VARCHAR(100) NULL,
  veiculo_vazio BOOLEAN NULL,
  rodas_pneus_livres BOOLEAN NULL,
  oficina_24h BOOLEAN NULL,
  necessita_taxi BOOLEAN NULL,

  observacoes TEXT NULL,

  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_chamados_categoria
    FOREIGN KEY (categoria_id) REFERENCES categorias(id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_chamados_empresa
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_chamados_criador
    FOREIGN KEY (usuario_criador_id) REFERENCES usuarios(id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_chamados_tecnico
    FOREIGN KEY (tecnico_responsavel_id) REFERENCES usuarios(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Comentarios de um chamado
CREATE TABLE IF NOT EXISTS comentarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  chamado_id INT NOT NULL,
  usuario_id INT NOT NULL,
  comentario TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_comentarios_chamado
    FOREIGN KEY (chamado_id) REFERENCES chamados(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_comentarios_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Historico de alteracoes de um chamado (auditoria)
CREATE TABLE IF NOT EXISTS historico_alteracoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  chamado_id INT NOT NULL,
  usuario_id INT NOT NULL,
  tipo_alteracao VARCHAR(100) NOT NULL,   -- ex.: 'status', 'prioridade', 'atribuicao'
  campo_alterado VARCHAR(100) NULL,
  valor_anterior VARCHAR(255) NULL,
  valor_novo VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_historico_chamado
    FOREIGN KEY (chamado_id) REFERENCES chamados(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_historico_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Anexos de um chamado (upload de arquivos)
CREATE TABLE IF NOT EXISTS chamado_anexos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  chamado_id INT NOT NULL,
  nome_arquivo VARCHAR(255) NOT NULL,
  nome_original VARCHAR(255) NOT NULL,
  caminho_arquivo VARCHAR(500) NOT NULL,
  tipo_arquivo VARCHAR(100) NULL,
  tamanho INT NULL,
  usuario_upload_id INT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_anexos_chamado
    FOREIGN KEY (chamado_id) REFERENCES chamados(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_anexos_usuario
    FOREIGN KEY (usuario_upload_id) REFERENCES usuarios(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Etapas do fluxo de guincho/reboque
CREATE TABLE IF NOT EXISTS etapas_guincho (
  id INT AUTO_INCREMENT PRIMARY KEY,
  chamado_id INT NOT NULL,
  etapa_numero INT NOT NULL,
  etapa_nome VARCHAR(255) NOT NULL,
  prazo_minutos INT NULL,
  status ENUM('pendente', 'em_andamento', 'concluida', 'atrasada') NOT NULL DEFAULT 'pendente',
  data_inicio DATETIME NULL,
  data_conclusao DATETIME NULL,
  prazo_estimado DATETIME NULL,
  tempo_estimado_manual INT NULL,
  protocolo_seguradora VARCHAR(255) NULL,
  observacoes TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_etapas_chamado
    FOREIGN KEY (chamado_id) REFERENCES chamados(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- Dados iniciais (seed) - idempotentes
-- =====================================================================

-- Categorias
INSERT IGNORE INTO categorias (nome, ativo) VALUES
  ('Vidro', TRUE),
  ('Guincho', TRUE),
  ('Chaveiro', TRUE),
  ('Para-brisa', TRUE),
  ('Retrovisor', TRUE),
  ('Pneu', TRUE);

-- Configuracao de SLA (tempo_resolucao_minutos por prioridade)
INSERT IGNORE INTO sla_config (prioridade, tempo_resolucao_minutos) VALUES
  ('Imediata', 30),
  ('Alta', 120),
  ('Média', 240),
  ('Baixa', 480),
  ('Programada', 1440);

-- Empresa exemplo
INSERT IGNORE INTO empresas (nome, cnpj, telefone, email, ativo) VALUES
  ('Seguradora Exemplo LTDA', '00.000.000/0001-00', '(11) 3000-0000', 'contato@seguradoraexemplo.com.br', TRUE);

-- Usuario administrador padrao
-- Senha em texto puro: admin123 (hash bcrypt, cost 10, compativel com bcryptjs)
INSERT IGNORE INTO usuarios (nome, email, senha, perfil, ativo) VALUES
  ('Administrador',
   'admin@assistencia.com',
   '$2b$10$JyNjh0EhYDmYeDD1BTjqLObpsx7vpqXVXbcd6fwwYA01VEYoZiNse',
   'administrador',
   TRUE);
