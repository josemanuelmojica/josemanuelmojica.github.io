import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const referenceRoot = path.join(root, "reference");
const outputPath = path.join(referenceRoot, "FILE_INDEX.json");

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    const absolute = path.join(directory, entry.name);
    if (absolute === outputPath) continue;
    if (entry.isDirectory()) files.push(...(await walk(absolute)));
    if (entry.isFile()) files.push(absolute);
  }

  return files;
}

async function digest(absolute) {
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(absolute)) hash.update(chunk);
  return hash.digest("hex");
}

const files = await walk(referenceRoot);
const entries = [];
let totalBytes = 0;

for (const absolute of files) {
  const details = await stat(absolute);
  totalBytes += details.size;
  entries.push({
    path: path.relative(referenceRoot, absolute).split(path.sep).join("/"),
    bytes: details.size,
    sha256: await digest(absolute),
  });
}

await writeFile(
  outputPath,
  `${JSON.stringify({ schemaVersion: 1, fileCount: entries.length, totalBytes, entries }, null, 2)}\n`,
  "utf8",
);

console.log(`Indexed ${entries.length} reference files (${totalBytes} bytes).`);
