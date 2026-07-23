import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { OltManager } from './services/OltManager.js';
import { OntScanner } from './services/OntScanner.js';
import { HuaweiDriver } from './drivers/HuaweiDriver.js';
import { FiberhomeAN6000Driver } from './drivers/FiberhomeAN6000Driver.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const oltManager = new OltManager();
const ontScanner = new OntScanner(oltManager);

// API Routes

// 1. Scan ONT by SN / MAC
app.post('/api/scan', async (req, res) => {
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
app.get('/api/olts', (req, res) => {
  res.json({ success: true, data: oltManager.getOlts() });
});

// 3. Add OLT
app.post('/api/olts', (req, res) => {
  try {
    const newOlt = oltManager.addOlt(req.body);
    res.json({ success: true, data: newOlt });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// 4. Update OLT
app.put('/api/olts/:id', (req, res) => {
  try {
    const updated = oltManager.updateOlt(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, message: 'OLT não encontrada.' });
    return res.json({ success: true, data: updated });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

// 5. Delete OLT
app.delete('/api/olts/:id', (req, res) => {
  const deleted = oltManager.deleteOlt(req.params.id);
  if (!deleted) return res.status(404).json({ success: false, message: 'OLT não encontrada ou é padrão do sistema.' });
  res.json({ success: true, message: 'OLT removida com sucesso.' });
});

// 6. Execute CLI Command directly on OLT
app.post('/api/execute', async (req, res) => {
  try {
    const { oltIp, cliCommand, vendor } = req.body;

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
