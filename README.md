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

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm test` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run lint` - Check code with ESLint
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run format` - Format code with Prettier
- `npm run typecheck` - Run TypeScript type checking

### Testing

```bash
npm run test
# or with coverage
npm run test:coverage
```

See `documents/TEST_SUMMARY.md` for detailed test documentation.

## Updating statutory parameters

- Tax brackets, allowances, contribution caps and voluntary insurance rules live in `public/data/config.json`.
- Edit the relevant values (for example, raising contribution caps or changing rates) and reload the application—no rebuild required when served statically.
- Add new tax classes or adjust existing ones by editing their sections in the JSON file.

## Project structure

```
├── public/data/config.json   # editable statutory data
├── src
│   ├── App.tsx               # UI, form and result presentation
│   ├── components            # Reusable React components
│   ├── hooks/useConfig.tsx   # runtime configuration loader
│   ├── utils                 # calculator and formatting helpers
│   ├── types                 # shared TypeScript types
│   └── i18n.ts               # internationalization (EN/DE)
├── tests                     # Vitest unit tests
└── .github/workflows         # CI/CD automation
```

## Documentation

- **[Production Readiness Assessment](PRODUCTION_READINESS_ASSESSMENT.md)** - Comprehensive evaluation of the application's production readiness
- **[Deployment Guide](DEPLOYMENT.md)** - Instructions for deploying to various platforms
- **[Security Assessment](SECURITY.md)** - Security considerations and vulnerability reports
- **[Test Documentation](documents/TEST_SUMMARY.md)** - Detailed test coverage and validation reports

## Production Readiness

The application has been assessed for production deployment:

**Current Status:** 63% - Needs Work

✅ **Strengths:**
- All 37 tests passing
- Functionally correct calculations validated against reference data
- TypeScript strict mode with full type safety
- Clean architecture with separation of concerns
- CI/CD pipeline with automated testing

⚠️ **Improvements Made:**
- ✅ ESLint and Prettier configured
- ✅ Error boundary implemented with i18n support
- ✅ GitHub Actions CI/CD workflow
- ✅ Comprehensive documentation

See [PRODUCTION_READINESS_ASSESSMENT.md](PRODUCTION_READINESS_ASSESSMENT.md) for the complete analysis.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting: `npm test && npm run lint`
5. Submit a pull request

All pull requests trigger automated CI checks including linting, type checking, testing, and building.

## License

MIT
