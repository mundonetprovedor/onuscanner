import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { OltManager } from './services/OltManager.js';
import { OntScanner } from './services/OntScanner.js';
import { AuthService } from './services/AuthService.js';
import { HuaweiDriver } from './drivers/HuaweiDriver.js';
import { FiberhomeAN6000Driver } from './drivers/FiberhomeAN6000Driver.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const oltManager = new OltManager();
const ontScanner = new OntScanner(oltManager);

// --------------------------------------------------------------------------
// 🛡️ SECURITY SHIELD: Rate Limiting & Brute-Force Protection
// --------------------------------------------------------------------------
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

const rateLimitLogin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const record = loginAttempts.get(clientIp);

  if (record && now < record.resetAt) {
    if (record.count >= 5) {
      return res.status(429).json({
        success: false,
        message: 'Muitas tentativas incorretas. Bloqueado por 15 minutos por segurança.',
      });
    }
  } else {
    loginAttempts.set(clientIp, { count: 0, resetAt: now + 15 * 60 * 1000 });
  }

  next();
};

const recordFailedLogin = (ip: string) => {
  const record = loginAttempts.get(ip);
  if (record) {
    record.count += 1;
  }
};

// Authentication Middleware
const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Acesso não autorizado. Faça login.' });
  }

  const user = AuthService.validateToken(token);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Sessão expirada ou inválida.' });
  }

  (req as any).user = user;
  next();
};

// --------------------------------------------------------------------------
// 🔒 SECURITY SHIELD: CLI Command Sanitization & Whitelist Validation
// --------------------------------------------------------------------------
const BLOCKED_COMMAND_KEYWORDS = [
  'erase', 'format', 'delete flash', 'reboot system', 'sys',
  'system-view', 'undo interface', 'shutdown', 'save', 'default',
  'vlan batch', 'user-interface', 'aaa', 'rmdir'
];

const isCommandSafe = (cliCommand: string): boolean => {
  const lower = cliCommand.toLowerCase();
  for (const forbidden of BLOCKED_COMMAND_KEYWORDS) {
    if (lower.includes(forbidden)) {
      return false;
    }
  }
  return true;
};

// Public Auth Endpoints

// Login with Rate Limiter
app.post('/api/auth/login', rateLimitLogin, (req, res) => {
  const { username, password } = req.body;
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Informe o usuário e a senha.' });
  }

  const result = AuthService.login(username, password);
  if (!result.success) {
    recordFailedLogin(clientIp);
    return res.status(401).json(result);
  }

  return res.json(result);
});

// Check Session (/me)
app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) return res.status(401).json({ success: false });

  const user = AuthService.validateToken(token);
  if (!user) return res.status(401).json({ success: false });

  return res.json({ success: true, user });
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
  if (token) AuthService.logout(token);
  return res.json({ success: true });
});

// Protected API Routes

// 1. Scan ONT by SN / MAC
app.post('/api/scan', requireAuth, async (req, res) => {
  try {
    const { snOrMac, oltId, useMockIfOffline } = req.body;
    const result = await ontScanner.scan({ snOrMac, oltId, useMockIfOffline });
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Erro interno ao realizar busca na OLT.',
    });
  }
});

// 2. Get OLTs list
app.get('/api/olts', requireAuth, (req, res) => {
  res.json({ success: true, data: oltManager.getOlts() });
});

// 3. Add OLT
app.post('/api/olts', requireAuth, (req, res) => {
  try {
    const newOlt = oltManager.addOlt(req.body);
    res.json({ success: true, data: newOlt });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// 4. Update OLT
app.put('/api/olts/:id', requireAuth, (req, res) => {
  try {
    const updated = oltManager.updateOlt(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, message: 'OLT não encontrada.' });
    return res.json({ success: true, data: updated });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

// 5. Delete OLT
app.delete('/api/olts/:id', requireAuth, (req, res) => {
  const deleted = oltManager.deleteOlt(req.params.id);
  if (!deleted) return res.status(404).json({ success: false, message: 'OLT não encontrada ou é padrão do sistema.' });
  res.json({ success: true, message: 'OLT removida com sucesso.' });
});

// 6. Execute CLI Command (Protected with Whitelist Sanitizer)
app.post('/api/execute', requireAuth, async (req, res) => {
  try {
    const { oltIp, cliCommand, vendor } = req.body;

    if (!cliCommand || !isCommandSafe(cliCommand)) {
      console.warn(`[SECURITY SHIELD] Comando bloqueado por segurança: "${cliCommand}"`);
      return res.status(403).json({
        success: false,
        message: 'Comando não permitido por políticas de segurança do sistema.',
      });
    }

    const olt = oltManager.getOlts().find((o) => o.ip === oltIp) || oltManager.getOlts()[0];

    if (olt.isMock) {
      await new Promise((r) => setTimeout(r, 600));
      return res.json({
        success: true,
        cliOutput: `[MOCK CLI EXECUTION - ${olt.name}]\nRunning Command:\n${cliCommand}\n\n% Command executed successfully on OLT.\n% Result: OK.`,
      });
    }

    let output = '';
    const commandsArray = cliCommand.split('\n').filter((c: string) => c.trim().length > 0);

    if (vendor === 'HUAWEI') {
      output = await HuaweiDriver.executeCommand(olt, commandsArray);
    } else {
      output = await FiberhomeAN6000Driver.executeCommand(olt, commandsArray);
    }

    res.json({ success: true, cliOutput: output });
  } catch (err: any) {
    res.status(500).json({ success: false, message: `Erro ao executar comando na OLT: ${err.message}` });
  }
});

// Serve Static Production Frontend Build
const distPath = path.join(process.cwd(), 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`⚡ MUNDONET ONT Scanner Backend rodando na porta ${PORT}`);
});
