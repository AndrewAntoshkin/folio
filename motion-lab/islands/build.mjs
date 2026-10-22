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
    "motion/react": path.join(dir, "shims/motion-react.js"),
    "next/image": path.join(dir, "shims/next-image.jsx"),
    "next/link": path.join(dir, "shims/next-link.jsx"),
    "next/navigation": path.join(dir, "shims/next-navigation.js"),
    "next/font/google": path.join(dir, "shims/next-font.js"),
    "next-themes": path.join(dir, "shims/next-themes.js"),
    "@tabler/icons-react": path.join(dir, "shims/tabler-icons.jsx"),
  },
  define: {
    "process.env.NODE_ENV": '"production"',
  },
});
