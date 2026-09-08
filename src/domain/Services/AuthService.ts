import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { config } from "../../infrastructure/config/config";
import { PublicUser, User } from "../entities/User";

export class AuthService {
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  generateToken(user: Pick<User, "id" | "correo" | "usuario">): string {
    return jwt.sign({ id: user.id, correo: user.correo, usuario: user.usuario }, config.jwt.secret, {
      expiresIn: config.jwt.expires,
    });
  }

  toPublicUser(user: User): PublicUser {
    const { password, created_at, ...publicUser } = user;
    return publicUser;
  }

  async validateUser(user: User, password: string): Promise<{ token: string; user: PublicUser } | null> {
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return null;

    return { token: this.generateToken(user), user: this.toPublicUser(user) };
  }
}
