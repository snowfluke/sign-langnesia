/// <reference types='bun-types' />
import { existsSync, rmSync } from "node:fs";
import { join, resolve } from "node:path/posix";

const ROOTDIR = resolve(import.meta.dir, "..");
const SOURCEDIR = `${ROOTDIR}/src`;
const OUTDIR = join(ROOTDIR, "lib");

// Remove old content
if (existsSync(OUTDIR)) rmSync(OUTDIR, { recursive: true });

// Emit all .d.ts in one native tsc pass (tsconfig.build.json scopes it to
// src/ rooted at lib/).
const tsc = Bun.spawnSync(["bunx", "tsc", "-p", join(ROOTDIR, "tsconfig.build.json")], {
  cwd: ROOTDIR,
  stdout: "inherit",
  stderr: "inherit",
});
if (tsc.exitCode !== 0) process.exit(tsc.exitCode ?? 1);

// Transpile files concurrently
const transpiler = new Bun.Transpiler({
  loader: "ts",
  target: "node",
  minifyWhitespace: true,
  treeShaking: true,
});

for (const path of new Bun.Glob("**/*.ts").scanSync(SOURCEDIR)) {
  const src = await Bun.file(`${SOURCEDIR}/${path}`).text();
  const js = transpiler.transformSync(src);
  if (js.length !== 0) {
    const outPath = `${OUTDIR}/${path.substring(0, path.lastIndexOf("."))}.js`;
    await Bun.write(outPath, js);
  }
}

console.log(`Built ${OUTDIR}`);
