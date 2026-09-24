# REP — Gym Tracker MVP

MVP móvil y sin backend para registrar entrenamientos.

## Incluye
- Rutinas precargadas y creación de rutinas.
- Entrenamientos libres.
- Series, peso, repeticiones y marcado de series completadas.
- Recuperación automática de los valores de la última sesión por ejercicio.
- Temporizador de descanso.
- Historial, volumen total, duración y objetivo semanal.
- Persistencia en `localStorage`.
- Exportación JSON.
- PWA/offline al desplegar por HTTPS.

## Ejecutar localmente

```bash
python -m http.server 8080
```

Abrir `http://localhost:8080`.

Para probarlo en el móvil, despliega la carpeta como sitio estático o sirve la carpeta en tu red local.

## Release

Current release candidate: **v0.5** — rep ranges, RIR, set types, guided progression, exercise notes and workout summary.
