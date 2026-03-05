# Voice Agent Platform - Frontend

Modern, production-grade frontend for the Voice Agent Platform built with Next.js 16, TypeScript, and Tailwind CSS.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui
- **State Management**:
  - Zustand (auth state)
  - TanStack Query (server state)
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **API Client**: Axios with interceptors

## Features

### Authentication
- JWT-based authentication
- Automatic token refresh on 401
- Role-based access control (SuperAdmin, Admin)
- Persistent auth state
- Protected routes

### SuperAdmin Dashboard
- **Overview**: System-wide analytics and metrics
- **Companies**: Full CRUD for company management
- **Users**: User management across all companies
- **Analytics**: Visual charts and trends

### Admin Dashboard
- **Overview**: Company-specific metrics
- **Calls**: Call history and details with transcript
- **Knowledge Base**: Document management with RAG
- **Agent Configuration**: AI agent customization

## Getting Started

### Installation

```bash
cd frontend
npm install
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth pages (login, register)
│   ├── superadmin/        # SuperAdmin dashboard
│   └── admin/             # Admin dashboard
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── dialogs/          # Modal dialogs
│   └── *.tsx             # Shared components
├── lib/                   # Utilities and configurations
│   ├── api/              # API client and types
│   ├── hooks/            # Custom React hooks
│   ├── providers/        # Context providers
│   └── store/            # Zustand stores
└── .env.local            # Environment variables
```

## Environment Variables

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## Testing

1. Start backend: `cd .. && uvicorn app.main:app --reload`
2. Create superadmin: `python scripts/seed_superadmin.py`
3. Start frontend: `npm run dev`
4. Login and explore!

## License

MIT
