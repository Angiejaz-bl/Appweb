import { NextFunction, Request, Response } from "express";
import { UserRole } from "../../domain/entities/User";
import { errorResponse } from "../responses/ApiResponse";

export const authorizeRole = (...rolesPermitidos: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const usuario = req.authUser;

    if (!usuario) {
      const response = errorResponse(
        "Autenticación requerida",
        401
      );

      return res.status(response.statusCode).json(response.body);
    }

    if (!rolesPermitidos.includes(usuario.rol)) {
      const response = errorResponse(
        "No tienes permisos para acceder a esta función",
        403
      );

      return res.status(response.statusCode).json(response.body);
    }

    return next();
  };
};