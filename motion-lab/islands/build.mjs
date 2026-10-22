import { build } from "esbuild";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));

await build({
  absWorkingDir: dir,
  entryPoints: ["entry.jsx"],
  bundle: true,
  format: "esm",
  outfile: path.join(dir, "../islands.js"),
  minify: true,
  jsx: "automatic",
  legalComments: "none",
  define: {
    "process.env.NODE_ENV": '"production"',
  },
});
