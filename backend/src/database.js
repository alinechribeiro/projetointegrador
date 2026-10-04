const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const db = new DatabaseSync(path.join(__dirname, '..', 'banco.sqlite'));

db.exec(`
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS produtos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    codigo_barras TEXT UNIQUE,
    descricao TEXT NOT NULL,
    preco REAL,
    quantidade_estoque INTEGER DEFAULT 0,
    categoria TEXT NOT NULL,
    data_validade TEXT,
    imagem_url TEXT
  );

  CREATE TABLE IF NOT EXISTS fornecedores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome_empresa TEXT NOT NULL,
    cnpj TEXT NOT NULL UNIQUE,
    endereco TEXT NOT NULL,
    telefone TEXT NOT NULL,
    email TEXT NOT NULL,
    contato_principal TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS produto_fornecedor (
    produto_id INTEGER NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
    fornecedor_id INTEGER NOT NULL REFERENCES fornecedores(id) ON DELETE CASCADE,
    preco REAL,
    PRIMARY KEY (produto_id, fornecedor_id)
  );
`);

// Bancos criados antes do preço por fornecedor ganham a coluna sem perder os dados.
const colunas = db.prepare('PRAGMA table_info(produto_fornecedor)').all();
if (!colunas.some((coluna) => coluna.name === 'preco')) {
  db.exec('ALTER TABLE produto_fornecedor ADD COLUMN preco REAL');
}

module.exports = db;
