import { pool } from "../database/connection";
import {
  CreateUserInput,
  PublicUser,
  User,
  UserId,
  UserRole,
  UserStatus,
} from "../../domain/entities/User";

export class LastActiveAdministratorError extends Error {
  constructor() {
    super("No se puede quitar el último administrador activo");
    this.name = "LastActiveAdministratorError";
  }
}

export class UserRepository {
  async findByUsuario(usuario: string): Promise<User | undefined> {
    const result = await pool.query<User>(
      `SELECT id::text AS id, nombre, apellido, usuario, correo, password, rol, created_at,
              telefono, fecha_nacimiento AS "fechaNacimiento", genero, estado,
              ultimo_acceso AS "ultimoAcceso"
       FROM users
       WHERE usuario = $1`,
      [usuario],
    );
    return result.rows[0];
  }

  async findByCorreo(correo: string): Promise<User | undefined> {
    const result = await pool.query<User>(
      `SELECT id::text AS id, nombre, apellido, usuario, correo, password, rol, created_at,
              telefono, fecha_nacimiento AS "fechaNacimiento", genero, estado,
              ultimo_acceso AS "ultimoAcceso"
       FROM users
       WHERE correo = $1`,
      [correo],
    );
    return result.rows[0];
  }

  async create(input: CreateUserInput): Promise<PublicUser> {
    const result = await pool.query<PublicUser>(
      `INSERT INTO users (
         nombre, apellido, usuario, correo, password, telefono,
         fecha_nacimiento, genero, rol
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id::text AS id, nombre, apellido, usuario, correo, rol, foto,
                 telefono, fecha_nacimiento AS "fechaNacimiento", genero,
                 estado, ultimo_acceso AS "ultimoAcceso"`,
      [
        input.nombre,
        input.apellido,
        input.usuario,
        input.correo,
        input.password,
        input.telefono ?? null,
        input.fechaNacimiento ?? null,
        input.genero ?? null,
        input.rol ?? "CENSISTA",
      ],
    );
    return result.rows[0];
  }

  async findPublicById(id: UserId): Promise<PublicUser | undefined> {
    const result = await pool.query<PublicUser>(
      `SELECT id::text AS id, nombre, apellido, usuario, correo, rol, foto,
              telefono, fecha_nacimiento AS "fechaNacimiento", genero, estado,
              ultimo_acceso AS "ultimoAcceso"
       FROM users
       WHERE id = $1`,
      [id],
    );
    return result.rows[0];
  }

  async findAuthorizationById(id: UserId): Promise<{ rol: UserRole; estado: UserStatus } | undefined> {
    const result = await pool.query<{ rol: UserRole; estado: UserStatus }>(
      `SELECT rol, estado FROM users WHERE id = $1`,
      [id],
    );
    return result.rows[0];
  }

  async list(): Promise<PublicUser[]> {
    const result = await pool.query<PublicUser>(
      `SELECT id::text AS id, nombre, apellido, usuario, correo, rol, foto, telefono,
              fecha_nacimiento AS "fechaNacimiento", genero, estado,
              ultimo_acceso AS "ultimoAcceso"
       FROM users ORDER BY id DESC`,
    );
    return result.rows;
  }

  async updateLastAccess(id: UserId): Promise<Date> {
    const result = await pool.query<{ ultimoAcceso: Date }>(
      `UPDATE users SET ultimo_acceso = CURRENT_TIMESTAMP
       WHERE id = $1 RETURNING ultimo_acceso AS "ultimoAcceso"`,
      [id],
    );
    return result.rows[0].ultimoAcceso;
  }

  async update(id: UserId, fields: Record<string, unknown>): Promise<PublicUser | undefined> {
    const columns: Record<string, string> = {
      nombre: "nombre", apellido: "apellido", usuario: "usuario",
      correo: "correo", password: "password", telefono: "telefono",
      fechaNacimiento: "fecha_nacimiento", genero: "genero", rol: "rol",
      estado: "estado",
    };
    const entries = Object.entries(fields).filter(([key]) => columns[key]);
    if (entries.length === 0) return this.findPublicById(id);

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      // Serialize user updates so simultaneous admin demotions cannot both pass the count check.
      await client.query("SELECT pg_advisory_xact_lock(74192031)");

      const currentResult = await client.query<{ rol: UserRole; estado: UserStatus }>(
        `SELECT rol, estado FROM users WHERE id = $1 FOR UPDATE`,
        [id],
      );
      const current = currentResult.rows[0];
      if (!current) {
        await client.query("COMMIT");
        return undefined;
      }

      const nextRole = (fields.rol as UserRole | undefined) ?? current.rol;
      const nextStatus = (fields.estado as UserStatus | undefined) ?? current.estado;
      const removesActiveAdmin = current.rol === "ADMINISTRADOR"
        && current.estado === "ACTIVA"
        && (nextRole !== "ADMINISTRADOR" || nextStatus !== "ACTIVA");

      if (removesActiveAdmin) {
        const countResult = await client.query<{ count: string }>(
          `SELECT COUNT(*)::text AS count FROM users
           WHERE rol = 'ADMINISTRADOR' AND estado = 'ACTIVA'`,
        );
        if (countResult.rows[0].count === "1") {
          throw new LastActiveAdministratorError();
        }
      }

      const assignments = entries.map(([key], index) => `${columns[key]} = $${index + 1}`);
      const values = entries.map(([, value]) => value);
      const result = await client.query<PublicUser>(
        `UPDATE users SET ${assignments.join(", ")} WHERE id = $${values.length + 1}
         RETURNING id::text AS id, nombre, apellido, usuario, correo, rol, foto, telefono,
                   fecha_nacimiento AS "fechaNacimiento", genero, estado,
                   ultimo_acceso AS "ultimoAcceso"`,
        [...values, id],
      );
      await client.query("COMMIT");
      return result.rows[0];
    } catch (error) {
      try {
        await client.query("ROLLBACK");
      } catch {
        // Preserve the original transaction error if rollback also fails.
      }
      throw error;
    } finally {
      client.release();
    }
  }

  async updateFoto(id: UserId, foto: Buffer): Promise<void> {
    await pool.query(
      "UPDATE users SET foto = $1 WHERE id = $2",
      [foto, id],
    );
  }

  isUniqueConstraintError(error: unknown): boolean {
    return (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505"
    );
  }
}
