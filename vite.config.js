import { defineConfig } from "vite";
import { resolve } from "node:path";
import { contentPlugin } from "./scripts/content-plugin.js";

export default defineConfig({
  // Served from the root of chibimuere.com (custom domain via public/CNAME).
  base: "/",
  plugins: [contentPlugin("src/content.json")],
  build: {
    rolldownOptions: {
      input: {
        main: resolve(import.meta.dirname, "index.html"),
        resume: resolve(import.meta.dirname, "resume.html"),
        notFound: resolve(import.meta.dirname, "404.html"),
      },
    },
  },
});
