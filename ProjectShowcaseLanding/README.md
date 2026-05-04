# ProjectShowcaseLanding

Landing page para mostrar los proyectos CoachingApp, LogoApp y NutriApp a clientes.

## Ejecutar en local

```bash
cd ProjectShowcaseLanding
python3 -m http.server 5500
```

Luego abre `http://localhost:5500`.

## Personalizar links de demo

Edita `projects.js` y reemplaza los valores `liveUrl` de cada proyecto por la URL real de despliegue.

## Deploy en Vercel

### Opcion 1: desde dashboard

1. Entra a Vercel y haz click en **Add New... > Project**.
2. Importa el repositorio `alexxarmaas/Proyectos`.
3. En **Root Directory** selecciona `ProjectShowcaseLanding`.
4. Framework Preset: **Other**.
5. Build Command: dejar vacio.
6. Output Directory: dejar vacio.
7. Deploy.

### Opcion 2: con Vercel CLI

```bash
cd ProjectShowcaseLanding
npx vercel
```

En el asistente responde:
- Set up and deploy? `yes`
- Which scope? tu cuenta
- Link to existing project? `no` (la primera vez)
- Project name: `project-showcase-landing`
- Directory: `./`

Para produccion:

```bash
npx vercel --prod
```

## Troubleshooting Vercel

Si no te aparece la landing para desplegar, revisa esto:

1. El repo en GitHub debe tener la carpeta ProjectShowcaseLanding en la rama main.
2. En Vercel, al importar el repo, entra a Configure Project y selecciona Root Directory = ProjectShowcaseLanding.
3. Si no ves el selector, desconecta y vuelve a conectar GitHub en Vercel (Settings > Git).
4. Si sigue sin aparecer en dashboard, despliega por CLI desde la carpeta:

```bash
cd ProjectShowcaseLanding
npx vercel --prod
```

Nota: para pruebas locales el comando correcto es python3 -m http.server 5500.

## Deploy completo por CLI (recomendado)

Este flujo crea demos funcionales con backend serverless + frontend por cada app.

### 0) Login en Vercel

```bash
npx vercel login
```

### 1) Landing

```bash
cd /workspaces/Proyectos/ProjectShowcaseLanding
rm -rf .vercel
npx vercel --prod
```

Respuestas recomendadas del asistente:
- Set up and deploy? yes
- Which scope? tu cuenta
- Link to existing project? no
- Project name: project-showcase-landing
- In which directory is your code located? ./
- Want to modify these settings? no
- Do you want to change additional project settings? no

### 2) CoachingApp backend (serverless)

```bash
cd /workspaces/Proyectos/CoachingApp/backend
rm -rf .vercel
npx vercel --prod
```

Respuestas recomendadas:
- Link to existing project? no
- Project name: coachingapp-backend
- Directory: ./

Guarda la URL final, por ejemplo:
- https://coachingapp-backend.vercel.app

### 3) CoachingApp frontend

```bash
cd /workspaces/Proyectos/CoachingApp/frontend
rm -rf .vercel
npx vercel --prod
```

Respuestas recomendadas:
- Link to existing project? no
- Project name: coachingapp-frontend
- Directory: ./

Despues, configura variable en Vercel para el frontend:
- Name: VITE_API_URL
- Value: URL del backend (sin /api), por ejemplo https://coachingapp-backend.vercel.app

Luego redeploy del frontend:

```bash
cd /workspaces/Proyectos/CoachingApp/frontend
npx vercel --prod
```

### 4) NutriApp backend (serverless)

```bash
cd /workspaces/Proyectos/NutriApp/backend
rm -rf .vercel
npx vercel --prod
```

Respuestas recomendadas:
- Link to existing project? no
- Project name: nutriapp-backend
- Directory: ./

Guarda la URL final del backend.

### 5) NutriApp frontend

```bash
cd /workspaces/Proyectos/NutriApp/frontend
rm -rf .vercel
npx vercel --prod
```

Configura variable del frontend:
- Name: VITE_API_URL
- Value: URL del backend de NutriApp (sin /api)

Redeploy:

```bash
cd /workspaces/Proyectos/NutriApp/frontend
npx vercel --prod
```

### 6) LogoApp backend (serverless)

```bash
cd /workspaces/Proyectos/LogoApp/backend
rm -rf .vercel
npx vercel --prod
```

Respuestas recomendadas:
- Link to existing project? no
- Project name: logoapp-backend
- Directory: ./

### 7) LogoApp frontend

```bash
cd /workspaces/Proyectos/LogoApp/frontend
rm -rf .vercel
npx vercel --prod
```

Si mas adelante conectas LogoApp frontend al backend real, agrega VITE_API_URL con la URL del backend y vuelve a desplegar.

### 8) Actualizar links en la landing

Edita projects.js en ProjectShowcaseLanding y reemplaza cada liveUrl por la URL real de cada frontend desplegado.

Redeploy final:

```bash
cd /workspaces/Proyectos/ProjectShowcaseLanding
npx vercel --prod
```

### Nota sobre serverless + SQLite

En CoachingApp y NutriApp, la base SQLite en Vercel serverless es temporal para demo. Es normal que algunos datos se reinicien.
