BEGIN;

CREATE TABLE parcial_ubicaciones (
  id BIGSERIAL PRIMARY KEY,
  propietario_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  nombre VARCHAR(150) NOT NULL CHECK (length(btrim(nombre)) > 0),
  descripcion TEXT NOT NULL CHECK (length(btrim(descripcion)) > 0),
  latitud DOUBLE PRECISION NOT NULL CHECK (latitud BETWEEN -90 AND 90),
  longitud DOUBLE PRECISION NOT NULL CHECK (longitud BETWEEN -180 AND 180),
  fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX parcial_ubicaciones_propietario_fecha_idx
  ON parcial_ubicaciones (propietario_id, fecha_creacion DESC, id DESC);

COMMIT;
