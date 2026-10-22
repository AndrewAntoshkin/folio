import { build } from "esbuild";
import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));

execSync("npx @tailwindcss/cli -i styles.css -o ../islands.css --minify", {
  cwd: dir,
  stdio: "inherit",
});

await build({
  absWorkingDir: dir,
  entryPoints: ["entry.jsx"],
  bundle: true,
  format: "esm",
  outfile: path.join(dir, "../islands.js"),
  minify: true,
  jsx: "automatic",
  legalComments: "none",
  loader: { ".tsx": "tsx" },
  alias: {
    "@/lib/utils": path.join(dir, "shims/lib/utils.js"),
  },
  define: {
    "process.env.NODE_ENV": '"production"',
  },
});
