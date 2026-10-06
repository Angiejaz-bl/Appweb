import { UserRepository } from "../../infrastructure/repositories/UserRepository";
import { ApiResult, errorResponse, successResponse } from "../../interfaces/responses/ApiResponse";

export class ProfilePhotoUseCase {
  private userRepo = new UserRepository();

  async execute(userId: number, foto: Buffer): Promise<ApiResult<null>> {
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
