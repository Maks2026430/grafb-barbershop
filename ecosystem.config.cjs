// Конфиг pm2 для сервера ГРАФЪ (сайт + ИИ-прокси одним процессом).
//
// Запуск на VPS:
//   npm install -g pm2
//   npm install && npm run build          # зависимости и сборка dist/
//   cp .env.example .env && nano .env      # впишите OPENAI_API_KEY
//   pm2 start ecosystem.config.cjs         # поднять
//   pm2 save && pm2 startup                # автозапуск после перезагрузки
//
// Ключ НЕ хранится здесь — сервер читает OPENAI_API_KEY из .env (через dotenv).

module.exports = {
  apps: [
    {
      name: "grafb",
      script: "server/proxy.mjs",
      cwd: __dirname,
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      max_restarts: 10,
      env: {
        NODE_ENV: "production",
        PORT: 8787,
      },
    },
  ],
};
