import { useEffect, useState } from 'react';
import { api } from './api';
import Campo from './Campo';

const CATEGORIAS = ['Alimentos', 'Bebidas', 'Limpeza', 'Higiene', 'Eletrônicos', 'Vestuário'];

const VAZIO = {
  nome: '',
  codigo_barras: '',
  descricao: '',
  preco: '',
  quantidade_estoque: '',
  categoria: '',
  outra_categoria: '',
  data_validade: '',
  imagem_url: '',
};

function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [versao, setVersao] = useState(0);
  const [form, setForm] = useState(VAZIO);
  const [editandoId, setEditandoId] = useState(null);
  const [erros, setErros] = useState({});
  const [mensagem, setMensagem] = useState(null);

  useEffect(() => {
    api('/produtos').then(({ ok, dados }) => ok && setProdutos(dados));
  }, [versao]);

  function alterar(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function limpar() {
    setForm(VAZIO);
    setEditandoId(null);
    setErros({});
  }

  async function salvar(e) {
    e.preventDefault();
    const produto = {
      nome: form.nome,
      codigo_barras: form.codigo_barras,
      descricao: form.descricao,
      preco: form.preco === '' ? null : Number(form.preco),
      quantidade_estoque: form.quantidade_estoque === '' ? 0 : Number(form.quantidade_estoque),
      categoria: form.categoria === 'Outro' ? form.outra_categoria : form.categoria,
      data_validade: form.data_validade,
      imagem_url: form.imagem_url,
    };

    const { ok, dados } = editandoId
      ? await api(`/produtos/${editandoId}`, 'PUT', produto)
      : await api('/produtos', 'POST', produto);

    setMensagem({ tipo: ok ? 'sucesso' : 'erro', texto: dados.mensagem || 'Corrija os campos destacados.' });
    if (ok) {
      limpar();
      setVersao(versao + 1);
    } else {
      setErros(dados.erros || {});
    }
  }

  function editar(produto) {
    const categoriaConhecida = CATEGORIAS.includes(produto.categoria);
    setForm({
      nome: produto.nome,
      codigo_barras: produto.codigo_barras ?? '',
      descricao: produto.descricao,
      preco: produto.preco ?? '',
      quantidade_estoque: produto.quantidade_estoque ?? '',
      categoria: categoriaConhecida ? produto.categoria : 'Outro',
      outra_categoria: categoriaConhecida ? '' : produto.categoria,
      data_validade: produto.data_validade ?? '',
      imagem_url: produto.imagem_url ?? '',
    });
    setEditandoId(produto.id);
    setErros({});
    setMensagem(null);
  }

  async function excluir(produto) {
    if (!window.confirm(`Excluir o produto "${produto.nome}"?`)) return;
    const { ok, dados } = await api(`/produtos/${produto.id}`, 'DELETE');
    setMensagem({ tipo: ok ? 'sucesso' : 'erro', texto: dados.mensagem });
    if (ok) {
      if (editandoId === produto.id) limpar();
      setVersao(versao + 1);
    }
  }

  return (
    <section>
      <h2>{editandoId ? 'Editar Produto' : 'Cadastro de Produto'}</h2>
      {mensagem && <p className={`mensagem ${mensagem.tipo}`}>{mensagem.texto}</p>}

      <form onSubmit={salvar}>
        <Campo rotulo="Nome do Produto *" erro={erros.nome}>
          <input name="nome" value={form.nome} onChange={alterar} placeholder="Insira o nome do produto" />
        </Campo>
        <Campo rotulo="Código de Barras" erro={erros.codigo_barras}>
          <input
            name="codigo_barras"
            value={form.codigo_barras}
            onChange={alterar}
            inputMode="numeric"
            placeholder="Insira o código de barras"
          />
        </Campo>
        <Campo rotulo="Descrição *" erro={erros.descricao}>
          <textarea
            name="descricao"
            value={form.descricao}
            onChange={alterar}
            placeholder="Descreva brevemente o produto"
          />
        </Campo>
        <Campo rotulo="Preço (R$)" erro={erros.preco}>
          <input name="preco" type="number" min="0" step="0.01" value={form.preco} onChange={alterar} />
        </Campo>
        <Campo rotulo="Quantidade em Estoque" erro={erros.quantidade_estoque}>
          <input
            name="quantidade_estoque"
            type="number"
            min="0"
            value={form.quantidade_estoque}
            onChange={alterar}
            placeholder="Quantidade disponível"
          />
        </Campo>
        <Campo rotulo="Categoria *" erro={erros.categoria}>
          <select name="categoria" value={form.categoria} onChange={alterar}>
            <option value="">Selecione uma categoria</option>
            {CATEGORIAS.map((categoria) => (
              <option key={categoria}>{categoria}</option>
            ))}
            <option>Outro</option>
          </select>
          {form.categoria === 'Outro' && (
            <input
              name="outra_categoria"
              value={form.outra_categoria}
              onChange={alterar}
              placeholder="Especifique a categoria"
            />
          )}
        </Campo>
        <Campo rotulo="Data de Validade" erro={erros.data_validade}>
          <input name="data_validade" type="date" value={form.data_validade} onChange={alterar} />
        </Campo>
        <Campo rotulo="Imagem do Produto (URL)" erro={erros.imagem_url}>
          <input name="imagem_url" value={form.imagem_url} onChange={alterar} placeholder="https://..." />
        </Campo>

        <div className="acoes">
          <button type="submit">{editandoId ? 'Salvar' : 'Cadastrar'}</button>
          {editandoId && (
            <button type="button" onClick={limpar}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      <h2>Produtos Cadastrados</h2>
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Código de Barras</th>
            <th>Categoria</th>
            <th>Preço</th>
            <th>Estoque</th>
            <th>Validade</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {produtos.map((produto) => (
            <tr key={produto.id}>
              <td>{produto.nome}</td>
              <td>{produto.codigo_barras}</td>
              <td>{produto.categoria}</td>
              <td>{produto.preco != null && `R$ ${produto.preco.toFixed(2)}`}</td>
              <td>{produto.quantidade_estoque}</td>
              <td>{produto.data_validade}</td>
              <td>
                <button onClick={() => editar(produto)}>Editar</button>
                <button onClick={() => excluir(produto)}>Excluir</button>
              </td>
            </tr>
          ))}
          {produtos.length === 0 && (
            <tr>
              <td colSpan="7">Nenhum produto cadastrado.</td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
}

export default Produtos;
