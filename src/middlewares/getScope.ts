import { User } from "../models/user.model.ts";
import { Session } from "../models/session.model.ts";

export async function getScopeWhere(req: any) {
  const cookie = req.cookies?.session;
  if (!cookie) return null;

  const [sessionId, token] = cookie.split(":");
  if (!sessionId || !token) return null;

  const session = await Session.findByPk(sessionId);
  if (!session || new Date(session.expiresAt) < new Date()) return null;

  const user = await User.findByPk(session.userId);
  if (!user) return null;

  return {
    user,
    where: user.isAdmin ? {} : { userId: user.id },
  };
}
