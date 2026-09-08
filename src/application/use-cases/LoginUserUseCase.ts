import { UserRepository } from "../../infrastructure/repositories/UserRepository";
import { AuthService } from "../../domain/Services/AuthService";
import { ApiResult, errorResponse, successResponse } from "../../interfaces/responses/ApiResponse";
import { PublicUser } from "../../domain/entities/User";
import { LoginRequestDTO } from "../../interfaces/dtos/LoginRequestDTO";

export class LoginUserUseCase {
  private userRepo = new UserRepository();
  private authService = new AuthService();

  async execute(input: LoginRequestDTO): Promise<ApiResult<{ token: string; user: PublicUser }>> {
    if (!input?.usuario?.trim() || !input.password) return errorResponse("Usuario y password son obligatorios", 400);

    const user = await this.userRepo.findByUsuario(input.usuario.trim().toLowerCase());
    if (!user) return errorResponse("Credenciales incorrectas", 401);

    const result = await this.authService.validateUser(user, input.password);
    if (!result) return errorResponse("Credenciales incorrectas", 401);

    return successResponse("Login exitoso", result);
  }
}
