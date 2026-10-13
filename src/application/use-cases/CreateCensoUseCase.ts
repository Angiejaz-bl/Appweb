
import {
  CensoRepository,
  CrearCensoInput,
} from "../../infrastructure/repositories/CensoRepository";

export class CreateCensoUseCase {
  private readonly censoRepository = new CensoRepository();

  async execute(
    input: Omit<CrearCensoInput, "creado_por">,
    usuarioId: number,
  ) {
    if (!input.nombre?.trim() || !input.apellido?.trim()) {
      throw new Error("El nombre y el apellido son obligatorios");
    }

    if (
      !Number.isInteger(input.total_miembros) ||
      input.total_miembros < 1
    ) {
      throw new Error("El total de miembros debe ser al menos 1");
    }

    if (
      !Number.isInteger(input.cantidad_televisiones) ||
      input.cantidad_televisiones < 0
    ) {
      throw new Error("La cantidad de televisiones no puede ser negativa");
    }

    return this.censoRepository.crear({
      ...input,
      nombre: input.nombre.trim(),
      apellido: input.apellido.trim(),
      creado_por: usuarioId,
    });
  }
}
