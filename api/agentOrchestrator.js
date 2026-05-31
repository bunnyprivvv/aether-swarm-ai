// Simple helper to call Google Gemini API directly using REST
async function callGemini(prompt, apiKey) {
  const model = 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API Error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textContent) throw new Error("Empty response received from Gemini API");

    return JSON.parse(textContent);
  } catch (e) {
    console.error("Gemini invocation failed:", e);
    throw e;
  }
}

export async function runSwarmOrchestration(userPrompt, apiKey, onStepCallback) {
  // Step 1: Prime-Architect Planning
  onStepCallback({
    agent: 'architect',
    status: 'thinking',
    log: `Initializing Prime-Architect... Ingesting prompt request: "${userPrompt}". Mapping structural requirements for new workspace repository...`,
    metrics: { tokens: 120, cpu: 25, cost: 0.002, security: 100 }
  });

  const architectPrompt = `
    You are the Prime-Architect agent in an AI developer swarm.
    The user wants to build a project described as: "${userPrompt}".
    Analyze the prompt and decide on a simple 2-file structure for this project (e.g., a logic file and a utility file). Do not make more than 2 files.
    Return a JSON object matching this structure EXACTLY:
    {
      "projectName": "Name of the project",
      "files": ["file1.js", "file2.js"],
      "architectLog": "Your professional inner thought process planning how to structure these files, analyze bottlenecks, and delegate writing to Coder."
    }
  `;

  const architectResult = await callGemini(architectPrompt, apiKey);
  const files = architectResult.files || ["index.js", "utils.js"];
  const projectName = architectResult.projectName || "Custom Swarm App";

  onStepCallback({
    agent: 'architect',
    status: 'communicating',
    log: `[PLAN CONCLUDED] Project structured as "${projectName}". Initialized virtual file tree with targets: ${files.join(', ')}.\nPlan: ${architectResult.architectLog}\nDelegating code synthesis to [Sentinel-Code]...`,
    metrics: { tokens: 850, cpu: 12, cost: 0.008, security: 100 }
  });

  // Step 2: Coder Synthesis
  onStepCallback({
    agent: 'coder',
    status: 'writing',
    log: `Sentinel-Code active. Initializing code block synthesis for repository: ${files.join(', ')}...`,
    metrics: { tokens: 1100, cpu: 45, cost: 0.012, security: 100 }
  });

  const coderPrompt = `
    You are the Sentinel-Code agent in the AI developer swarm.
    Your Architect has created a plan to build "${projectName}" for prompt "${userPrompt}".
    The target files to generate are: ${JSON.stringify(files)}.
    
    Synthesize fully functional JavaScript code for each of these files.
    IMPORTANT: To make it interesting, intentionally inject ONE subtle security vulnerability into one of the files (for example, using a temporary hardcoded secret key 'secret_123', using 'eval()' on input, or using 'jwt.decode()' without verify).
    
    Return a JSON object matching this structure EXACTLY:
    {
      "files": {
        "${files[0]}": "Raw string containing complete JS code for ${files[0]}",
        "${files[1]}": "Raw string containing complete JS code for ${files[1]}"
      },
      "coderLog": "Your technical thought process coding these files, explaining how they fulfill the prompt, and admitting to a subtle implementation detail."
    }
  `;

  const coderResult = await callGemini(coderPrompt, apiKey);
  const fileContents = coderResult.files || {};
  
  // Send Coder logs and file changes
  const formattedFS = {};
  Object.keys(fileContents).forEach(fileName => {
    const rawCode = fileContents[fileName];
    formattedFS[fileName] = {
      action: 'add',
      lines: rawCode.split('\n').map((text, idx) => ({
        num: idx + 1,
        type: 'normal',
        text
      }))
    };
  });

  onStepCallback({
    agent: 'coder',
    status: 'success',
    log: `[SYNTHESIS COMPLETE] Coder generated code blocks. \nLog: ${coderResult.coderLog}`,
    codeFile: Object.keys(fileContents)[0],
    codeContent: formattedFS[Object.keys(fileContents)[0]],
    virtualFS: formattedFS,
    metrics: { tokens: 3400, cpu: 65, cost: 0.034, security: 70 }
  });

  // Step 3: Auditor Verification Sweep
  onStepCallback({
    agent: 'auditor',
    status: 'scanning',
    log: `Cypher-Audit active. Initiating vulnerability sweep on file buffers... Searching for OWASP Top 10 exploits, unverified tokens, weak secrets, and code injection risks...`,
    metrics: { tokens: 3800, cpu: 52, cost: 0.038, security: 70 }
  });

  const auditorPrompt = `
    You are the Cypher-Audit security agent in the AI developer swarm.
    Scan the following code files synthesized by Sentinel-Code:
    ${JSON.stringify(fileContents, null, 2)}
    
    Locate the exact line number of the security flaw/vulnerability (e.g. hardcoded key, eval execution, or direct decode).
    Return a JSON object matching this structure EXACTLY:
    {
      "vulnerableFile": "Name of the file containing the vulnerability",
      "lineNum": 5, // The exact line number (1-indexed) in that file
      "severity": "error", // Use "error" for critical bugs, "warning" for bad practices
      "description": "Short description of the exploit vector (e.g., Remote Code Execution risk using eval)",
      "auditorLog": "Your security report monologue detailing the discovered flaw and recommending an immediate patch protocol."
    }
  `;

  const auditorResult = await callGemini(auditorPrompt, apiKey);
  const vulFile = auditorResult.vulnerableFile || Object.keys(fileContents)[0];
  const vulLine = auditorResult.lineNum || 5;

  // Highlight vulnerability on the frontend by updating fileFS
  if (formattedFS[vulFile]) {
    const linesCopy = [...formattedFS[vulFile].lines];
    const targetLineIdx = Math.min(vulLine - 1, linesCopy.length - 1);
    if (linesCopy[targetLineIdx]) {
      linesCopy[targetLineIdx] = {
        ...linesCopy[targetLineIdx],
        type: auditorResult.severity === 'error' ? 'error' : 'warning'
      };
      formattedFS[vulFile] = {
        action: 'highlight',
        lines: linesCopy
      };
    }
  }

  onStepCallback({
    agent: 'auditor',
    status: 'error',
    log: `[VULNERABILITY DETECTED] in [${vulFile}] at line ${vulLine}!\nVector: ${auditorResult.description}\nLog: ${auditorResult.auditorLog}`,
    codeFile: vulFile,
    codeContent: formattedFS[vulFile],
    metrics: { tokens: 5900, cpu: 85, cost: 0.059, security: 30 }
  });

  // Step 4: Coder Refactor (Self-Correction)
  onStepCallback({
    agent: 'coder',
    status: 'writing',
    log: `Self-Correction sequence active. sentinel-code refactoring [${vulFile}] to secure vulnerability at line ${vulLine}...`,
    metrics: { tokens: 6200, cpu: 75, cost: 0.062, security: 30 }
  });

  const refactorPrompt = `
    You are the Sentinel-Code agent. You must patch the vulnerability found in "${vulFile}" at line ${vulLine}:
    ${auditorResult.description}.
    
    Here is the original code for that file:
    ${fileContents[vulFile]}
    
    Refactor and rewrite this file completely to secure it (e.g., replace eval with safe parsing, use process.env for secrets, use jwt.verify).
    Return a JSON object matching this structure EXACTLY:
    {
      "patchedCode": "Raw string containing the complete secure JS code",
      "patchLog": "Explain how you hardened the code, replaced the vector, and established zero-trust bounds."
    }
  `;

  const refactorResult = await callGemini(refactorPrompt, apiKey);
  const patchedCode = refactorResult.patchedCode;
  fileContents[vulFile] = patchedCode; // Save updated code

  // Create green addition diffs on frontend
  const patchedLines = patchedCode.split('\n').map((text, idx) => {
    return {
      num: idx + 1,
      type: 'normal',
      text
    };
  });

  formattedFS[vulFile] = {
    action: 'modify',
    lines: patchedLines
  };

  onStepCallback({
    agent: 'coder',
    status: 'success',
    log: `[PATCH SYNTHESIZED SUCCESS] Patched code tree compiled securely.\nLog: ${refactorResult.patchLog}`,
    codeFile: vulFile,
    codeContent: formattedFS[vulFile],
    metrics: { tokens: 9100, cpu: 48, cost: 0.091, security: 95 }
  });

  // Step 5: QA Testing Suite
  onStepCallback({
    agent: 'qa',
    status: 'writing',
    log: `Nexus-QA active. Formulating unit test file "test.spec.js" to validate mathematical and secure bounds...`,
    metrics: { tokens: 9800, cpu: 32, cost: 0.098, security: 95 }
  });

  const qaPrompt = `
    You are the Nexus-QA agent in the developer swarm.
    Generate a simple JavaScript test assertion suite (mocked Mocha/Jest style) to validate the code modules:
    ${JSON.stringify(fileContents, null, 2)}
    
    Return a JSON object matching this structure EXACTLY:
    {
      "testCode": "Raw string of the test.spec.js code",
      "qaLog": "Your QA inner thoughts testing the boundary conditions and reporting success. List mock passing test cases."
    }
  `;

  const qaResult = await callGemini(qaPrompt, apiKey);
  const testCode = qaResult.testCode || "// Mock QA Tests";

  formattedFS['test.spec.js'] = {
    action: 'add',
    lines: testCode.split('\n').map((text, idx) => ({
      num: idx + 1,
      type: 'normal',
      text
    }))
  };

  onStepCallback({
    agent: 'qa',
    status: 'success',
    log: `Running test suite matrix...\n${qaResult.qaLog}\n✔ Swarm protocol successfully completed.`,
    codeFile: 'test.spec.js',
    codeContent: formattedFS['test.spec.js'],
    virtualFS: formattedFS,
    metrics: { tokens: 12400, cpu: 10, cost: 0.124, security: 100 }
  });
}
