import js from "@eslint/js";
import { plugin as shadcn } from "@shadcn/lint";
import stylistic from "@stylistic/eslint-plugin";
import eslintConfigPrettier from "eslint-config-prettier";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import reactYouMightNotNeedAnEffect from "eslint-plugin-react-you-might-not-need-an-effect";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import unusedImports from "eslint-plugin-unused-imports";
import globals from "globals";
import tseslint from "typescript-eslint";

/** @type {import("eslint").Linter.Config} */
export default [
  { ignores: ["out/**", "dist/**", "coverage/**"] },
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  {
    ...pluginReact.configs.flat.recommended,
    languageOptions: {
      ...pluginReact.configs.flat.recommended.languageOptions,
      globals: {
        ...globals.browser,
      },
    },
  },
  {
    plugins: {
      "react-hooks": pluginReactHooks,
      "@stylistic": stylistic,
      "simple-import-sort": simpleImportSort,
      "unused-imports": unusedImports,
    },
    settings: {
      react: { version: "detect" },
    },
    rules: {
      ...pluginReactHooks.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react-hooks/exhaustive-deps": "off",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          fixStyle: "separate-type-imports",
          disallowTypeAnnotations: false,
        },
      ],
      "@typescript-eslint/no-import-type-side-effects": "error",
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["../*", "../../*"],
              message:
                "Use '@/' alias imports instead of relative parent imports (../ or ../../)",
            },
          ],
        },
      ],
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            ["^\\u0000"],
            [
              "^(node:)",
              "^(assert|buffer|child_process|cluster|console|constants|crypto|dgram|dns|domain|events|fs|http|https|module|net|os|path|punycode|querystring|readline|repl|stream|string_decoder|sys|timers|tls|tty|url|util|vm|zlib|freelist|v8|process|async_hooks|http2|perf_hooks)(/.*|$)",
            ],
            ["^react"],
            ["^@?\\w"],
            ["^"],
            ["^\\."],
          ],
        },
      ],
      "simple-import-sort/exports": "error",
      "react/function-component-definition": [
        "error",
        {
          namedComponents: "function-declaration",
          unnamedComponents: "arrow-function",
        },
      ],
      "react/jsx-sort-props": [
        "error",
        {
          callbacksLast: true,
          shorthandFirst: true,
          multiline: "last",
          ignoreCase: true,
          reservedFirst: true,
        },
      ],
      "@stylistic/padding-line-between-statements": [
        "error",
        { blankLine: "always", prev: "import", next: "*" },
        { blankLine: "any", prev: "import", next: "import" },
        { blankLine: "always", prev: "*", next: "return" },
        { blankLine: "always", prev: "*", next: "function" },
        { blankLine: "always", prev: "function", next: "*" },
        { blankLine: "always", prev: "*", next: "type" },
        { blankLine: "always", prev: "type", next: "*" },
        { blankLine: "always", prev: "*", next: "interface" },
        { blankLine: "always", prev: "interface", next: "*" },
        { blankLine: "always", prev: "*", next: "class" },
        { blankLine: "always", prev: "class", next: "*" },
        { blankLine: "always", prev: "*", next: "export" },
        { blankLine: "always", prev: "export", next: "*" },
        { blankLine: "any", prev: "export", next: "export" },
      ],
    },
  },
  reactYouMightNotNeedAnEffect.configs.strict,
  {
    files: ["src/renderer/**/*.{ts,tsx}"],
    ignores: ["src/renderer/src/components/ui/**"],
    plugins: { shadcn },
    rules: {
      "shadcn/no-arbitrary-values": "error",
    },
  },
  {
    files: ["src/main/**", "src/preload/**", "*.config.*"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    files: ["src/renderer/src/components/ui/**"],
    rules: {
      "react/jsx-sort-props": "off",
      "react-hooks/purity": "off",
    },
  },
];
