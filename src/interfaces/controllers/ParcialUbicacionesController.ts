import { Request, Response } from "express";
import { CreateParcialUbicacionUseCase } from "../../application/use-cases/CreateParcialUbicacionUseCase";
import { GetParcialUbicacionesUseCase } from "../../application/use-cases/GetParcialUbicacionesUseCase";
import { errorResponse, successResponse } from "../responses/ApiResponse";

export class ParcialUbicacionesController {
  async crear(req: Request, res: Response) {
    const { nombre, descripcion, latitud, longitud } = req.body ?? {};
    try {
      const ubicacion = await new CreateParcialUbicacionUseCase().execute(
        { nombre, descripcion, latitud, longitud }, req.authUser!.id,
      );
      const response = successResponse("Ubicación registrada exitosamente", ubicacion, 201);
      return res.status(response.statusCode).json(response.body);
    } catch (error) {
      const validationError = error instanceof Error && error.name === "ParcialUbicacionValidationError";
      const response = errorResponse(
        validationError && error instanceof Error ? error.message : "No fue posible registrar la ubicación",
        validationError ? 400 : 500,
      );
      return res.status(response.statusCode).json(response.body);
    }
  }

  async listar(req: Request, res: Response) {
    try {
      const ubicaciones = await new GetParcialUbicacionesUseCase().execute(req.authUser!.id);
      const response = successResponse("Ubicaciones obtenidas exitosamente", ubicaciones);
      return res.status(response.statusCode).json(response.body);
    } catch {
      const response = errorResponse("No fue posible obtener las ubicaciones", 500);
      return res.status(response.statusCode).json(response.body);
    }
  }
}
