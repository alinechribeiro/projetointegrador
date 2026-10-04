import { useEffect, useState } from 'react';
import { api } from './api';

function Relatorios() {
  const [relatorio, setRelatorio] = useState(null);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    api('/relatorios/estoque').then(({ ok, dados }) => (ok ? setRelatorio(dados) : setErro(dados.mensagem)));
  }, []);

  if (erro) return <p className="mensagem erro">{erro}</p>;
  if (!relatorio) return <p>Carregando...</p>;

  return (
    <section>
      <h2>Relatório de Estoque e Menor Preço</h2>
      <p>
        Gerado em {new Date(relatorio.gerado_em).toLocaleString('pt-BR')} · {relatorio.total_produtos} produtos ·{' '}
        {relatorio.total_itens_estoque} itens em estoque
      </p>
      <div className="acoes nao-imprimir">
        <button onClick={() => window.print()}>Imprimir</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Produto</th>
            <th>Código de Barras</th>
            <th>Categoria</th>
            <th>Estoque</th>
            <th>Validade</th>
            <th>Fornecedores</th>
            <th>Menor Preço</th>
            <th>Fornecedor mais barato</th>
          </tr>
        </thead>
        <tbody>
          {relatorio.produtos.map((p) => (
            <tr key={p.id}>
              <td>{p.nome}</td>
              <td>{p.codigo_barras}</td>
              <td>{p.categoria}</td>
              <td>{p.quantidade_estoque}</td>
              <td>{p.data_validade}</td>
              <td>{p.total_fornecedores}</td>
              <td>{p.menor_preco != null && `R$ ${p.menor_preco.toFixed(2)}`}</td>
              <td>{p.fornecedor_menor_preco}</td>
            </tr>
          ))}
          {relatorio.produtos.length === 0 && (
            <tr>
              <td colSpan="8">Nenhum produto cadastrado.</td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
}

export default Relatorios;
