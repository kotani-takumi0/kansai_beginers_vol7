import { randomUUID, createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { Router } from "express";
import type { Request, Response } from "express";
import type { AuthResponse, AuthUser } from "../../src/types";

type StoredUser = AuthUser & {
  passwordHash: string;
};

type StoredSession = {
  token: string;
  userId: string;
};

const usersByEmail = new Map<string, StoredUser>();
const sessions = new Map<string, string>();
let hasLoadedAuthState = false;

type CredentialsBody = {
  email?: unknown;
  password?: unknown;
  displayName?: unknown;
};

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function getAuthStorePath() {
  return process.env.AUTH_STORE_FILE
    ? path.resolve(process.env.AUTH_STORE_FILE)
    : path.resolve(process.cwd(), "server/data/auth-users.json");
}

function getSessionStorePath() {
  if (process.env.AUTH_SESSION_STORE_FILE) {
    return path.resolve(process.env.AUTH_SESSION_STORE_FILE);
  }

  const userStorePath = getAuthStorePath();
  const extension = path.extname(userStorePath);
  const basename = extension ? userStorePath.slice(0, -extension.length) : userStorePath;
  return `${basename}-sessions${extension || ".json"}`;
}

function persistSessionsToDisk() {
  const sessionStorePath = getSessionStorePath();
  mkdirSync(path.dirname(sessionStorePath), { recursive: true });
  const serializedSessions: StoredSession[] = [...sessions.entries()].map(([token, userId]) => ({
    token,
    userId,
  }));
  writeFileSync(sessionStorePath, JSON.stringify(serializedSessions, null, 2), "utf8");
}

function loadAuthStateFromDisk() {
  if (hasLoadedAuthState) {
    return;
  }

  try {
    usersByEmail.clear();

    const userStorePath = getAuthStorePath();
    if (existsSync(userStorePath)) {
      const rawUsers = readFileSync(userStorePath, "utf8");
      const parsedUsers = JSON.parse(rawUsers) as ReadonlyArray<StoredUser>;

      for (const user of parsedUsers) {
        usersByEmail.set(user.email, user);
      }
    }

    sessions.clear();

    const sessionStorePath = getSessionStorePath();
    if (existsSync(sessionStorePath)) {
      const rawSessions = readFileSync(sessionStorePath, "utf8");
      const parsedSessions = JSON.parse(rawSessions) as ReadonlyArray<StoredSession>;

      for (const session of parsedSessions) {
        sessions.set(session.token, session.userId);
      }
    }
  } catch (error) {
    console.error("Failed to load auth state from disk:", error);
  } finally {
    hasLoadedAuthState = true;
  }
}

function persistUsersToDisk() {
  const storePath = getAuthStorePath();
  mkdirSync(path.dirname(storePath), { recursive: true });
  writeFileSync(
    storePath,
    JSON.stringify([...usersByEmail.values()], null, 2),
    "utf8",
  );
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
  persistSessionsToDisk();
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

export function resetAuthStore(options?: {
  clearPersistedUsers?: boolean;
  clearPersistedSessions?: boolean;
}) {
  usersByEmail.clear();
  sessions.clear();
  hasLoadedAuthState = false;

  if (options?.clearPersistedUsers !== false) {
    rmSync(getAuthStorePath(), { force: true });
  }

  if (options?.clearPersistedSessions !== false) {
    rmSync(getSessionStorePath(), { force: true });
  }
}

export const createAuthRouter = (): Router => {
  loadAuthStateFromDisk();

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
    persistUsersToDisk();

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
      persistSessionsToDisk();
      res.status(401).json({ error: "ユーザーが見つかりません。" });
      return;
    }

    res.json({ user });
  });

  return router;
};
