# LogoGest

Plataforma de gestión para logopedas. MVP desarrollado con React (frontend) y Express (backend).

## Estructura del Proyecto

```
LogoApp/
├── frontend/          # React + Vite (puerto 5173)
│   ├── src/
│   │   ├── components/    # Sidebar, TopBar, Toast, SearchBar
│   │   ├── context/       # ThemeContext (modo oscuro), ToastContext
│   │   ├── pages/         # Dashboard, Patients, Agenda, Exercises, Billing, PatientPortal
│   │   └── mockData.js    # Datos de prueba (reemplazar con API calls)
│   └── public/
│       └── logo.png       # ← Coloca aquí el logo (44x44 recomendado)
│
├── backend/           # Express API (puerto 3001)
│   └── src/
│       ├── routes/        # /api/patients, /api/appointments, /api/exercises, /api/billing
│       ├── controllers/   # Lógica de negocio
│       ├── models/        # Definición de modelos (para futuro ORM)
│       ├── middleware/    # errorHandler, auth (JWT placeholder)
│       └── data/
│           └── mockData.js  # Datos mock del servidor
│
└── package.json       # Scripts raíz del monorepo
```

## Inicio rápido

### Instalar dependencias
```bash
npm run install:all
```

### Arrancar solo el frontend (MVP)
```bash
npm run dev:frontend
# → http://localhost:5173
```

### Arrancar el backend
```bash
npm run dev:backend
# → http://localhost:3001
# → http://localhost:3001/api/health
```

## Logo
Coloca el archivo `logo.png` en `frontend/public/logo.png` para que aparezca en el sidebar. Si no existe, se mostrará un avatar con las iniciales "LG".

## Próximos pasos (escalabilidad)
- [ ] Conectar base de datos (SQLite dev → PostgreSQL prod)
- [ ] Implementar autenticación JWT (estructura ya preparada en `backend/src/middleware/auth.js`)
- [ ] Conectar el frontend a la API real (reemplazar `mockData.js` por `fetch('/api/...')`)
- [ ] Añadir tests (Vitest para frontend, Jest para backend)
- [ ] Configurar CI/CD (GitHub Actions)
- [ ] Deploy: Vercel (frontend) + Railway/Render (backend)
