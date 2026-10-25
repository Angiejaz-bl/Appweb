import { AuthService } from "../../domain/Services/AuthService";
import { CreateUserInput, PublicUser, UserRole } from "../../domain/entities/User";
import { UserRepository } from "../../infrastructure/repositories/UserRepository";
import { RegisterRequestDTO } from "../../interfaces/dtos/RegisterRequestDTO";
import { ApiResult, errorResponse, successResponse } from "../../interfaces/responses/ApiResponse";

export class RegisterUserUseCase {
  constructor(
    private readonly userRepo = new UserRepository(),
    private readonly authService = new AuthService(),
  ) {}

  async execute(
    input: RegisterRequestDTO,
    rol: UserRole = "CENSISTA",
    allowAdministratorRole = false,
  ): Promise<ApiResult<PublicUser>> {
    const validationError = this.validate(input, allowAdministratorRole);
    if (validationError) return errorResponse(validationError, 400);
    if (rol !== "CENSISTA" && rol !== "ADMINISTRADOR") return errorResponse("Rol no válido", 400);

    const correo = input.correo.trim().toLowerCase();
    const usuario = input.usuario.trim().toLowerCase();
    const existingByCorreo = await this.userRepo.findByCorreo(correo);
    if (existingByCorreo) return errorResponse("El correo ya está registrado", 409);

    const existingByUsername = await this.userRepo.findByUsuario(usuario);
    if (existingByUsername) return errorResponse("El nombre de usuario ya está registrado", 409);

    const userToCreate: CreateUserInput = {
      nombre: input.nombre.trim(),
      apellido: input.apellido.trim(),
      usuario,
      correo,
      password: await this.authService.hashPassword(input.password),
      telefono: input.telefono?.trim() || null,
      fechaNacimiento: input.fechaNacimiento || null,
      genero: input.genero?.trim() || null,
      rol,
    };

    try {
      const user = await this.userRepo.create(userToCreate);
      return successResponse("Usuario registrado exitosamente", user, 201);
    } catch (error: unknown) {
      if (this.userRepo.isUniqueConstraintError(error)) {
        return errorResponse("El correo electrónico o usuario ya está registrado", 409);
      }
      throw error;
    }
  }

  private validate(input: RegisterRequestDTO, allowAdministratorRole: boolean): string | null {
    if (!input || typeof input !== "object" || Array.isArray(input)) return "La solicitud no es válida";
    const allowedFields = new Set([
      "nombre", "apellido", "usuario", "correo", "password", "telefono",
      "fechaNacimiento", "genero", "rol",
    ]);
    if (Object.keys(input).some((key) => !allowedFields.has(key))) return "La solicitud contiene campos no permitidos";
    for (const key of ["nombre", "apellido", "usuario", "correo", "password"] as const) {
      if (typeof input[key] !== "string" || !input[key].trim()) {
        return "Nombre, apellido, usuario, correo y password son obligatorios";
      }
    }
    if (input.rol !== undefined && input.rol !== "CENSISTA" && !(allowAdministratorRole && input.rol === "ADMINISTRADOR")) {
      return "Rol no válido";
    }
    if (!/^\S+@\S+\.\S+$/.test(input.correo.trim())) return "El correo no es válido";
    if (!/^[a-zA-Z0-9._-]{3,50}$/.test(input.usuario.trim())) {
      return "El usuario debe tener entre 3 y 50 caracteres y usar solo letras, números, punto, guion o guion bajo";
    }
    if (input.password.length < 8) return "La contraseña debe tener al menos 8 caracteres";
    if (input.telefono !== undefined && input.telefono !== null && typeof input.telefono !== "string") return "El teléfono no es válido";
    if (input.fechaNacimiento !== undefined && input.fechaNacimiento !== null && !this.isValidDate(input.fechaNacimiento)) return "La fecha de nacimiento no es válida";
    if (input.genero !== undefined && input.genero !== null && typeof input.genero !== "string") return "El género no es válido";
    if (typeof input.telefono === "string" && input.telefono.length > 30) return "El teléfono no puede superar 30 caracteres";
    if (typeof input.genero === "string" && input.genero.length > 50) return "El género no puede superar 50 caracteres";
    return null;
  }

  private isValidDate(value: string): boolean {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith("0000-")) return false;
    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }
}
