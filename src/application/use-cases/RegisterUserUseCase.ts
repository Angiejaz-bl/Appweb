import { AuthService } from "../../domain/Services/AuthService";
import { CreateUserInput, PublicUser } from "../../domain/entities/User";
import { UserRepository } from "../../infrastructure/repositories/UserRepository";
import { RegisterRequestDTO } from "../../interfaces/dtos/RegisterRequestDTO";
import { ApiResult, errorResponse, successResponse } from "../../interfaces/responses/ApiResponse";

export class RegisterUserUseCase {
  private userRepo = new UserRepository();
  private authService = new AuthService();

  async execute(input: RegisterRequestDTO): Promise<ApiResult<PublicUser>> {
    const validationError = this.validate(input);
    if (validationError) return errorResponse(validationError, 400);

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

  private validate(input: RegisterRequestDTO): string | null {
    if (!input || !input.nombre?.trim() || !input.apellido?.trim() || !input.usuario?.trim() || !input.correo?.trim() || !input.password) {
      return "Nombre, apellido, usuario, correo y password son obligatorios";
    }
    if (!/^\S+@\S+\.\S+$/.test(input.correo.trim())) return "El correo no es válido";
    if (!/^[a-zA-Z0-9._-]{3,50}$/.test(input.usuario.trim())) {
      return "El usuario debe tener entre 3 y 50 caracteres y usar solo letras, números, punto, guion o guion bajo";
    }
    if (input.password.length < 8) return "La contraseña debe tener al menos 8 caracteres";
    return null;
  }
}
