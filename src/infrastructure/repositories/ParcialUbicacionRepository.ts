import { pool } from "../database/connection";
import { UserId } from "../../domain/entities/User";

export interface ParcialUbicacion {
  id: string;
  nombre: string;
  descripcion: string;
  latitud: number;
  longitud: number;
  fecha_creacion: Date;
}

export interface CreateParcialUbicacionInput {
  nombre: string;
  descripcion: string;
  latitud: number;
  longitud: number;
  propietario_id: UserId;
}

export class ParcialUbicacionRepository {
  async crear(input: CreateParcialUbicacionInput): Promise<ParcialUbicacion> {
    const result = await pool.query<ParcialUbicacion>(
      `INSERT INTO parcial_ubicaciones
         (propietario_id, nombre, descripcion, latitud, longitud)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id::text AS id, nombre, descripcion, latitud, longitud, fecha_creacion`,
      [input.propietario_id, input.nombre, input.descripcion, input.latitud, input.longitud],
    );
    return result.rows[0];
  }

  async listarPorPropietario(propietarioId: UserId): Promise<ParcialUbicacion[]> {
    const result = await pool.query<ParcialUbicacion>(
      `SELECT id::text AS id, nombre, descripcion, latitud, longitud, fecha_creacion
       FROM parcial_ubicaciones
       WHERE propietario_id = $1
       ORDER BY fecha_creacion DESC, id DESC`,
      [propietarioId],
    );
    return result.rows;
  }
}
