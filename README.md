# Ecommerce Platform

Modern e-ticaret platformu - React + Express + TypeScript

## Proje Yapısı

```
EcommercePlatform/
├── client/          # Frontend (React + Vite)
├── server/          # Backend (Express + Drizzle)
├── shared/          # Ortak tipler ve şemalar
└── migrations/      # Database migration'ları
```

## Kurulum

```bash
# Tüm bağımlılıkları yükle
npm run install:all

# Veya manuel olarak:
npm install
npm install --workspace=client
npm install --workspace=server
```

## Geliştirme

```bash
# Frontend ve backend'i aynı anda başlat
npm run dev

# Sadece backend
npm run dev:server

# Sadece frontend
npm run dev:client
```

## Build

```bash
# Tüm projeyi build et
npm run build
```

## Database

```bash
# Migration'ları push et
npm run db:push
```

## Teknolojiler

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Radix UI
- React Query
- React Hook Form
- Zod

### Backend
- Express.js
- TypeScript
- Drizzle ORM
- PostgreSQL
- Passport.js
- Nodemailer

### Ortak
- Zod (validation)
- TypeScript 