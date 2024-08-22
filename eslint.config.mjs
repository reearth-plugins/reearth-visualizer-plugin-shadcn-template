import config from "eslint-config-reearth";

/** @type { import("eslint").Linter.FlatConfig[] } */
export default [
  ...config,
  {
    ignores: ["node_modules/", "dist/", "dist-ui/", "package/", "public/"],
  },
];
