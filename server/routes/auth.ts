import { randomUUID, createHash } from "node:crypto";
import { Router } from "express";
import type { Request, Response } from "express";
import type { AuthResponse, AuthUser } from "../../src/types";

type StoredUser = AuthUser & {
  passwordHash: string;
};

const usersByEmail = new Map<string, StoredUser>();
const sessions = new Map<string, string>();

type CredentialsBody = {
  email?: unknown;
  password?: unknown;
  displayName?: unknown;
};

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function buildAuthResponse(user: AuthUser): AuthResponse {
  const token = randomUUID();
  sessions.set(token, user.id);
  return { token, user };
}

function findUserById(userId: string): AuthUser | null {
  for (const user of usersByEmail.values()) {
    if (user.id === userId) {
      const { passwordHash: _passwordHash, ...safeUser } = user;
      return safeUser;
    }
  }

  return null;
}

export function resetAuthStore() {
  usersByEmail.clear();
  sessions.clear();
}

export const createAuthRouter = (): Router => {
  const router = Router();

  router.post("/register", (req: Request, res: Response) => {
    const { email, password, displayName } = req.body as CredentialsBody;

    if (!isNonEmptyString(displayName) || displayName.trim().length < 2) {
      res.status(400).json({ error: "表示名は2文字以上で入力してください。" });
      return;
    }

    if (!isNonEmptyString(email) || !email.includes("@")) {
      res.status(400).json({ error: "有効なメールアドレスを入力してください。" });
      return;
    }

    if (!isNonEmptyString(password) || password.length < 8) {
      res.status(400).json({ error: "パスワードは8文字以上で入力してください。" });
      return;
    }

    const normalizedEmail = normalizeEmail(email);

    if (usersByEmail.has(normalizedEmail)) {
      res.status(409).json({ error: "このメールアドレスは既に登録されています。" });
      return;
    }

    const user: StoredUser = {
      id: randomUUID(),
      email: normalizedEmail,
      displayName: displayName.trim(),
      createdAt: new Date().toISOString(),
      passwordHash: hashPassword(password),
    };

    usersByEmail.set(normalizedEmail, user);

    const { passwordHash: _passwordHash, ...safeUser } = user;
    res.status(201).json(buildAuthResponse(safeUser));
  });

  router.post("/login", (req: Request, res: Response) => {
    const { email, password } = req.body as CredentialsBody;

    if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
      res.status(400).json({ error: "メールアドレスとパスワードを入力してください。" });
      return;
    }

    const normalizedEmail = normalizeEmail(email);
    const user = usersByEmail.get(normalizedEmail);

    if (!user || user.passwordHash !== hashPassword(password)) {
      res.status(401).json({ error: "メールアドレスまたはパスワードが正しくありません。" });
      return;
    }

    const { passwordHash: _passwordHash, ...safeUser } = user;
    res.json(buildAuthResponse(safeUser));
  });

  router.get("/me", (req: Request, res: Response) => {
    const authHeader = req.header("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      res.status(401).json({ error: "認証トークンがありません。" });
      return;
    }

    const userId = sessions.get(token);

    if (!userId) {
      res.status(401).json({ error: "セッションが無効です。再ログインしてください。" });
      return;
    }

    const user = findUserById(userId);

    if (!user) {
      sessions.delete(token);
      res.status(401).json({ error: "ユーザーが見つかりません。" });
      return;
    }

    res.json({ user });
  });

  return router;
};
