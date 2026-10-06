import { Request, Response } from "express";
import { GetProfileUseCase } from "../../application/use-cases/GetProfileUseCase";
import { LoginUserUseCase } from "../../application/use-cases/LoginUserUseCase";
import { RegisterUserUseCase } from "../../application/use-cases/RegisterUserUseCase";
import { ProfilePhotoUseCase } from "../../application/use-cases/ProfilePhotoUseCase";
import { LoginRequestDTO } from "../dtos/LoginRequestDTO";
import { RegisterRequestDTO } from "../dtos/RegisterRequestDTO";
import { errorResponse } from "../responses/ApiResponse";

export class AuthController {
  async login(req: Request, res: Response) {
    try {
      const { usuario, password }: LoginRequestDTO = req.body ?? {};
      const result = await new LoginUserUseCase().execute({ usuario, password });
      return res.status(result.statusCode).json(result.body);
    } catch {
      const response = errorResponse("No fue posible iniciar sesión", 500);
      return res.status(response.statusCode).json(response.body);
    }
  }

  async register(req: Request, res: Response) {
    try {
      const input: RegisterRequestDTO = req.body ?? {};
      const result = await new RegisterUserUseCase().execute(input);
      return res.status(result.statusCode).json(result.body);
    } catch {
      const response = errorResponse("No fue posible registrar el usuario", 500);
      return res.status(response.statusCode).json(response.body);
    }
  }

  async profile(req: Request, res: Response) {
    try {
      const result = await new GetProfileUseCase().execute(req.authUser!.id);
      return res.status(result.statusCode).json(result.body);
    } catch {
      const response = errorResponse("No fue posible obtener el perfil", 500);
      return res.status(response.statusCode).json(response.body);
    }
  }

  async updatePhoto(req: Request, res: Response) {
    try {
      const userId = req.authUser!.id;
      const foto = (req as Request & { file?: { buffer: Buffer } }).file?.buffer as Buffer;
      const result = await new ProfilePhotoUseCase().execute(userId, foto);
      return res.status(result.statusCode).json(result.body);
    } catch {
      const response = errorResponse("No fue posible actualizar la foto de perfil", 500);
      return res.status(response.statusCode).json(response.body);
    }
  }
}
