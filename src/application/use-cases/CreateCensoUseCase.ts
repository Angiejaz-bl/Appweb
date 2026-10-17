
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

    if (
      typeof input.latitud !== "number" ||
      !Number.isFinite(input.latitud) ||
      input.latitud < -90 ||
      input.latitud > 90
    ) {
      throw new Error("La latitud no es válida");
    }

    if (
      typeof input.longitud !== "number" ||
      !Number.isFinite(input.longitud) ||
      input.longitud < -180 ||
      input.longitud > 180
    ) {
      throw new Error("La longitud no es válida");
    }

    return this.censoRepository.crear({
      ...input,
      nombre: input.nombre.trim(),
      apellido: input.apellido.trim(),
      creado_por: usuarioId,
    });
  }
}
