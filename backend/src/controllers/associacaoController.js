const db = require('../database');

function produtoExiste(id) {
  return Boolean(db.prepare('SELECT id FROM produtos WHERE id = ?').get(id));
}

function fornecedorExiste(id) {
  return Boolean(db.prepare('SELECT id FROM fornecedores WHERE id = ?').get(id));
}

module.exports = {
  associar(req, res) {
    const { produtoId } = req.params;
    const fornecedorId = req.body?.fornecedor_id;

    if (!produtoExiste(produtoId)) return res.status(404).json({ mensagem: 'Produto não encontrado.' });
    if (!fornecedorId || !fornecedorExiste(fornecedorId)) {
      return res.status(404).json({ mensagem: 'Fornecedor não encontrado.' });
    }

    const jaAssociado = db
      .prepare('SELECT 1 FROM produto_fornecedor WHERE produto_id = ? AND fornecedor_id = ?')
      .get(produtoId, fornecedorId);
    if (jaAssociado) return res.status(409).json({ mensagem: 'Fornecedor já está associado a este produto!' });

    db.prepare('INSERT INTO produto_fornecedor (produto_id, fornecedor_id) VALUES (?, ?)').run(produtoId, fornecedorId);
    res.status(201).json({ mensagem: 'Fornecedor associado com sucesso ao produto!' });
  },

  desassociar(req, res) {
    const { changes } = db
      .prepare('DELETE FROM produto_fornecedor WHERE produto_id = ? AND fornecedor_id = ?')
      .run(req.params.produtoId, req.params.fornecedorId);
    if (changes === 0) return res.status(404).json({ mensagem: 'Associação não encontrada.' });
    res.json({ mensagem: 'Fornecedor desassociado com sucesso!' });
  },

  fornecedoresDoProduto(req, res) {
    if (!produtoExiste(req.params.produtoId)) return res.status(404).json({ mensagem: 'Produto não encontrado.' });
    const fornecedores = db
      .prepare(
        `SELECT f.* FROM fornecedores f
         JOIN produto_fornecedor pf ON pf.fornecedor_id = f.id
         WHERE pf.produto_id = ?`
      )
      .all(req.params.produtoId);
    res.json(fornecedores);
  },

  produtosDoFornecedor(req, res) {
    if (!fornecedorExiste(req.params.fornecedorId)) {
      return res.status(404).json({ mensagem: 'Fornecedor não encontrado.' });
    }
    const produtos = db
      .prepare(
        `SELECT p.* FROM produtos p
         JOIN produto_fornecedor pf ON pf.produto_id = p.id
         WHERE pf.fornecedor_id = ?`
      )
      .all(req.params.fornecedorId);
    res.json(produtos);
  },
};
