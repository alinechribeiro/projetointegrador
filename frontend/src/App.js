import { useState } from 'react';
import Produtos from './Produtos';
import Fornecedores from './Fornecedores';
import Associacao from './Associacao';
import './App.css';

const PAGINAS = {
  produtos: { titulo: 'Produtos', componente: Produtos },
  fornecedores: { titulo: 'Fornecedores', componente: Fornecedores },
  associacao: { titulo: 'Associação Produto/Fornecedor', componente: Associacao },
};

function App() {
  const [pagina, setPagina] = useState('produtos');
  const Pagina = PAGINAS[pagina].componente;

  return (
    <div className="App">
      <header>
        <h1>Psiu Alimentos Ltda</h1>
        <nav>
          {Object.entries(PAGINAS).map(([chave, { titulo }]) => (
            <button key={chave} className={chave === pagina ? 'ativo' : ''} onClick={() => setPagina(chave)}>
              {titulo}
            </button>
          ))}
        </nav>
      </header>
      <main>
        <Pagina />
      </main>
    </div>
  );
}

export default App;
