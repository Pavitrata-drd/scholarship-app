# ScholarHub — Scholarship Platform

ScholarHub is a scholarship discovery and tracking platform with a React frontend and an Express + PostgreSQL backend.

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS + shadcn-ui (Radix)
- TanStack React Query

### Backend
- Node.js + Express + TypeScript
- PostgreSQL (`pg`)
- JWT auth (`jsonwebtoken`)
- Zod validation

## Project Structure

- `src/` → frontend app
- `server/src/` → backend API
- `server/src/db/seed.ts` → seed data and demo users

## Getting Started

### 1) Install dependencies

```sh
npm install
cd server
npm install
```

### 2) Configure frontend API URL

Create `.env` in project root:

```env
VITE_API_URL=http://localhost:4000/api
```

### 3) Run backend

```sh
cd server
npm run db:seed
npm run dev
```

### 4) Run frontend

```sh
npm run dev
```

## Scripts

### Root

| Command | Description |
|---|---|
| `npm run dev` | Start frontend dev server |
| `npm run build` | Build frontend |
| `npm run lint` | Lint frontend + backend TS files |
| `npm run test` | Run frontend tests |

### Server (`server/`)

| Command | Description |
|---|---|
| `npm run dev` | Start backend in watch mode |
| `npm run build` | Compile backend TypeScript |
| `npm run db:seed` | Seed scholarships and demo users |
