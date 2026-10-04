FACULDADE GRAN (https://faculdade.grancursosonline.com.br/)

Projeto Disciplina Projeto Integrador

# M&R COMERCIO DE ALIMENTOS - Controle de Produtos e Fornecedores

Esse projeto visa criar um sistema de cadastro e controle de Produtos e de Fornecedores para a empresa MAM RIBEIRO COMERCIO DE ALIMENTOS - ME (M&R COMERCIO DE ALIMENTOS).
O Backend foi criado em Node.js (Express) com banco de dados SQLite e fica na pasta `backend/`. O frontend foi criado com ReactJS para a Etapa 3 e fica na pasta `frontend/`.

## Como executar

Backend (em um terminal):

```bash
cd backend
npm install
npm start
```

A API roda em http://localhost:3001 e cria o arquivo `backend/banco.sqlite`.

Para testar no Insomnia, basta importarmos o arquivo `backend/insomnia/mr-comercio-alimentos.json`.

Frontend (em outro terminal):

```bash
cd frontend
npm install
npm start
```

As páginas de Produtos, Fornecedores e Associação abrem em http://localhost:3000.


## Rotas do Projeto

| Método | Rota | Descrição |
| --- | --- | --- |
| GET / POST | `/produtos` | Lista / cadastra produtos |
| GET / PUT / DELETE | `/produtos/:id` | Busca / atualiza / exclui um produto |
| GET / POST | `/fornecedores` | Lista / cadastra fornecedores |
| GET / PUT / DELETE | `/fornecedores/:id` | Busca / atualiza / exclui um fornecedor |
| POST | `/produtos/:produtoId/fornecedores` | Associa um fornecedor (`{ "fornecedor_id": 1 }`) |
| DELETE | `/produtos/:produtoId/fornecedores/:fornecedorId` | Desassocia o fornecedor |
| GET | `/produtos/:produtoId/fornecedores` | Fornecedores de um produto |
| GET | `/fornecedores/:fornecedorId/produtos` | Produtos de um fornecedor |
