# Factory Gestion (Angular 21)

Internal factory dashboard scaffold based on the current `gestion.html` application.

## Stack

- Angular 21 standalone + signals
- TypeScript strict mode
- Angular Material
- AG Grid (large tables)
- PWA (`@angular/service-worker`)
- JWT auth against FastAPI
- OpenAPI typed client generation
- Capacitor-ready config for Android packaging

## Run

```bash
npm install
npm run start
```

`npm run start` uses `proxy.conf.json` and expects FastAPI at `http://localhost:5000`.

## Build

```bash
npm run build
```

Production deployment target is `/app` (base href is `/app/`).

## Generate typed API client from OpenAPI

```bash
npm run api:generate
```

This command targets `http://localhost:8000/openapi.json` and generates code in:

`src/app/core/api/generated`

## Initial features

- `/login` JWT login form
- `/app/home` dashboard home
- `/app/users` users AG Grid example connected to API
- `/app/settings` settings page
- Shell layout with sidebar + topbar

## Notes

- API paths are relative and proxied:
  - `/api/*`
  - `/auth/*`
- Current generated client folder includes a compile-safe starter implementation; regenerate from OpenAPI to align with your real backend schema.
