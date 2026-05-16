import { uid } from './format';

const USERS_KEY = 'recomp-os-auth-users-v1';
const SESSION_KEY = 'recomp-os-auth-session-v1';

export interface User {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
}

export interface Session {
  userId: string;
  token: string;
  local: boolean;
  expiresAt?: string;
}

interface SignUpInput {
  email: string;
  password: string;
  displayName: string;
}

interface SignInInput {
  email: string;
  password: string;
}

type StoredUser = User & { password: string };

function loadUsers(): StoredUser[] {
  const raw = localStorage.getItem(USERS_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw) as StoredUser[]; } catch { return []; }
}

function saveUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getCurrentSession(): Session | null {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    const session = JSON.parse(raw) as Session;
    if (session.expiresAt && new Date(session.expiresAt).getTime() < Date.now()) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

function saveSession(session: Session | null) {
  if (!session) {
    localStorage.removeItem(SESSION_KEY);
    return;
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function getCurrentUser(): User | null {
  const session = getCurrentSession();
  if (!session) return null;
  const user = loadUsers().find((u) => u.id === session.userId);
  if (!user) return null;
  const { password: _password, ...safe } = user;
  return safe;
}

export function signUp(input: SignUpInput): { user: User; session: Session } {
  const email = input.email.trim().toLowerCase();
  const displayName = input.displayName.trim();
  const password = input.password;

  if (!email || !displayName || !password) throw new Error('Completa todos los campos.');

  const users = loadUsers();
  if (users.some((u) => u.email === email)) throw new Error('Ese correo ya existe.');

  const user: StoredUser = {
    id: uid('user'),
    email,
    displayName,
    createdAt: new Date().toISOString(),
    password
  };

  users.push(user);
  saveUsers(users);

  const session: Session = { userId: user.id, token: uid('token'), local: true };
  saveSession(session);

  const { password: _password, ...safe } = user;
  return { user: safe, session };
}

export function signIn(input: SignInInput): { user: User; session: Session } {
  const email = input.email.trim().toLowerCase();
  const users = loadUsers();
  const user = users.find((u) => u.email === email && u.password === input.password);
  if (!user) throw new Error('Credenciales inválidas.');

  const session: Session = { userId: user.id, token: uid('token'), local: true };
  saveSession(session);

  const { password: _password, ...safe } = user;
  return { user: safe, session };
}

export function signOut() {
  saveSession(null);
}
