import { pool } from "../database/connection";

export class UserRepository {
  async findByEmail(email: string) {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    return result.rows[0];
  }
}
