import dotenv from "dotenv";
import type { SignOptions } from "jsonwebtoken";
dotenv.config();

export const config = {
  db: {
    name: process.env.DB_NAME!,
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    host: process.env.DB_HOST!,
    port: Number(process.env.DB_PORT ?? 5432)
  },
  server: {
    port: Number(process.env.PORT ?? 3000)
  },
  jwt: {
    secret: process.env.JWT_SECRET!,
    expires: process.env.JWT_EXPIRES as SignOptions["expiresIn"]
  }
};
