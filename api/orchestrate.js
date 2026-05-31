import { runSwarmOrchestration } from './agentOrchestrator.js';

export default async function handler(req, res) {
  // CORS Preflight Options
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    return res.status(401).json({
      error: 'API_KEY_MISSING',
      message: 'Google Gemini API Key is not configured in Vercel Environment Variables. Please set GEMINI_API_KEY.'
    });
  }

  if (!prompt || !prompt.trim()) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  // Set SSE Headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    await runSwarmOrchestration(prompt, apiKey, (stepData) => {
      res.write(`data: ${JSON.stringify(stepData)}\n\n`);
    });

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('[SWARM SERVERLESS FAULT]', error);
    res.write(`data: ${JSON.stringify({
      agent: 'auditor',
      status: 'error',
      log: `[CRITICAL SERVERLESS PIPELINE FAULT] Serverless function execution crashed.\nDetail: ${error.message}`
    })}\n\n`);
    res.end();
  }
}
