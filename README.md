# Sistema de Chamados - Assistência Auto

Sistema completo de gerenciamento de chamados para assistência automotiva, desenvolvido com React, TypeScript, Express e MySQL.

## 🚀 Tecnologias

### Frontend
- React 18
- TypeScript
- TailwindCSS
- React Router DOM
- Axios
- Lucide React (ícones)
- Vite

### Backend
- Node.js
- Express
- TypeScript
- MySQL2
- JWT (autenticação)
- Bcrypt (criptografia)
- CORS

## 📋 Pré-requisitos

- Node.js 18+ instalado
- MySQL 8+ instalado e rodando
- MySQL Workbench (opcional, para gerenciar o banco)

## 🔧 Instalação

### 1. Clonar o repositório
```bash
cd assistencia
```

### 2. Configurar o Banco de Dados

Abra o MySQL Workbench e execute o script SQL:
```bash
backend/database/schema.sql
```

Isso criará:
- Banco de dados `assistencia_auto`
- Todas as tabelas necessárias
- Dados iniciais (categorias, empresa exemplo, usuário admin)

### 3. Configurar Backend

```bash
cd backend
npm install
```

Crie o arquivo `.env` baseado no `.env.example`:
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais do MySQL:
```env
PORT=3001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha_mysql
DB_NAME=assistencia_auto
JWT_SECRET=sua_chave_secreta_jwt_muito_segura
NODE_ENV=development
```

### 4. Configurar Frontend

```bash
cd ../frontend
npm install
```

### 5. Instalar dependências da raiz (opcional)

```bash
cd ..
npm install
```

## ▶️ Executar o Projeto

### Opção 1: Executar tudo de uma vez (da raiz)
```bash
npm run dev
```

### Opção 2: Executar separadamente

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## 🌐 Acessar o Sistema

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

### Credenciais Padrão
- **Email**: admin@assistencia.com
- **Senha**: admin123

## 📱 Funcionalidades Implementadas

### ✅ Autenticação (RF-001)
- Login com JWT
- Proteção de rotas
- Perfis: Técnico e Administrador

### ✅ Gestão de Chamados (RF-002 a RF-007)
- Abertura de chamados
- Listagem com filtros
- Detalhes completos
- Atualização de status
- Atribuição de técnicos
- Sistema de comentários

### ✅ Organização (RF-008, RF-009)
- Gestão de prioridades (Imediata, Alta, Média, Baixa, Programada)
- Categorização (Vidro, Guincho, Chaveiro, Para-brisa, Retrovisor, Pneu)

### ✅ Dashboard e Métricas (RF-010)
- Chamados por prioridade
- Status geral
- Métricas de performance

### ✅ Busca e Filtros (RF-011)
- Busca por texto
- Filtros por status, prioridade, categoria, técnico, tipo de contrato

### ✅ Gestão de Usuários (RF-012, RF-015)
- CRUD de técnicos e administradores
- Controle de permissões

### ✅ Histórico (RF-014)
- Registro completo de alterações
- Rastreabilidade de ações

### ✅ SLA (RF-016)
- Cálculo automático de prazos
- Alertas de vencimento

## 🎨 Design

O sistema foi desenvolvido com foco em **responsividade mobile-first**, seguindo a imagem de referência fornecida:

- Layout adaptável para dispositivos móveis
- Sidebar retrátil
- Cards e tabelas responsivas
- Cores e indicadores visuais para prioridades e status

## 📂 Estrutura do Projeto

```
assistencia/
├── backend/
│   ├── database/
│   │   └── schema.sql
│   ├── src/
│   │   ├── config/
│   │   │   └── database.ts
│   │   ├── controllers/
│   │   │   ├── authController.ts
│   │   │   ├── chamadoController.ts
│   │   │   ├── categoriaController.ts
│   │   │   ├── dashboardController.ts
│   │   │   ├── empresaController.ts
│   │   │   └── usuarioController.ts
│   │   ├── middlewares/
│   │   │   └── authMiddleware.ts
│   │   ├── routes/
│   │   │   ├── authRoutes.ts
│   │   │   ├── chamadoRoutes.ts
│   │   │   ├── categoriaRoutes.ts
│   │   │   ├── dashboardRoutes.ts
│   │   │   ├── empresaRoutes.ts
│   │   │   └── usuarioRoutes.ts
│   │   └── server.ts
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.tsx
│   │   │   └── PrivateRoute.tsx
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx
│   │   ├── lib/
│   │   │   └── api.ts
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Chamados.tsx
│   │   │   ├── ChamadoDetalhes.tsx
│   │   │   ├── NovoChamado.tsx
│   │   │   └── Usuarios.tsx
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
├── assistencia-requirements.md
├── .github/
│   └── copilot-instructions.md
└── package.json
```

## 🔐 Segurança

- Senhas criptografadas com bcrypt
- Autenticação JWT
- Middleware de proteção de rotas
- Controle de perfis e permissões
- Validação de dados

## 📊 Banco de Dados

O schema inclui:
- `usuarios` - Gestão de usuários do sistema
- `chamados` - Chamados de assistência
- `categorias` - Categorias de serviço
- `empresas` - Empresas responsáveis
- `comentarios` - Comentários nos chamados
- `historico_alteracoes` - Auditoria de mudanças
- `anexos` - Arquivos anexados
- `sla_config` - Configuração de SLAs

## 🛠️ Comandos Úteis

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento (raiz)
npm run dev

# Build do frontend
cd frontend && npm run build

# Build do backend
cd backend && npm run build
```

## 📝 Notas

- O sistema está configurado para usar MySQL na porta padrão 3306
- O backend roda na porta 3001
- O frontend roda na porta 3000 com proxy para o backend
- Todos os requisitos funcionais foram implementados conforme documento
- Design mobile-first seguindo a referência visual fornecida

## 🤝 Suporte

Para dúvidas ou problemas:
1. Verifique se o MySQL está rodando
2. Confirme que as credenciais no `.env` estão corretas
3. Execute o schema.sql no banco de dados
4. Instale todas as dependências com `npm install`
