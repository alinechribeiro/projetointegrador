const db = require('../database');

module.exports = {
  estoque(req, res) {
    const produtos = db
      .prepare(
        `SELECT p.id, p.nome, p.codigo_barras, p.categoria, p.quantidade_estoque, p.data_validade,
                COUNT(pf.fornecedor_id) AS total_fornecedores,
                MIN(pf.preco) AS menor_preco,
                (SELECT f.nome_empresa
                 FROM produto_fornecedor pf2
                 JOIN fornecedores f ON f.id = pf2.fornecedor_id
                 WHERE pf2.produto_id = p.id AND pf2.preco IS NOT NULL
                 ORDER BY pf2.preco
                 LIMIT 1) AS fornecedor_menor_preco
         FROM produtos p
         LEFT JOIN produto_fornecedor pf ON pf.produto_id = p.id
         GROUP BY p.id
         ORDER BY p.nome`
      )
      .all();

    res.json({
      gerado_em: new Date().toISOString(),
      total_produtos: produtos.length,
      total_itens_estoque: produtos.reduce((soma, p) => soma + (p.quantidade_estoque ?? 0), 0),
      produtos,
    });
  },
};
