# Contrato GeoTracker — Evaluación Parcial II

Base local: `http://localhost:3000`. Ambas rutas requieren `Authorization: Bearer <token>` obtenido de `POST /api/login`.

## POST `/api/parcial/ubicaciones`

Todos los campos son obligatorios. Las coordenadas deben ser valores numéricos JSON.

```json
{
  "nombre": "Mirador",
  "descripcion": "Punto de observación",
  "latitud": 14.6349,
  "longitud": -90.5069
}
```

Respuesta `201 Created`:

```json
{
  "success": true,
  "message": "Ubicación registrada exitosamente",
  "data": {
    "id": "1",
    "nombre": "Mirador",
    "descripcion": "Punto de observación",
    "latitud": 14.6349,
    "longitud": -90.5069,
    "fecha_creacion": "2026-10-27T12:00:00.000Z"
  }
}
```

Latitud: -90 a 90; longitud: -180 a 180. El propietario nunca se acepta desde el cuerpo; se toma de la identidad autenticada.

## GET `/api/parcial/ubicaciones`

No lleva cuerpo. Respuesta `200 OK`:

```json
{
  "success": true,
  "message": "Ubicaciones obtenidas exitosamente",
  "data": [
    {
      "id": "1",
      "nombre": "Mirador",
      "descripcion": "Punto de observación",
      "latitud": 14.6349,
      "longitud": -90.5069,
      "fecha_creacion": "2026-10-27T12:00:00.000Z"
    }
  ]
}
```

Errores: `401` por token faltante/inválido, `400` por datos inválidos en POST, `500` por error de persistencia; el cuerpo sigue `{ "success": false, "message": "...", "data": null }`. No se añade política de roles: cualquier usuario aceptado por `authenticateToken` puede usar GeoTracker; las consultas solo muestran filas de ese usuario.

## Prueba manual local

Tras aplicar la migración solo en una base local y arrancar con `npm run dev`:

1. Obtener tokens para dos usuarios activos con el login actual.
2. POST y GET sin token deben responder `401`.
3. Con token A, crear una ubicación válida; debe responder `201` con los seis campos.
4. Probar campo faltante, latitud fuera de rango, longitud fuera de rango y coordenada como texto: cada solicitud debe responder `400`.
5. GET con A debe mostrar su ubicación; GET con B no debe mostrarla.

No se ejecutó la migración. No se verificó persistencia contra PostgreSQL ni AWS.
