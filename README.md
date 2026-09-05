# ABCN Client

Public bilingual website and administration interface for ABCN.

## Requirements

- Node.js 20.19 or newer
- npm 9 or newer
- ABCN API running locally or available over HTTPS

The currently approved Windows environment (`Node 20.19.4`, `npm 9.9.4`) is compatible.

## Local setup

```bash
npm install
copy .env.example .env
npm run dev
```

The website runs at `http://localhost:5173` by default.

## Environment

```env
VITE_API_URL=http://localhost:8000/api/v1
```

## Production build

```bash
npm run build
```

The production output is written to `dist/`.

## Current routes

- `/` — homepage
- `/about` — company and leadership
- `/solutions` — engineering directions
- `/products` — prepared catalog structure
- `/products/:slug` — published product details and documents
- `/contact` — project inquiry form
- `/admin/login` — administration login
- `/admin` — administration dashboard
- `/admin/inquiries` — project inquiries
- `/admin/content` — bilingual page and SEO editor
- `/admin/categories` — product category editor
- `/admin/products` — product, specification and document editor
- `/admin/media` — image and PDF library
