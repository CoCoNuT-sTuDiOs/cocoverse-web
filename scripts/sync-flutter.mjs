import { cpSync, existsSync, rmSync } from "node:fs";

const src = process.argv[2] ?? process.env.FLUTTER_BUILD_DIR;
if (!src || !existsSync(src)) {
  console.error("Usage: npm run sync-flutter -- <path to example/build/web>");
  process.exit(1);
}
rmSync("public/flutter", { recursive: true, force: true });
cpSync(src, "public/flutter", { recursive: true });
console.log(`Copied ${src} to public/flutter`);