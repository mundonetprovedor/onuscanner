import crypto from 'crypto';

export interface User {
  id: string;
  username: string;
  name: string;
  role: 'ADMIN' | 'TECHNICIAN';
}

const DEFAULT_USERS: (User & { passwordHash: string })[] = [
  {
    id: 'usr-admin',
    username: 'admin',
    name: 'Administrador MUNDONET',
    role: 'ADMIN',
    // Simple SHA256 of "mundonet2026"
    passwordHash: crypto.createHash('sha256').update('mundonet2026').digest('hex'),
  },
  {
    id: 'usr-tech',
    username: 'tecnico',
    name: 'Técnico de Campo',
    role: 'TECHNICIAN',
    passwordHash: crypto.createHash('sha256').update('mundonet123').digest('hex'),
  },
];

// Active sessions stored in memory
const activeTokens = new Map<string, { user: User; expiresAt: number }>();

export class AuthService {
  public static hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  public static login(username: string, password: string): { success: boolean; token?: string; user?: User; message?: string } {
    const cleanUser = username.trim().toLowerCase();
    const hashed = this.hashPassword(password);

    const found = DEFAULT_USERS.find(
      (u) => u.username.toLowerCase() === cleanUser && u.passwordHash === hashed
    );

    if (!found) {
      return { success: false, message: 'Usuário ou senha incorretos.' };
    }

    // Generate token valid for 24 hours
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000;

    const userProfile: User = {
      id: found.id,
      username: found.username,
      name: found.name,
      role: found.role,
    };

    activeTokens.set(token, { user: userProfile, expiresAt });

    return {
      success: true,
      token,
      user: userProfile,
    };
  }

  public static validateToken(token: string): User | null {
    if (!token) return null;

    const session = activeTokens.get(token);
    if (!session) return null;

    if (Date.now() > session.expiresAt) {
      activeTokens.delete(token);
      return null;
    }

    return session.user;
  }

  public static logout(token: string): boolean {
    return activeTokens.delete(token);
  }
}
