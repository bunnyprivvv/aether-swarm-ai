import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { runSwarmOrchestration } from './agentOrchestrator.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000']
}));
app.use(express.json());

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'AetherSwarm AI Backend Active',
    api_configured: !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE'
  });
});

// Real-Time Server-Sent Events (SSE) Agent Orchestration Streaming
app.post('/api/orchestrate', async (req, res) => {
  const { prompt } = req.body;
  
  // Extract API key from .env
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    return res.status(401).json({
      error: 'API_KEY_MISSING',
      message: 'Google Gemini API Key is not configured. Please paste your key in backend/.env'
    });
  }

  if (!prompt || !prompt.trim()) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  // Set SSE Headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders(); // Establish SSE lane

  console.log(`[SWARM INITIATED] Ingesting prompt query: "${prompt}"`);

  try {
    await runSwarmOrchestration(prompt, apiKey, (stepData) => {
      // Stream step JSON to the React client
      res.write(`data: ${JSON.stringify(stepData)}\n\n`);
    });

    // Close lane when done
    res.write('data: [DONE]\n\n');
    res.end();
    console.log(`[SWARM COMPLETED] Successful pipeline run.`);
  } catch (error) {
    console.error('[SWARM FAULT]', error);
    res.write(`data: ${JSON.stringify({
      agent: 'auditor',
      status: 'error',
      log: `[CRITICAL PIPELINE ERROR] Swarm engine crashed.\nDetail: ${error.message}`
    })}\n\n`);
    res.end();
  }
});

app.listen(PORT, () => {
  console.log(`⚡ [AETHER_SWARM BACKEND] Active and listening at http://localhost:${PORT}`);
});
