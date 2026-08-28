// Inline every photo the source page references, so the mockup that ships is a
// single file a buyer can open from a USB stick.
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const src = resolve(here, "mockup.src.html");
const out = resolve(here, "../../archizen-mockup.html");
const photos = resolve(here, "../../photos/archizen");

let html = readFileSync(src, "utf8");
let count = 0;
html = html.replace(/photos\/([\w-]+)\.jpg/g, (_, name) => {
    const b64 = readFileSync(resolve(photos, name + ".jpg")).toString("base64");
    count++;
    return "data:image/jpeg;base64," + b64;
});
writeFileSync(out, html);
console.log(`inlined ${count} references -> ${out} (${(html.length / 1e6).toFixed(2)} MB)`);
