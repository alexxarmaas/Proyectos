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
