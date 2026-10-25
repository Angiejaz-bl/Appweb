export interface RegisterRequestDTO {
  nombre: string;
  apellido: string;
  usuario: string;
  correo: string;
  password: string;
  telefono?: string | null;
  fechaNacimiento?: string | null;
  genero?: string | null;
  rol?: string;
}
