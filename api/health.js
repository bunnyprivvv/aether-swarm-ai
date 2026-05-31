export default function handler(req, res) {
  // Check CORS and headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.status(200).json({
    status: 'ok',
    message: 'AetherSwarm AI Backend Active (Vercel Serverless)',
    api_configured: !!process.env.GEMINI_API_KEY
  });
}
