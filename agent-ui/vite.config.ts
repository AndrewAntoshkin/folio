import { resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

const here = fileURLToPath(new URL(".", import.meta.url))

// The built site lands next to the sources so Pages serves it at /agent-ui/.
export default defineConfig({
  root: "app",
  base: "/agent-ui/",
  publicDir: false,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@/lib": `${here}lib`,
      "@/components/agent-ui": `${here}registry/agent-ui`,
    },
  },
  build: {
    outDir: here,
    emptyOutDir: false,
    assetsDir: "assets",
    rollupOptions: {
      input: {
        index: resolve(here, "app/index.html"),
        en: resolve(here, "app/en.html"),
      },
    },
  },
})
