import { UserRepository } from "../../infrastructure/repositories/UserRepository";
import { AuthService } from "../../domain/services/AuthService";

export class LoginUserUseCase {
  private userRepo = new UserRepository();
  private authService = new AuthService();

  async execute(email: string, password: string) {
    const user = await this.userRepo.findByEmail(email);
    if (!user) return { status: "error", message: "Usuario no encontrado", data: null };

    const result = await this.authService.validateUser(user, password);
    if (!result) return { status: "error", message: "Credenciales incorrectas", data: null };

    return { status: "success", message: "Login exitoso", data: result };
  }
}
