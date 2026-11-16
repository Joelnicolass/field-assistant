const { defineConfig, globalIgnores } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

const restrict = (...patterns) => ({
  'no-restricted-imports': ['error', { patterns }],
});

const forbid = (regex, message) => ({ regex, message });

const NOT_ALLOWED_IN_DOMAIN = 'R1: domain solo importa de domain, sin React ni Expo.';
const NOT_ALLOWED_IN_USECASES = 'R3: data/usecases importa solo de domain.';
const NOT_ALLOWED_IN_CORE = 'R6: core no importa nada del proyecto.';
const NOT_ALLOWED_IN_SHARED = 'R5: shared no importa de presentation/features, domain, data ni di.';
const NOT_ALLOWED_IN_PRESENTATION =
  'R4: presentation importa de domain, shared, core y de useDependencies.';
const NOT_DATA = 'R2: nada fuera de di importa de data.';

const FROM_ROOT = '^(@/|(\\.\\./)+)';

const importsFromData = `${FROM_ROOT}data(/|$)`;

module.exports = defineConfig([
  globalIgnores(['dist/', 'android/', '.expo/']),
  expoConfig,
  {
    settings: {
      react: { version: '19.3.0' },
    },
    rules: {
      // eslint-config-expo's TypeScript resolver is nested and import/* resolves the 'typescript' package instead; tsc already checks every import
      'import/no-unresolved': 'off',
      'import/namespace': 'off',
      'import/no-duplicates': 'off',
    },
  },
  {
    files: ['src/domain/**/*.{ts,tsx}'],
    rules: restrict(forbid('^(?!@/domain/|\\./|\\.\\./[^.])', NOT_ALLOWED_IN_DOMAIN)),
  },
  {
    files: ['src/data/usecases/**/*.{ts,tsx}'],
    rules: restrict(forbid('^(?!@/domain/|\\./|\\.\\./\\.\\./domain/)', NOT_ALLOWED_IN_USECASES)),
  },
  {
    files: ['src/presentation/**/*.{ts,tsx}'],
    rules: restrict(
      forbid(importsFromData, NOT_ALLOWED_IN_PRESENTATION),
      forbid(`${FROM_ROOT}di(?!/useDependencies$)(/|$)`, NOT_ALLOWED_IN_PRESENTATION),
    ),
  },
  {
    files: ['src/shared/**/*.{ts,tsx}'],
    rules: restrict(
      forbid(importsFromData, NOT_DATA),
      forbid(`${FROM_ROOT}(presentation/features|domain|di)(/|$)`, NOT_ALLOWED_IN_SHARED),
    ),
  },
  {
    files: ['src/core/**/*.{ts,tsx}'],
    rules: restrict(
      forbid(importsFromData, NOT_DATA),
      forbid('^(@/(?!core/)|\\.\\./\\.\\./)', NOT_ALLOWED_IN_CORE),
    ),
  },
]);
