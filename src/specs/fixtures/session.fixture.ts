import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import env from "../../config/env.ts";
import { User } from "../../models/user.model.ts";
import { Session } from "../../models/session.model.ts";

export const createSessionFixture = async () => {
  const user = await User.create({
    email: `sessionuser-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`,
    password: bcrypt.hashSync("Password123@", env.SALT_ROUNDS || 10),
    firstname: "Test",
    lastname: "Session",
    isVerified: true,
    isAdmin: false,
  });

  const ip = "192.168.1.1";
  const userAgent = "Mozilla/5.0";
  const rawToken = "user-session-token";
  const hashedToken = await bcrypt.hash(rawToken, env.SALT_ROUNDS || 10);

  const sessionExpiration = parseInt(String(env.SESSION_EXPIRATION ?? "1"), 10);
  const session = await Session.create({
    userId: user.id,
    token: hashedToken,
    ip,
    userAgent,
    expiresAt: new Date(Date.now() + sessionExpiration * 3600000),
  });

  // 👉 valeur utilisable directement par supertest
  const cookieValue = `${session.toJSON().id}:${rawToken}`;

  return { user: user.toJSON(), cookieValue };
};


export const createAdminSessionFixture = async () => {
  const user = await User.create({
    email: `admin-sessionuser-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`,
    password: bcrypt.hashSync("password123", env.SALT_ROUNDS || 10),
    firstname: "Test",
    lastname: "Session",
    isVerified: true,
    isAdmin: true,
  });

  const rawToken = "admin-session-token";
  const hashedToken = await bcrypt.hash(rawToken, env.SALT_ROUNDS || 10);
  const ip = "192.168.1.1";
  const userAgent = "Mozilla/5.0";

  const sessionExpiration = parseInt(String(env.SESSION_EXPIRATION ?? "1"), 10);
  const session = await Session.create({
    userId: user.id,
    token: hashedToken,
    ip,
    userAgent,
    expiresAt: new Date(Date.now() + sessionExpiration * 3600000),
  });

  const cookieValue = `${session.toJSON().id}:${rawToken}`;
  return { user: user.toJSON(), cookieValue };
};

