
import { CensoRepository } from "../../infrastructure/repositories/CensoRepository";

export class GetCensosUseCase {
  private readonly censoRepository = new CensoRepository();

  async execute() {
    return this.censoRepository.listar();
  }
}
