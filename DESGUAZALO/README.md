# DESGUÁZALO

DESGUÁZALO es un marketplace móvil-first para vender piezas usadas de coche y vehículos completos para despiece. La plataforma no procesa pagos ni envíos: comprador y vendedor contactan directamente y acuerdan el trato fuera de DESGUÁZALO.

## MVP incluido

- Registro y login con Supabase Auth.
- Publicación rápida en 3 pasos con 1–5 imágenes.
- Piezas individuales y vehículos completos para despiece.
- Marketplace con búsqueda y filtros por marca, modelo, año, categoría, precio, localización, estado y disponibilidad.
- URLs amigables de anuncio.
- Ficha de producto con contacto por WhatsApp/teléfono.
- Perfil público de vendedor y sus publicaciones.
- Favoritos.
- Mis anuncios.
- Edición, borrado y cambio de estado: disponible, reservada y vendida.
- Reportes de contenido.
- Backoffice mínimo con usuarios, publicaciones, ocultación, borrado, reportes y métricas básicas.
- SEO básico: metadata, OpenGraph, sitemap y robots.
- Datos demo realistas y seed reproducible.
- Arquitectura preparada para compatibilidad de una pieza con varios vehículos.

## Stack y arquitectura

- **Next.js 16 / App Router**: frontend y renderizado full-stack.
- **React 19 + TypeScript**.
- **Supabase Auth**: registro, login y sesión.
- **Supabase Postgres**: perfiles, anuncios, favoritos, reportes y compatibilidades.
- **Supabase Storage**: fotografías de anuncios.
- **Row Level Security (RLS)**: autorización real en base de datos.
- **Vercel**: despliegue recomendado del frontend.

La app puede arrancar sin variables de Supabase para revisar la interfaz pública: en ese caso usa el dataset de demostración de `lib/demo.ts`. Para probar registro, publicación, favoritos, edición o backoffice hay que conectar un proyecto Supabase.

## Estructura relevante

```text
DESGUAZALO/
├── app/                    # Rutas App Router
├── components/             # Componentes compartidos
├── lib/                    # Datos, Supabase, tipos y utilidades
├── scripts/seed.mjs        # Seed reproducible de usuarios/anuncios
├── supabase/migrations/    # Esquema, RLS y Storage
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

# Solo para npm run seed. NO debe ser NEXT_PUBLIC.
SUPABASE_SERVICE_ROLE_KEY=...
```

`SUPABASE_SERVICE_ROLE_KEY` se usa únicamente desde el script local de seed. No debe configurarse como variable pública ni utilizarse en componentes del navegador.

## Base de datos y migraciones

Crear un proyecto Supabase independiente para DESGUÁZALO. No reutilizar bases de datos de otros productos.

La migración inicial está en:

```text
supabase/migrations/202609160001_initial.sql
```

Puede aplicarse con Supabase CLI:

```bash
supabase link --project-ref TU_PROJECT_REF
supabase db push
```

O copiando la migración en el SQL Editor de Supabase.

La migración crea:

- `profiles`
- `listings`
- `listing_images`
- `listing_compatibilities`
- `favorites`
- `reports`
- índices de búsqueda y marketplace
- trigger de perfil al registrar usuario
- `tsvector` de búsqueda en español
- políticas RLS
- bucket público `listing-images` con escritura restringida

### Seguridad relevante

- Un usuario solo puede crear anuncios con su propio `seller_id`.
- Edición y eliminación se protegen con RLS, no únicamente ocultando botones.
- `is_admin` no puede modificarse desde un usuario normal: los privilegios de columna lo bloquean además de RLS.
- Las imágenes se suben a una carpeta cuyo primer segmento debe coincidir con `auth.uid()`.
- Solo propietario o administrador puede borrar fotografías.
- El email de acceso no se expone en perfiles públicos.
- El redirect posterior al login solo admite rutas internas.
- Los tipos y tamaño de imagen se validan en cliente y también se limitan en Storage.

## Seed y usuarios demo

Después de aplicar la migración, configurar también `SUPABASE_SERVICE_ROLE_KEY` en `.env.local` y ejecutar:

```bash
npm run seed
```

El seed es idempotente para los IDs principales y carga usuarios, piezas, coches para despiece, anuncios disponibles/reservados/vendidos y ejemplos de compatibilidad.

Usuarios de prueba:

```text
Vendedor
Email: demo@desguazalo.local
Password: DesguazaloDemo2026!

Administrador
Email: admin@desguazalo.local
Password: DesguazaloAdmin2026!
```

Estas credenciales son solo para entornos de demo/desarrollo. No usar en producción.

## Flujo demo recomendado

1. Entrar con `demo@desguazalo.local`.
2. Abrir **Publicar**.
3. Subir entre 1 y 5 JPG/PNG/WEBP.
4. Crear una pieza con nombre, coche, precio y localización.
5. Comprobar que aparece en el marketplace.
6. Buscarla por palabras del título/coche.
7. Abrir la ficha y revisar WhatsApp/teléfono.
8. Añadirla a favoritos desde otro usuario si se desea.
9. Volver a **Mis anuncios** y marcarla como reservada o vendida.
10. Entrar como administrador para probar moderación y reportes.

Consultas de referencia incluidas en los datos demo:

- `faros golf 7`
- `caja cambios polo 1.0 tsi`
- `motor bmw e46`
- `despiece ibiza 6j`

## Calidad y verificación

Ejecutar todo el pipeline local con:

```bash
npm run check
```

Equivale a:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

También existe un workflow de GitHub Actions que ejecuta el mismo bloque sobre cambios de DESGUÁZALO.

## Build de producción

```bash
npm run build
npm start
```

El build puede realizarse sin Supabase para validar compilación y páginas públicas, ya que la aplicación cae al dataset demo cuando faltan las variables. Un entorno funcional con usuarios reales sí requiere Supabase.

## Despliegue en Vercel

1. Importar el repositorio.
2. Definir **Root Directory** como `DESGUAZALO`.
3. Añadir:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `NEXT_PUBLIC_SITE_URL` con la URL final.
4. No añadir `SUPABASE_SERVICE_ROLE_KEY` al frontend salvo que se necesite ejecutar el seed desde un entorno seguro; preferiblemente ejecutar el seed localmente.
5. En Supabase Auth, añadir la URL de producción y URLs de preview necesarias a las Redirect URLs.
6. Desplegar.

## Modelo de crecimiento

La tabla `listing_compatibilities` permite asociar una pieza a varios vehículos sin modificar `listings`. La arquitectura deja espacio para añadir después cuentas profesionales/verificadas, destacados, promociones, pagos, envíos, valoraciones, VIN/matrícula, notificaciones, búsqueda geográfica, recomendaciones y aplicación móvil sin obligar a sobrearquitectar el MVP actual.

## Decisiones de alcance del MVP

- Sin pagos internos.
- Sin logística propia.
- Sin chat interno: WhatsApp/teléfono reducen fricción para validar el producto.
- Sin motor automático de compatibilidad todavía; sí existe el modelo de datos.
- Sin geolocalización precisa; la búsqueda por localización trabaja con texto.
- Las fotografías demo son remotas; las nuevas publicaciones reales usan Supabase Storage.

## Antes de producción pública

Cambiar o eliminar usuarios demo, revisar dominio definitivo, configurar las URLs de Auth, ejecutar la migración sobre un proyecto Supabase dedicado, comprobar las políticas en ese proyecto y realizar una pasada manual en iPhone, Android, tablet y escritorio con el dominio final.