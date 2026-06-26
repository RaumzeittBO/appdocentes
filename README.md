# Addison Challenge 🩺

**Addison Challenge** es una aplicación web interactiva y educativa diseñada para docentes y estudiantes del área de ciencias de la salud, enfocada en la fisiopatología, diagnóstico y tratamiento de la **Enfermedad de Addison** (Insuficiencia Suprarrenal Primaria).

Esta aplicación ha sido creada por **Fabrizio Salamanca**.

---

## Características Principales

1. **Ruta Fisiopatológica Interactiva:** Flujograma educativo detallado paso a paso, desde la sospecha clínica hasta el manejo de la crisis adrenal.
2. **Examen Proctorizado de Alta Seguridad:** Evaluación de 7 preguntas de opción múltiple con monitorización activa en tiempo real contra faltas académicas.
3. **Detección Anti-Trampas Integrada:**
   - Detección de salida de pantalla completa (`fullscreenchange`).
   - Detección de cambio de pestaña o aplicación (`visibilitychange`).
   - Detección de pérdida de foco del navegador (`blur`).
   - Bloqueo de copia y pega (`copy`, `paste`).
   - Bloqueo de atajos de teclado (`Ctrl+C`, `Ctrl+V`, `Ctrl+T`, `Ctrl+W`) e inspección con `F12`.
   - Bloqueo de clic derecho y menú contextual.
4. **Alertas por Voz en Tiempo Real:** Al cometer una falta, el sistema descalifica al estudiante y lo anuncia mediante síntesis de voz en español (`speechSynthesis`).
5. **Panel Docente en Tiempo Real:** Conexión mediante Firestore `onSnapshot` para visualizar calificaciones, tiempos y alertas instantáneamente, con cálculo automático del ganador de la sesión.

---

## Requisitos Previos

- **Node.js** (versión 18 o superior recomendada)
- **NPM** (incluido por defecto con Node.js)
- Una base de datos **Firebase Firestore** (sin autenticación activa para la demo)

---

## Configuración del Proyecto

### 1. Variables de Entorno

Para conectar la aplicación a tu base de datos de Firebase, debes configurar las variables de entorno de Vite.

1. Duplica el archivo `.env.example` y renombralo a `.env`:
   ```bash
   cp .env.example .env
   ```
2. Abre el archivo `.env` y rellena las credenciales de tu proyecto de Firebase:
   ```env
   VITE_FIREBASE_API_KEY=tu_api_key_aquí
   VITE_FIREBASE_AUTH_DOMAIN=tu_auth_domain_aquí
   VITE_FIREBASE_PROJECT_ID=tu_project_id_aquí
   VITE_FIREBASE_STORAGE_BUCKET=tu_storage_bucket_aquí
   VITE_FIREBASE_MESSAGING_SENDER_ID=tu_messaging_sender_id_aquí
   VITE_FIREBASE_APP_ID=tu_app_id_aquí
   ```

*Nota: Ya se incluye un archivo `.env` de prueba local con las credenciales que provistas.*

---

## Comandos de Desarrollo y Construcción

### Instalar dependencias
Antes de arrancar el servidor por primera vez, instala todos los paquetes necesarios:
```bash
npm install
```

### Probar localmente
Inicia el servidor de desarrollo de Vite para visualizar la aplicación de manera local:
```bash
npm run dev
```
Abre en tu navegador la dirección indicada en la terminal (usualmente `http://localhost:5173`).

### Compilar para producción
Para compilar la aplicación y optimizar el rendimiento de cara a su distribución (lo que creará la carpeta `dist/`):
```bash
npm run build
```

---

## Despliegue en Vercel

Esta aplicación está pensada para ser alojada fácilmente en **Vercel**. El directorio de salida compilado es `dist/`.

### Opción A: Despliegue Manual (Desde el Dashboard Web)

1. Ejecuta `npm run build` en tu terminal para generar la carpeta de producción `dist/`.
2. Inicia sesión en tu cuenta de [Vercel](https://vercel.com).
3. Dirígete a la sección de **Add New Project**.
4. En lugar de conectar con un repositorio de Git, busca la opción **Vercel CLI / Drag and Drop**.
5. Arrastra la carpeta `dist/` que se acaba de crear en el directorio raíz de tu proyecto.
6. Configura las variables de entorno en el panel de Vercel con las claves listadas en tu archivo `.env` para que la conexión a Firebase funcione en producción.

### Opción B: Despliegue con Vercel CLI (Línea de Comandos)

1. Instala el CLI de Vercel de forma global en tu máquina (si aún no lo tienes):
   ```bash
   npm install -g vercel
   ```
2. Vincula tu terminal a tu cuenta de Vercel ejecutando:
   ```bash
   vercel login
   ```
3. Ejecuta el comando de despliegue en la raíz del proyecto para crear un despliegue de desarrollo/preview:
   ```bash
   vercel
   ```
   *El CLI te preguntará si deseas configurar el proyecto. Responde **Yes**, selecciona tu equipo de Vercel y enlaza el directorio raíz.*
4. Agrega las variables de entorno en el panel de control de tu proyecto creado en Vercel.
5. Ejecuta la compilación y despliegue final en producción:
   ```bash
   vercel --prod
   ```
   *Vercel compilará automáticamente usando la configuración por defecto de Vite (Vite Framework Preset) y pondrá la web en línea con un dominio `.vercel.app`.*
