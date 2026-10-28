import { UserId } from "../../domain/entities/User";
import { CreateParcialUbicacionInput, ParcialUbicacionRepository } from "../../infrastructure/repositories/ParcialUbicacionRepository";

export class ParcialUbicacionValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ParcialUbicacionValidationError";
  }
}

export class CreateParcialUbicacionUseCase {
  private readonly repository = new ParcialUbicacionRepository();

  async execute(input: Omit<CreateParcialUbicacionInput, "propietario_id">, propietarioId: UserId) {
    if (typeof input.nombre !== "string" || !input.nombre.trim()) {
      throw new ParcialUbicacionValidationError("El nombre es obligatorio");
    }
    if (input.nombre.trim().length > 150) {
      throw new ParcialUbicacionValidationError("El nombre no puede superar 150 caracteres");
    }
    if (typeof input.descripcion !== "string" || !input.descripcion.trim()) {
      throw new ParcialUbicacionValidationError("La descripción es obligatoria");
    }
    if (typeof input.latitud !== "number" || !Number.isFinite(input.latitud)
      || input.latitud < -90 || input.latitud > 90) {
      throw new ParcialUbicacionValidationError("La latitud debe ser numérica y estar entre -90 y 90");
    }
    if (typeof input.longitud !== "number" || !Number.isFinite(input.longitud)
      || input.longitud < -180 || input.longitud > 180) {
      throw new ParcialUbicacionValidationError("La longitud debe ser numérica y estar entre -180 y 180");
    }
    return this.repository.crear({
      nombre: input.nombre.trim(), descripcion: input.descripcion.trim(),
      latitud: input.latitud, longitud: input.longitud, propietario_id: propietarioId,
    });
  }
}
