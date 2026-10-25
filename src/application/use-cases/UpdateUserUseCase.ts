import bcrypt from "bcrypt";
import { LastActiveAdministratorError, UserRepository } from "../../infrastructure/repositories/UserRepository";
import { PublicUser, UserRole, UserStatus } from "../../domain/entities/User";
import { UpdateUserRequestDTO } from "../../interfaces/dtos/UpdateUserRequestDTO";
import { ApiResult, errorResponse, successResponse } from "../../interfaces/responses/ApiResponse";

export class UpdateUserUseCase {
  constructor(private readonly userRepo = new UserRepository()) {}

  async execute(id: string, input: UpdateUserRequestDTO): Promise<ApiResult<PublicUser>> {
    if (!input || Object.keys(input).length === 0) return errorResponse("No se recibieron cambios", 400);
    const allowedFields = new Set([
      "nombre", "apellido", "usuario", "correo", "password", "telefono",
      "fechaNacimiento", "genero", "rol", "estado",
    ]);
    if (Object.keys(input).some((key) => !allowedFields.has(key))) {
      return errorResponse("La solicitud contiene campos no permitidos", 400);
    }

    const fields: Record<string, unknown> = {};
    for (const key of ["nombre", "apellido", "usuario", "correo"] as const) {
      const value = input[key];
      if (value !== undefined) {
        if (typeof value !== "string" || !value.trim()) return errorResponse(`${key} no es válido`, 400);
        fields[key] = key === "usuario" || key === "correo" ? value.trim().toLowerCase() : value.trim();
      }
    }
    if (fields.usuario && !/^[a-zA-Z0-9._-]{3,50}$/.test(String(fields.usuario))) return errorResponse("El usuario debe tener entre 3 y 50 caracteres", 400);
    if (fields.correo && !/^\S+@\S+\.\S+$/.test(String(fields.correo))) return errorResponse("El correo no es válido", 400);
    if (input.password !== undefined) {
      if (typeof input.password !== "string" || input.password.length < 8) return errorResponse("La contraseña debe tener al menos 8 caracteres", 400);
      fields.password = await bcrypt.hash(input.password, 12);
    }
    for (const key of ["telefono", "fechaNacimiento", "genero"] as const) {
      const value = input[key];
      if (value !== undefined) {
        if (value !== null && typeof value !== "string") return errorResponse(`${key} no es válido`, 400);
        fields[key] = typeof value === "string" && value.trim() ? value.trim() : null;
      }
    }
    if (typeof input.telefono === "string" && input.telefono.length > 30) return errorResponse("El teléfono no puede superar 30 caracteres", 400);
    if (typeof input.genero === "string" && input.genero.length > 50) return errorResponse("El género no puede superar 50 caracteres", 400);
    if (input.fechaNacimiento && !this.isValidDate(input.fechaNacimiento)) return errorResponse("La fecha de nacimiento debe usar formato YYYY-MM-DD", 400);
    if (input.rol !== undefined) {
      if (input.rol !== "CENSISTA" && input.rol !== "ADMINISTRADOR") return errorResponse("Rol no válido", 400);
      fields.rol = input.rol as UserRole;
    }
    if (input.estado !== undefined) {
      if (input.estado !== "ACTIVA" && input.estado !== "INACTIVA") return errorResponse("Estado no válido", 400);
      fields.estado = input.estado as UserStatus;
    }

    try {
      const user = await this.userRepo.update(id, fields);
      return user ? successResponse("Usuario actualizado exitosamente", user) : errorResponse("Usuario no encontrado", 404);
    } catch (error) {
      if (error instanceof LastActiveAdministratorError) {
        return errorResponse("Debe permanecer al menos un administrador activo", 409);
      }
      if (this.userRepo.isUniqueConstraintError(error)) return errorResponse("El correo o usuario ya está registrado", 409);
      throw error;
    }
  }

  private isValidDate(value: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith("0000-")) return false;
    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }
}
