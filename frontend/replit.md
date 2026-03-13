# Frontend Project

## Overview
A Next.js 16 frontend application migrated from Vercel to Replit. Uses React 19, TypeScript, Tailwind CSS v4, shadcn/ui components, TanStack Query, Zustand, and Recharts.

## Architecture
- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4 with shadcn/ui
- **State**: Zustand for global state, TanStack React Query for server state
- **Forms**: React Hook Form + Zod validation
- **HTTP**: Axios with JWT auth interceptors (auto-refresh on 401)

## Project Structure
- `app/` — Next.js App Router pages and layouts
  - `(auth)/` — Login and register pages
  - `admin/` — Admin dashboard routes
  - `superadmin/` — Superadmin routes
  - `api/` — Next.js API routes
- `components/` — Reusable UI components (shadcn/ui + custom)
- `lib/api/` — Axios client with JWT interceptors, endpoints, and types

## Environment Variables
- `NEXT_PUBLIC_API_BASE_URL` — Backend API base URL (defaults to `http://localhost:8000`)

## Running the App
- **Dev**: `npm run dev` — starts on port 5000
- **Build**: `npm run build`
- **Start**: `npm run start` — starts on port 5000

## Replit Configuration
- Port: 5000 (required for Replit webview)
- Host: 0.0.0.0 (required for Replit proxy)
- Package manager: npm
