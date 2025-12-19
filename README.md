# Sports Articles

A full-stack application for managing sports articles using TypeScript, Node.js, Express, Apollo Server v4 (GraphQL), Next.js, and PostgreSQL.

## 🏗️ Architecture

This project contains two independent applications:

- **Backend** (`apps/backend`): Express + Apollo Server v4 + TypeORM + PostgreSQL
- **Frontend** (`apps/frontend`): Next.js 14 (Pages Router) + Apollo Client + Material UI

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 18.0.0 ([Download](https://nodejs.org/))
- **pnpm** >= 8.0.0 ([Installation Guide](https://pnpm.io/installation))
- **Docker** and **Docker Compose** ([Download](https://www.docker.com/get-started))

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd sport-articles
```

### 2. Install Dependencies

Install dependencies for each app separately:

```bash
# Backend
cd apps/backend
pnpm install

# Frontend
cd apps/frontend
pnpm install
```

### 3. Start PostgreSQL Database

Start the PostgreSQL database using Docker Compose:

```bash
docker-compose up -d
```

This will start a PostgreSQL 15 container on port `5432` with:
- Database: `sports_articles_db`
- User: `sports_articles_user`
- Password: `sports_articles_password`

You can verify the database is running:

```bash
docker ps
```

### 4. Configure Environment Variables

#### Backend

Create a `.env` file in `apps/backend/`:

```bash
cp apps/backend/.env.example apps/backend/.env
```

The default configuration should work if you're using the Docker Compose setup:

```env
DATABASE_URL="postgresql://sports_articles_user:sports_articles_password@localhost:5432/sports_articles_db?schema=public"
PORT=4000
NODE_ENV=development
```

#### Frontend

Create a `.env.local` file in `apps/frontend/`:

```bash
cp apps/frontend/.env.example apps/frontend/.env.local
```

Default configuration:

```env
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:4000/graphql
```

### 5. Set Up Database

#### Run Migrations

```bash
cd apps/backend
pnpm db:migrate
```

This will create the `sports_articles` table in your database.

#### Seed Initial Data

Load sports articles data from the CSV file:

```bash
cd apps/backend
pnpm db:seed
```

This will import all articles from `sports-articles.csv` into the database.

### 6. Start Development Servers

**Backend** (Terminal 1):

```bash
cd apps/backend
pnpm dev
```

The GraphQL API will be available at `http://localhost:4000/graphql`

**Frontend** (Terminal 2):

```bash
cd apps/frontend
pnpm dev
```

The frontend will be available at `http://localhost:3000`

## 📚 Available Scripts

### Backend (`apps/backend`)

```bash
cd apps/backend
```

- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm db:migrate` - Run database migrations
- `pnpm db:seed` - Seed database from CSV
- `pnpm lint` - Run ESLint

### Frontend (`apps/frontend`)

```bash
cd apps/frontend
```

- `pnpm dev` - Start Next.js development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

### Next.js Image Configuration

The application is configured to allow images from any external URL. This is set in `apps/frontend/next.config.js`:

```javascript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: '**',
    },
    {
      protocol: 'http',
      hostname: '**',
    },
  ],
}
```

This allows articles to use images from any source (Unsplash, Freepik, or any other image hosting service).

## 🗄️ Database Management

### Database Migrations

Run migrations:

```bash
cd apps/backend
pnpm db:migrate
```

This will execute all pending migrations and create/update the database schema.

### Reset Database

To reset the database (⚠️ **WARNING**: This deletes all data):

```bash
# Stop the database
docker-compose down -v

# Start it again
docker-compose up -d

# Run migrations and seed (from apps/backend directory)
cd apps/backend
pnpm db:migrate
pnpm db:seed
```

## 🧪 Testing the API

### GraphQL Playground

Apollo Server v4 doesn't include GraphQL Playground by default. You can use:

1. **Apollo Studio** - Visit `http://localhost:4000/graphql` (if introspection is enabled)
2. **Postman** or **Insomnia** - Configure a GraphQL request
3. **curl** - Use command-line tools

### Example GraphQL Queries

#### Fetch All Articles (with pagination)

```graphql
query {
  articles(limit: 10, offset: 0) {
    articles {
      id
      title
      content
      createdAt
      imageUrl
    }
    totalCount
    hasMore
  }
}
```

#### Fetch Single Article

```graphql
query {
  article(id: "article-id") {
    id
    title
    content
    createdAt
    deletedAt
    imageUrl
  }
}
```

#### Create Article

```graphql
mutation {
  createArticle(
    input: {
      title: "New Article Title"
      content: "Article content here..."
      imageUrl: "https://example.com/image.jpg"
    }
  ) {
    id
    title
    content
    createdAt
    imageUrl
  }
}
```

#### Update Article

```graphql
mutation {
  updateArticle(
    id: "article-id"
    input: {
      title: "Updated Title"
      content: "Updated content..."
      imageUrl: "https://example.com/image.jpg"
    }
  ) {
    id
    title
    content
    createdAt
    deletedAt
    imageUrl
  }
}
```

#### Delete Article

```graphql
mutation {
  deleteArticle(id: "article-id")
}
```

## 🏗️ Project Structure

```
sport-articles/
├── apps/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── entities/
│   │   │   │   └── SportsArticle.ts   # TypeORM entity
│   │   │   ├── migrations/
│   │   │   │   └── *.ts               # TypeORM migrations
│   │   │   ├── graphql/
│   │   │   │   ├── schema.ts          # GraphQL type definitions
│   │   │   │   └── resolvers.ts       # GraphQL resolvers
│   │   │   ├── scripts/
│   │   │   │   ├── seed.ts            # Database seeding script
│   │   │   │   └── migrate.ts         # Migration runner
│   │   │   ├── data-source.ts         # TypeORM data source config
│   │   │   └── index.ts               # Express + Apollo Server setup
│   │   ├── .env.example
│   │   └── package.json
│   └── frontend/
│       ├── src/
│       │   ├── pages/                 # Next.js Pages Router
│       │   │   ├── _app.tsx           # App wrapper with providers
│       │   │   ├── _document.tsx      # Document structure
│       │   │   ├── index.tsx           # List page (SSR with getServerSideProps)
│       │   │   ├── create.tsx          # Create article page
│       │   │   └── article/
│       │   │       └── [articleId]/
│       │   │           ├── [articleId].tsx  # Article details (SSR)
│       │   │           └── edit.tsx         # Edit article page
│       │   ├── components/
│       │   │   ├── ApolloWrapper.tsx
│       │   │   ├── ArticleDetailContent.tsx
│       │   │   ├── ArticleImage.tsx
│       │   │   ├── ArticlesList.tsx
│       │   │   ├── CreateArticleContent.tsx
│       │   │   ├── DeleteArticleModal.tsx
│       │   │   ├── EditArticleContent.tsx
│       │   │   ├── HomePageContent.tsx
│       │   │   └── ThemeRegistry.tsx
│       │   ├── lib/
│       │   │   ├── apollo-client.ts        # Browser Apollo Client
│       │   │   ├── apollo-server-client.ts # Server Apollo Client (SSR)
│       │   │   ├── apollo-config.ts        # Shared Apollo Client config
│       │   │   ├── theme.ts
│       │   │   └── graphql/
│       │   │       └── queries.ts          # GraphQL queries and mutations
│       │   ├── types/
│       │   │   └── article.ts              # Shared TypeScript types
│       │   └── styles/
│       │       └── globals.css
│       ├── next.config.js            # Next.js config (image domains)
│       ├── .env.example
│       └── package.json
├── docker-compose.yml                 # PostgreSQL Docker configuration
├── sports-articles.csv                # Seed data
├── .gitignore                         # Git ignore patterns
└── README.md                          # This file
```

## 🛠️ Tech Stack

### Backend

- **Node.js** - JavaScript runtime
- **TypeScript** - Type-safe JavaScript
- **Express** - Web framework
- **Apollo Server v4** - GraphQL server
- **TypeORM** - ORM and database toolkit
- **PostgreSQL** - Relational database
- **Zod** - Schema validation

### Frontend

- **Next.js 14** - React framework with Pages Router
- **TypeScript** - Type-safe JavaScript
- **Apollo Client** - GraphQL client (with SSR support)
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **Material UI** - React component library

### Development Tools

- **pnpm** - Fast, disk space efficient package manager
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Docker** - Containerization

## 📄 Features

### Backend

- GraphQL API with Apollo Server v4
- CRUD operations for sports articles
- Input validation (title and content required)
- Readable GraphQL error messages
- Soft delete support (deletedAt field)
- PostgreSQL database with TypeORM

### Frontend

- **Server-Side Rendering (SSR)**:
  - List page shows first 10 articles via SSR using `getServerSideProps`
  - Article details page uses SSR with `getServerSideProps`
- **Pages**:
  - `/` - Articles list with SSR
  - `/create` - Create new article
  - `/article/[articleId]` - Article details with SSR
  - `/article/[articleId]/edit` - Edit article
- **Features**:
  - Client-side validation using Zod
  - Server error handling
  - Responsive design with Material UI
  - Clean, user-friendly UI
  - Image support from any external URL
  - Error handling for failed image loads
  - Image loading indicators
  - Pagination with "Load More" functionality
  - Apollo Client cache management
  - Shared TypeScript types

## 🐛 Troubleshooting

### Database Connection Issues

If you're having trouble connecting to the database:

1. Ensure Docker is running: `docker ps`
2. Check if the container is healthy: `docker-compose ps`
3. Verify the connection string in `apps/backend/.env`
4. Try restarting the database: `docker-compose restart`

### Port Already in Use

If port 4000 or 3000 is already in use:

1. Change the port in `apps/backend/.env` (for backend)
2. Change the port in `apps/frontend/package.json` scripts (for frontend)
3. Update `NEXT_PUBLIC_GRAPHQL_URL` in frontend `.env.local` if backend port changed

### Migration Issues

If migrations fail:

1. Check database connection
2. Ensure you're using the correct database URL
3. Try resetting: `docker-compose down -v && docker-compose up -d`

## 📝 Code Quality

The project includes:

- **ESLint** - Configured for TypeScript with recommended rules
- **Prettier** - Consistent code formatting
- **TypeScript** - Strict type checking enabled with decorator support for TypeORM
- **Zod** - Runtime validation for GraphQL inputs
- **TypeORM** - Database migrations and entity management

Run linting:

```bash
pnpm lint
```

Format code:

```bash
pnpm format
```

## 🚢 Production Deployment

### Build for Production

```bash
pnpm build
```

### Environment Variables

Ensure all environment variables are set correctly for production:

- Backend: `DATABASE_URL`, `PORT`, `NODE_ENV`
- Frontend: `NEXT_PUBLIC_GRAPHQL_URL`

### Database

For production, use a managed PostgreSQL service (AWS RDS, Heroku Postgres, etc.) and update the `DATABASE_URL` accordingly.

## 📄 License

This project is created for assessment purposes.

## 👤 Author

Created as part of a technical assessment.

---

**Note**: Make sure Docker is running before starting the database. The application requires PostgreSQL to be running for the backend to function properly.
