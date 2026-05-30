export const SwarmBlueprints = {
  SECURE_JWT_AUTH: {
    id: "SECURE_JWT_AUTH",
    name: "Deploy Secure Cryptographic Auth Gateway",
    metrics: { complexity: "High", estimatedTime: "12s", targetSecurity: "100%" },
    files: ["auth.js", "cipher.js", "gateway.spec.js"],
    steps: [
      {
        agent: "architect",
        status: "thinking",
        log: "Analyzing prompt. Architectural protocol requested: JWT authentication gateway with AES-256 payload encryption. Target environment: Node.js serverless edge. Compiling structural blueprint...",
        codeFile: null,
        codeContent: null,
        metrics: { tokens: 820, cpu: 32, cost: 0.016, security: 80 }
      },
      {
        agent: "architect",
        status: "communicating",
        log: "Planning completed. Initializing file tree hierarchy. Spawning 'auth.js' for payload signing, 'cipher.js' for cryptographic utilities. Delegating code generation to [Sentinel-Code]...",
        codeFile: null,
        codeContent: null,
        metrics: { tokens: 1450, cpu: 22, cost: 0.029, security: 80 }
      },
      {
        agent: "coder",
        status: "writing",
        log: "[auth.js] Synthesizing JWT sign/verify core. Implementing standard token signature generation using process.env.SECRET. Outputting raw payload routing structures...",
        codeFile: "auth.js",
        codeContent: {
          action: "add",
          lines: [
            { num: 1, type: "normal", text: "const jwt = require('jsonwebtoken');" },
            { num: 2, type: "normal", text: "" },
            { num: 3, type: "normal", text: "function generateToken(user) {" },
            { num: 4, type: "normal", text: "  // TODO: Encrypt user payload before signing" },
            { num: 5, type: "normal", text: "  return jwt.sign({ id: user.id, role: user.role }, 'temp_secret_key');" },
            { num: 6, type: "normal", text: "}" },
            { num: 7, type: "normal", text: "" },
            { num: 8, type: "normal", text: "function verifyToken(token) {" },
            { num: 9, type: "normal", text: "  return jwt.decode(token); // Direct decode for performance" },
            { num: 10, type: "normal", text: "}" },
            { num: 11, type: "normal", text: "" },
            { num: 12, type: "normal", text: "module.exports = { generateToken, verifyToken };" }
          ]
        },
        metrics: { tokens: 3200, cpu: 64, cost: 0.064, security: 55 }
      },
      {
        agent: "coder",
        status: "writing",
        log: "[cipher.js] Synthesizing AES-256-GCM symmetric block ciphers. Encrypting payload metadata buffers with unique initialization vectors (IVs)...",
        codeFile: "cipher.js",
        codeContent: {
          action: "add",
          lines: [
            { num: 1, type: "normal", text: "const crypto = require('crypto');" },
            { num: 2, type: "normal", text: "const ALGORITHM = 'aes-256-gcm';" },
            { num: 3, type: "normal", text: "" },
            { num: 4, type: "normal", text: "function encrypt(text, key) {" },
            { num: 5, type: "normal", text: "  const iv = crypto.randomBytes(12);" },
            { num: 6, type: "normal", text: "  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(key), iv);" },
            { num: 7, type: "normal", text: "  let encrypted = cipher.update(text, 'utf8', 'hex');" },
            { num: 8, type: "normal", text: "  encrypted += cipher.final('hex');" },
            { num: 9, type: "normal", text: "  const tag = cipher.getAuthTag().toString('hex');" },
            { num: 10, type: "normal", text: "  return { iv: iv.toString('hex'), content: encrypted, tag };" },
            { num: 11, type: "normal", text: "}" },
            { num: 12, type: "normal", text: "" },
            { num: 13, type: "normal", text: "module.exports = { encrypt };" }
          ]
        },
        metrics: { tokens: 4950, cpu: 58, cost: 0.099, security: 65 }
      },
      {
        agent: "auditor",
        status: "scanning",
        log: "Active Security Audit initiated on source tree. Ingesting 'auth.js'... Searching for cryptographic intercept vectors, token spoofing leaks, and unhardened signing protocols...",
        codeFile: "auth.js",
        codeContent: null,
        metrics: { tokens: 6800, cpu: 78, cost: 0.136, security: 65 }
      },
      {
        agent: "auditor",
        status: "error",
        log: "CRITICAL VULNERABILITY DETECTED in [auth.js]!\nVector: Unverified Token Signature Verification.\nDetail: Line 9 utilizes `jwt.decode()` instead of `jwt.verify()`. Attackers can forge signatures and gain absolute administrative privileges. Recommending structural rewrite...",
        codeFile: "auth.js",
        codeContent: {
          action: "highlight",
          lines: [
            { num: 5, type: "warning", text: "  return jwt.sign({ id: user.id, role: user.role }, 'temp_secret_key'); // WARNING: Weak/static temporary secret key" },
            { num: 9, type: "error", text: "  return jwt.decode(token); // CRITICAL VULNERABILITY: Bypasses cryptographic verification" }
          ]
        },
        metrics: { tokens: 8100, cpu: 45, cost: 0.162, security: 35 }
      },
      {
        agent: "coder",
        status: "writing",
        log: "Vulnerability ticket received. Refactoring 'auth.js'... Hardening verification pipeline, replacing unverified decoding with secure environmental key mapping and strict JWT validation.",
        codeFile: "auth.js",
        codeContent: {
          action: "modify",
          lines: [
            { num: 1, type: "normal", text: "const jwt = require('jsonwebtoken');" },
            { num: 2, type: "normal", text: "const { encrypt } = require('./cipher');" },
            { num: 3, type: "normal", text: "" },
            { num: 4, type: "normal", text: "function generateToken(user, encKey) {" },
            { num: 5, type: "added", text: "  const securePayload = encrypt(JSON.stringify({ id: user.id }), encKey);" },
            { num: 6, type: "added", text: "  return jwt.sign({ data: securePayload }, process.env.JWT_SECRET, { expiresIn: '1h' });" },
            { num: 7, type: "removed", text: "  return jwt.sign({ id: user.id, role: user.role }, 'temp_secret_key');" },
            { num: 8, type: "normal", text: "}" },
            { num: 9, type: "normal", text: "" },
            { num: 10, type: "normal", text: "function verifyToken(token) {" },
            { num: 11, type: "added", text: "  return jwt.verify(token, process.env.JWT_SECRET);" },
            { num: 12, type: "removed", text: "  return jwt.decode(token); // Direct decode for performance" },
            { num: 13, type: "normal", text: "}" },
            { num: 14, type: "normal", text: "" },
            { num: 15, type: "normal", text: "module.exports = { generateToken, verifyToken };" }
          ]
        },
        metrics: { tokens: 9950, cpu: 72, cost: 0.199, security: 95 }
      },
      {
        agent: "auditor",
        status: "scanning",
        log: "Re-auditing modified 'auth.js'... Signature verification secure. Payload symmetric encryption active. Environmental key mapping verified. Security rating: 100%. Handing off to [Nexus-QA]...",
        codeFile: "auth.js",
        codeContent: {
          action: "add",
          lines: [
            { num: 1, type: "normal", text: "const jwt = require('jsonwebtoken');" },
            { num: 2, type: "normal", text: "const { encrypt } = require('./cipher');" },
            { num: 3, type: "normal", text: "" },
            { num: 4, type: "normal", text: "function generateToken(user, encKey) {" },
            { num: 5, type: "normal", text: "  const securePayload = encrypt(JSON.stringify({ id: user.id }), encKey);" },
            { num: 6, type: "normal", text: "  return jwt.sign({ data: securePayload }, process.env.JWT_SECRET, { expiresIn: '1h' });" },
            { num: 7, type: "normal", text: "}" },
            { num: 8, type: "normal", text: "" },
            { num: 9, type: "normal", text: "function verifyToken(token) {" },
            { num: 10, type: "normal", text: "  return jwt.verify(token, process.env.JWT_SECRET);" },
            { num: 11, type: "normal", text: "}" },
            { num: 12, type: "normal", text: "" },
            { num: 13, type: "normal", text: "module.exports = { generateToken, verifyToken };" }
          ]
        },
        metrics: { tokens: 11400, cpu: 40, cost: 0.228, security: 100 }
      },
      {
        agent: "qa",
        status: "writing",
        log: "[gateway.spec.js] Generating integration and unit test configurations. Mocking user validation routes, simulating forged header vectors, and validating cryptographic boundaries...",
        codeFile: "gateway.spec.js",
        codeContent: {
          action: "add",
          lines: [
            { num: 1, type: "normal", text: "const { generateToken, verifyToken } = require('./auth');" },
            { num: 2, type: "normal", text: "const assert = require('assert');" },
            { num: 3, type: "normal", text: "" },
            { num: 4, type: "normal", text: "describe('Gateway Crypto Suit', () => {" },
            { num: 5, type: "normal", text: "  it('should verify cryptographically signed tokens', () => {" },
            { num: 6, type: "normal", text: "    process.env.JWT_SECRET = 'super_secure_vault_secret_99';" },
            { num: 7, type: "normal", text: "    const user = { id: 2841 };" },
            { num: 8, type: "normal", text: "    const token = generateToken(user, 'key_must_be_32_bytes_long_xxxxxx');" },
            { num: 9, type: "normal", text: "    const verified = verifyToken(token);" },
            { num: 10, type: "normal", text: "    assert.ok(verified);" },
            { num: 11, type: "normal", text: "  });" },
            { num: 12, type: "normal", text: "});" }
          ]
        },
        metrics: { tokens: 13200, cpu: 55, cost: 0.264, security: 100 }
      },
      {
        agent: "qa",
        status: "success",
        log: "Running test matrix... \n✔ test.spec.js > should verify cryptographically signed tokens (2.1ms)\n✔ test.spec.js > should reject forged token headers (0.9ms)\nAll 2 test units passed successfully. Swarm task completed.",
        codeFile: "gateway.spec.js",
        codeContent: null,
        metrics: { tokens: 14850, cpu: 10, cost: 0.297, security: 100 }
      }
    ]
  },
  HEMASCAN_PIPELINE: {
    id: "HEMASCAN_PIPELINE",
    name: "Optimize HemaScan Clinical Pathology Pipeline",
    metrics: { complexity: "Extreme", estimatedTime: "15s", targetSecurity: "100%" },
    files: ["queue.js", "triage.js", "queue.spec.js"],
    steps: [
      {
        agent: "architect",
        status: "thinking",
        log: "Analyzing clinical requirements: Ingestion of high-throughput blood pathology reports with real-time triage sorting. Designing low-latency non-blocking memory queue.",
        codeFile: null,
        codeContent: null,
        metrics: { tokens: 950, cpu: 45, cost: 0.019, security: 80 }
      },
      {
        agent: "coder",
        status: "writing",
        log: "[queue.js] Coding active array buffer buffer. Direct pushing of triage payloads. Creating basic race mitigation blocks...",
        codeFile: "queue.js",
        codeContent: {
          action: "add",
          lines: [
            { num: 1, type: "normal", text: "class DiagnosticQueue {" },
            { num: 2, type: "normal", text: "  constructor() { this.items = []; }" },
            { num: 3, type: "normal", text: "  async enqueue(patientData) {" },
            { num: 4, type: "normal", text: "    // Async lock simulated without semaphore" },
            { num: 5, type: "normal", text: "    this.items.push(patientData);" },
            { num: 6, type: "normal", text: "    return true;" },
            { num: 7, type: "normal", text: "  }" },
            { num: 8, type: "normal", text: "}" }
          ]
        },
        metrics: { tokens: 2800, cpu: 75, cost: 0.056, security: 60 }
      },
      {
        agent: "auditor",
        status: "error",
        log: "WARNING DETECTED in [queue.js]!\nThread Race Condition vulnerability in asynchronous clinical pathology uploads. High concurrency will lead to out-of-order emergency triages.",
        codeFile: "queue.js",
        codeContent: {
          action: "highlight",
          lines: [
            { num: 4, type: "warning", text: "    // Async lock simulated without semaphore" },
            { num: 5, type: "error", text: "    this.items.push(patientData); // Race condition under concurrent HTTP bursts" }
          ]
        },
        metrics: { tokens: 4800, cpu: 85, cost: 0.096, security: 40 }
      },
      {
        agent: "coder",
        status: "writing",
        log: "[queue.js] Refactoring queue with atomic semaphore transaction wrapper. Securing pathology prioritization.",
        codeFile: "queue.js",
        codeContent: {
          action: "modify",
          lines: [
            { num: 1, type: "normal", text: "class DiagnosticQueue {" },
            { num: 2, type: "normal", text: "  constructor() { this.items = []; this.lock = false; }" },
            { num: 3, type: "normal", text: "  async enqueue(patientData) {" },
            { num: 4, type: "added", text: "    while(this.lock) { await new Promise(r => setTimeout(r, 1)); }" },
            { num: 5, type: "added", text: "    this.lock = true;" },
            { num: 6, type: "normal", text: "    this.items.push(patientData);" },
            { num: 7, type: "added", text: "    this.items.sort((a,b) => b.priority - a.priority);" },
            { num: 8, type: "added", text: "    this.lock = false;" },
            { num: 9, type: "removed", text: "    // Async lock simulated without semaphore" },
            { num: 10, type: "normal", text: "    return true;" },
            { num: 11, type: "normal", text: "  }" },
            { num: 12, type: "normal", text: "}" }
          ]
        },
        metrics: { tokens: 7100, cpu: 55, cost: 0.142, security: 95 }
      },
      {
        agent: "qa",
        status: "success",
        log: "[queue.spec.js] Running concurrent 10,000 requests pathology load-test. \n✔ All triages sorted in strictly non-overlapping microsecond orders. Process finalized.",
        codeFile: "queue.spec.js",
        codeContent: null,
        metrics: { tokens: 9900, cpu: 12, cost: 0.198, security: 100 }
      }
    ]
  },
  DECENTRALIZED_PAY: {
    id: "DECENTRALIZED_PAY",
    name: "Formulate Decentralized Web3 Transaction Sync",
    metrics: { complexity: "Medium", estimatedTime: "10s", targetSecurity: "100%" },
    files: ["ledger.js", "wallet.js", "ledger.spec.js"],
    steps: [
      {
        agent: "architect",
        status: "thinking",
        log: "Planning decentralized ledger observer. Direct blockchain event listening via WebSocket provider. Filtering transaction logs to authenticate merchant payments natively.",
        codeFile: null,
        codeContent: null,
        metrics: { tokens: 750, cpu: 20, cost: 0.015, security: 80 }
      },
      {
        agent: "coder",
        status: "writing",
        log: "[ledger.js] Establishing contract connection interface. Processing event buffers. Warning: Nonce verification is not initialized.",
        codeFile: "ledger.js",
        codeContent: {
          action: "add",
          lines: [
            { num: 1, type: "normal", text: "const ethers = require('ethers');" },
            { num: 2, type: "normal", text: "function syncTx(txHash) {" },
            { num: 3, type: "normal", text: "  // MOCK: Event confirmation" },
            { num: 4, type: "normal", text: "  console.log('Confirmed Tx: ' + txHash);" },
            { num: 5, type: "normal", text: "  return true;" },
            { num: 6, type: "normal", text: "}" }
          ]
        },
        metrics: { tokens: 2100, cpu: 50, cost: 0.042, security: 65 }
      },
      {
        agent: "auditor",
        status: "error",
        log: "VULNERABILITY IDENTIFIED in [ledger.js]!\nTransaction replay attack vulnerability. Failure to track spent nonces allows duplicate invoice settlements.",
        codeFile: "ledger.js",
        codeContent: {
          action: "highlight",
          lines: [
            { num: 3, type: "warning", text: "  // MOCK: Event confirmation" },
            { num: 4, type: "error", text: "  console.log('Confirmed Tx: ' + txHash); // WARNING: Replaying hash bypasses limits" }
          ]
        },
        metrics: { tokens: 4200, cpu: 65, cost: 0.084, security: 45 }
      },
      {
        agent: "coder",
        status: "writing",
        log: "[ledger.js] Injecting transactional database caching array. Validating unique transaction hash signatures to secure checkout routing.",
        codeFile: "ledger.js",
        codeContent: {
          action: "modify",
          lines: [
            { num: 1, type: "normal", text: "const ethers = require('ethers');" },
            { num: 2, type: "added", text: "const settledHashes = new Set();" },
            { num: 3, type: "normal", text: "function syncTx(txHash) {" },
            { num: 4, type: "added", text: "  if (settledHashes.has(txHash)) throw new Error('Transaction replay blocked');" },
            { num: 5, type: "added", text: "  settledHashes.add(txHash);" },
            { num: 6, type: "normal", text: "  console.log('Confirmed Tx: ' + txHash);" },
            { num: 7, type: "normal", text: "  return true;" },
            { num: 8, type: "normal", text: "}" }
          ]
        },
        metrics: { tokens: 6300, cpu: 48, cost: 0.126, security: 100 }
      },
      {
        agent: "qa",
        status: "success",
        log: "[ledger.spec.js] Testing blockchain signature integrity... Replay transaction successfully blocked by cache check. Suite finalized.",
        codeFile: "ledger.spec.js",
        codeContent: null,
        metrics: { tokens: 7800, cpu: 5, cost: 0.156, security: 100 }
      }
    ]
  }
};

export function generateCustomBlueprint(userPrompt) {
  const normalized = userPrompt.toLowerCase();
  
  let targetArea = "System Microservice";
  let files = ["server.js", "router.js", "api.spec.js"];
  
  if (normalized.includes("api") || normalized.includes("route") || normalized.includes("backend")) {
    targetArea = "RESTful API Serverless Route";
    files = ["controller.js", "schema.js", "endpoint.spec.js"];
  } else if (normalized.includes("ui") || normalized.includes("frontend") || normalized.includes("page")) {
    targetArea = "Reactive Client Dashboard";
    files = ["Dashboard.jsx", "ThemeEngine.js", "render.spec.js"];
  } else if (normalized.includes("ai") || normalized.includes("agent") || normalized.includes("model")) {
    targetArea = "Model Inference Engine pipeline";
    files = ["model.py", "inference.js", "pipeline.spec.js"];
  } else if (normalized.includes("database") || normalized.includes("db") || normalized.includes("sql")) {
    targetArea = "Vector Cache SQL Store";
    files = ["query.js", "connection.js", "query.spec.js"];
  }

  return {
    id: "CUSTOM_RUN",
    name: `Orchestrate: ${userPrompt.length > 50 ? userPrompt.substring(0, 47) + "..." : userPrompt}`,
    metrics: { complexity: "Variable", estimatedTime: "11s", targetSecurity: "100%" },
    files: files,
    steps: [
      {
        agent: "architect",
        status: "thinking",
        log: `Analyzing custom prompt: "${userPrompt}". \nResolving blueprint requirements for [${targetArea}]. Mapping active data flow structures...`,
        codeFile: null,
        codeContent: null,
        metrics: { tokens: 880, cpu: 38, cost: 0.017, security: 80 }
      },
      {
        agent: "coder",
        status: "writing",
        log: `[${files[0]}] Synthesizing customized code skeleton for prompt. Constructing function bindings, variable mappings, and exports...`,
        codeFile: files[0],
        codeContent: {
          action: "add",
          lines: [
            { num: 1, type: "normal", text: `// Customized code module generated for: ${userPrompt}` },
            { num: 2, type: "normal", text: "function executeCustomProtocol(payload) {" },
            { num: 3, type: "normal", text: "  const data = payload || {};" },
            { num: 4, type: "normal", text: "  // TODO: Implement proper data cleansing" },
            { num: 5, type: "normal", text: "  const result = eval(data.input); // Evaluate payload directly" },
            { num: 6, type: "normal", text: "  return { status: 'success', result };" },
            { num: 7, type: "normal", text: "}" },
            { num: 8, type: "normal", text: "module.exports = { executeCustomProtocol };" }
          ]
        },
        metrics: { tokens: 2900, cpu: 68, cost: 0.058, security: 50 }
      },
      {
        agent: "auditor",
        status: "error",
        log: `CRITICAL RISK caught in [${files[0]}]!\nVector: Remote Code Execution (RCE) / Command Injection.\nDetail: Line 5 uses \`eval()\` with unscrubbed user inputs. High severity exploit gateway. Recommending structural rebuild...`,
        codeFile: files[0],
        codeContent: {
          action: "highlight",
          lines: [
            { num: 4, type: "warning", text: "  // TODO: Implement proper data cleansing" },
            { num: 5, type: "error", text: "  const result = eval(data.input); // CRITICAL RISK: Bypasses sandboxing" }
          ]
        },
        metrics: { tokens: 4950, cpu: 88, cost: 0.099, security: 25 }
      },
      {
        agent: "coder",
        status: "writing",
        log: `Vulnerability patched. Redesigning [${files[0]}]... Removing toxic evaluation patterns, implementing safe parsing rules, and validating inputs securely.`,
        codeFile: files[0],
        codeContent: {
          action: "modify",
          lines: [
            { num: 1, type: "normal", text: `// Customized code module generated for: ${userPrompt}` },
            { num: 2, type: "normal", text: "function executeCustomProtocol(payload) {" },
            { num: 3, type: "normal", text: "  const data = payload || {};" },
            { num: 4, type: "added", text: "  if (!data.input || typeof data.input !== 'string') {" },
            { num: 5, type: "added", text: "    throw new Error('Invalid input payload structure');" },
            { num: 6, type: "added", text: "  }" },
            { num: 7, type: "added", text: "  // Restrict parsing to safe mathematical character bounds" },
            { num: 8, type: "added", text: "  const safeString = data.input.replace(/[^0-9+\\-*/().]/g, '');" },
            { num: 9, type: "added", text: "  const result = Function('\"use strict\"; return (' + safeString + ')')();" },
            { num: 10, type: "removed", text: "  const result = eval(data.input); // Evaluate payload directly" },
            { num: 11, type: "normal", text: "  return { status: 'success', result };" },
            { num: 12, type: "normal", text: "}" },
            { num: 13, type: "normal", text: "module.exports = { executeCustomProtocol };" }
          ]
        },
        metrics: { tokens: 7300, cpu: 52, cost: 0.146, security: 95 }
      },
      {
        agent: "qa",
        status: "success",
        log: `[${files[2]}] Standard tests created.\n✔ Verified validation of clean inputs.\n✔ Verified blocking of injection payload. 2/2 unit tests passed. Swarm completed.`,
        codeFile: files[2],
        codeContent: null,
        metrics: { tokens: 9400, cpu: 8, cost: 0.188, security: 100 }
      }
    ]
  };
}
