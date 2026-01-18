# mock-api

Простой mock backend для локальной разработки.

## Запуск

Из папки `mock-api`:

- Установка зависимостей: `npm install`
- Dev-режим (с автоперезапуском): `npm run dev`
- Обычный запуск: `npm start`

По умолчанию сервер слушает `http://localhost:3001`.

## Переменные окружения

- `PORT` — порт сервера (по умолчанию `3001`)
- `CORS_ORIGIN` — origin фронта для CORS (по умолчанию `http://localhost:4000`)

## Эндпоинты

- `GET /health`
- `POST /auth/sign-up`
- `POST /auth/sign-in`
- `POST /auth/refresh-token`
- `GET /chats`
- `POST /chats`
- `POST /chats/:chatId/messages`
- `GET /messages/:chatId`
- `GET /vacancies/:chatId`
