import { Request, Response } from "express";
import { LoginUserUseCase } from "../../application/use-cases/LoginUserUseCase";

export class AuthController {
  async login(req: Request, res: Response) {
    const { email, password } = req.body;
    const useCase = new LoginUserUseCase();
    const result = await useCase.execute(email, password);
    res.json(result);
  }
}
