# Sonya · Sistema Web de Gestión Escolar y Control Docente

Aplicación web multiusuario para reemplazar las plantillas de Excel del personal docente:
asistencia mensual, evaluaciones cualitativas, diagnósticos y control de materiales.

> **Estado:** aplicación funcional con los 4 módulos de control (asistencia, evaluaciones,
> diagnóstico y materiales), autenticación, perfil del plantel y gestión de estudiantes
> operativos.

---

## 1. Stack tecnológico

| Capa | Tecnología |
| --- | --- |
| Framework | Next.js 15 (App Router) + React 19 |
| Lenguaje | TypeScript |
| Base de datos | SQLite vía Prisma ORM |
| Autenticación | Sesión JWT (`jose`) en cookie `httpOnly` + `bcryptjs` |
| Validación | Zod |
| Estilos | Tailwind CSS |
| Ejecución | Node.js 18.18+ (probado con Node 24) |

**Decisiones de arquitectura**

- **Multi-tenant lógico:** una sola base de datos; cada registro lleva `teacherId` y
  todas las consultas filtran por el docente autenticado. Ningún docente ve datos de otro.
- **Portabilidad:** al usar Prisma, migrar de SQLite a PostgreSQL más adelante solo
  requiere cambiar el `datasource` en `schema.prisma` y regenerar (los modelos no cambian).
- **Sin enums nativos:** SQLite no los soporta en Prisma, por eso los valores controlados
  se guardan como `String` y se validan con Zod en `src/lib/constants.ts` + `validations.ts`.

---

## 2. Puesta en marcha

```bash
# 1. Instalar dependencias (ya incluye "prisma generate" en postinstall)
npm install

# 2. Crear la base de datos SQLite y las tablas
npm run db:push

# 3. Cargar datos de prueba (docente + estudiantes)
npm run db:seed

# 4. Ejecutar en desarrollo
npm run dev
# Abre http://localhost:3000
```

**Credenciales demo**

```
Correo:     docente@sonya.app
Contraseña: docente123
```

> Antes de desplegar, edita `.env` y cambia `AUTH_SECRET` por un valor largo y aleatorio.

### Scripts disponibles

| Script | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Compila para producción (genera Prisma + build de Next) |
| `npm run start` | Sirve la versión compilada |
| `npm run db:push` | Sincroniza el esquema con la base de datos |
| `npm run db:migrate` | Crea una migración versionada |
| `npm run db:seed` | Carga datos de prueba |
| `npm run db:studio` | Abre Prisma Studio (explorador visual de la BD) |

---

## 3. Estructura del proyecto

```
Sonya/
├─ prisma/
│  ├─ schema.prisma            # Modelos de TODO el sistema (módulos A–D)
│  └─ seed.ts                  # Docente demo + 12 estudiantes
├─ src/
│  ├─ middleware.ts            # Redirige a /login si no hay cookie de sesión
│  ├─ lib/
│  │  ├─ prisma.ts             # Cliente Prisma (singleton)
│  │  ├─ auth.ts               # Hash, JWT de sesión, getCurrentTeacher/requireTeacher
│  │  ├─ constants.ts          # Listas de valores controlados + etiquetas
│  │  ├─ validations.ts        # Esquemas Zod de todos los formularios
│  │  ├─ types.ts              # Tipos compartidos (DTO)
│  │  ├─ utils.ts              # cn(), fechas, porcentajes
│  │  └─ actions/              # Server Actions (lógica del servidor)
│  │     ├─ auth.ts            # registro, login, logout, recuperación
│  │     ├─ profile.ts         # datos del docente/plantel
│  │     ├─ students.ts        # CRUD de estudiantes
│  │     ├─ modules.ts         # acciones de módulos A–D
│  │     └─ helpers.ts         # utilidades de formularios/errores
│  ├─ components/              # UI reutilizable (card, inputs, sidebar, iconos...)
│  └─ app/
│     ├─ layout.tsx            # Layout raíz
│     ├─ globals.css           # Tailwind + clases de componentes
│     ├─ page.tsx              # Redirige a /dashboard o /login
│     ├─ (auth)/               # Rutas públicas
│     │  ├─ login/  register/  forgot-password/  reset-password/
│     └─ (app)/                # Rutas protegidas (requieren sesión)
│        ├─ layout.tsx         # Sidebar + contenedor
│        ├─ dashboard/         # Panel con métricas y accesos
│        ├─ configuracion/     # Datos del docente y del plantel
│        ├─ estudiantes/       # CRUD de la lista única de estudiantes
│        ├─ asistencia/        # Módulo A (base lista)
│        ├─ evaluaciones/      # Módulo B (base lista)
│        ├─ diagnostico/       # Módulo C (base lista)
│        └─ materiales/        # Módulo D (base lista)
└─ .env                        # DATABASE_URL, AUTH_SECRET, APP_URL
```

---

## 4. Modelo de datos

Definido completo en `prisma/schema.prisma`.

### Autenticación y configuración

- **Teacher** — cuenta del docente (`email`, `passwordHash`, `nombre`, `apellido`).
- **TeacherProfile** — 1:1 con el docente: `plantel`, `grado`, `seccion`, `anoEscolar`,
  `dependencia`, `localidad`.
- **PasswordResetToken** — tokens de recuperación de contraseña (hash + expiración).

### Estudiantes (lista única)

- **Student** — `nombres`, `apellidos`, `edad`, `sexo` (V/H), `condicion`
  (REGULAR, REPITIENTE, EXTRANJERO, NEE, OTRO), `activo`.
  Único por docente. Se reutiliza en todos los módulos.

### Módulo A — Asistencia

- **Attendance** — `studentId`, `fecha`, `estado` (`AS` / `IA`). Único por alumno+día.
- **MonthlyStat** — datos manuales del resumen: matrícula inicial, ingresos y egresos
  desglosados por sexo (`V`/`H`). Los promedios y porcentajes se calculan.

### Módulo B — Evaluaciones

- **EvaluationActivity** — `momento`, `area`, `actividad`, `aprendizajeEsperado`,
  `indicador`, `fecha`.
- **EvaluationRecord** — calificación por estudiante: `literal`
  (`L`, `NL`, `I`, `C`, `RR`, `N`, `SN`) + `observacion`. Único por actividad+alumno.

### Módulo C — Diagnóstico

- **LanguageDiagnostic** — `lectura`, `comprension`, `escrituraNivel`, `escrituraEstilo`
  (CORREDIZA, SCRIPT, AGLUTINA, NO_APLICA), `observaciones`.
- **MathDiagnostic** — `adicion`, `sustraccion`, `series`, `resolucion`, `observaciones`.
  Niveles: `I`, `C`, `RR`.

### Módulo D — Materiales

- **MaterialDelivery** — `item` (ESPONJA, LAVA_PLATOS, CLOROX, LAVANSAN, CERA, VASOS,
  PAPEL_HIGIENICO, SERVILLETAS, OTRO), `cantidad`, `entregadoPor`, `observaciones`.

---

## 5. Flujo de autenticación

1. **Registro** (`/register`): crea el docente + perfil vacío, inicia sesión y va al panel.
2. **Login** (`/login`): valida credenciales con `bcrypt` y firma un JWT en cookie
   `httpOnly`.
3. **Sesión:** `getCurrentTeacher()` lee y verifica el JWT; `requireTeacher()` redirige a
   `/login` si no hay sesión. El `middleware.ts` hace una comprobación rápida de cookie.
4. **Recuperación** (`/forgot-password` → `/reset-password`): genera un token con
   expiración de 1 hora. En desarrollo el enlace se muestra en pantalla; en producción
   se conectaría un servicio de correo (SMTP / Resend).

---

## 6. Estado de los módulos y próximos pasos

| Módulo | Modelo de datos | Acciones (servidor) | Interfaz |
| --- | :---: | :---: | :---: |
| Autenticación | ✅ | ✅ | ✅ |
| Configuración del plantel | ✅ | ✅ | ✅ |
| Estudiantes | ✅ | ✅ | ✅ |
| Panel (dashboard) | ✅ | — | ✅ |
| A · Asistencia mensual | ✅ | ✅ | ✅ |
| B · Evaluaciones | ✅ | ✅ | ✅ |
| C · Diagnóstico | ✅ | ✅ | ✅ |
| D · Materiales | ✅ | ✅ | ✅ |

**Módulo A — Control diario y asistencia:** grilla mensual con marcadores AS/IA (clic
alterna AS → IA → sin marcar), **autoguardado por celda**, porcentaje por alumno, selector
de mes/año, conteo diario por sexo, matrícula (inicial / ingresos / **suma** / egresos /
final por V/H/Total), distribución por edad y sexo, repitientes por edad y sexo, promedio y
% general, e impresión/PDF. (Formato fiel a las imágenes 1 y 2.)

**Módulo B — Evaluaciones:** actividades por momento/área (con aprendizaje esperado e
indicador), tabla de calificación con literales **L, NL, I, C, RR, N, SN** y observaciones
por estudiante, con autoguardado. (Formato fiel a la imagen 3.)

**Módulo C — Diagnóstico:** pestañas Lenguaje (lectura, comprensión, escritura nivel y
estilo C/S/AG) y Matemática (adición, sustracción, series, resolución), celdas que cíclan
I → C → RR, observaciones y autoguardado. (Formato fiel a las imágenes 4 y 5.)

**Módulo D — Materiales:** registro de entregas (esponja, lava platos, clorox, lavansan,
cera, vasos, papel higiénico, servilletas y otros), cantidades, colaborador y observaciones,
con totales por insumo. (Formato fiel a la imagen 6.)

**Imágenes de referencia:** los 6 formatos originales se guardan en `docs/formato/`.

**Pendientes opcionales:**

1. Exportación a PDF real (`@react-pdf/renderer`) en lugar de la impresión del navegador.
2. Firma digital/electrónica del docente en los reportes.
3. Fecha de entrega automática en imprimibles.
4. Migración a PostgreSQL y despliegue en hosting.

---

## 7. Notas de despliegue

- Genera un `AUTH_SECRET` seguro: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
- Mantén `NODE_ENV=production` para que la cookie se marque `secure` (requiere HTTPS).
- Haz respaldo periódico del archivo `prisma/dev.db` (o migra a PostgreSQL para multiusuario intensivo).
- Para correo real de recuperación, integra un proveedor en `src/lib/actions/auth.ts`.
