import { UserRepository } from "../../infrastructure/repositories/UserRepository";
import { ApiResult, successResponse } from "../../interfaces/responses/ApiResponse";
import { PublicUser } from "../../domain/entities/User";

export class GetUsersUseCase {
  constructor(private readonly userRepo = new UserRepository()) {}

  async execute(): Promise<ApiResult<PublicUser[]>> {
    return successResponse("Usuarios obtenidos exitosamente", await this.userRepo.list());
  }
}
