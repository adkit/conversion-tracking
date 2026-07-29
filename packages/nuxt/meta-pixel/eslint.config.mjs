// @ts-check
import { createConfigForNuxt } from '@nuxt/eslint-config/flat';

// Run `npx @eslint/config-inspector` to inspect the resolved config interactively
export default createConfigForNuxt({
    features: {
        tooling: true,
        stylistic: false,
    },
    dirs: {
        src: ['./playground'],
    },
}).append({
    rules: {
        'vue/html-self-closing': 'off',
        'vue/multi-word-component-names': 'off',
        'vue/no-mutating-props': 'off',
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/no-unused-vars': [
            'warn',
            {
                args: 'after-used',
                vars: 'all',
                ignoreRestSiblings: true,
                varsIgnorePattern: '^_',
                argsIgnorePattern: '^_',
                caughtErrorsIgnorePattern: '^_',
                destructuredArrayIgnorePattern: '^_',
            },
        ],
        'no-unused-vars': 'off',
    },
}).append({
    files: ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts', '**/*.vue'],
    languageOptions: {
        parserOptions: {
            project: ['./tsconfig.json', './playground/tsconfig.json'],
            extraFileExtensions: ['.vue'],
        },
    },
    rules: {
        '@typescript-eslint/no-deprecated': 'error',
    },
});
