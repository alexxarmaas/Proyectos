# NutriApp MVP Demo

Demo SaaS B2B para nutricionistas independientes. El foco del producto es ordenar pacientes, consultas, seguimiento y agenda en una sola webapp fácil de enseñar y fácil de operar.

## Propuesta del MVP

- Usuario objetivo: nutricionista independiente no técnico.
- Problema que resuelve: historial disperso entre notas, Excel, calendario y WhatsApp.
- Promesa demo: "en 2 minutos entiendes qué pacientes tienes, qué toca esta semana y qué pasó en la última consulta".

## Estructura del proyecto

```text
NutriApp/
├─ backend/
│  ├─ db.js
│  ├─ server.js
│  ├─ database.sqlite
│  ├─ package.json
│  └─ node_modules/
├─ frontend/
│  ├─ index.html
│  ├─ package.json
│  ├─ vite.config.js
│  ├─ node_modules/
│  └─ src/
│     ├─ App.jsx
│     ├─ main.jsx
│     ├─ index.css
│     ├─ lib/
│     │  └─ api.js
│     ├─ components/
│     │  ├─ Layout.jsx
│     │  ├─ StatCard.jsx
│     │  ├─ EmptyState.jsx
│     │  ├─ PatientFormModal.jsx
│     │  ├─ ConsultationFormModal.jsx
│     │  └─ NoteFormModal.jsx
│     └─ pages/
│        ├─ Login.jsx
│        ├─ Dashboard.jsx
│        ├─ Patients.jsx
│        ├─ PatientProfile.jsx
│        ├─ Consultations.jsx
│        └─ Agenda.jsx
└─ README.md
```

## Modelo de datos

### `users`
- `id`
- `name`
- `email`
- `password`
- `role`
- `created_at`

### `patients`
- `id`
- `name`
- `email`
- `phone`
- `goal`
- `status`
- `general_notes`
- `created_at`
- `updated_at`

### `patient_notes`
- `id`
- `patient_id`
- `content`
- `created_at`

### `consultations`
- `id`
- `patient_id`
- `date`
- `time`
- `weight`
- `observations`
- `habits`
- `recommendations`
- `status`
- `created_at`
- `updated_at`

## Relaciones

- Un `user` representa al nutricionista demo autenticado.
- Un `patient` tiene muchas `consultations`.
- Un `patient` tiene muchas `patient_notes`.
- `consultations.patient_id` y `patient_notes.patient_id` usan borrado en cascada.

## Endpoints REST

### Auth
- `POST /api/auth/login`

### Dashboard
- `GET /api/dashboard`

### Pacientes
- `GET /api/patients`
- `POST /api/patients`
- `GET /api/patients/:id`
- `PUT /api/patients/:id`
- `DELETE /api/patients/:id`

### Seguimiento
- `POST /api/patients/:id/notes`
- `DELETE /api/patients/:patientId/notes/:noteId`

### Consultas
- `GET /api/consultations`
- `POST /api/consultations`
- `PUT /api/consultations/:id`
- `DELETE /api/consultations/:id`

### Agenda
- `GET /api/agenda/week?start=YYYY-MM-DD`

## Flujo de navegación

1. Login demo.
2. Dashboard para mostrar volumen, próximas citas y últimos seguimientos.
3. Pacientes para entrar al directorio y crear o editar fichas.
4. Ficha de paciente para consultar contexto, notas y evolución.
5. Consultas para editar rápidamente el histórico completo.
6. Agenda para revisar la semana y abrir o crear citas.

## Datos demo incluidos

- Nutricionista demo: `nutri@demo.com / admin123`
- Pacientes: Marta Romero, David Serrano, Lucía Navarro y Javier Ortega.
- Consultas con estados `pending`, `completed` y `cancelled`.
- Notas de seguimiento creíbles para escenario de consulta real.

## Por qué cada pantalla vende bien el producto

### Login
- Da sensación de producto cerrado y listo para usar.
- Permite enseñar acceso simple sin fricción técnica.

### Dashboard
- Resume valor en segundos.
- Enseña control del negocio: pacientes activos, próximas consultas y últimos seguimientos.

### Pacientes
- Muestra orden y rapidez operativa.
- Refuerza la idea de "dejo de buscar cosas en varios sitios".

### Ficha de paciente
- Es la pantalla más vendible.
- Concentra objetivo, notas, historial y seguimiento en un solo lugar.

### Consultas
- Demuestra profundidad funcional sin complicar el MVP.
- Ayuda a enseñar edición rápida del trabajo diario.

### Agenda
- Hace visible la organización semanal.
- Refuerza claridad visual para usuarios no técnicos.

## Propuesta visual de pantallas

### Dirección visual
- Estética SaaS limpia y serena.
- Paleta verde clínica suave con fondos claros y superficies blancas.
- Jerarquía fuerte en títulos, tarjetas y estados.
- Sensación general: orden, seguimiento y calma.

### Layout principal
- Sidebar fijo con `Dashboard`, `Pacientes`, `Agenda`, `Consultas`.
- Topbar ligera con identidad del nutricionista.
- Área central con tarjetas, tablas y paneles de lectura rápida.

### Dashboard
- Hero superior con resumen y CTA.
- Tres tarjetas KPI.
- Gráfico de actividad.
- Lista de próximas consultas y tabla de últimos seguimientos.

### Pacientes
- Toolbar con búsqueda y alta rápida.
- Tabla clara con nombre, contacto, objetivo y estado.
- Acciones de editar y eliminar sin salir del contexto.

### Ficha de paciente
- Cabecera con identidad del paciente y acciones clave.
- Bloque lateral para contexto y notas.
- Timeline de consultas con peso, observaciones, hábitos y recomendaciones.

### Consultas
- Tabla central para gestionar el histórico.
- Filtro por estado y búsqueda por paciente.
- Modal amplio para crear o editar sin perder contexto.

### Agenda
- Vista semanal en columnas.
- Tarjetas por franja con paciente, hora y estado.
- Navegación simple entre semanas.

## Decisiones de alcance

- No hay pagos.
- No hay multiusuario.
- No hay analítica avanzada.
- No hay automatizaciones clínicas complejas.
- No hay recetas ni IA clínica.

## Arranque rápido

### Backend
```bash
cd backend
npm start
```

### Frontend
```bash
cd frontend
npm run dev
```

### URLs
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001`
