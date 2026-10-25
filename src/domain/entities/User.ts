export type UserRole = "CENSISTA" | "ADMINISTRADOR";
export type UserStatus = "ACTIVA" | "INACTIVA";
export type UserId = string;

const MAX_POSTGRES_BIGINT = "9223372036854775807";

export const parseUserId = (value: unknown): UserId | null => {
  if (typeof value === "number") {
    return Number.isSafeInteger(value) && value > 0 ? String(value) : null;
  }
  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) return null;
  if (value.length > MAX_POSTGRES_BIGINT.length) return null;
  if (value.length === MAX_POSTGRES_BIGINT.length && value > MAX_POSTGRES_BIGINT) return null;
  return value;
};

export interface User {
  id: UserId;
  nombre: string;
  apellido: string;
  usuario: string;
  correo: string;
  password: string;
  rol: UserRole;
  telefono: string | null;
  fechaNacimiento: string | null;
  genero: string | null;
  estado: UserStatus;
  ultimoAcceso: Date | null;
  created_at?: Date;
  foto?: Buffer;
}

export interface CreateUserInput {
  nombre: string;
  apellido: string;
  usuario: string;
  correo: string;
  password: string;
  telefono?: string | null;
  fechaNacimiento?: string | null;
  genero?: string | null;
  rol?: UserRole;
}

export type PublicUser = Pick<
  User,
  | "id" | "nombre" | "apellido" | "usuario" | "correo" | "rol" | "foto"
  | "telefono" | "fechaNacimiento" | "genero" | "estado" | "ultimoAcceso"
>;
