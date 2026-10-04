const db = require('../database');

function produtoExiste(id) {
  return Boolean(db.prepare('SELECT id FROM produtos WHERE id = ?').get(id));
}

function fornecedorExiste(id) {
  return Boolean(db.prepare('SELECT id FROM fornecedores WHERE id = ?').get(id));
}

// Retorna o preço como número, null se não informado, ou undefined se for inválido.
function lerPreco(valor) {
  if (valor === undefined || valor === null || valor === '') return null;
  const preco = Number(valor);
  return Number.isFinite(preco) && preco >= 0 ? preco : undefined;
}

const PRECO_INVALIDO = { erros: { preco: 'Informe um preço maior ou igual a zero.' } };

module.exports = {
  associar(req, res) {
    const { produtoId } = req.params;
    const fornecedorId = req.body?.fornecedor_id;
    const preco = lerPreco(req.body?.preco);

    if (!produtoExiste(produtoId)) return res.status(404).json({ mensagem: 'Produto não encontrado.' });
    if (!fornecedorId || !fornecedorExiste(fornecedorId)) {
      return res.status(404).json({ mensagem: 'Fornecedor não encontrado.' });
    }
    if (preco === undefined) return res.status(400).json(PRECO_INVALIDO);

    const jaAssociado = db
      .prepare('SELECT 1 FROM produto_fornecedor WHERE produto_id = ? AND fornecedor_id = ?')
      .get(produtoId, fornecedorId);
    if (jaAssociado) return res.status(409).json({ mensagem: 'Fornecedor já está associado a este produto!' });

    db.prepare('INSERT INTO produto_fornecedor (produto_id, fornecedor_id, preco) VALUES (?, ?, ?)').run(
      produtoId,
      fornecedorId,
      preco
    );
    res.status(201).json({ mensagem: 'Fornecedor associado com sucesso ao produto!' });
  },

  atualizarPreco(req, res) {
    const preco = lerPreco(req.body?.preco);
    if (preco === undefined || preco === null) return res.status(400).json(PRECO_INVALIDO);

    const { changes } = db
      .prepare('UPDATE produto_fornecedor SET preco = ? WHERE produto_id = ? AND fornecedor_id = ?')
      .run(preco, req.params.produtoId, req.params.fornecedorId);
    if (changes === 0) return res.status(404).json({ mensagem: 'Associação não encontrada.' });
    res.json({ mensagem: 'Preço do fornecedor atualizado com sucesso!' });
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
        `SELECT f.*, pf.preco AS preco_fornecedor FROM fornecedores f
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
        `SELECT p.*, pf.preco AS preco_fornecedor FROM produtos p
         JOIN produto_fornecedor pf ON pf.produto_id = p.id
         WHERE pf.fornecedor_id = ?`
      )
      .all(req.params.fornecedorId);
    res.json(produtos);
  },

  comparacaoPrecos(req, res) {
    const produto = db.prepare('SELECT id, nome, codigo_barras FROM produtos WHERE id = ?').get(req.params.produtoId);
    if (!produto) return res.status(404).json({ mensagem: 'Produto não encontrado.' });

    const fornecedores = db
      .prepare(
        `SELECT f.id, f.nome_empresa, f.cnpj, f.telefone, f.email, f.contato_principal,
                pf.preco AS preco_fornecedor
         FROM fornecedores f
         JOIN produto_fornecedor pf ON pf.fornecedor_id = f.id
         WHERE pf.produto_id = ?
         ORDER BY pf.preco IS NULL, pf.preco, f.nome_empresa`
      )
      .all(req.params.produtoId);

    const maisBarato = fornecedores[0]?.preco_fornecedor != null ? fornecedores[0] : null;
    res.json({ produto, menor_preco: maisBarato, fornecedores });
  },
};
