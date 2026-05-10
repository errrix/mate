# Генератор математических примеров

Веб-приложение для создания примеров по математике с возможностью печати.

## Установка

```bash
npm install
```

## Запуск

```bash
npm run dev
```

Приложение будет доступно по адресу `http://localhost:5173`

## Сборка

```bash
npm run build
```

## Структура проекта

```
src/
├── generators/          # Модули генерации примеров
│   ├── additionGenerator.js
│   ├── subtractionGenerator.js
│   ├── multiplicationGenerator.js
│   └── divisionGenerator.js
├── components/         # React компоненты
│   ├── SettingsScreen.jsx
│   ├── ExamplesScreen.jsx
│   ├── AdditionExample.jsx
│   ├── SubtractionExample.jsx
│   ├── MultiplicationExample.jsx
│   └── DivisionExample.jsx
├── App.jsx             # Главный компонент
└── main.jsx            # Точка входа
```

## Технологии

- React 18
- Vite
- CSS Modules
