# Power Progress

> Офлайн-первый PWA-дневник тренировок с системой прогрессии нагрузок.
> Стек: Nuxt 4 · Vue 3 · Firebase · Pinia · Tailwind CSS 4 · IndexedDB

## Требования

| Инструмент | Версия |
|------------|--------|
| Node.js    | 20+    |
| npm        | 10.9+  |

## Быстрый старт

```bash
# 1. Установить зависимости
npm install

# 2. Скопировать и заполнить переменные окружения
cp .env.example .env

# 3. Запустить dev-сервер → http://localhost:3000
npm run dev
```

## Команды

| Команда             | Описание                                    |
|---------------------|---------------------------------------------|
| `npm run dev`       | Dev-сервер (SPA, порт 3000)                 |
| `npm run build`     | Продакшен-сборка                            |
| `npm run preview`   | Локальный preview после сборки              |
| `npm run typecheck` | Проверка TypeScript (strict mode)           |
| `npm run lint`      | Псевдоним для typecheck                     |
| `npm run test`      | Запуск тестов (Node built-in test runner)   |

## Переменные окружения

Все значения берутся из Firebase Console → Project Settings.

```env
FIREBASE_API_KEY=
AUTH_DOMAIN=your-project.firebaseapp.com
DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
PROJECT_ID=
STORAGE_BUCKET=
MESSAGING_SENDER_ID=
APP_ID=
```
