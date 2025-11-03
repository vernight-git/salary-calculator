# Architecture Decision Records (ADRs)

This document records important architectural decisions made in the German Salary Calculator project.

## Table of Contents

1. [ADR-001: Use React with TypeScript](#adr-001-use-react-with-typescript)
2. [ADR-002: Static Configuration via JSON](#adr-002-static-configuration-via-json)
3. [ADR-003: No Backend Required](#adr-003-no-backend-required)
4. [ADR-004: Vitest for Unit Testing](#adr-004-vitest-for-unit-testing)
5. [ADR-005: Playwright for E2E Testing](#adr-005-playwright-for-e2e-testing)
6. [ADR-006: Pre-commit Hooks with Husky](#adr-006-pre-commit-hooks-with-husky)
7. [ADR-007: Conventional Commits](#adr-007-conventional-commits)

---

## ADR-001: Use React with TypeScript

**Status:** Accepted

**Date:** 2024

**Context:**
We needed to choose a frontend framework for building an interactive salary calculator with complex form interactions and state management.

**Decision:**
Use React with TypeScript, built with Vite.

**Rationale:**

- **React**: Mature ecosystem, excellent for form handling and state management
- **TypeScript**: Type safety critical for financial calculations
- **Vite**: Fast build times, excellent developer experience
- **Large community**: Easy to find developers and resources

**Consequences:**

- ✅ Type-safe salary calculations reduce bugs
- ✅ Fast development with hot module replacement
- ✅ Rich ecosystem of libraries and tools
- ❌ Bundle size larger than vanilla JS (acceptable trade-off)
- ❌ Requires build step (acceptable for production deployment)

**Alternatives Considered:**

- Vue.js: Good alternative, but smaller ecosystem
- Svelte: Smaller bundle size, but less mature ecosystem
- Vanilla JS: Would be harder to maintain as complexity grows

---

## ADR-002: Static Configuration via JSON

**Status:** Accepted

**Date:** 2024

**Context:**
German tax laws and social insurance rates change annually. We needed a way to update these values without code changes.

**Decision:**
Store all tax brackets, rates, and caps in `public/data/config.json` loaded at runtime.

**Rationale:**

- **No code changes needed** for annual tax updates
- **No redeployment required** - just update JSON file
- **Auditable**: Changes to tax rules are visible in version control
- **Testable**: Can easily create test configurations
- **Flexible**: Same codebase works for different years/scenarios

**Consequences:**

- ✅ Easy to update tax parameters annually
- ✅ Can maintain multiple configurations for testing
- ✅ Non-developers can update tax values
- ❌ Initial page load requires config fetch (minimal impact)
- ❌ No compile-time validation of config (mitigated by TypeScript types)

**Implementation:**

```typescript
interface ConfigData {
  taxClasses: Record<string, TaxClassConfig>;
  socialInsurance: SocialInsuranceConfig;
  allowances: AllowancesConfig;
  // ...
}
```

**Alternatives Considered:**

- Hardcoded values: Would require code changes and redeployment
- Database backend: Overkill for this use case, adds complexity
- Environment variables: Less flexible, requires rebuild

---

## ADR-003: No Backend Required

**Status:** Accepted

**Date:** 2024

**Context:**
We needed to decide whether to build a backend API or keep everything client-side.

**Decision:**
Keep the application entirely client-side with no backend services.

**Rationale:**

- **Privacy**: No user data ever leaves their browser
- **Cost**: Can be hosted on free static hosting (GitHub Pages, Netlify)
- **Scalability**: CDN can handle any traffic level
- **Security**: No server to secure or maintain
- **Simplicity**: Easier to deploy and maintain
- **Offline-capable**: Works without internet after initial load

**Consequences:**

- ✅ Zero operational costs
- ✅ Perfect for privacy-conscious users
- ✅ Fast global distribution via CDN
- ✅ No server maintenance required
- ❌ Cannot track usage analytics server-side (can use client-side)
- ❌ Cannot generate PDFs server-side (can use client-side libraries)

**Use Cases:**

- Personal salary estimates
- Financial planning
- HR preliminary calculations
- Educational purposes

**Alternatives Considered:**

- Node.js backend: Added complexity without clear benefit
- Serverless functions: Useful for PDF generation, but not essential

---

## ADR-004: Vitest for Unit Testing

**Status:** Accepted

**Date:** 2024

**Context:**
We needed a testing framework for unit tests, especially for salary calculation logic.

**Decision:**
Use Vitest as the primary unit testing framework.

**Rationale:**

- **Vite integration**: Native support for Vite projects
- **Fast**: Runs tests in parallel, uses Vite's transform pipeline
- **Jest-compatible API**: Easy migration path, familiar syntax
- **TypeScript support**: First-class TypeScript support
- **ESM native**: No transpilation needed for modern JavaScript
- **Watch mode**: Excellent developer experience

**Consequences:**

- ✅ Fast test execution
- ✅ Great developer experience
- ✅ Easy to add tests for new features
- ✅ Coverage reporting available
- ❌ Smaller community than Jest (acceptable trade-off)

**Test Coverage Goals:**

- Core calculator logic: >95%
- Utilities: >90%
- Components: >80%
- Overall: >80%

**Alternatives Considered:**

- Jest: More mature but slower, requires additional configuration for ESM
- Testing Library alone: Needs a test runner
- Mocha/Chai: Less integrated with modern tooling

---

## ADR-005: Playwright for E2E Testing

**Status:** Accepted

**Date:** 2024

**Context:**
We needed end-to-end testing to verify complete user flows and catch integration issues.

**Decision:**
Use Playwright for E2E testing with tests in the `e2e/` directory.

**Rationale:**

- **Multi-browser**: Tests Chrome, Firefox, Safari automatically
- **Reliable**: Auto-waits for elements, reduces flakiness
- **Fast**: Parallel execution, efficient resource usage
- **Modern**: Great API, excellent documentation
- **Developer tools**: UI mode, trace viewer, codegen
- **CI-friendly**: Headless mode, CI optimizations built-in

**Consequences:**

- ✅ Confidence in full application flows
- ✅ Catches integration issues
- ✅ Tests real user scenarios
- ✅ Cross-browser testing automated
- ❌ Slower than unit tests (expected)
- ❌ Requires browsers to be installed

**Test Strategy:**

- Critical paths: Salary calculation for each tax class
- User interactions: Form filling, language switching
- Error handling: Invalid inputs, network failures
- Accessibility: Keyboard navigation, screen readers

**Alternatives Considered:**

- Cypress: Popular but more opinionated, browser limitations
- Selenium: Older technology, more complex setup
- Testing Library only: Cannot test full browser interactions

---

## ADR-006: Pre-commit Hooks with Husky

**Status:** Accepted

**Date:** 2024

**Context:**
We wanted to enforce code quality and prevent broken code from being committed.

**Decision:**
Use Husky with lint-staged for pre-commit and commit-msg hooks.

**Rationale:**

- **Automatic enforcement**: Developers cannot commit broken code
- **Fast feedback**: Catch issues before pushing to remote
- **Consistency**: All developers follow same standards
- **Prevents mistakes**: Automated checks reduce human error

**Consequences:**

- ✅ Code quality enforced automatically
- ✅ Fewer CI failures
- ✅ Consistent formatting across codebase
- ✅ Tests run on affected files
- ❌ Slightly slower commits (worth the trade-off)
- ❌ Developers must have hooks installed

**Hooks Configured:**

**pre-commit:**

- Lint and fix staged files
- Format staged files
- Run tests for affected files

**commit-msg:**

- Validate commit message format
- Enforce conventional commits

**Alternatives Considered:**

- No hooks: Would rely on CI only (slower feedback)
- Different hook manager: Husky is industry standard
- Manual enforcement: Error-prone, inconsistent

---

## ADR-007: Conventional Commits

**Status:** Accepted

**Date:** 2024

**Context:**
We needed a consistent commit message format for better git history and potential automation.

**Decision:**
Enforce conventional commits format with commitlint.

**Rationale:**

- **Readable history**: Clear, structured commit messages
- **Automation**: Enables automatic changelog generation
- **Clarity**: Type prefix makes purpose clear
- **Standard**: Industry-standard format

**Format:**

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style (no functional changes)
- `refactor`: Code refactoring
- `test`: Add/update tests
- `chore`: Maintenance

**Consequences:**

- ✅ Clear, scannable git history
- ✅ Potential for automatic versioning
- ✅ Can generate changelogs automatically
- ✅ Easy to find specific types of changes
- ❌ Learning curve for developers
- ❌ More rigid commit format

**Examples:**

```
feat(calculator): add support for company car benefits
fix(ui): correct mobile layout for salary results
docs(readme): update installation instructions
test(calculator): add edge cases for bonus calculations
```

**Alternatives Considered:**

- Free-form commits: Less structure, harder to parse
- Custom format: Would require more documentation
- Gitmoji: Visual but less tooling support

---

## Decision Process

For new architectural decisions:

1. **Identify the problem** that needs a decision
2. **Research alternatives** and their trade-offs
3. **Discuss with team** or in pull request
4. **Document the decision** in this file
5. **Include rationale** and consequences
6. **Update date** and status

## Status Values

- **Proposed**: Decision is proposed but not yet accepted
- **Accepted**: Decision is accepted and implemented
- **Deprecated**: Decision is no longer recommended but still in use
- **Superseded**: Decision has been replaced by a newer one

---

**Last Updated:** 2024
**Maintained By:** Development Team
