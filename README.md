# AulaNova - LMA: Codigo Rojo

Plataforma educativa en React/Vite con Firebase Firestore para actividades sincronizadas, panel docente, jugadores temporales, ranking en vivo y mecanismos antitrampa.

## Stack

- React 19 + Vite
- Firebase Firestore
- lucide-react
- Vercel

## Variables de entorno

Configurar en `.env` local y en Vercel:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_TEACHER_EMAIL=
VITE_TEACHER_PASSWORD=
VITE_GEMINI_API_KEY=
```

`VITE_GEMINI_API_KEY` es opcional para generar actividades con IA desde el panel docente.

## Iniciar localmente

```bash
npm install
npm run dev
```

Abrir la URL que muestre Vite, normalmente `http://localhost:5173`.

## Administrador / docente

Ruta:

```text
/docente
```

Credenciales:

- Si `VITE_TEACHER_EMAIL` y `VITE_TEACHER_PASSWORD` estan configuradas, usa esas.
- Si no existen variables de entorno, el codigo incluye credenciales demo fallback:
  - correo: `docente@aulanova.edu`
  - contrasena: `Fabrizio2026`

## Juego listo para clase

Actividad predeterminada:

```text
LMA
```

Nombre:

```text
LMA: Codigo Rojo
```

Subtitulo:

```text
Diagnostica. Decide. Sobrevive a la guardia.
```

Cada partida usa **15 preguntas maximo**, seleccionadas y mezcladas desde el banco LMA.

## Flujo docente

1. Entrar a `/docente`.
2. Seleccionar la actividad `LMA`.
3. Opcional: pulsar `Limpiar Datos` para reiniciar jugadores, ranking y alertas.
4. Pulsar `Activar sonido` una vez para habilitar alarma y aviso por voz en el navegador del docente.
5. Pulsar `Iniciar clase`.
6. Proyectar el panel docente si se desea ver ranking y alertas.

## Flujo jugador

1. Entrar a la pagina principal.
2. Escribir nombre o alias.
3. Usar codigo de actividad: `LMA`.
4. Esperar en sala si el docente aun no inicio.
5. Jugar las rondas de Codigo Rojo.

## Puntuacion

La prioridad es:

1. precision;
2. puntaje total;
3. racha maxima;
4. menor tiempo.

Cada respuesta correcta suma base + bonus moderado por velocidad + bonus moderado por racha. Las advertencias antitrampa descuentan puntos.

## Antitrampa

El juego conserva monitoreo del navegador:

- salida de pantalla completa;
- cambio de pestana o aplicacion;
- perdida de foco;
- copiar/pegar;
- clic derecho;
- atajos bloqueados;
- F12.

La politica actual es moderada: registra advertencias y penalizaciones. No expulsa automaticamente por una sola perdida de foco accidental.

El panel docente muestra el nombre del estudiante, numero de alertas y puntos descontados. Cada incidente nuevo activa una alarma y un aviso por voz cuando el docente ha pulsado `Activar sonido`.

## Simulacro aislado

Para comprobar localmente 30 estudiantes ficticios sin escribir datos en Firestore:

```bash
npm run simulate:class
```

El simulacro procesa 450 respuestas, aplica penalizaciones antitrampa y valida que el ranking termine con exactamente cuatro ganadores.

## Datos guardados

Firestore usa la estructura existente:

```text
activities/{code}
activities/{code}/results
activities/{code}/alerts
```

En `results` se guarda nombre temporal, puntaje, correctas, total de preguntas, precision, racha maxima, penalizacion, advertencias, tiempo y estado.

En `alerts` se guardan eventos antitrampa.

Para borrar datos temporales de una partida, usar `Limpiar Datos` desde el panel docente.

## Revision medica

Ver `MEDICAL_REVIEW.md` antes de usar la actividad como material formal evaluativo.
