-- Historial: migración aplicada en AWS. Conservar como referencia; no volver a ejecutar.
-- No crea ni modifica datos de perfiles personales existentes.
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS telefono VARCHAR(30),
  ADD COLUMN IF NOT EXISTS fecha_nacimiento DATE,
  ADD COLUMN IF NOT EXISTS genero VARCHAR(50),
  ADD COLUMN IF NOT EXISTS rol VARCHAR(30) NOT NULL DEFAULT 'CENSISTA',
  ADD COLUMN IF NOT EXISTS estado VARCHAR(10) NOT NULL DEFAULT 'ACTIVA',
  ADD COLUMN IF NOT EXISTS ultimo_acceso TIMESTAMPTZ;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'users_estado_check'
      AND conrelid = 'users'::regclass
  ) THEN
    ALTER TABLE users
      ADD CONSTRAINT users_estado_check
      CHECK (estado IN ('ACTIVA', 'INACTIVA'));
  END IF;
END $$;
