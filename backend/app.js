const express = require('express');
const cors = require('cors');
const produtos = require('./src/controllers/produtoController');
const fornecedores = require('./src/controllers/fornecedorController');
const associacoes = require('./src/controllers/associacaoController');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ mensagem: 'API Psiu Alimentos Ltda - controle de produtos e fornecedores' });
});

app.get('/produtos', produtos.listar);
app.get('/produtos/:id', produtos.buscar);
app.post('/produtos', produtos.criar);
app.put('/produtos/:id', produtos.atualizar);
app.delete('/produtos/:id', produtos.remover);

app.get('/fornecedores', fornecedores.listar);
app.get('/fornecedores/:id', fornecedores.buscar);
app.post('/fornecedores', fornecedores.criar);
app.put('/fornecedores/:id', fornecedores.atualizar);
app.delete('/fornecedores/:id', fornecedores.remover);

app.post('/produtos/:produtoId/fornecedores', associacoes.associar);
app.delete('/produtos/:produtoId/fornecedores/:fornecedorId', associacoes.desassociar);
app.get('/produtos/:produtoId/fornecedores', associacoes.fornecedoresDoProduto);
app.get('/fornecedores/:fornecedorId/produtos', associacoes.produtosDoFornecedor);

// A porta 3000 fica livre para o frontend React (Etapa 3).
const PORT = 3001;

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}/`);
});
