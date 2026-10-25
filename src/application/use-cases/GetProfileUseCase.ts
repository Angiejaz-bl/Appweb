import { PublicUser, UserId } from "../../domain/entities/User";
import { UserRepository } from "../../infrastructure/repositories/UserRepository";
import { ApiResult, errorResponse, successResponse } from "../../interfaces/responses/ApiResponse";

export class GetProfileUseCase {
  private userRepo = new UserRepository();

  async execute(userId: UserId): Promise<ApiResult<PublicUser>> {
    const user = await this.userRepo.findPublicById(userId);
    if (!user) return errorResponse("Usuario no encontrado", 404);
    return successResponse("Perfil obtenido exitosamente", user);
  }
}
