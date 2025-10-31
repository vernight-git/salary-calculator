# German Salary Calculator

An interactive, fully static React application that estimates the German net salary from a gross salary, including monthly bonuses, allowances (home office, commuting), social security contributions and optional voluntary insurance. All statutory parameters such as contribution caps and tax brackets are configurable through JSON files so that legal changes can be applied without touching the code.

## Features

- Support for German tax classes I–VI with configurable progressive brackets.
- Home office and commuter allowances applied before income tax computation.
- Bonus planner for fixed or percentage-based payments assigned to specific months.
- Language toggle for English and German labels directly in the UI.
- Social insurance contributions (health, pension, unemployment, long-term care) with monthly caps.
- Optional solidarity and church tax as well as a configurable voluntary insurance surcharge.
- Configuration stored in `public/data/config.json`, enabling updates without code changes.
- Automated unit tests for the core calculator logic via Vitest.

## Getting started

```bash
npm install
npm run dev
```

The dev server runs on [http://localhost:5173](http://localhost:5173). The application only needs static hosting; run `npm run build` to generate the production assets in `dist/`.

### Testing

```bash
npm run test
# or with coverage
npm run test:coverage
```

## Updating statutory parameters

- Tax brackets, allowances, contribution caps and voluntary insurance rules live in `public/data/config.json`.
- Edit the relevant values (for example, raising contribution caps or changing rates) and reload the application—no rebuild required when served statically.
- Add new tax classes or adjust existing ones by editing their sections in the JSON file.

## Project structure

```
├── public/data/config.json   # editable statutory data
├── src
│   ├── App.tsx               # UI, form and result presentation
│   ├── hooks/useConfig.tsx   # runtime configuration loader
│   ├── utils                 # calculator and formatting helpers
│   └── types                 # shared TypeScript types
└── tests                     # Vitest unit tests
```

## License

MIT
