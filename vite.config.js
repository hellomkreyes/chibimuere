import { defineConfig } from "vite";
import { resolve } from "node:path";
import { contentPlugin } from "./scripts/content-plugin.js";

export default defineConfig({
  // Repo name for GitHub Pages project sites. Switch to "/" once the
  // custom domain is pointed at the site.
  base: "/chibimuere/",
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
