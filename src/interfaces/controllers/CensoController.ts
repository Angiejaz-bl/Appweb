
import { Request, Response } from "express";
import { CreateCensoUseCase } from "../../application/use-cases/CreateCensoUseCase";
import { GetCensosUseCase } from "../../application/use-cases/GetCensosUseCase";
import { errorResponse } from "../responses/ApiResponse";

export class CensoController {
  async crear(req: Request, res: Response) {
    try {
      const {
        nombre,
        apellido,
        total_miembros,
        cantidad_televisiones,
        latitud,
        longitud,
      } = req.body ?? {};

      const censo = await new CreateCensoUseCase().execute(
        {
          nombre,
          apellido,
          total_miembros,
          cantidad_televisiones,
          latitud,
          longitud,
        },
        req.authUser!.id,
      );

      return res.status(201).json({
        success: true,
        message: "Censo registrado exitosamente",
        data: censo,
      });
    } catch (error) {
      const mensaje =
        error instanceof Error
          ? error.message
          : "No fue posible registrar el censo";

      const response = errorResponse(mensaje, 400);
      return res.status(response.statusCode).json(response.body);
    }
  }

  async listar(_req: Request, res: Response) {
    try {
      const censos = await new GetCensosUseCase().execute();

      return res.status(200).json({
        success: true,
        message: "Censos obtenidos exitosamente",
        data: censos,
      });
    } catch {
      const response = errorResponse("No fue posible obtener los censos", 500);
      return res.status(response.statusCode).json(response.body);
    }
  }
}
