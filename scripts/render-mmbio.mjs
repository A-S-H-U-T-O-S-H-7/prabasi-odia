import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createCanvas } from "@napi-rs/canvas";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

const source = resolve("public/mmbio.pdf");
const output = resolve("public/mmbio-pages");
const bytes = new Uint8Array(await readFile(source));
const task = getDocument({ data: bytes, useSystemFonts: true });
const document = await task.promise;

await mkdir(output, { recursive: true });

for (let number = 1; number <= document.numPages; number++) {
  const page = await document.getPage(number);
  const viewport = page.getViewport({ scale: 1.2 });
  const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
  const context = canvas.getContext("2d");

  await page.render({ canvasContext: context, viewport, canvas }).promise;
  await writeFile(resolve(output, `page-${number}.webp`), await canvas.encode("webp", 90));
  page.cleanup();
  console.log(`Rendered page ${number} of ${document.numPages}`);
}

await task.destroy();
