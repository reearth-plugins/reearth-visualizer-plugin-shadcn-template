import config from "eslint-config-reearth";

/** @type { import("eslint").Linter.Config[] } */
export default [
  ...config("@visualizer-plugin", { reactRecommended: true }),
  { ignores: ["node_modules/", "dist/", "dist-ui/", "package/", "public/", "scripts/"] },
];
