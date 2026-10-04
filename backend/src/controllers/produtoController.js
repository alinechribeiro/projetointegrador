const db = require('../database');

const OBRIGATORIOS = ['nome', 'descricao', 'categoria'];

function validar(produto) {
  const erros = {};
  for (const campo of OBRIGATORIOS) {
    if (!produto[campo] || String(produto[campo]).trim() === '') {
      erros[campo] = 'Campo obrigatório.';
    }
  }
  return erros;
}

function valores(produto) {
  return [
    produto.nome,
    produto.codigo_barras || null,
    produto.descricao,
    produto.preco ?? null,
    produto.quantidade_estoque ?? 0,
    produto.categoria,
    produto.data_validade || null,
    produto.imagem_url || null,
  ];
}

function codigoEmUso(codigoBarras, id) {
  if (!codigoBarras) return false;
  const existente = db.prepare('SELECT id FROM produtos WHERE codigo_barras = ?').get(codigoBarras);
  return Boolean(existente) && existente.id !== Number(id);
}

module.exports = {
  listar(req, res) {
    res.json(db.prepare('SELECT * FROM produtos').all());
  },

  buscar(req, res) {
    const produto = db.prepare('SELECT * FROM produtos WHERE id = ?').get(req.params.id);
    if (!produto) return res.status(404).json({ mensagem: 'Produto não encontrado.' });
    res.json(produto);
  },

  criar(req, res) {
    const produto = req.body ?? {};
    const erros = validar(produto);
    if (Object.keys(erros).length > 0) return res.status(400).json({ erros });
    if (codigoEmUso(produto.codigo_barras)) {
      return res.status(409).json({ mensagem: 'Produto com este código de barras já está cadastrado!' });
    }

    const { lastInsertRowid } = db
      .prepare(
        `INSERT INTO produtos
          (nome, codigo_barras, descricao, preco, quantidade_estoque, categoria, data_validade, imagem_url)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(...valores(produto));
    res.status(201).json({ mensagem: 'Produto cadastrado com sucesso!', id: lastInsertRowid });
  },

  atualizar(req, res) {
    const { id } = req.params;
    if (!db.prepare('SELECT id FROM produtos WHERE id = ?').get(id)) {
      return res.status(404).json({ mensagem: 'Produto não encontrado.' });
    }

    const produto = req.body ?? {};
    const erros = validar(produto);
    if (Object.keys(erros).length > 0) return res.status(400).json({ erros });
    if (codigoEmUso(produto.codigo_barras, id)) {
      return res.status(409).json({ mensagem: 'Produto com este código de barras já está cadastrado!' });
    }

    db.prepare(
      `UPDATE produtos SET
        nome = ?, codigo_barras = ?, descricao = ?, preco = ?, quantidade_estoque = ?,
        categoria = ?, data_validade = ?, imagem_url = ?
       WHERE id = ?`
    ).run(...valores(produto), id);
    res.json({ mensagem: 'Produto atualizado com sucesso!' });
  },

  remover(req, res) {
    const { changes } = db.prepare('DELETE FROM produtos WHERE id = ?').run(req.params.id);
    if (changes === 0) return res.status(404).json({ mensagem: 'Produto não encontrado.' });
    res.json({ mensagem: 'Produto excluído com sucesso!' });
  },
};
