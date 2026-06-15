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
- Utilizador, palavra-passe e base de dados: use os valores definidos no seu
  ficheiro `.env` local.

O container do backend executa as migrações e o seed automaticamente. Para parar:

```bash
docker compose down
```

O seed pode criar o superadministrador global e o primeiro administrador do
clube através de `SEED_SUPER_ADMIN_*` e `SEED_ADMIN_*` no `.env` local.

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

Crie os ficheiros locais a partir dos exemplos e preencha valores próprios:

```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
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
| `version` | String | Versão ou variante |
| `year` | Integer | Ano da viatura |
| `currentMileage` | Integer | Quilometragem atual |
| `fuelType` | Enum | Tipo de combustível |
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
| `GET` | `/notifications` | Gera alertas dinâmicos de inspeção e seguro |
| `DELETE` | `/notifications/:notificationId` | Oculta uma notificação para o utilizador atual |
| `GET` | `/clubs` | Lista todos os clubes, apenas superadmin |
| `POST` | `/clubs` | Cria um clube, apenas superadmin |
| `PATCH` | `/clubs/:clubId` | Edita um clube, apenas superadmin |
| `DELETE` | `/clubs/:clubId` | Remove um clube, apenas superadmin |
| `GET` | `/vehicles` | Lista paginada de viaturas |
| `GET` | `/vehicles/dashboard` | Totais por estado |
| `GET` | `/vehicles/:id` | Detalhe de uma viatura |
| `POST` | `/vehicles` | Cria uma viatura |
| `PATCH` | `/vehicles/:id` | Edita uma viatura |
| `DELETE` | `/vehicles/:id` | Remove uma viatura |
| `GET` | `/vehicles/:id/usages` | Histórico paginado de utilizações |
| `POST` | `/vehicles/:id/usages` | Regista utilização e atualiza quilometragem |
| `DELETE` | `/vehicles/:id/usages/:usageId` | Apaga a última utilização e repõe quilometragem |
| `GET` | `/vehicles/:id/revisions` | Histórico paginado de revisões |
| `GET` | `/vehicles/:id/revisions/:revisionId` | Detalhe de uma revisão |
| `POST` | `/vehicles/:id/revisions` | Regista uma revisão, admin ou superadmin |
| `PATCH` | `/vehicles/:id/revisions/:revisionId` | Edita uma revisão, admin ou superadmin |
| `DELETE` | `/vehicles/:id/revisions/:revisionId` | Remove uma revisão, admin ou superadmin |
| `GET` | `/users` | Lista utilizadores do clube e superadmins globais |
| `POST` | `/users` | Adiciona utilizador; só superadmin cria administradores |
| `PATCH` | `/users/:membershipId` | Altera nome, email, função ou estado |
| `DELETE` | `/users/:membershipId` | Remove utilizador ou acesso ao clube |

Para `ADMIN` e `MEMBER`, o login exige código do clube, email e palavra-passe e
o token fica vinculado à inscrição nesse clube. O `SUPER_ADMIN` é global, não
possui `Membership` nem `clubId`; pode indicar um código de clube no login apenas
para selecionar o contexto de trabalho.

Funções disponíveis:

- `SUPER_ADMIN`: conta global sem membership; gere todos os clubes, utilizadores
  e recursos.
- `ADMIN`: pertence obrigatoriamente a um clube, gere recursos e pode criar
  administradores ou membros nesse clube, mas não gere superadministradores.
- `MEMBER`: consulta dashboard e viaturas.

A remoção de um utilizador exige o corpo `{ "confirmation": "delete" }`. Um
administrador não pode gerir `ADMIN` ou `SUPER_ADMIN`. O último superadministrador
ativo não pode ser removido, desativado ou convertido para outra função. Se um
utilizador normal pertencer a outros clubes, apenas a inscrição no clube atual
é removida.

O seed cria o superadministrador através de:

```env
SEED_SUPER_ADMIN_NAME=
SEED_SUPER_ADMIN_EMAIL=
SEED_SUPER_ADMIN_PASSWORD=
```

O administrador inicial do clube é mantido pelo seed através de:

```env
SEED_ADMIN_NAME=
SEED_ADMIN_EMAIL=
SEED_ADMIN_PASSWORD=
```

Se uma destas contas já existir, o seed atualiza apenas os dados de perfil,
função e estado, preservando o hash da palavra-passe atual. As palavras-passe do
seed só são necessárias na primeira criação das contas num ambiente novo.

Se estas variáveis ainda não estiverem configuradas numa instalação existente,
o primeiro administrador ativo é promovido uma única vez para garantir a
existência permanente de pelo menos um `SUPER_ADMIN`.

Os clubes podem ser criados, editados e removidos por qualquer `SUPER_ADMIN`.
A remoção exige `{ "confirmation": "delete" }`, elimina os dados associados em
cascata e o sistema impede que seja apagado o último clube existente.

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
  "version": "Tourer",
  "year": 2022,
  "currentMileage": 48320,
  "fuelType": "DIESEL",
  "type": "VAN",
  "status": "ACTIVE",
  "inspectionDate": "2026-11-12",
  "insuranceDate": "2026-09-30",
  "notes": "Carrinha principal da equipa sénior."
}
```

Exemplo de utilização:

```json
{
  "usedBy": "João Silva",
  "destination": "Estádio Municipal",
  "usageDate": "2026-06-15",
  "startMileage": 120000,
  "endMileage": 120180,
  "fuelAmount": 20.5,
  "fuelCost": 34.9,
  "notes": "Deslocação da equipa sénior."
}
```

O registo é transacional: a quilometragem inicial tem de coincidir com a
quilometragem atual, a final não pode ser inferior e a viatura não pode estar
indisponível. Após a criação, `currentMileage` é atualizada automaticamente.

A eliminação exige corpo `{ "confirmation": "delete" }` e só é permitida para a
utilização mais recente. A quilometragem atual é restaurada para `startMileage`
na mesma transação.

### Revisões e notificações

Cada revisão guarda a data, quilometragem, descrição, serviços realizados,
oficina, custo e a previsão da revisão seguinte por data e/ou quilometragem.

O endpoint `GET /notifications` também gera avisos dinâmicos para a revisão mais
recente de cada viatura:

- próxima revisão por data quando faltam até 30 dias;
- revisão por data vencida quando a data já passou;
- próxima revisão por quilometragem quando faltam até 500 km ou o valor previsto
  foi atingido;
- revisão por quilometragem vencida quando a quilometragem prevista foi
  ultrapassada.

Uma notificação pode ser dispensada individualmente. A dispensa fica associada
ao utilizador e ao clube de trabalho e não afeta os restantes utilizadores. Se o
prazo ou a quilometragem prevista mudar, é gerada uma nova notificação.

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
