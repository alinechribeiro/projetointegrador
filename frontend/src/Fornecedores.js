import { useEffect, useState } from 'react';
import { api } from './api';
import Campo from './Campo';

const VAZIO = {
  nome_empresa: '',
  cnpj: '',
  endereco: '',
  telefone: '',
  email: '',
  contato_principal: '',
};

function Fornecedores() {
  const [fornecedores, setFornecedores] = useState([]);
  const [versao, setVersao] = useState(0);
  const [form, setForm] = useState(VAZIO);
  const [editandoId, setEditandoId] = useState(null);
  const [erros, setErros] = useState({});
  const [mensagem, setMensagem] = useState(null);

  useEffect(() => {
    api('/fornecedores').then(({ ok, dados }) => ok && setFornecedores(dados));
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
    const { ok, dados } = editandoId
      ? await api(`/fornecedores/${editandoId}`, 'PUT', form)
      : await api('/fornecedores', 'POST', form);

    setMensagem({ tipo: ok ? 'sucesso' : 'erro', texto: dados.mensagem || 'Corrija os campos destacados.' });
    if (ok) {
      limpar();
      setVersao(versao + 1);
    } else {
      setErros(dados.erros || {});
    }
  }

  function editar(fornecedor) {
    const { id, ...dados } = fornecedor;
    setForm(dados);
    setEditandoId(id);
    setErros({});
    setMensagem(null);
  }

  async function excluir(fornecedor) {
    if (!window.confirm(`Excluir o fornecedor "${fornecedor.nome_empresa}"?`)) return;
    const { ok, dados } = await api(`/fornecedores/${fornecedor.id}`, 'DELETE');
    setMensagem({ tipo: ok ? 'sucesso' : 'erro', texto: dados.mensagem });
    if (ok) {
      if (editandoId === fornecedor.id) limpar();
      setVersao(versao + 1);
    }
  }

  return (
    <section>
      <h2>{editandoId ? 'Editar Fornecedor' : 'Cadastro de Fornecedor'}</h2>
      {mensagem && <p className={`mensagem ${mensagem.tipo}`}>{mensagem.texto}</p>}

      <form onSubmit={salvar}>
        <Campo rotulo="Nome da Empresa *" erro={erros.nome_empresa}>
          <input
            name="nome_empresa"
            value={form.nome_empresa}
            onChange={alterar}
            placeholder="Insira o nome da empresa"
          />
        </Campo>
        <Campo rotulo="CNPJ *" erro={erros.cnpj}>
          <input name="cnpj" value={form.cnpj} onChange={alterar} placeholder="00.000.000/0000-00" />
        </Campo>
        <Campo rotulo="Endereço *" erro={erros.endereco}>
          <textarea
            name="endereco"
            value={form.endereco}
            onChange={alterar}
            placeholder="Insira o endereço completo da empresa"
          />
        </Campo>
        <Campo rotulo="Telefone *" erro={erros.telefone}>
          <input name="telefone" type="tel" value={form.telefone} onChange={alterar} placeholder="(00) 0000-0000" />
        </Campo>
        <Campo rotulo="E-mail *" erro={erros.email}>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={alterar}
            placeholder="exemplo@fornecedor.com"
          />
        </Campo>
        <Campo rotulo="Contato Principal *" erro={erros.contato_principal}>
          <input
            name="contato_principal"
            value={form.contato_principal}
            onChange={alterar}
            placeholder="Nome do contato principal"
          />
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

      <h2>Fornecedores Cadastrados</h2>
      <table>
        <thead>
          <tr>
            <th>Empresa</th>
            <th>CNPJ</th>
            <th>Telefone</th>
            <th>E-mail</th>
            <th>Contato</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {fornecedores.map((fornecedor) => (
            <tr key={fornecedor.id}>
              <td>{fornecedor.nome_empresa}</td>
              <td>{fornecedor.cnpj}</td>
              <td>{fornecedor.telefone}</td>
              <td>{fornecedor.email}</td>
              <td>{fornecedor.contato_principal}</td>
              <td>
                <button onClick={() => editar(fornecedor)}>Editar</button>
                <button onClick={() => excluir(fornecedor)}>Excluir</button>
              </td>
            </tr>
          ))}
          {fornecedores.length === 0 && (
            <tr>
              <td colSpan="6">Nenhum fornecedor cadastrado.</td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
}

export default Fornecedores;
