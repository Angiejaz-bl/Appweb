export interface User {
  id: number;
  nombre: string;
  apellido: string;
  usuario: string;
  correo: string;
  password: string;
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
  "id" | "nombre" | "apellido" | "usuario" | "correo" | "foto"
>;