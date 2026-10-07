import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { config } from "../../infrastructure/config/config";
import { errorResponse } from "../responses/ApiResponse";

export interface TokenPayload extends JwtPayload {
  id: number;
  correo: string;
  usuario: string;
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
  console.log("AUTH MIDDLEWARE EJECUTADO");

  const authorization = req.headers.authorization;

  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : undefined;

  if (!token) {
    console.log("JWT: NO SE RECIBIÓ TOKEN");

    const response = errorResponse(
      "Token de autenticación requerido",
      401
    );

    return res.status(response.statusCode).json(response.body);
  }

  console.log("JWT: TOKEN RECIBIDO");

  try {
    const payload = jwt.verify(token, config.jwt.secret);

    console.log("JWT PAYLOAD:", payload);

    if (typeof payload === "object" && payload !== null) {
      console.log("JWT ID:", payload.id);
      console.log("JWT ID TYPE:", typeof payload.id);
      console.log("JWT USUARIO:", payload.usuario);
      console.log("JWT CORREO:", payload.correo);
    }

    if (
      typeof payload === "string" ||
      typeof payload.id !== "number"
    ) {
      console.log("JWT: ID INVÁLIDO");

      const response = errorResponse(
        "Token de autenticación inválido",
        401
      );

      return res.status(response.statusCode).json(response.body);
    }

    req.authUser = payload as TokenPayload;

    console.log("JWT: AUTENTICACIÓN CORRECTA");

    return next();
  } catch (error) {
    console.log("JWT ERROR:", error);

    const response = errorResponse(
      "Token de autenticación inválido o expirado",
      401
    );

    return res.status(response.statusCode).json(response.body);
  }
};