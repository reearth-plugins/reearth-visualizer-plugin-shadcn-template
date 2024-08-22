import path from "path";

import react from "@vitejs/plugin-react";
import { Plugin, defineConfig } from "vite";
import cdn from "vite-plugin-cdn-import";
import { viteSingleFile } from "vite-plugin-singlefile";

import pkg from "../package.json";

const extensionName = process.env.EXTENSION_NAME || "";
const uiName = process.env.UI_NAME || "";

const serverHeaders = (): Plugin => ({
  name: "server-headers",
  configureServer(server) {
    server.middlewares.use((_req, res, next) => {
      res.setHeader("Service-Worker-Allowed", "/");
      next();
    });
  },
});

export default defineConfig({
  plugins: [
    react(),
    serverHeaders(),
    viteSingleFile(),
    cdn({
      modules: ["react", "react-dom"],
    }),
  ],
  define: {
    "process.env.VERSION": JSON.stringify(pkg.version),
  },
  root: path.resolve(__dirname, "../src/extensions", extensionName, uiName),
  appType: "spa",
  publicDir: false,
  build: {
    outDir: path.resolve(__dirname, "../dist-ui", extensionName, uiName),
    emptyOutDir: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "../src"),
    },
  },
});
