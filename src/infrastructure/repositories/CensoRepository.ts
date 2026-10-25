
import { pool } from "../database/connection";
import { UserId } from "../../domain/entities/User";

export interface Censo {
  id: number;
  nombre: string;
  apellido: string;
  total_miembros: number;
  cantidad_televisiones: number;
  latitud: number;
  longitud: number;
  creado_por: UserId;
  fecha_registro: Date;
}

export interface CrearCensoInput {
  nombre: string;
  apellido: string;
  total_miembros: number;
  cantidad_televisiones: number;
  latitud: number;
  longitud: number;
  creado_por: UserId;
}

export class CensoRepository {
  async crear(input: CrearCensoInput): Promise<Censo> {
    const resultado = await pool.query<Censo>(
      `INSERT INTO censos (
        nombre,
        apellido,
        total_miembros,
        cantidad_televisiones,
        latitud,
        longitud,
        creado_por
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, nombre, apellido, total_miembros,
                cantidad_televisiones, latitud, longitud,
                creado_por::text AS creado_por, fecha_registro`,
      [
        input.nombre,
        input.apellido,
        input.total_miembros,
        input.cantidad_televisiones,
        input.latitud,
        input.longitud,
        input.creado_por,
      ],
    );

    return resultado.rows[0];
  }

  async listar(): Promise<Censo[]> {
    const resultado = await pool.query<Censo>(
      `SELECT id, nombre, apellido, total_miembros,
              cantidad_televisiones, latitud, longitud,
              creado_por::text AS creado_por, fecha_registro
       FROM censos
       ORDER BY id DESC`,
    );

    return resultado.rows;
  }
}
