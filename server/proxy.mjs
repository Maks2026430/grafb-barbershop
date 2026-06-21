// Прод-сервер ИИ-консультанта для барбершопа ГРАФЪ.
//
// Делает две вещи:
//   1) /api/chat — прокси к OpenAI-совместимому API (по умолчанию OpenAI,
//      либо ProxyAPI через OPENAI_BASE_URL — см. ниже). Ключ OPENAI_API_KEY
//      хранится на сервере и НЕ попадает во фронтенд.
//   2) отдаёт собранный фронтенд из ../dist (если он там есть), так что весь
//      сайт работает одним процессом Node на одном порту — без отдельного
//      веб-сервера и без CORS. На фронтенде ставим VITE_AI_ENDPOINT=/api/chat.
//
// Фронтенд присылает { system, messages, model, max_tokens } в стиле Anthropic
// (system отдельным полем). Прокси приводит это к формату OpenAI Chat
// Completions: system становится первым сообщением, ответ возвращается как есть
// (фронтенд читает choices[0].message.content).
//
// Запуск на VPS:
//   1) npm install            # express и cors уже в package.json
//   2) npm run build          # собирает фронтенд в dist/ (с .env.production)
//   3) OPENAI_API_KEY=sk-... npm start   # слушает :8787, отдаёт сайт и /api/chat
//
// Лучше под process-менеджером (pm2/systemd) и за nginx с HTTPS — см. README.

import express from "express";
import cors from "cors";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "..");
const DIST_DIR = path.join(ROOT_DIR, "dist");

// Грузим переменные из .env в корне проекта (там лежит OPENAI_API_KEY на сервере).
// Так ключ читается одинаково при `npm start`, pm2 и systemd — независимо от cwd.
loadEnv({ path: path.join(ROOT_DIR, ".env") });

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

const API_KEY = process.env.OPENAI_API_KEY;
const PORT = process.env.PORT || 8787;
// Базовый URL OpenAI-совместимого API. По умолчанию — официальный OpenAI.
// Для ProxyAPI (доступ из РФ) задайте OPENAI_BASE_URL=https://api.proxyapi.ru/openai/v1
// в .env — формат запросов и авторизация (Bearer) те же.
const BASE_URL = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/+$/, "");

app.post("/api/chat", async (req, res) => {
  if (!API_KEY) {
    return res.status(500).json({ error: "OPENAI_API_KEY не задан на сервере" });
  }
  try {
    // OpenAI не принимает system отдельным полем — кладём его первым сообщением.
    const messages = req.body.system
      ? [{ role: "system", content: req.body.system }, ...(req.body.messages || [])]
      : req.body.messages || [];

    const upstream = await fetch(`${BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: req.body.model || "gpt-4o-mini",
        max_tokens: req.body.max_tokens || 1000,
        // Просим модель вернуть строго JSON — совпадает с форматом из промпта.
        response_format: { type: "json_object" },
        messages,
      }),
    });
    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (e) {
    res.status(502).json({ error: String(e) });
  }
});

// Раздаём собранный фронтенд, если он есть (прод). В dev (без dist) сервер
// работает только как API-прокси — фронтенд поднимает Vite на :5173.
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  // SPA-fallback: любой не-API GET отдаёт index.html.
  app.get(/^(?!\/api\/).*/, (_req, res) => {
    res.sendFile(path.join(DIST_DIR, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`ГРАФЪ server on http://localhost:${PORT}`);
  console.log(
    fs.existsSync(DIST_DIR)
      ? `  → отдаёт фронтенд из ${DIST_DIR} и проксирует /api/chat`
      : `  → dist/ не найден: работает только как API-прокси (/api/chat)`
  );
  console.log(`  → upstream API: ${BASE_URL}`);
});
