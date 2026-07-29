# Tests

## Unit Tests

Run unit tests with Vitest:

```bash
npm run test:unit
```

Watch mode:

```bash
npm run test:unit:watch
```

## E2E Tests

Run end-to-end tests with Playwright:

```bash
npm run test
```

Interactive UI mode:

```bash
npm run test:ui
```

## Test Structure

```
test/
├── config.test.ts       # Configuration validation tests
├── hook.test.tsx        # useMetaPixel hook tests
├── init.test.ts         # initMetaPixel function tests
├── provider.test.tsx    # MetaPixelProvider component tests
├── setup.ts             # Test setup file
├── vitest.config.ts     # Vitest configuration
├── playwright.config.ts # Playwright configuration
└── e2e/
    └── pixel-loading.spec.ts  # E2E tests for pixel loading & tracking
```
