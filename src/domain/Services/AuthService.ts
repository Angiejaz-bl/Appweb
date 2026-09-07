import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { config } from "../../infrastructure/config/config";

export class AuthService {
  async validateUser(user: any, password: string) {
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return null;

    const token = jwt.sign({ id: user.id, email: user.email }, config.jwt.secret, {
      expiresIn: config.jwt.expires,
    });
    return { token, user };
  }
}
