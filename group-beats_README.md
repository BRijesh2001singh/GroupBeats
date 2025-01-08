
# Full-Stack Application Setup (Client + Server)

This project is a full-stack application with the client built using **Next.js** and the server built using **Node.js**, **Express.js**, **Prisma**, and **PostgreSQL**, all written in **TypeScript**.

## Folder Structure

```
/project-root
  /client      # Next.js frontend
  /server      # Node.js backend with Express.js
  .env         # Environment variables for both client and server
  tsconfig.json
  package.json
```

## Prerequisites

Before you begin, ensure that you have the following software installed:

- **Node.js** (version >=14)
- **PostgreSQL** (for the database)
- **Redis** (if using caching)
- **TypeScript** (global or locally)
- **Git**

## Getting Started

### Step 1: Clone the Repository

Clone the repository to your local machine:

```bash
git clone https://github.com/yourusername/full-stack-app.git
cd full-stack-app
```

### Step 2: Set up the Client (Next.js with TypeScript)

1. Navigate to the `client` folder:

```bash
cd client
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables. Create a `.env.local` file in the `client` directory and add:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

This sets the API URL for the client to communicate with the backend.

4. Start the client development server:

```bash
npm run dev
```

The client will be available at `http://localhost:3000`.

### Step 3: Set up the Server (Node.js, Express.js, Prisma, PostgreSQL)

1. Navigate to the `server` folder:

```bash
cd server
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables. Create a `.env` file in the `server` directory with the following settings:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/your_database
REDIS_URL=redis://localhost:6379
```

4. Run database migrations with Prisma:

```bash
npx prisma migrate dev
```

This will apply any database schema changes and create tables in PostgreSQL.

5. Start the server:

```bash
npm run dev
```

The backend server will be available at `http://localhost:5000`.

### Step 4: Running Both Client and Server

For development purposes, you can run both the client and server concurrently. Open two terminals:

- In one terminal, start the client (Next.js):

```bash
cd client
npm run dev
```

- In the second terminal, start the backend server (Express.js):

```bash
cd server
npm run dev
```

### Step 5: Database Setup

1. **PostgreSQL Setup**:
   - Ensure that PostgreSQL is installed on your local machine.
   - Create a new database and user for the project:

   ```bash
   psql -U postgres
   CREATE DATABASE your_database;
   CREATE USER your_user WITH PASSWORD 'your_password';
   ALTER ROLE your_user SET client_encoding TO 'utf8';
   ALTER ROLE your_user SET default_transaction_isolation TO 'read committed';
   ALTER ROLE your_user SET timezone TO 'UTC';
   GRANT ALL PRIVILEGES ON DATABASE your_database TO your_user;
   ```

2. **Redis Setup** (if applicable):
   - Install Redis (if you’re using caching).
   - Run Redis server:

   ```bash
   redis-server
   ```

### Step 6: TypeScript Configuration

1. In the root of the project, ensure that you have a `tsconfig.json` for both client and server:

   **Root `tsconfig.json`**:

   ```json
   {
     "compilerOptions": {
       "target": "ES6",
       "module": "commonjs",
       "strict": true,
       "esModuleInterop": true,
       "skipLibCheck": true,
       "forceConsistentCasingInFileNames": true,
       "baseUrl": "./",
       "paths": {
         "@client/*": ["client/*"],
         "@server/*": ["server/*"]
       },
       "outDir": "./dist"
     },
     "include": ["server/**/*.ts", "client/**/*.ts", "client/**/*.tsx"]
   }
   ```

### Step 7: Deployment

To deploy the application, you can use services like **Heroku** for the backend and **Vercel** for the frontend.

### Step 8: Contribution

Feel free to fork this project and contribute by opening issues or submitting pull requests.

### Step 9: License

This project is licensed under the MIT License.
