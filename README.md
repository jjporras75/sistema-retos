# sistema-retos

Prueba de concepto para un sistema de gestión de retos (challenges).

## Descripción

REST API construida con Node.js y Express que permite:

- **Crear retos** con título, descripción y nivel de dificultad (easy / medium / hard).
- **Registrar usuarios** y asociarlos a retos.
- **Enviar respuestas** (submissions) a un reto.
- **Actualizar el estado** de una respuesta: `pending` → `accepted` / `rejected`.
- **Consultar** retos, usuarios y respuestas.

Una interfaz web básica está incluida en `public/index.html`.

## Requisitos

- Node.js ≥ 18

## Instalación y uso

```bash
npm install
npm start
```

El servidor arranca en `http://localhost:3000`.

## Endpoints principales

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/health` | Estado del servicio |
| GET | `/api/challenges` | Listar todos los retos |
| POST | `/api/challenges` | Crear un reto |
| GET | `/api/challenges/:id` | Obtener un reto |
| GET | `/api/challenges/:id/submissions` | Respuestas de un reto |
| GET | `/api/users` | Listar usuarios |
| POST | `/api/users` | Crear un usuario |
| GET | `/api/users/:id` | Obtener un usuario |
| POST | `/api/users/:id/submissions` | Enviar respuesta a un reto |
| GET | `/api/users/:id/submissions` | Respuestas de un usuario |
| PATCH | `/api/users/:userId/submissions/:id` | Actualizar estado de respuesta |

## Tests

```bash
npm test
```

> **Nota:** Los datos son en memoria y se pierden al reiniciar el servidor. Este proyecto es una prueba de concepto.
