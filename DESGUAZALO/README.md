# DESGUÁZALO

DESGUÁZALO es un marketplace móvil-first para vender piezas usadas de coche y vehículos completos para despiece. La plataforma no procesa pagos ni envíos: comprador y vendedor contactan directamente y acuerdan la operación fuera de DESGUÁZALO.

## MVP incluido

- Registro y login con Supabase Auth.
- Publicación rápida en 3 pasos con 1–5 imágenes.
- Piezas individuales y vehículos completos para despiece.
- Marketplace con búsqueda y filtros por marca, modelo, año, categoría, precio, localización, estado y disponibilidad.
- URLs amigables y fichas con contacto por WhatsApp/teléfono.
- Perfil público de vendedor y sus publicaciones.
- Favoritos, Mis anuncios, edición, borrado y estados disponible/reservada/vendida.
- Reportes de contenido.
- Backoffice mínimo: usuarios, publicaciones, ocultación, borrado, reportes y métricas básicas.
- SEO: metadata, OpenGraph, sitemap y robots.
- Dataset demo realista y seed reproducible.
- Modelo preparado para compatibilidad de una pieza con varios vehículos.

## Stack y arquitectura

- **Next.js 16 / App Router**: frontend y renderizado full-stack.
- **React 19 + TypeScript**.
- **Supabase Auth**: registro, login y sesión.
- **Supabase Postgres**: perfiles, anuncios, favoritos, reportes y compatibilidades.
- **Supabase Storage**: fotografías de anuncios.
- **Row Level Security (RLS)**: autorización efectiva en base de datos.
- **Vercel**: despliegue recomendado.

La aplicación puede arrancar sin Supabase para revisar la interfaz pública: en ese caso usa `lib/demo.ts`. Registro, publicación, favoritos, edición y backoffice necesitan un proyecto Supabase configurado.

## Estructura

```text
DESGUAZALO/
├── app/                    # Rutas App Router
├── components/             # Componentes compartidos
├── lib/                    # Datos, Supabase, tipos y utilidades
├── scripts/seed.mjs        # Seed reproducible
├── supabase/migrations/    # Esquema, seguridad y optimizaciones RLS
├── tests/                  # Tests rápidos
└── .env.example
```

## Instalación local

Requisitos: Node.js 20+ y npm.

```bash
cd DESGUAZALO
npm install
cp .env.example .env.local
npm run dev
```

Abrir `http://localhost:3000`.

## Variables de entorno

```env
NEXT_PUBLIC_SUPABASE_URL=https://TU_PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Solo para npm run seed. Nunca usar NEXT_PUBLIC_* para esta clave.
SUPABASE_SERVICE_ROLE_KEY=...
```

`SUPABASE_SERVICE_ROLE_KEY` se usa únicamente para ejecutar el seed desde un entorno de confianza. Nunca debe llegar al navegador ni versionarse.

## Supabase y migraciones

DESGUÁZALO dispone de un proyecto Supabase dedicado. Para recrear la base desde cero, aplicar en orden todo `supabase/migrations/`:

1. `202609160001_initial.sql` — tablas, índices, búsqueda, RLS y bucket `listing-images`.
2. `202609160002_security_hardening.sql` — mueve helpers `SECURITY DEFINER` al esquema privado y elimina su exposición como RPC público.
3. `202609160003_rls_performance.sql` — optimiza las políticas RLS e índices de claves foráneas.

Con Supabase CLI:

```bash
supabase link --project-ref TU_PROJECT_REF
supabase db push
```

El esquema final incluye:

- `profiles`
- `listings`
- `listing_images`
- `listing_compatibilities`
- `favorites`
- `reports`
- `tsvector` de búsqueda en español
- bucket `listing-images`
- trigger de creación de perfil al registrar un usuario
- RLS para propietarios, usuarios y administradores

### Seguridad

- Un usuario solo puede crear anuncios con su propio `seller_id`.
- Edición y borrado están protegidos por RLS, no solo por la UI.
- `is_admin` no está disponible entre las columnas actualizables por usuarios normales.
- Las imágenes solo se pueden subir dentro de la carpeta cuyo primer segmento coincide con `auth.uid()`.
- Solo propietario o administrador puede eliminar ficheros del anuncio.
- El email de acceso no se publica en el perfil del vendedor.
- El `next` posterior al login solo acepta rutas internas.
- Storage limita cada imagen a 8 MB y a JPG/PNG/WEBP.
- Los helpers con privilegios elevados viven en el esquema `private`, fuera de la API pública.

En el proyecto Supabase usado durante el desarrollo, el asesor de seguridad queda sin findings después de aplicar las tres migraciones. Los avisos de rendimiento restantes son únicamente índices sin uso en una base recién creada.

## Seed y usuarios demo

Después de aplicar las migraciones, configurar `SUPABASE_SERVICE_ROLE_KEY` en `.env.local` y ejecutar:

```bash
npm run seed
```

El seed crea usuarios de desarrollo y carga piezas, coches para despiece, anuncios disponibles/reservados/vendidos y ejemplos de compatibilidad.

```text
Vendedor
Email: demo@desguazalo.local
Password: DesguazaloDemo2026!

Administrador
Email: admin@desguazalo.local
Password: DesguazaloAdmin2026!
```

Estas credenciales son exclusivamente de demo/desarrollo. Eliminarlas o cambiarlas antes de una apertura pública.

## Flujo demo recomendado

1. Entrar con el usuario vendedor o registrar uno nuevo.
2. Abrir **Publicar**.
3. Subir entre 1 y 5 JPG/PNG/WEBP.
4. Crear una pieza indicando como mínimo pieza, coche, precio y localización.
5. Comprobar que aparece en el marketplace.
6. Buscarla por título, coche o referencia.
7. Abrir la ficha y comprobar WhatsApp/teléfono.
8. Guardarla en favoritos desde otro usuario.
9. Volver a **Mis anuncios** y marcarla reservada o vendida.
10. Usar una cuenta con `profiles.is_admin = true` para probar moderación y reportes.

Consultas de referencia del dataset demo:

- `faros golf 7`
- `caja cambios polo 1.0 tsi`
- `motor bmw e46`
- `despiece ibiza 6j`

## Calidad

```bash
npm run check
```

Ejecuta, en orden:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

GitHub Actions ejecuta el mismo gate para cambios de `DESGUAZALO/**`.

## Build de producción

```bash
npm run build
npm start
```

El build puede ejecutarse sin Supabase para validar compilación y páginas públicas. Un entorno con usuarios reales requiere las dos variables públicas de Supabase.

## Despliegue en Vercel

1. Importar `alexxarmaas/Proyectos` como un proyecto nuevo.
2. Definir **Root Directory** = `DESGUAZALO`.
3. Configurar `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` y `NEXT_PUBLIC_SITE_URL`.
4. No configurar `SUPABASE_SERVICE_ROLE_KEY` en el frontend.
5. Añadir el dominio de producción y las previews necesarias en las Redirect URLs de Supabase Auth.
6. Desplegar.

No reutilizar el proyecto Vercel de otra aplicación del monorepo.

## Preparación para crecimiento

`listing_compatibilities` permite asociar una pieza a varios vehículos sin modificar `listings`. El modelo deja espacio para cuentas profesionales/verificadas, destacados, promociones, pagos, envíos, valoraciones, VIN/matrícula, notificaciones, geobúsqueda, recomendaciones y aplicación móvil sin introducir esas complejidades en el MVP.

## Decisiones del MVP

- Sin pagos internos ni logística propia.
- Sin chat interno: WhatsApp/teléfono reducen fricción durante la validación.
- Sin motor automático de compatibilidad; sí existe el modelo de datos.
- Sin geolocalización precisa; la localización se filtra como texto.
- Las imágenes demo son remotas; las publicaciones reales usan Supabase Storage.

## Antes de abrir al público

- Configurar dominio y URLs de Auth definitivos.
- Ejecutar `npm run seed` solo si se quieren datos demo en el entorno elegido.
- Cambiar o eliminar las cuentas demo.
- Probar manualmente registro/login, publicación con imagen, favoritos, edición y cambio de estado en el dominio desplegado.
- Hacer una pasada visual final en iPhone, Android, tablet y escritorio.
