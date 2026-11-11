module.exports = {
  extends: ["react-app", "react-app/jest"],
  plugins: ["import"],
  rules: {
    "import/order": [
      "error",
      {
        groups: [
          "builtin",     // node builtins: path, fs, etc.
          "external",    // node_modules: react, lodash, etc.
          "internal",    // your code (via @/ alias or tsconfig paths)
          ["parent", "sibling"], // ../foo, ./bar
          "index",       // ./
          "type",        // type-only imports
        ],
        pathGroups: [
          { pattern: "react", group: "external", position: "before" },
          { pattern: "react-dom", group: "external", position: "before" },
          { pattern: "react-hooks", group: "external", position: "before" },
          { pattern: "@/**", group: "internal", position: "before" },
        ],
        pathGroupsExcludedImportTypes: ["builtin"],
        "newlines-between": "always",
        alphabetize: { order: "asc", caseInsensitive: true },
      },
    ],
  },
};   