import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { config } from "../../infrastructure/config/config";
import { UserRole } from "../../domain/entities/User";
import { errorResponse } from "../responses/ApiResponse";

export interface TokenPayload extends JwtPayload {
  id: number;
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

export const authenticateToken = (
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

  try {
    const payload = jwt.verify(token, config.jwt.secret);

    if (
      typeof payload === "string" ||
      !payload.id ||
      (payload.rol !== "CENSISTA" &&
        payload.rol !== "ADMINISTRADOR")
    ) {
      const response = errorResponse(
        "Token de autenticación inválido",
        401
      );
      return res.status(response.statusCode).json(response.body);
    }

    const id = Number(payload.id);

    if (!Number.isInteger(id)) {
      const response = errorResponse(
        "Token de autenticación inválido",
        401
      );
      return res.status(response.statusCode).json(response.body);
    }

    req.authUser = {
      ...payload,
      id,
      rol: payload.rol,
    } as TokenPayload;

    return next();
  } catch {
    const response = errorResponse(
      "Token de autenticación inválido o expirado",
      401
    );
    return res.status(response.statusCode).json(response.body);
  }
};