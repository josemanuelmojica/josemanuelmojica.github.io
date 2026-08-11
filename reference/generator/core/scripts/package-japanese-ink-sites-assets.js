import { cp, mkdir } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "public/maps/japanese-ink-scroll");
const handoff = path.join(root, "sites-handoff/japanese-ink-scroll");
const uploadRoot = path.join(handoff, "upload/maps/japanese-ink-scroll");
const archive = path.join(handoff, "japanese-ink-sites-assets.zip");

await mkdir(path.join(uploadRoot, "base"), { recursive: true });
await mkdir(path.join(uploadRoot, "previews"), { recursive: true });
await cp(path.join(source, "collection.json"), path.join(uploadRoot, "collection.json"));
await cp(path.join(source, "base"), path.join(uploadRoot, "base"), { recursive: true });
await cp(path.join(source, "previews"), path.join(uploadRoot, "previews"), { recursive: true });

for (let index = 1; index <= 8; index += 1) {
  const id = `study-${String(index).padStart(2, "0")}`;
  await cp(path.join(source, `${id}.active-overlay.svg`), path.join(uploadRoot, `${id}.active-overlay.svg`));
  await cp(path.join(source, `${id}.active.json`), path.join(uploadRoot, `${id}.active.json`));
}

const result = spawnSync("zip", ["-q", "-r", "-FS", archive, "maps"], {
  cwd: path.join(handoff, "upload"),
  encoding: "utf8",
});

if (result.status !== 0) {
  throw new Error(result.stderr || `zip exited with ${result.status}`);
}

console.log(`Packaged ${archive}`);
