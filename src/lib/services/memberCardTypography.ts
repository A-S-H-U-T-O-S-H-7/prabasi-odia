import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { create, type Font } from 'fontkit';

export type CardFont = 'body' | 'bold' | 'title';
const fonts: Partial<Record<CardFont, Font>> = {};
const files = { body: 'poppins-regular.woff', bold: 'poppins-semibold.woff', title: 'libre-baskerville.woff' };
function fontFor(kind: CardFont): Font {
  return fonts[kind] ??= create(readFileSync(join(process.cwd(), 'public/fonts/member-card', files[kind])));
}
export function measureCardText(text: string, size: number, font: CardFont = 'body') {
  const face = fontFor(font);
  return face.layout(text).advanceWidth * size / face.unitsPerEm;
}

// Outlines use bundled fonts, so preview and PDF never depend on host fonts.
export function cardText(text: string, x: number, y: number, size: number, color: string, font: CardFont = 'body', maxWidth?: number): string {
  const face = fontFor(font);
  const run = face.layout(String(text));
  const scale = Math.min(size / face.unitsPerEm, maxWidth ? maxWidth / Math.max(run.advanceWidth, 1) : Infinity);
  let cursor = 0;
  const paths = run.glyphs.map((glyph, i) => {
    const position = run.positions[i];
    const path = `<path transform="translate(${cursor + position.xOffset},${position.yOffset})" d="${glyph.path.toSVG()}"/>`;
    cursor += position.xAdvance;
    return path;
  }).join('');
  return `<g fill="${color}" transform="translate(${x},${y}) scale(${scale},${-scale})">${paths}</g>`;
}

export function wrapCardText(text: string, width: number, size: number, font: CardFont = 'body'): string[] {
  const words = String(text).trim().split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (line && measureCardText(next, size, font) > width) { lines.push(line); line = word; }
    else line = next;
  }
  if (line) lines.push(line);
  return lines;
}
