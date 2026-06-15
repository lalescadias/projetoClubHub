# ClubHub

Plataforma modular e multi-clube de gestão desportiva. Esta versão inclui
autenticação, isolamento de dados por clube, gestão básica de utilizadores e o
módulo completo de viaturas.

## Stack

- React 19, TypeScript, Vite e Tailwind CSS 4
- Node.js, Express 5 e TypeScript
- PostgreSQL e Prisma ORM
- API REST
- Autenticação JWT e controlo de acesso por função
- Docker e Docker Compose

## Estrutura

```text
clubhub/
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── src/
│       ├── config/
│       ├── errors/
│       ├── lib/
│       ├── middlewares/
│       ├── modules/vehicles/
│       ├── routes/
│       ├── app.ts
│       └── server.ts
├── frontend/
│   └── src/
│       ├── api/
│       ├── components/
│       ├── hooks/
│       ├── layouts/
│       ├── modules/vehicles/
│       ├── pages/
│       ├── services/
│       └── types/
├── docker-compose.yml
└── README.md
```

O backend usa uma organização orientada a módulos. Controllers, serviços, schemas,
rotas e tipos específicos de viaturas estão juntos em `modules/vehicles`; middleware
e infraestrutura partilhados ficam nas respetivas pastas globais.

O frontend usa Tailwind CSS através do plugin oficial para Vite. Os componentes
aplicam utilitários diretamente no JSX; `src/styles/global.css` contém apenas a
importação do Tailwind, tokens do tema ClubHub e estilos base.

## Arranque rápido com Docker

Requisitos: Docker Desktop com Docker Compose.

```bash
docker compose up --build
```

Depois do arranque:

- Frontend: <http://localhost:5173>
- API: <http://localhost:3333/api>
- Health check: <http://localhost:3333/api/health>
- Adminer: <http://localhost:8080>
- PostgreSQL: `localhost:5432`

No Adminer, use:

- Sistema: `PostgreSQL`
- Servidor: `postgres`
- Utilizador: `clubhub`
- Palavra-passe: `clubhub_password`
- Base de dados: `clubhub`

O container do backend executa as migrações e o seed automaticamente. Para parar:

```bash
docker compose down
```

Contas de demonstração criadas pelo seed:

| Perfil | Email | Palavra-passe |
| --- | --- | --- |
| Admin do Atlético (`atletico-clube`) | `admin@clubhub.pt` | `ClubHub2026!` |
| Membro do Atlético (`atletico-clube`) | `membro@clubhub.pt` | `ClubHub2026!` |
| Admin do Sporting (`sporting-da-vila`) | `admin.vila@clubhub.pt` | `ClubHub2026!` |

Estas credenciais destinam-se apenas a desenvolvimento local.

Para remover também os dados locais:

```bash
docker compose down -v
```

## Desenvolvimento local

### 1. Criar o frontend

Os comandos equivalentes usados para iniciar a aplicação React são:

```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
npm install axios react-router-dom react-hook-form @hookform/resolvers zod lucide-react
npm install -D tailwindcss @tailwindcss/vite
cd ..
```

### 2. Criar o backend

```bash
mkdir backend
cd backend
npm init -y
npm install express cors helmet morgan dotenv zod @prisma/client
npm install -D typescript tsx prisma @types/node @types/express @types/cors @types/morgan
npx tsc --init
npx prisma init
cd ..
```

### 3. Instalar este projeto

No Windows PowerShell com execução de scripts restrita, use `npm.cmd`:

```powershell
npm.cmd run install:all
```

Em macOS/Linux:

```bash
npm run install:all
```

### 4. Iniciar apenas o PostgreSQL

```bash
docker compose up -d postgres
```

O ficheiro `backend/.env` já aponta para o PostgreSQL local:

```env
DATABASE_URL=postgresql://clubhub:clubhub_password@localhost:5432/clubhub?schema=public
PORT=3333
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### 5. Preparar a base de dados

```bash
npm --prefix backend run prisma:generate
npm --prefix backend run prisma:migrate -- --name init
npm --prefix backend run prisma:seed
```

### 6. Iniciar frontend e backend

```bash
npm run dev
```

Também podem ser iniciados separadamente:

```bash
npm run dev:backend
npm run dev:frontend
```

## Modelo Vehicle

| Campo | Tipo | Notas |
| --- | --- | --- |
| `id` | UUID | Chave primária |
| `plate` | String | Matrícula única |
| `make` | String | Marca |
| `model` | String | Modelo |
| `year` | Integer | Ano da viatura |
| `mileage` | Integer | Quilometragem |
| `type` | Enum | `CAR`, `VAN`, `BUS`, `MOTORCYCLE`, `OTHER` |
| `status` | Enum | `ACTIVE`, `MAINTENANCE`, `UNAVAILABLE` |
| `inspectionDate` | Date | Data de validade da inspeção |
| `insuranceDate` | Date | Data de validade do seguro |
| `notes` | Text | Observações opcionais |
| `createdAt` | DateTime | Criação automática |
| `updatedAt` | DateTime | Atualização automática |

## Endpoints REST

Base URL: `http://localhost:3333/api`

| Método | Endpoint | Descrição |
| --- | --- | --- |
| `GET` | `/health` | Estado da API |
| `POST` | `/auth/login` | Inicia sessão |
| `GET` | `/auth/me` | Sessão e clubes do utilizador |
| `PATCH` | `/auth/password` | Altera a palavra-passe |
| `GET` | `/vehicles` | Lista paginada de viaturas |
| `GET` | `/vehicles/dashboard` | Totais por estado |
| `GET` | `/vehicles/:id` | Detalhe de uma viatura |
| `POST` | `/vehicles` | Cria uma viatura |
| `PATCH` | `/vehicles/:id` | Edita uma viatura |
| `DELETE` | `/vehicles/:id` | Remove uma viatura |
| `GET` | `/users` | Lista utilizadores do clube, apenas admin |
| `POST` | `/users` | Adiciona utilizador ao clube, apenas admin |
| `PATCH` | `/users/:membershipId` | Altera função ou estado, apenas admin |

O login exige o código do clube, email e palavra-passe. O token JWT fica vinculado
à inscrição nesse clube e não pode ser reutilizado para aceder a outro clube. As
rotas privadas exigem `Authorization: Bearer <token>`.

Funções disponíveis:

- `ADMIN`: gere utilizadores e viaturas.
- `MEMBER`: consulta dashboard e viaturas.

Parâmetros de `GET /vehicles`:

- `search`: pesquisa em matrícula, marca e modelo
- `status`: `ACTIVE`, `MAINTENANCE` ou `UNAVAILABLE`
- `page`: página, por omissão `1`
- `limit`: registos por página, por omissão `20` e máximo `100`

Exemplo de criação:

```json
{
  "plate": "AA-01-CH",
  "make": "Mercedes-Benz",
  "model": "Sprinter",
  "year": 2022,
  "mileage": 48320,
  "type": "VAN",
  "status": "ACTIVE",
  "inspectionDate": "2026-11-12",
  "insuranceDate": "2026-09-30",
  "notes": "Carrinha principal da equipa sénior."
}
```

## Scripts úteis

```bash
npm run dev
npm run build
npm run db:migrate
npm run db:seed
npm --prefix backend run typecheck
npm --prefix frontend run typecheck
npm --prefix backend run prisma:generate
```

## Evolução da arquitetura

Novos domínios devem seguir a mesma fronteira modular de `vehicles`, por exemplo
`modules/players`, `modules/teams` e `modules/finances`. Cada módulo pode conter os
seus contratos, validações, serviço, controller e rotas, mantendo infraestrutura e
componentes transversais fora dos módulos.
