# Генератор математических примеров

Веб-приложение для создания печатных заданий по математике на русском языке. Пользователь выбирает операции, числовые параметры и количество примеров, а приложение формирует листы для печати.

## Установка

```bash
npm install
```

На Windows PowerShell можно использовать `npm.cmd`, если запуск `npm` заблокирован политикой выполнения.

## Запуск

```bash
npm run dev
```

Приложение будет доступно по адресу `http://localhost:5173`.

## Проверка и сборка

```bash
npm test
npm run build
```

После сборки Vite создает `dist/`. Этот каталог не нужен в обычных рабочих изменениях.

## Документация

- `ARCHITECTURE.md` — архитектура приложения, routing, layout, store и поток данных.
- `docs/OPERATIONS.md` — поведение операций, настройки и ограничения генераторов.
- `src/features/notebookGrid/README.md` — печатная сетка A4 и CSS-рендерер.
- `AGENTS.md` — краткие инструкции для coding agents.

## Структура проекта

```txt
src/
├── generators/              # Модули генерации примеров
│   ├── additionGenerator.js
│   ├── subtractionGenerator.js
│   ├── multiplicationGenerator.js
│   └── divisionGenerator.js
├── components/              # React-компоненты страниц и общего UI
│   ├── SiteHeader.jsx       # Общая шапка сайта
│   ├── SiteFooter.jsx       # Общий футер сайта
│   ├── HomePage.jsx
│   ├── SettingsScreen.jsx
│   └── ExamplesScreen.jsx
├── features/
│   └── notebookGrid/        # Печатная тетрадная сетка
├── store/
│   └── exerciseStore.jsx    # Shared settings store + localStorage
├── App.jsx                  # Общий layout и маршруты
├── App.css                  # Общий app container
├── index.css                # Глобальные reset/layout tokens
└── main.jsx                 # Точка входа
```

## Layout

Все маршруты рендерятся внутри общего контейнера `.container` с шириной из CSS-переменной `--site-shell-max-width` в `src/index.css`. Общие `SiteHeader` и `SiteFooter` подключены в `App.jsx` и скрываются в print-режиме.

## Технологии

- React 19
- React Router
- Vite 8
- Vitest
- Plain CSS imports
