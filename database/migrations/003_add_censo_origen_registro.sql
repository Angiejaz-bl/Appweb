-- Añade el origen para los censos nuevos sin clasificar filas antiguas.
-- Las filas nuevas que omitan el campo reciben MANUAL por defecto.

BEGIN;

DO $$
DECLARE
  tipo_columna TEXT;
  largo_columna INTEGER;
  nulable_columna TEXT;
  valor_predeterminado TEXT;
  valor_predeterminado_normalizado TEXT;
  numero_columna SMALLINT;
  restriccion RECORD;
  expresion_normalizada TEXT;
  hay_check_equivalente BOOLEAN := FALSE;
  hay_check_con_nombre_objetivo BOOLEAN := FALSE;
BEGIN
  IF to_regclass('public.censos') IS NULL THEN
    RAISE EXCEPTION 'No existe public.censos; se cancela la migración sin cambios.';
  END IF;

  SELECT data_type, character_maximum_length, is_nullable, column_default
    INTO tipo_columna, largo_columna, nulable_columna, valor_predeterminado
    FROM information_schema.columns
   WHERE table_schema = 'public'
     AND table_name = 'censos'
     AND column_name = 'origen_registro';

  IF tipo_columna IS NOT NULL THEN
    IF tipo_columna IS DISTINCT FROM 'character varying'
       OR largo_columna IS DISTINCT FROM 10
       OR nulable_columna IS DISTINCT FROM 'YES' THEN
      RAISE EXCEPTION 'public.censos.origen_registro debe ser VARCHAR(10) NULL; se encontró una definición incompatible.';
    END IF;

    IF valor_predeterminado IS NOT NULL THEN
      valor_predeterminado_normalizado := regexp_replace(
        lower(valor_predeterminado), '[[:space:]()]', '', 'g'
      );
      IF valor_predeterminado_normalizado IS DISTINCT FROM '''manual''::charactervarying' THEN
        RAISE EXCEPTION 'public.censos.origen_registro tiene un default incompatible (%); no se modificaron datos.', valor_predeterminado;
      END IF;
    END IF;

    IF EXISTS (
      SELECT 1
        FROM public.censos
       WHERE origen_registro IS NOT NULL
         AND origen_registro NOT IN ('MANUAL', 'MASIVO')
    ) THEN
      RAISE EXCEPTION 'public.censos.origen_registro contiene valores fuera de MANUAL/MASIVO; no se modificaron datos.';
    END IF;

    SELECT attnum
      INTO numero_columna
      FROM pg_attribute
     WHERE attrelid = 'public.censos'::regclass
       AND attname = 'origen_registro'
       AND NOT attisdropped;

    FOR restriccion IN
      SELECT conname, contype, convalidated, pg_get_constraintdef(oid) AS definicion
        FROM pg_constraint
       WHERE conrelid = 'public.censos'::regclass
         AND numero_columna = ANY(conkey)
    LOOP
      IF restriccion.contype <> 'c' THEN
        RAISE EXCEPTION 'public.censos.origen_registro participa en una restricción incompatible (%).', restriccion.conname;
      END IF;

      expresion_normalizada := regexp_replace(
        lower(restriccion.definicion), '[[:space:]()]', '', 'g'
      );

      IF expresion_normalizada NOT IN (
        'checkorigen_registroisnullororigen_registro::text=anyarray[''manual''::charactervarying,''masivo''::charactervarying]::text[]',
        'checkorigen_registroisnullororigen_registro=anyarray[''manual''::charactervarying,''masivo''::charactervarying]',
        'checkorigen_registroisnullororigen_registro::text=''manual''::textororigen_registro::text=''masivo''::text'
      ) THEN
        RAISE EXCEPTION 'La restricción % sobre origen_registro no coincide con MANUAL/MASIVO; requiere revisión.', restriccion.conname;
      END IF;

      IF NOT restriccion.convalidated THEN
        RAISE EXCEPTION 'La restricción equivalente % no está validada; requiere revisión.', restriccion.conname;
      END IF;

      hay_check_equivalente := TRUE;
      IF restriccion.conname = 'censos_origen_registro_check' THEN
        hay_check_con_nombre_objetivo := TRUE;
      END IF;
    END LOOP;
  END IF;

  IF EXISTS (
    SELECT 1
      FROM pg_constraint
     WHERE conrelid = 'public.censos'::regclass
       AND conname = 'censos_origen_registro_check'
  ) AND NOT hay_check_con_nombre_objetivo THEN
    RAISE EXCEPTION 'El nombre censos_origen_registro_check ya está ocupado por otra restricción.';
  END IF;

  IF tipo_columna IS NULL THEN
    ALTER TABLE public.censos
      ADD COLUMN origen_registro VARCHAR(10);
  END IF;

  ALTER TABLE public.censos
    ALTER COLUMN origen_registro SET DEFAULT 'MANUAL';

  IF NOT hay_check_equivalente THEN
    ALTER TABLE public.censos
      ADD CONSTRAINT censos_origen_registro_check
      CHECK (origen_registro IS NULL OR origen_registro IN ('MANUAL', 'MASIVO'));
  END IF;
END;
$$;

COMMIT;
