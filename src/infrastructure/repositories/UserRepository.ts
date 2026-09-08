import { pool } from "../database/connection";
import { CreateUserInput, PublicUser, User } from "../../domain/entities/User";

export class UserRepository {
  async findByUsuario(usuario: string): Promise<User | undefined> {
    const result = await pool.query<User>(
      "SELECT id, nombre, apellido, usuario, correo, password, created_at FROM users WHERE usuario = $1",
      [usuario],
    );
    return result.rows[0];
  }

  async findByCorreo(correo: string): Promise<User | undefined> {
    const result = await pool.query<User>(
      "SELECT id, nombre, apellido, usuario, correo, password, created_at FROM users WHERE correo = $1",
      [correo],
    );
    return result.rows[0];
  }

  async create(input: CreateUserInput): Promise<PublicUser> {
    const result = await pool.query<PublicUser>(
      `INSERT INTO users (nombre, apellido, usuario, correo, password)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, nombre, apellido, usuario, correo`,
      [input.nombre, input.apellido, input.usuario, input.correo, input.password],
    );
    return result.rows[0];
  }

  async findPublicById(id: number): Promise<PublicUser | undefined> {
    const result = await pool.query<PublicUser>(
      "SELECT id, nombre, apellido, usuario, correo FROM users WHERE id = $1",
      [id],
    );
    return result.rows[0];
  }

  isUniqueConstraintError(error: unknown): boolean {
    return typeof error === "object" && error !== null && "code" in error && error.code === "23505";
  }
}
