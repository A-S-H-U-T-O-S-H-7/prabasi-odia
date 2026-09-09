declare module 'fontkit' {
  export interface Font {
    unitsPerEm: number;
    layout(text: string): {
      glyphs: { path: { toSVG(): string } }[];
      positions: { xAdvance: number; yAdvance: number; xOffset: number; yOffset: number }[];
      advanceWidth: number;
    };
  }
  export function create(buffer: Buffer): Font;
}
