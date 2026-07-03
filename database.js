const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const isVercel = !!process.env.VERCEL;
const DB_DIR = isVercel ? path.join('/tmp', 'data') : path.join(__dirname, 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

// Initialize database
function initDb() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ users: [], history: [], sessions: [] }, null, 2));
  }
}

// Read database
function readDb() {
  initDb();
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    const parsed = JSON.parse(data);
    if (!parsed.sessions) parsed.sessions = [];
    return parsed;
  } catch (error) {
    console.error('Error reading database file:', error);
    return { users: [], history: [], sessions: [] };
  }
}

// Write database
function writeDb(data) {
  initDb();
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing database file:', error);
  }
}

// User Helpers
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedPassword) {
  const [salt, originalHash] = storedPassword.split(':');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === originalHash;
}

function registerUser(email, password, name) {
  const db = readDb();
  const lowerEmail = email.toLowerCase();
  
  if (db.users.some(u => u.email === lowerEmail)) {
    throw new Error('User already exists with this email.');
  }

  const user = {
    id: 'user_' + crypto.randomBytes(8).toString('hex'),
    email: lowerEmail,
    name: name || email.split('@')[0],
    password: hashPassword(password),
    activated: true,
    subscription: {
      plan: 'free',
      status: 'active',
      updatedAt: new Date().toISOString()
    },
    extractionsCount: 0,
    createdAt: new Date().toISOString()
  };

  db.users.push(user);
  writeDb(db);

  // Return user without password
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

function activateUser(token) {
  const db = readDb();
  const user = db.users.find(u => u.activationToken === token);
  if (!user) {
    throw new Error('Invalid or expired activation link.');
  }
  user.activated = true;
  delete user.activationToken;
  writeDb(db);
  
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

function authenticateUser(email, password) {
  const db = readDb();
  const lowerEmail = email.toLowerCase();
  const user = db.users.find(u => u.email === lowerEmail);

  if (!user || !verifyPassword(password, user.password)) {
    throw new Error('Invalid email or password.');
  }

  // Schema fallbacks for existing users
  if (!user.subscription) {
    user.subscription = { plan: 'free', status: 'active', updatedAt: new Date().toISOString() };
  }
  if (user.extractionsCount === undefined) {
    user.extractionsCount = 0;
  }

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

function getUserById(id) {
  const db = readDb();
  const user = db.users.find(u => u.id === id);
  if (!user) return null;

  // Schema fallbacks for existing users
  if (!user.subscription) {
    user.subscription = { plan: 'free', status: 'active', updatedAt: new Date().toISOString() };
  }
  if (user.extractionsCount === undefined) {
    user.extractionsCount = 0;
  }
  
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

// History Helpers
function getHistory(userId) {
  const db = readDb();
  return db.history.filter(h => h.userId === userId)
                   .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function addHistoryEntry(userId, name, size, latex, relativeFilePath, status = 'converted') {
  const db = readDb();
  const entry = {
    id: 'hist_' + crypto.randomBytes(8).toString('hex'),
    userId,
    name,
    size,
    latex: latex || '',
    filePath: relativeFilePath,
    status,
    createdAt: new Date().toISOString()
  };

  db.history.push(entry);
  writeDb(db);
  return entry;
}

function updateHistoryEntry(id, userId, updates) {
  const db = readDb();
  const index = db.history.findIndex(h => h.id === id && h.userId === userId);
  
  if (index === -1) {
    throw new Error('History entry not found.');
  }

  db.history[index] = {
    ...db.history[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  writeDb(db);
  return db.history[index];
}

function deleteHistoryEntry(id, userId) {
  const db = readDb();
  const index = db.history.findIndex(h => h.id === id && h.userId === userId);
  
  if (index === -1) {
    throw new Error('History entry not found.');
  }

  const entry = db.history[index];
  db.history.splice(index, 1);
  writeDb(db);

  // Return file path so server can delete physical file if needed
  return entry.filePath;
}

// Session Helpers
function createSession(userId) {
  const db = readDb();
  const token = crypto.randomBytes(32).toString('hex');
  const session = {
    token,
    userId,
    createdAt: new Date().toISOString()
  };
  db.sessions.push(session);
  writeDb(db);
  return token;
}

function getSession(token) {
  const db = readDb();
  const session = db.sessions.find(s => s.token === token);
  return session ? session.userId : null;
}

function deleteSession(token) {
  const db = readDb();
  const index = db.sessions.findIndex(s => s.token === token);
  if (index !== -1) {
    db.sessions.splice(index, 1);
    writeDb(db);
    return true;
  }
  return false;
}

function updateUserSubscription(userId, plan) {
  const db = readDb();
  const index = db.users.findIndex(u => u.id === userId);
  if (index === -1) {
    throw new Error('User not found.');
  }
  db.users[index].subscription = {
    plan,
    status: 'active',
    updatedAt: new Date().toISOString()
  };
  writeDb(db);
  
  const { password: _, ...userWithoutPassword } = db.users[index];
  return userWithoutPassword;
}

function incrementUserExtractions(userId) {
  const db = readDb();
  const index = db.users.findIndex(u => u.id === userId);
  if (index !== -1) {
    if (db.users[index].extractionsCount === undefined) {
      db.users[index].extractionsCount = 0;
    }
    db.users[index].extractionsCount += 1;
    writeDb(db);
  }
}

module.exports = {
  registerUser,
  activateUser,
  authenticateUser,
  getUserById,
  getHistory,
  addHistoryEntry,
  updateHistoryEntry,
  deleteHistoryEntry,
  createSession,
  getSession,
  deleteSession,
  updateUserSubscription,
  incrementUserExtractions
};
