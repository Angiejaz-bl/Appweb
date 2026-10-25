import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { config } from "../../infrastructure/config/config";
import { parseUserId, UserRole } from "../../domain/entities/User";
import { UserRepository } from "../../infrastructure/repositories/UserRepository";
import { errorResponse } from "../responses/ApiResponse";

export interface TokenPayload extends JwtPayload {
  id: string;
  correo: string;
  usuario: string;
  rol: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      authUser?: TokenPayload;
    }
  }
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authorization = req.headers.authorization;

  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : undefined;

  if (!token) {
    const response = errorResponse(
      "Token de autenticación requerido",
      401
    );
    return res.status(response.statusCode).json(response.body);
  }

  let payload: string | JwtPayload;
  try {
    payload = jwt.verify(token, config.jwt.secret);
  } catch {
    const response = errorResponse("Token de autenticación inválido o expirado", 401);
    return res.status(response.statusCode).json(response.body);
  }

  if (
    typeof payload === "string" ||
    (payload.rol !== "CENSISTA" && payload.rol !== "ADMINISTRADOR")
  ) {
    const response = errorResponse("Token de autenticación inválido", 401);
    return res.status(response.statusCode).json(response.body);
  }

  const id = parseUserId(payload.id);
  if (!id) {
    const response = errorResponse("Token de autenticación inválido", 401);
    return res.status(response.statusCode).json(response.body);
  }

  try {
    const authorization = await new UserRepository().findAuthorizationById(id);
    if (!authorization || authorization.estado !== "ACTIVA") {
      const response = errorResponse(
        "La cuenta no existe o está inactiva",
        401
      );
      return res.status(response.statusCode).json(response.body);
    }

    req.authUser = {
      ...payload,
      id,
      rol: authorization.rol,
    } as TokenPayload;
    return next();
  } catch {
    const response = errorResponse("No fue posible validar el estado de la cuenta", 500);
    return res.status(response.statusCode).json(response.body);
  }
};
