/* eslint-disable no-console */

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const crypto = require('crypto');

const app = express();

const PORT = Number(process.env.PORT || 3001);
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:4000';

app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
  })
);
app.use(morgan('dev'));
app.use(express.json({ limit: '1mb' }));

// -------------------------
// In-memory "DB"
// -------------------------

const usersByEmail = new Map(); // email -> { id, email, password, username? }
const usersById = new Map(); // id -> user

const accessTokens = new Map(); // accessToken -> { userId, expiresAt }
const refreshTokens = new Map(); // refreshToken -> { userId, expiresAt }

const chatsById = new Map(); // chatId -> { id, userId, title }
const messagesByChatId = new Map(); // chatId -> Message[]

function nowMs() {
  return Date.now();
}

function randomId(prefix) {
  return `${prefix}_${crypto.randomUUID()}`;
}

function issueTokens(userId) {
  const accessToken = randomId('access');
  const refreshToken = randomId('refresh');

  // "Простая" жизнь токенов: access 60 сек, refresh 7 дней
  accessTokens.set(accessToken, { userId, expiresAt: nowMs() + 60_000 });
  refreshTokens.set(refreshToken, { userId, expiresAt: nowMs() + 7 * 24 * 60 * 60_000 });

  return { accessToken, refreshToken };
}

function validateAccessToken(req) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return { ok: false };

  const token = auth.slice('Bearer '.length);
  const entry = accessTokens.get(token);
  if (!entry) return { ok: false };

  if (entry.expiresAt <= nowMs()) {
    accessTokens.delete(token);
    return { ok: false };
  }

  return { ok: true, userId: entry.userId };
}

function requireAuth(req, res, next) {
  const v = validateAccessToken(req);
  if (!v.ok) return res.status(403).json({ message: 'Forbidden' });
  req.userId = v.userId;
  next();
}

function toPage(content, page, size) {
  const totalElements = content.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / size));
  const start = page * size;
  const sliced = content.slice(start, start + size);

  return {
    content: sliced,
    totalPages,
    totalElements,
    size,
    number: page,
    first: page === 0,
    last: page >= totalPages - 1,
    empty: sliced.length === 0,
  };
}

// Health
app.get('/health', (req, res) => {
  res.json({ ok: true });
});

// -------------------------
// Auth
// -------------------------

app.post('/auth/sign-up', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: 'email and password required' });

  if (usersByEmail.has(email)) return res.status(409).json({ message: 'user already exists' });

  const user = {
    id: crypto.randomUUID(),
    email,
    password,
    username: email.split('@')[0],
  };

  usersByEmail.set(email, user);
  usersById.set(user.id, user);

  return res.status(201).send();
});

app.post('/auth/sign-in', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: 'email and password required' });

  const user = usersByEmail.get(email);
  if (!user || user.password !== password) return res.status(401).json({ message: 'invalid credentials' });

  const { accessToken, refreshToken } = issueTokens(user.id);

  return res.json({
    id: user.id,
    email: user.email,
    username: user.username,
    accessToken,
    refreshToken,
  });
});

app.post('/auth/refresh-token', (req, res) => {
  const { refreshToken, userId } = req.body || {};
  if (!refreshToken || !userId) return res.status(400).json({ message: 'refreshToken and userId required' });

  const entry = refreshTokens.get(refreshToken);
  if (!entry || entry.userId !== userId) return res.status(403).json({ message: 'Forbidden' });

  if (entry.expiresAt <= nowMs()) {
    refreshTokens.delete(refreshToken);
    return res.status(403).json({ message: 'Forbidden' });
  }

  // rotate refresh token
  refreshTokens.delete(refreshToken);
  const tokens = issueTokens(userId);

  return res.json(tokens);
});

// -------------------------
// Chats
// -------------------------

app.get('/chats', requireAuth, (req, res) => {
  const page = Number(req.query.page || 0);
  const size = Number(req.query.size || 50);

  const all = Array.from(chatsById.values())
    .filter((c) => c.userId === req.userId)
    .map((c) => ({ id: c.id, title: c.title }));

  return res.json(toPage(all, page, size));
});

app.post('/chats', requireAuth, (req, res) => {
  const { userId } = req.body || {};

  // фронт присылает userId в body, но мы всё равно авторизуемся по токену
  if (!userId) return res.status(400).json({ message: 'userId required' });

  const chatId = crypto.randomUUID();
  const title = `Chat ${String(chatsById.size + 1)}`;

  chatsById.set(chatId, { id: chatId, userId: req.userId, title });
  if (!messagesByChatId.has(chatId)) messagesByChatId.set(chatId, []);

  return res.status(201).json({
    chatId,
    title,
    titleGenerated: false,
  });
});

app.post('/chats/:chatId/messages', requireAuth, (req, res) => {
  const { chatId } = req.params;
  const chat = chatsById.get(chatId);

  if (!chat || chat.userId !== req.userId) return res.status(404).json({ message: 'chat not found' });

  const content = typeof req.body === 'string' ? req.body : req.body?.content;
  if (!content) return res.status(400).json({ message: 'message content required' });

  const list = messagesByChatId.get(chatId) || [];

  list.push({
    id: crypto.randomUUID(),
    chatId,
    content: String(content),
    role: 0, // RoleEnum.user
  });

  // простая авто-реплика "assistant" чтобы чат выглядел живым
  list.push({
    id: crypto.randomUUID(),
    chatId,
    content: `Я получил: ${String(content).slice(0, 200)}`,
    role: 1, // RoleEnum.assistant
  });

  messagesByChatId.set(chatId, list);

  return res.status(201).send();
});

// -------------------------
// Messages
// -------------------------

app.get('/messages/:chatId', requireAuth, (req, res) => {
  const { chatId } = req.params;
  const page = Number(req.query.page || 0);
  const size = Number(req.query.size || 50);

  const chat = chatsById.get(chatId);
  if (!chat || chat.userId !== req.userId) return res.status(404).json({ message: 'chat not found' });

  const all = (messagesByChatId.get(chatId) || []).slice().reverse(); // новые сверху
  return res.json(toPage(all, page, size));
});

// -------------------------
// Vacancies
// -------------------------

app.get('/vacancies/:chatId', requireAuth, (req, res) => {
  const { chatId } = req.params;
  const page = Number(req.query.page || 0);
  const size = Number(req.query.size || 50);

  const chat = chatsById.get(chatId);
  if (!chat || chat.userId !== req.userId) return res.status(404).json({ message: 'chat not found' });

  const sample = [
    {
      id: randomId('vac'),
      title: 'Frontend Developer (React)',
      location: 'Remote',
      minSalary: 1500,
      maxSalary: 3000,
      techStack: ['React', 'TypeScript', 'Next.js'],
      description: 'Простая демо-вакансия для тестирования фронта.',
      companyName: 'Demo Inc',
      seniorityLevel: 'Middle',
      sourceLink: 'https://example.com',
    },
    {
      id: randomId('vac'),
      title: 'Fullstack Developer (Node.js)',
      location: 'Warsaw',
      minSalary: 2500,
      maxSalary: 4500,
      techStack: ['Node.js', 'PostgreSQL', 'Docker'],
      description: 'Еще одна демо-вакансия, чтобы заполнить список.',
      companyName: 'Example LLC',
      seniorityLevel: 'Senior',
      sourceLink: 'https://example.com',
    },
  ];

  return res.json(toPage(sample, page, size));
});

app.listen(PORT, () => {
  console.log(`[mock-api] listening on http://localhost:${PORT}`);
  console.log(`[mock-api] cors origin: ${CORS_ORIGIN}`);
});
