# Santana Autorepuestos — Preview Next.js

Preview comercial y backoffice de Santana Autorepuestos y Accesorios construida con Next.js, React y TypeScript.

## Desarrollo local

```bash
npm install
npm run dev
```

- Web pública: `/`
- Backoffice de demo: `/admin`

## Despliegue en Vercel

1. Importar el repositorio `alexxarmaas/Proyectos`.
2. En **Root Directory**, seleccionar `santana-autorepuestos`.
3. Vercel detectará automáticamente Next.js.
4. No se requieren variables de entorno para esta preview.
5. Desplegar.

## Notas

- El logo se sirve localmente desde `public/santana-logo.jpg`.
- La preview está marcada como `noindex` para evitar indexación accidental durante la fase de demostración.
- Las solicitudes y métricas del backoffice son datos de demostración.
- La siguiente fase puede conectar autenticación, base de datos, almacenamiento de PDFs/imágenes y gestión real de solicitudes sin rehacer la interfaz.
