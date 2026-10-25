import { UserRepository } from "../../infrastructure/repositories/UserRepository";
import { UserId } from "../../domain/entities/User";
import { ApiResult, errorResponse, successResponse } from "../../interfaces/responses/ApiResponse";

export class ProfilePhotoUseCase {
  private userRepo = new UserRepository();

  async execute(userId: UserId, foto: Buffer): Promise<ApiResult<null>> {
    if (!foto || foto.length === 0) {
      return errorResponse("La foto es obligatoria", 400);
    }

    try {
      await this.userRepo.updateFoto(userId, foto);
      return successResponse("Foto de perfil actualizada exitosamente", null);
    } catch (error: unknown) {
      return errorResponse("No fue posible actualizar la foto de perfil", 500);
    }
  }
}
