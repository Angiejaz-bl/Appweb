-- Inserta datos de prueba; no representa hogares ni ubicaciones reales.
-- Cambiar la cantidad en _configuracion_censos para ajustar el lote.
-- latitud y longitud quedan NULL para que el mapa no los trate como ubicaciones reales.
-- Requiere database/migrations/003_add_censo_origen_registro.sql aplicada previamente.

BEGIN;

CREATE TEMPORARY TABLE _configuracion_censos (
  cantidad INTEGER NOT NULL CHECK (cantidad > 0)
) ON COMMIT DROP;

INSERT INTO _configuracion_censos (cantidad) VALUES (100);

DO $$
DECLARE
  cantidad_solicitada INTEGER;
  creador_id_bigint BIGINT;
  creador_id_integer INTEGER;
  columnas_faltantes TEXT;
  campos_requeridos_sin_default TEXT;
  cantidad_insertada INTEGER;
  tipo_creador_censo TEXT;
  tipo_id_usuario TEXT;
  tipo_fecha_registro TEXT;
  tipo_latitud TEXT;
  tipo_longitud TEXT;
  latitud_nullable TEXT;
  longitud_nullable TEXT;
BEGIN
  SELECT cantidad
    INTO cantidad_solicitada
    FROM pg_temp._configuracion_censos;

  IF to_regclass('public.censos') IS NULL THEN
    RAISE EXCEPTION 'No existe public.censos; revise el esquema de la base de datos.';
  END IF;

  IF to_regclass('public.users') IS NULL THEN
    RAISE EXCEPTION 'No existe public.users; no se puede validar creado_por.';
  END IF;

  SELECT string_agg(requerida.nombre, ', ' ORDER BY requerida.nombre)
    INTO columnas_faltantes
    FROM (VALUES
      ('nombre'),
      ('apellido'),
      ('total_miembros'),
      ('cantidad_televisiones'),
      ('latitud'),
      ('longitud'),
      ('creado_por'),
      ('fecha_registro'),
      ('origen_registro')
    ) AS requerida(nombre)
   WHERE NOT EXISTS (
     SELECT 1
       FROM information_schema.columns columna
      WHERE columna.table_schema = 'public'
        AND columna.table_name = 'censos'
        AND columna.column_name = requerida.nombre
   );

  IF columnas_faltantes IS NOT NULL THEN
    RAISE EXCEPTION 'Faltan columnas requeridas en public.censos: %. Revise el esquema y aplique primero la migración de origen.', columnas_faltantes;
  END IF;

  SELECT data_type INTO tipo_creador_censo
    FROM information_schema.columns
   WHERE table_schema = 'public' AND table_name = 'censos' AND column_name = 'creado_por';
  SELECT data_type INTO tipo_id_usuario
    FROM information_schema.columns
   WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'id';
  IF tipo_creador_censo IS DISTINCT FROM 'integer'
     OR tipo_id_usuario IS DISTINCT FROM 'bigint' THEN
    RAISE EXCEPTION 'Esquema incompatible: se esperaba censos.creado_por INTEGER y users.id BIGINT; se encontró % y %, respectivamente.', tipo_creador_censo, tipo_id_usuario;
  END IF;

  SELECT data_type INTO tipo_fecha_registro
    FROM information_schema.columns
   WHERE table_schema = 'public' AND table_name = 'censos' AND column_name = 'fecha_registro';
  SELECT data_type, is_nullable INTO tipo_latitud, latitud_nullable
    FROM information_schema.columns
   WHERE table_schema = 'public' AND table_name = 'censos' AND column_name = 'latitud';
  SELECT data_type, is_nullable INTO tipo_longitud, longitud_nullable
    FROM information_schema.columns
   WHERE table_schema = 'public' AND table_name = 'censos' AND column_name = 'longitud';
  IF tipo_fecha_registro IS DISTINCT FROM 'timestamp without time zone'
     OR tipo_latitud IS DISTINCT FROM 'double precision'
     OR tipo_longitud IS DISTINCT FROM 'double precision'
     OR latitud_nullable IS DISTINCT FROM 'YES'
     OR longitud_nullable IS DISTINCT FROM 'YES' THEN
    RAISE EXCEPTION 'Esquema incompatible: se esperaba fecha_registro TIMESTAMP, y latitud/longitud DOUBLE PRECISION NULL.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
      FROM information_schema.columns
     WHERE table_schema = 'public'
       AND table_name = 'users'
       AND column_name = 'estado'
  ) THEN
    RAISE EXCEPTION 'No existe public.users.estado; no se puede verificar un usuario activo para creado_por.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
      FROM information_schema.key_column_usage origen
      JOIN information_schema.constraint_column_usage destino
        ON destino.constraint_catalog = origen.constraint_catalog
       AND destino.constraint_schema = origen.constraint_schema
       AND destino.constraint_name = origen.constraint_name
     WHERE origen.table_schema = 'public'
       AND origen.table_name = 'censos'
       AND origen.column_name = 'creado_por'
       AND destino.table_schema = 'public'
       AND destino.table_name = 'users'
       AND destino.column_name = 'id'
       AND EXISTS (
         SELECT 1
           FROM information_schema.table_constraints restriccion
          WHERE restriccion.constraint_catalog = origen.constraint_catalog
            AND restriccion.constraint_schema = origen.constraint_schema
            AND restriccion.constraint_name = origen.constraint_name
            AND restriccion.constraint_type = 'FOREIGN KEY'
       )
  ) THEN
    RAISE EXCEPTION 'No se encontró la clave foránea public.censos.creado_por -> public.users.id.';
  END IF;

  SELECT string_agg(columna.attname, ', ' ORDER BY columna.attnum)
    INTO campos_requeridos_sin_default
    FROM pg_attribute columna
    LEFT JOIN pg_attrdef valor_default
      ON valor_default.adrelid = columna.attrelid
     AND valor_default.adnum = columna.attnum
   WHERE columna.attrelid = 'public.censos'::regclass
     AND columna.attnum > 0
     AND NOT columna.attisdropped
     AND columna.attnotnull
     AND columna.attname NOT IN (
       'nombre', 'apellido', 'total_miembros', 'cantidad_televisiones',
       'latitud', 'longitud', 'creado_por', 'fecha_registro', 'origen_registro', 'id'
     )
     AND valor_default.oid IS NULL;

  IF campos_requeridos_sin_default IS NOT NULL THEN
    RAISE EXCEPTION 'public.censos tiene columnas obligatorias no contempladas por este script: %. Revise las restricciones antes de insertar.', campos_requeridos_sin_default;
  END IF;

  SELECT id
    INTO creador_id_bigint
    FROM public.users
   WHERE estado::text = 'ACTIVA'
   ORDER BY id
   LIMIT 1;

  IF creador_id_bigint IS NULL THEN
    RAISE EXCEPTION 'No hay usuarios activos en public.users; no se insertó ningún censo.';
  END IF;

  -- censos.creado_por es INTEGER y users.id es BIGINT: validar rango antes del cast.
  IF creador_id_bigint < -2147483648 OR creador_id_bigint > 2147483647 THEN
    RAISE EXCEPTION 'El ID del usuario activo seleccionado (%) excede el rango INTEGER de censos.creado_por.', creador_id_bigint;
  END IF;
  creador_id_integer := creador_id_bigint::INTEGER;

  INSERT INTO public.censos (
    nombre,
    apellido,
    total_miembros,
    cantidad_televisiones,
    latitud,
    longitud,
    creado_por,
    fecha_registro,
    origen_registro
  )
  SELECT
    'CensoPrueba-' || serie.numero::TEXT,
    'ApellidoPrueba-' || serie.numero::TEXT,
    1 + ((serie.numero - 1) % 8),
    (serie.numero - 1) % 5,
    NULL::DOUBLE PRECISION,
    NULL::DOUBLE PRECISION,
    creador_id_integer,
    LOCALTIMESTAMP - ((serie.numero - 1) % 365) * INTERVAL '1 day',
    'MASIVO'
  FROM generate_series(1, cantidad_solicitada) AS serie(numero);

  GET DIAGNOSTICS cantidad_insertada = ROW_COUNT;
  RAISE NOTICE 'Censos solicitados: %. Censos insertados: %. Origen: MASIVO. creador_id: %.',
    cantidad_solicitada, cantidad_insertada, creador_id_integer;
END;
$$;

COMMIT;
