# REP — Gym Tracker

REP 1.0 es un tracker de gimnasio mobile-first orientado a registrar rápido y progresar sin fricción.

## Funciones
- Rutinas, entrenamiento libre y sustitución de ejercicios.
- Recuperación de una sesión activa tras cerrar la app.
- Series de trabajo, top sets y calentamiento.
- RIR opcional por serie.
- Rangos de repeticiones e incrementos configurables.
- Progresión guiada, comparativas y PRs.
- Notas persistentes de máquina/ejercicio.
- Temporizador de descanso.
- Historial con búsqueda y filtros.
- Editar, eliminar y repetir sesiones.
- Progreso por ejercicio, volumen y actividad.
- Backup/import versionado.
- Persistencia local + copia de recuperación IndexedDB.
- PWA offline con actualización network-first.
- Capa cloud preparada para Supabase Auth + sync.

## Cloud
La app lee la configuración desde `.rep-cloud-config.json` en la raíz del repositorio. Esto permite activar Supabase sin otro despliegue web.

Aplicar `REP/supabase.sql` al proyecto Supabase y completar:
```json
{"enabled":true,"url":"https://PROJECT.supabase.co","publishableKey":"sb_publishable_..."}
```

## Ejecutar localmente
```bash
python -m http.server 8080
```
