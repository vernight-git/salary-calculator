# Contributing to German Salary Calculator

Thank you for your interest in contributing! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm 10.x or higher
- Git

### Initial Setup

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/salary-calculator.git
   cd salary-calculator
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Install Playwright browsers** (for E2E tests):
   ```bash
   npx playwright install
   ```
5. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 💻 Development Workflow

### Running the Application

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Testing

```bash
# Run unit tests (watch mode)
npm test

# Run unit tests once
npm run test:run

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run E2E tests in headed mode (see browser)
npm run test:e2e:headed
```

### Code Quality

```bash
# Lint TypeScript/React files
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Format code with Prettier
npm run format

# Check formatting
npm run format:check

# Type checking
npm run typecheck
```

## 📝 Commit Guidelines

We use [Conventional Commits](https://www.conventionalcommits.org/) for commit messages. This leads to more readable messages and enables automatic changelog generation.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, missing semi-colons, etc)
- **refactor**: Code refactoring (no functional changes)
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **build**: Build system changes
- **ci**: CI/CD changes
- **chore**: Other changes (maintenance, dependencies, etc)
- **revert**: Revert a previous commit

### Examples

```bash
feat(calculator): add support for company pension deductions

fix(ui): correct tax class dropdown alignment on mobile

docs(readme): update installation instructions

test(calculator): add edge case tests for bonus calculations
```

### Pre-commit Hooks

We use Husky to automatically:

1. **Lint and format** your code before committing
2. **Run related tests** for changed files
3. **Validate commit messages** against conventional commit format

If the pre-commit hook fails, fix the issues and try committing again.

## 🏗️ Code Structure

```
├── src/
│   ├── components/      # React components
│   ├── hooks/          # Custom React hooks
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions and business logic
│   ├── i18n.ts         # Internationalization
│   └── App.tsx         # Main application component
├── tests/              # Unit tests (Vitest)
├── e2e/                # End-to-end tests (Playwright)
├── public/data/        # Configuration JSON files
└── documents/          # Documentation
```

## ✅ Testing Guidelines

### Unit Tests

- Place unit tests in the `tests/` directory
- Name test files with `.test.ts` or `.test.tsx` extension
- Test files should mirror the source structure
- Aim for >80% code coverage on new code
- Test edge cases and error conditions

Example:

```typescript
import { describe, it, expect } from 'vitest';
import { calculateSalary } from '../src/utils/salaryCalculator';

describe('calculateSalary', () => {
  it('calculates net salary correctly for tax class I', () => {
    const result = calculateSalary(input, config);
    expect(result.netSalary).toBe(expectedValue);
  });
});
```

### E2E Tests

- Place E2E tests in the `e2e/` directory
- Name test files with `.spec.ts` extension
- Test complete user flows
- Use descriptive test names

Example:

```typescript
import { test, expect } from '@playwright/test';

test('calculates salary successfully', async ({ page }) => {
  await page.goto('/');
  await page.fill('[name="grossSalary"]', '5000');
  await page.click('button[type="submit"]');
  await expect(page.locator('.net-salary')).toContainText('€');
});
```

## 📚 Documentation

- Add JSDoc comments to all public functions
- Update README.md for user-facing changes
- Update documents/DEPLOYMENT.md for deployment-related changes
- Add comments for complex logic
- Keep documentation in sync with code

Example JSDoc:

```typescript
/**
 * Calculates the net salary from gross salary
 * @param input - Salary input parameters
 * @param config - Tax and social insurance configuration
 * @returns Complete salary breakdown including deductions
 */
export function calculateSalary(input: SalaryInput, config: ConfigData): SalaryBreakdown {
  // implementation
}
```

## 🎨 Code Style

- Follow the existing code style
- Use TypeScript for type safety
- Prefer functional programming patterns
- Keep functions small and focused
- Use descriptive variable and function names
- ESLint and Prettier are configured to enforce style

## 🐛 Reporting Bugs

When reporting bugs, please include:

1. **Description**: Clear description of the issue
2. **Steps to Reproduce**: Minimal steps to reproduce the behavior
3. **Expected Behavior**: What you expected to happen
4. **Actual Behavior**: What actually happened
5. **Environment**: Browser, OS, Node.js version
6. **Screenshots**: If applicable

## 💡 Suggesting Enhancements

Enhancement suggestions are welcome! Please include:

1. **Use Case**: Describe the problem or need
2. **Proposed Solution**: Your suggested approach
3. **Alternatives**: Any alternative solutions considered
4. **Additional Context**: Screenshots, examples, etc.

## 📋 Pull Request Process

1. **Update tests**: Add/update tests for your changes
2. **Update documentation**: Update README, JSDoc, etc.
3. **Run quality checks**: Ensure all tests pass and code is formatted
   ```bash
   npm run lint
   npm run typecheck
   npm run test:run
   npm run test:coverage
   ```
4. **Update CHANGELOG**: Add entry describing your changes
5. **Create PR**: Create a pull request with a clear title and description
6. **Address feedback**: Respond to review comments

### PR Title Format

Use conventional commit format for PR titles:

```
feat: add support for freelancer tax calculations
fix: correct rounding in pension contributions
```

### PR Description Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Unit tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added/updated
- [ ] All tests passing
```

## 🔒 Security

If you discover a security vulnerability, please email the maintainers directly instead of creating a public issue. See [SECURITY.md](SECURITY.md) for details.

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙏 Thank You!

Your contributions make this project better for everyone. Thank you for taking the time to contribute! ❤️

## 📞 Questions?

- Open an issue for questions
- Check existing issues and discussions
- Review the documentation in `/documents`

---

**Happy Contributing! 🎉**
