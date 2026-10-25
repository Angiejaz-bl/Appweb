import { Request, Response } from "express";
import { RegisterUserUseCase } from "../../application/use-cases/RegisterUserUseCase";
import { GetUsersUseCase } from "../../application/use-cases/GetUsersUseCase";
import { UpdateUserUseCase } from "../../application/use-cases/UpdateUserUseCase";
import { RegisterRequestDTO } from "../dtos/RegisterRequestDTO";
import { UpdateUserRequestDTO } from "../dtos/UpdateUserRequestDTO";
import { errorResponse } from "../responses/ApiResponse";
import { parseUserId } from "../../domain/entities/User";

export class UsersController {
  async listar(_req: Request, res: Response) {
    try {
      const result = await new GetUsersUseCase().execute();
      return res.status(result.statusCode).json(result.body);
    } catch {
      const response = errorResponse("No fue posible obtener los usuarios", 500);
      return res.status(response.statusCode).json(response.body);
    }
  }

  async crear(req: Request, res: Response) {
    try {
      const input: RegisterRequestDTO = req.body ?? {};
      const rol = input.rol === "ADMINISTRADOR" ? "ADMINISTRADOR" : input.rol === "CENSISTA" || input.rol === undefined ? "CENSISTA" : null;
      if (!rol) {
        const response = errorResponse("Rol no válido", 400);
        return res.status(response.statusCode).json(response.body);
      }
      const result = await new RegisterUserUseCase().execute(input, rol, true);
      return res.status(result.statusCode).json(result.body);
    } catch {
      const response = errorResponse("No fue posible crear el usuario", 500);
      return res.status(response.statusCode).json(response.body);
    }
  }

  async actualizar(req: Request, res: Response) {
    try {
      const id = parseUserId(req.params.id);
      if (!id) {
        const response = errorResponse("ID de usuario inválido", 400);
        return res.status(response.statusCode).json(response.body);
      }
      const input: UpdateUserRequestDTO = req.body ?? {};
      const result = await new UpdateUserUseCase().execute(id, input);
      return res.status(result.statusCode).json(result.body);
    } catch {
      const response = errorResponse("No fue posible actualizar el usuario", 500);
      return res.status(response.statusCode).json(response.body);
    }
  }
}
