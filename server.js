const express = require('express');
const multer = require('multer');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
const fs = require('fs');
const db = require('./database');
const emailService = require('./email');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3000;

const isVercel = !!process.env.VERCEL;

// Setup Multer to store uploaded files in a persistent folder
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = isVercel ? path.join('/tmp', 'uploads') : path.join(__dirname, 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // Limit file size to 25MB
  },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp|pdf/;
    const mimetype = filetypes.test(file.mimetype) || file.mimetype === 'application/pdf';
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only images (JPEG, PNG, WEBP) and PDF files are allowed!'));
  }
});

// Initialize Gemini API
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn('WARNING: GEMINI_API_KEY is not defined in the environment variables.');
}
const genAI = new GoogleGenerativeAI(apiKey || 'DUMMY_KEY');

// Setup standard body and cookie parsing middlewares
app.use(express.json());
app.use((req, res, next) => {
  req.cookies = {};
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    cookieHeader.split(';').forEach(cookie => {
      const parts = cookie.split('=');
      if (parts.length >= 2) {
        req.cookies[parts[0].trim()] = parts.slice(1).join('=').trim();
      }
    });
  }
  next();
});

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));
if (isVercel) {
  app.use('/uploads', express.static(path.join('/tmp', 'uploads')));
}

// Authentication Middlewares
function requireAuth(req, res, next) {
  const token = req.cookies['session_token'];
  let userId = token ? db.getSession(token) : null;
  
  // Auto-login on localhost for local testing/development convenience
  if (!userId && (req.hostname === 'localhost' || req.hostname === '127.0.0.1')) {
    userId = 'user_local_dev';
  }

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized. Please log in.' });
  }
  req.userId = userId;
  next();
}

function optionalAuth(req, res, next) {
  const token = req.cookies['session_token'];
  let userId = token ? db.getSession(token) : null;
  
  // Auto-login on localhost for local testing/development convenience
  if (!userId && (req.hostname === 'localhost' || req.hostname === '127.0.0.1')) {
    userId = 'user_local_dev';
  }

  req.userId = userId;
  next();
}

// Helper function to convert buffer to Gemini generative part format
function fileToGenerativePart(buffer, mimeType) {
  return {
    inlineData: {
      data: buffer.toString('base64'),
      mimeType
    },
  };
}

// User Authentication Endpoints
app.post('/api/auth/register', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
  try {
    const user = db.registerUser(email, password, name);
    const token = db.createSession(user.id);
    res.cookie('session_token', token, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    // Send welcome email in background
    emailService.sendConfirmationEmail(user.email, user.name).catch(err => {
      console.error('Failed to send registration confirmation email:', err);
    });

    res.json({ user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/auth/activate', (req, res) => {
  const { token } = req.query;
  if (!token) {
    return res.status(400).send('Activation token is missing.');
  }
  try {
    db.activateUser(token);
    // Redirect back to workspace with activation success query param
    res.redirect('/workspace.html?activated=true');
  } catch (err) {
    res.status(400).send(`Activation failed: ${err.message}`);
  }
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
  try {
    const user = db.authenticateUser(email, password);
    const token = db.createSession(user.id);
    res.cookie('session_token', token, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });
    res.json({ user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/auth/logout', (req, res) => {
  const token = req.cookies['session_token'];
  if (token) {
    db.deleteSession(token);
  }
  res.clearCookie('session_token');
  res.json({ success: true });
});

app.get('/api/auth/me', (req, res) => {
  const token = req.cookies['session_token'];
  let userId = token ? db.getSession(token) : null;
  
  if (!userId && (req.hostname === 'localhost' || req.hostname === '127.0.0.1')) {
    return res.json({ 
      user: {
        id: 'user_local_dev',
        email: 'local-dev@example.com',
        name: 'Local Developer',
        activated: true,
        subscription: { plan: 'free', status: 'active', updatedAt: new Date().toISOString() },
        extractionsCount: 0,
        createdAt: new Date().toISOString()
      } 
    });
  }

  if (!userId) {
    return res.json({ user: null });
  }
  const user = db.getUserById(userId);
  res.json({ user });
});

// User History Endpoints
app.get('/api/history', requireAuth, (req, res) => {
  const history = db.getHistory(req.userId);
  res.json({ history });
});

app.put('/api/history/:id', requireAuth, (req, res) => {
  const { latex, name, status } = req.body;
  try {
    const entry = db.updateHistoryEntry(req.params.id, req.userId, { latex, name, status });
    res.json({ entry });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/history/:id', requireAuth, (req, res) => {
  try {
    const relativePath = db.deleteHistoryEntry(req.params.id, req.userId);
    if (relativePath) {
      const absolutePath = isVercel
        ? path.join('/tmp', 'uploads', path.basename(relativePath))
        : path.join(__dirname, 'public', relativePath);
      if (fs.existsSync(absolutePath)) {
        fs.unlinkSync(absolutePath);
      }
    }
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// User Subscription Endpoint
app.post('/api/user/subscribe', requireAuth, (req, res) => {
  const { plan } = req.body;
  if (!plan) {
    return res.status(400).json({ error: 'Plan is required.' });
  }
  try {
    const user = db.updateUserSubscription(req.userId, plan);
    res.json({ success: true, user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Strict system prompt for LaTeX conversion
const SYSTEM_PROMPT = `You are an expert LaTeX developer, mathematician, and technical typesetter. Your task is to analyze the provided input (which may be an image, a PDF page, a technical diagram, a plotted curve, or complex mathematical equations) and convert it into perfect, compilable LaTeX code.

Follow these strict guidelines based on the type of content detected:

1. FOR EQUATIONS & FORMULAS:
   - Use standard amsmath environments (e.g., align*, equation, cases).
   - Ensure precise spacing, correct Greek letters, and accurate subscript/superscript placement.

2. FOR CURVES, GRAPHS & DIAGRAMS:
   - Use the tikz and pgfplots packages.
   - Accurately recreate the coordinate system, grids, axes, labels, and tick marks.
   - Include all necessary TikZ libraries (e.g., \`\\usetikzlibrary{positioning, arrows.meta, arrows}\`) in the preamble to ensure full compilability.
   - CRITICAL: Never use the word \`auto\` as a value for dimensions or positioning shifts (e.g., do NOT use \`xshift=auto\`, \`yshift=auto\`, \`below=auto\`, \`above=auto\`, \`left=auto\`, or \`right=auto\`). Use explicit units (e.g., \`2cm\`, \`15mm\`, \`0pt\`) or standard node placement (e.g., \`below=of node\`, not \`below=auto of node\`). Do not confuse TikZ options with CSS values.
   - For arrow heads, prefer modern TikZ keys from \`arrows.meta\` (like \`Stealth\`, \`Latex\`) or if legacy arrow shapes (like \`latex'\`, \`stealth'\`) are used, you MUST explicitly include \`\\usetikzlibrary{arrows}\` in the preamble.

3. FOR PDFS & TEXT DOCUMENTS:
   - Replicate the exact visual hierarchy (headings, paragraphs, bullet points).
   - Use tabular or booktabs for tables.

4. CODE STRUCTURE & OUTPUT CONSTRAINTS:
   - Provide a complete, compilable document using \\documentclass[tikz,border=5mm]{standalone} or \\documentclass{article}.
   - Output ONLY the exact LaTeX code enclosed in a \`\`\`latex \`\`\` block. Do not include any explanations.`;

// API endpoint to convert image/PDF to LaTeX
app.post('/api/convert', requireAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload an image or PDF file.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ 
        error: 'Gemini API key is not configured on the server. Please add it to your .env file.' 
      });
    }

    // Use gemini-2.5-flash for fast and accurate multimodal tasks with custom system prompt
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      systemInstruction: SYSTEM_PROMPT
    });

    // Read file into buffer from disk storage
    const fileBuffer = fs.readFileSync(req.file.path);
    const imagePart = fileToGenerativePart(fileBuffer, req.file.mimetype);

    const result = await model.generateContent([
      "Convert this file to LaTeX exactly as instructed.", 
      imagePart
    ]);
    const response = await result.response;
    let latexText = response.text().trim();

    // Clean markdown code blocks if the model wrapped it (e.g. ```latex ... ```)
    if (latexText.startsWith('```')) {
      latexText = latexText.replace(/^```(?:latex)?\n?/i, '').replace(/\n?```$/i, '').trim();
    }

    const relativePath = `/uploads/${req.file.filename}`;

    // If user is authenticated, save the conversion to history and increment usage count
    let historyEntry = null;
    if (req.userId) {
      historyEntry = db.addHistoryEntry(
        req.userId,
        req.file.originalname,
        req.file.size,
        latexText,
        relativePath,
        'converted'
      );
      db.incrementUserExtractions(req.userId);
    }

    res.json({ 
      latex: latexText,
      fileUrl: relativePath,
      historyEntry: historyEntry
    });
  } catch (error) {
    console.error('Error during conversion:', error);
    res.status(500).json({ error: 'Failed to process the file. ' + error.message });
  }
});

// API endpoint to extract diagram bounding box from an image/PDF
app.post('/api/extract-diagram', requireAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload an image or PDF file.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ 
        error: 'Gemini API key is not configured on the server. Please add it to your .env file.' 
      });
    }

    // Use gemini-2.5-flash for fast and accurate computer vision tasks
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `You are an expert computer vision assistant specializing in educational materials. Your task is to analyze the provided image (which may be a full document, worksheet, or exam paper) and locate any mathematical figures, physics diagrams, or charts.

Follow these strict output rules:
1. Locate the primary diagram/figure in the image. Ignore standard text paragraphs, headers, and page numbers.
2. Calculate the bounding box for this diagram.
3. Output strictly in valid JSON format representing the bounding box percentages relative to the image size. 
4. Do not include any markdown formatting, explanations, or conversational text.

Expected JSON format:
{
  "diagram_found": true,
  "type": "geometry_figure", // e.g., geometry_figure, function_curve, physics_circuit
  "bounding_box": {
    "x_min_percent": 0.15,
    "y_min_percent": 0.20,
    "width_percent": 0.40,
    "height_percent": 0.35
  }
}`;

    // Read file into buffer from disk storage
    const fileBuffer = fs.readFileSync(req.file.path);
    const imagePart = fileToGenerativePart(fileBuffer, req.file.mimetype);

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    let jsonText = response.text().trim();

    // Clean markdown code blocks if the model wrapped it (e.g. ```json ... ```)
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
    }

    let parsedResult;
    try {
      parsedResult = JSON.parse(jsonText);
    } catch (e) {
      return res.status(500).json({ 
        error: 'Failed to parse JSON response from model', 
        rawResponse: jsonText 
      });
    }

    res.json(parsedResult);
  } catch (error) {
    console.error('Error during diagram extraction:', error);
    res.status(500).json({ error: 'Failed to process the file. ' + error.message });
  }
});

// API endpoint to lint and fix LaTeX code
app.post('/api/fix-latex', requireAuth, async (req, res) => {
  try {
    const { latex } = req.body;
    if (!latex) {
      return res.status(400).json({ error: 'Please provide the LaTeX code to fix.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ 
        error: 'Gemini API key is not configured on the server. Please add it to your .env file.' 
      });
    }

    // Use gemini-2.5-flash for LaTeX syntax checking and fixing
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      systemInstruction: `You are an expert LaTeX compiler and debugging assistant. Your task is to review the provided LaTeX code, identify any syntax errors, missing packages, or compilation issues, and return the fully corrected, perfectly compilable code.

Perform the following strict checks before outputting the code:

1. MISSING PACKAGES:
   - If the code uses \\rowcolor or \\cellcolor in tables, you MUST add \\usepackage{colortbl} to the preamble.
   - If the code uses relative positioning (e.g., \`below=of...\`), you MUST add \\usetikzlibrary{positioning}.
   - If the code uses complex arrows, add \\usetikzlibrary{arrows.meta}.
   - Ensure \\usepackage{amsmath, amssymb} are present for mathematical symbols.

2. SYNTAX ERRORS (TIKZ):
   - Check for the PGF Math Error: \`inner sep\` cannot take multiple values. If you see \`inner sep=Xpt Ypt\`, change it to \`inner xsep=Xpt, inner ysep=Ypt\`.
   - Ensure all TikZ commands end with a semicolon (;).
   - Ensure table column definitions match the number of cells in the rows.

3. ENCODING & STRUCTURE:
   - Ensure \\usepackage[utf8]{inputenc} and \\usepackage[T1]{fontenc} are included.
   - Ensure the document starts with \\begin{document} and ends with \\end{document}.

4. OUTPUT RULES:
   - Fix the code silently. 
   - Output ONLY the fully corrected code enclosed in a \`\`\`latex \`\`\` markdown block.
   - Do not include any explanations, greetings, warnings, or conversational text whatsoever.`
    });

    const result = await model.generateContent([
      "Fix this LaTeX code: \n\n" + latex
    ]);
    const response = await result.response;
    let fixedLatex = response.text().trim();

    // Clean markdown code blocks if the model wrapped it (e.g. ```latex ... ```)
    if (fixedLatex.startsWith('```')) {
      fixedLatex = fixedLatex.replace(/^```(?:latex)?\n?/i, '').replace(/\n?```$/i, '').trim();
    }

    res.json({ latex: fixedLatex });
  } catch (error) {
    console.error('Error during LaTeX linting/fixing:', error);
    res.status(500).json({ error: 'Failed to fix the LaTeX code. ' + error.message });
  }
});

// Handle generic errors
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: 'File upload error: ' + err.message });
  }
  res.status(500).json({ error: err.message });
});

// Start the server
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`Mathpixo Node.js server running on port ${PORT}`);
  console.log(`Local URL: http://localhost:${PORT}`);
  console.log(`==================================================`);
});

