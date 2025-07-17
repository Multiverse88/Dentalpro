import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react/configs/recommended.js";
import hooksPlugin from "eslint-plugin-react-hooks";
import refreshPlugin from "eslint-plugin-react-refresh";
import prettierConfig from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";

export default [
  {
    ignores: ["dist/", ".eslintrc.cjs"],
  },
  ...tseslint.configs.recommended,
  pluginReact,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2020,
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      "react-hooks": hooksPlugin,
      "react-refresh": refreshPlugin,
      "prettier": prettierPlugin,
    },
    rules: {
      ...hooksPlugin.configs.recommended.rules,
      "react-refresh/only-export-components": "warn",
      "prettier/prettier": "error",
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "@typescript-eslint/no-unused-vars": "warn"
    },
    settings: {
      react: {
        version: "detect"
      }
    }
  },
  prettierConfig,
];
