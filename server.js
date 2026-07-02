const express = require('express');
const multer = require('multer');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
const fs = require('fs');
const db = require('./database');
const emailService = require('./email');

// Load environment variables
dotenv.config();

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
  const userId = token ? db.getSession(token) : null;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized. Please log in.' });
  }
  req.userId = userId;
  next();
}

function optionalAuth(req, res, next) {
  const token = req.cookies['session_token'];
  const userId = token ? db.getSession(token) : null;
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
app.post('/api/auth/register', (req, res) => {
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

    // Send email confirmation asynchronously
    emailService.sendConfirmationEmail(email, user.name).catch(err => {
      console.error('Failed to send registration confirmation email:', err);
    });

    res.json({ user });
  } catch (err) {
    res.status(400).json({ error: err.message });
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
  const userId = token ? db.getSession(token) : null;
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
      const absolutePath = path.join(__dirname, 'public', relativePath);
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

// API endpoint to convert image/PDF to LaTeX
app.post('/api/convert', optionalAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload an image or PDF file.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ 
        error: 'Gemini API key is not configured on the server. Please add it to your .env file.' 
      });
    }

    // Use gemini-2.5-flash for fast and accurate multimodal tasks
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `You are a high-accuracy mathematical OCR and LaTeX conversion system.
Analyze the uploaded image or document of mathematical expressions, formulas, control block diagrams, or function curves/graphs.
Extract all math equations, text, symbols, structures, diagrams, coordinate systems, or function plots, and convert them to standard, high-quality LaTeX code.

Provide ONLY the raw LaTeX code in the response.
CRITICAL RULES:
1. Do NOT wrap the code in Markdown code blocks (do NOT use \\\`\\\`\\\`latex or similar).
2. Do NOT write explanations, greeting, or backticks.
3. Return only the raw LaTeX code that can be directly pasted into a LaTeX editor (like Overleaf or TeXstudio).
4. For inline formulas, wrap them in $...$.
5. For standalone or display equations, wrap them in standard LaTeX block format:
   \\[
   <equation>
   \\]
   (Do NOT use $$...$$ as it is deprecated in modern LaTeX).
6. If there are multiple aligned equations, use \\begin{align*} ... \\end{align*}.
7. If the image contains a control system block diagram, represent it using the LaTeX 'blox' package (built on TikZ) or standard TikZ code.
8. If the image contains a mathematical curve, function graph, or coordinate plot, represent it using the LaTeX 'pgfplots' package (built on TikZ) or standard TikZ code.
9. Comment at the very top of the output which LaTeX packages are required to compile the generated code (e.g. % Required packages: \\usepackage{pgfplots}, \\usepackage{blox}, \\usepackage{tikz}, \\usepackage{amsmath}, etc.).
10. Ensure all symbols (like Greek letters, integrals, matrices, fractions) are correctly escaped and formatted.`;

    // Read file into buffer from disk storage
    const fileBuffer = fs.readFileSync(req.file.path);
    const imagePart = fileToGenerativePart(fileBuffer, req.file.mimetype);

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const latexText = response.text().trim();

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

