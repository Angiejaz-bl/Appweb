import { UserId } from "../../domain/entities/User";
import { ParcialUbicacionRepository } from "../../infrastructure/repositories/ParcialUbicacionRepository";

export class GetParcialUbicacionesUseCase {
  private readonly repository = new ParcialUbicacionRepository();

  async execute(propietarioId: UserId) {
    return this.repository.listarPorPropietario(propietarioId);
  }
}
