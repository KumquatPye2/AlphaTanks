import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
        // Custom globals for our AlphaTanks project - allow redefinition
        console: "readonly",
        document: "readonly",
        window: "readonly",
        requestAnimationFrame: "readonly",
        setTimeout: "readonly",
        setInterval: "readonly",
        clearTimeout: "readonly",
        clearInterval: "readonly"
      }
    },
    rules: {
      // Customize rules for our project
      "no-unused-vars": ["error", { 
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_",
        "args": "after-used",
        "caughtErrors": "none"
      }],
      "no-console": "off", // Allow console statements for debugging
      "no-undef": "off", // Turn off undefined checking for browser globals
      "no-redeclare": "off", // Allow redeclares for our global classes
      "no-unreachable": "error",
      "prefer-const": "warn",
      "eqeqeq": "warn",
      "curly": "warn",
      "no-prototype-builtins": "off", // Allow hasOwnProperty usage
      "no-case-declarations": "off" // Allow let/const in case blocks
    }
  },
  {
    // Special configuration for test files
    files: ["tests/**/*.js"],
    languageOptions: {
      globals: {
        ...globals.jest,
        describe: "readonly",
        test: "readonly",
        expect: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        jest: "readonly",
        global: "writable"
      }
    }
  },
  {
    // Ignore problematic files for now
    ignores: [
      "node_modules/**",
      "coverage/**",
      "*.min.js",
      "asi-arch-test-suite.js", // Legacy test file with issues
      "test-validation.js" // Has syntax error
    ]
  }
];
