const db = require('../database');

const OBRIGATORIOS = ['nome_empresa', 'cnpj', 'endereco', 'telefone', 'email', 'contato_principal'];

function validar(fornecedor) {
  const erros = {};
  for (const campo of OBRIGATORIOS) {
    if (!fornecedor[campo] || String(fornecedor[campo]).trim() === '') {
      erros[campo] = 'Campo obrigatório.';
    }
  }
  return erros;
}

function valores(fornecedor) {
  return OBRIGATORIOS.map((campo) => fornecedor[campo]);
}

function cnpjEmUso(cnpj, id) {
  const existente = db.prepare('SELECT id FROM fornecedores WHERE cnpj = ?').get(cnpj);
  return Boolean(existente) && existente.id !== Number(id);
}

module.exports = {
  listar(req, res) {
    res.json(db.prepare('SELECT * FROM fornecedores').all());
  },

  buscar(req, res) {
    const fornecedor = db.prepare('SELECT * FROM fornecedores WHERE id = ?').get(req.params.id);
    if (!fornecedor) return res.status(404).json({ mensagem: 'Fornecedor não encontrado.' });
    res.json(fornecedor);
  },

  criar(req, res) {
    const fornecedor = req.body ?? {};
    const erros = validar(fornecedor);
    if (Object.keys(erros).length > 0) return res.status(400).json({ erros });
    if (cnpjEmUso(fornecedor.cnpj)) {
      return res.status(409).json({ mensagem: 'Fornecedor com esse CNPJ já está cadastrado!' });
    }

    const { lastInsertRowid } = db
      .prepare(
        `INSERT INTO fornecedores (nome_empresa, cnpj, endereco, telefone, email, contato_principal)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .run(...valores(fornecedor));
    res.status(201).json({ mensagem: 'Fornecedor cadastrado com sucesso!', id: lastInsertRowid });
  },

  atualizar(req, res) {
    const { id } = req.params;
    if (!db.prepare('SELECT id FROM fornecedores WHERE id = ?').get(id)) {
      return res.status(404).json({ mensagem: 'Fornecedor não encontrado.' });
    }

    const fornecedor = req.body ?? {};
    const erros = validar(fornecedor);
    if (Object.keys(erros).length > 0) return res.status(400).json({ erros });
    if (cnpjEmUso(fornecedor.cnpj, id)) {
      return res.status(409).json({ mensagem: 'Fornecedor com esse CNPJ já está cadastrado!' });
    }

    db.prepare(
      `UPDATE fornecedores SET
        nome_empresa = ?, cnpj = ?, endereco = ?, telefone = ?, email = ?, contato_principal = ?
       WHERE id = ?`
    ).run(...valores(fornecedor), id);
    res.json({ mensagem: 'Fornecedor atualizado com sucesso!' });
  },

  remover(req, res) {
    const { changes } = db.prepare('DELETE FROM fornecedores WHERE id = ?').run(req.params.id);
    if (changes === 0) return res.status(404).json({ mensagem: 'Fornecedor não encontrado.' });
    res.json({ mensagem: 'Fornecedor excluído com sucesso!' });
  },
};
