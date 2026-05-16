import { AppData } from '../types';

export interface ApiSession {
  userId: string;
  token: string;
}

export interface AuthRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  userId: string;
}

const REMOTE_DB_KEY = 'recomp-os-remote-db-v1';

type RemoteDB = Record<string, AppData>;

function loadRemoteDb(): RemoteDB {
  const raw = localStorage.getItem(REMOTE_DB_KEY);
  if (!raw) return {};
  try { return JSON.parse(raw) as RemoteDB; } catch { return {}; }
}

function saveRemoteDb(db: RemoteDB) {
  localStorage.setItem(REMOTE_DB_KEY, JSON.stringify(db));
}

/** API contract for /auth */
export async function apiAuth(payload: AuthRequest): Promise<AuthResponse> {
  return {
    token: `remote-token-${payload.email.toLowerCase()}`,
    userId: payload.email.toLowerCase()
  };
}

/** API contract for /me */
export async function apiMe(session: ApiSession): Promise<{ userId: string }> {
  return { userId: session.userId };
}

/** API contract for /data */
export async function apiData(session: ApiSession, data?: AppData): Promise<AppData | null> {
  const db = loadRemoteDb();
  if (data) {
    db[session.userId] = data;
    saveRemoteDb(db);
    return data;
  }
  return db[session.userId] ?? null;
}
