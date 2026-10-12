export type UserRole = "CENSISTA" | "ADMINISTRADOR";

export interface User {
  id: number;
  nombre: string;
  apellido: string;
  usuario: string;
  correo: string;
  password: string;
  rol: UserRole;
  created_at?: Date;
  foto?: Buffer;
}

export interface CreateUserInput {
  nombre: string;
  apellido: string;
  usuario: string;
  correo: string;
  password: string;
}

export type PublicUser = Pick<
  User,
  "id" | "nombre" | "apellido" | "usuario" | "correo" | "rol" | "foto"
>;