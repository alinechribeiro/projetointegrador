import { useEffect, useState } from 'react';
import { api } from './api';
import Campo from './Campo';

function Associacao() {
  const [produtos, setProdutos] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [produtoId, setProdutoId] = useState('');
  const [fornecedorId, setFornecedorId] = useState('');
  const [associados, setAssociados] = useState([]);
  const [consultaFornecedorId, setConsultaFornecedorId] = useState('');
  const [produtosDoFornecedor, setProdutosDoFornecedor] = useState([]);
  const [versao, setVersao] = useState(0);
  const [mensagem, setMensagem] = useState(null);

  useEffect(() => {
    api('/produtos').then(({ ok, dados }) => ok && setProdutos(dados));
    api('/fornecedores').then(({ ok, dados }) => ok && setFornecedores(dados));
  }, []);

  useEffect(() => {
    if (!produtoId) return setAssociados([]);
    api(`/produtos/${produtoId}/fornecedores`).then(({ ok, dados }) => ok && setAssociados(dados));
  }, [produtoId, versao]);

  useEffect(() => {
    if (!consultaFornecedorId) return setProdutosDoFornecedor([]);
    api(`/fornecedores/${consultaFornecedorId}/produtos`).then(
      ({ ok, dados }) => ok && setProdutosDoFornecedor(dados)
    );
  }, [consultaFornecedorId, versao]);

  const produto = produtos.find((p) => p.id === Number(produtoId));

  function selecionarProduto(e) {
    setProdutoId(e.target.value);
    setFornecedorId('');
    setMensagem(null);
  }

  async function associar() {
    if (!fornecedorId) return setMensagem({ tipo: 'erro', texto: 'Selecione um fornecedor.' });
    const { ok, dados } = await api(`/produtos/${produtoId}/fornecedores`, 'POST', {
      fornecedor_id: Number(fornecedorId),
    });
    setMensagem({ tipo: ok ? 'sucesso' : 'erro', texto: dados.mensagem });
    if (ok) {
      setFornecedorId('');
      setVersao(versao + 1);
    }
  }

  async function desassociar(fornecedor) {
    const { ok, dados } = await api(`/produtos/${produtoId}/fornecedores/${fornecedor.id}`, 'DELETE');
    setMensagem({ tipo: ok ? 'sucesso' : 'erro', texto: dados.mensagem });
    if (ok) setVersao(versao + 1);
  }

  return (
    <section>
      <h2>Associação de Fornecedor a Produto</h2>
      {mensagem && <p className={`mensagem ${mensagem.tipo}`}>{mensagem.texto}</p>}

      <Campo rotulo="Produto">
        <select value={produtoId} onChange={selecionarProduto}>
          <option value="">Selecione um produto</option>
          {produtos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome}
            </option>
          ))}
        </select>
      </Campo>

      {produto && (
        <>
          <h3>Detalhes do Produto</h3>
          <div className="detalhes">
            <Campo rotulo="Nome do Produto">
              <input value={produto.nome} readOnly />
            </Campo>
            <Campo rotulo="Código de Barras">
              <input value={produto.codigo_barras ?? ''} readOnly />
            </Campo>
            <Campo rotulo="Descrição">
              <textarea value={produto.descricao} readOnly />
            </Campo>
            {produto.imagem_url && <img src={produto.imagem_url} alt={produto.nome} className="miniatura" />}
          </div>

          <h3>Associação de Fornecedor</h3>
          <div className="acoes">
            <select value={fornecedorId} onChange={(e) => setFornecedorId(e.target.value)}>
              <option value="">Selecione um fornecedor</option>
              {fornecedores.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nome_empresa}
                </option>
              ))}
            </select>
            <button onClick={associar}>Associar Fornecedor</button>
          </div>

          <h3>Fornecedores Associados</h3>
          <table>
            <thead>
              <tr>
                <th>Nome do Fornecedor</th>
                <th>CNPJ</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {associados.map((f) => (
                <tr key={f.id}>
                  <td>{f.nome_empresa}</td>
                  <td>{f.cnpj}</td>
                  <td>
                    <button onClick={() => desassociar(f)}>Desassociar</button>
                  </td>
                </tr>
              ))}
              {associados.length === 0 && (
                <tr>
                  <td colSpan="3">Nenhum fornecedor associado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </>
      )}

      <h2>Produtos por Fornecedor</h2>
      <Campo rotulo="Fornecedor">
        <select value={consultaFornecedorId} onChange={(e) => setConsultaFornecedorId(e.target.value)}>
          <option value="">Selecione um fornecedor</option>
          {fornecedores.map((f) => (
            <option key={f.id} value={f.id}>
              {f.nome_empresa}
            </option>
          ))}
        </select>
      </Campo>
      {consultaFornecedorId && (
        <ul>
          {produtosDoFornecedor.map((p) => (
            <li key={p.id}>{p.nome}</li>
          ))}
          {produtosDoFornecedor.length === 0 && <li>Nenhum produto associado a este fornecedor.</li>}
        </ul>
      )}
    </section>
  );
}

export default Associacao;
