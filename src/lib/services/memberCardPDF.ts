import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PDFDocument } from 'pdf-lib';
import QRCode from 'qrcode';
import sharp from 'sharp';
import { CARD_WIDTH, CARD_DESIGN_VERSION, renderMemberCardFaces } from './memberCardTemplate';

export interface MemberCardInput {
  name: string;
  memberId: string;
  memberSince: string;
  bloodGroup: string;
  location: string;
  communityName?: string;
  residencyStatus?: 'RI' | 'NRI';
  isVerified: boolean;
  photoURL: string;
  baseUrl: string;
}

const localAssets = new Map<string, string>();
function localImage(file: string): string {
  if (!localAssets.has(file)) localAssets.set(file, `data:image/png;base64,${readFileSync(join(process.cwd(), 'public', file)).toString('base64')}`);
  return localAssets.get(file)!;
}

async function memberPhoto(url: string): Promise<string> {
  if (!url) return '';
  let bytes: Buffer;
  if (/^data:image\/(png|jpeg|webp);base64,/i.test(url)) {
    bytes = Buffer.from(url.slice(url.indexOf(',') + 1), 'base64');
  } else {
    // Profile uploads and Google avatars are the supported image sources.
    const parsed = new URL(url);
    const allowed = parsed.hostname === 'firebasestorage.googleapis.com' || /^lh[3-6]\.googleusercontent\.com$/.test(parsed.hostname);
    if (parsed.protocol !== 'https:' || !allowed) throw new Error('Unsupported member photo URL');
    const response = await fetch(url, { cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(12_000) });
    if (!response.ok) throw new Error('Could not load member photo. Please try again.');
    bytes = Buffer.from(await response.arrayBuffer());
  }
  if (bytes.length > 12 * 1024 * 1024) throw new Error('Member photo is too large');
  // Respect camera orientation and contain the entire image, including the top.
  const png = await sharp(bytes, { limitInputPixels: 40_000_000 }).rotate().resize(486, 642, { fit: 'inside', withoutEnlargement: true }).png().toBuffer();
  return `data:image/png;base64,${png.toString('base64')}`;
}

export async function renderMemberCardImages(data: MemberCardInput) {
  const verifyUrl = `${data.baseUrl.replace(/\/$/, '')}/member/${encodeURIComponent(data.memberId)}`;
  const [photoURL, qrDataUrl] = await Promise.all([
    memberPhoto(data.photoURL),
    QRCode.toDataURL(verifyUrl, { width: 504, margin: 4, color: { dark: '#452330', light: '#FFFFFF' }, errorCorrectionLevel: 'M' }),
  ]);
  const faces = renderMemberCardFaces({ ...data, photoURL, qrDataUrl, logoUrl: localImage('logo.png'), odishaArtUrl: localImage('images/member-card/odisha-heritage.png'), jagannathArtUrl: localImage('images/member-card/odisha-jagannath-v2.png'), svsLogoUrl: localImage('svslogo.png') });
  // One source image for every destination; no browser screenshots or separate PDF layout.
  const [front, back] = await Promise.all([faces.front, faces.back].map(svg => sharp(Buffer.from(svg), { density: 108 }).png({ palette: true, quality: 90, effort: 1, dither: 0 }).toBuffer()));
  return { front, back };
}

export async function memberCardImagesToPDF(images: { front: Buffer; back: Buffer }, memberId: string): Promise<Buffer> {
  const document = await PDFDocument.create();
  for (const bytes of [images.front, images.back]) {
    const image = await document.embedPng(bytes);
    const page = document.addPage([CARD_WIDTH * 0.75, CARD_WIDTH * 0.75 * image.height / image.width]);
    page.drawImage(image, { x: 0, y: 0, width: page.getWidth(), height: page.getHeight() });
  }
  document.setTitle(`Prabasi Odia Member Card - ${memberId}`);
  document.setSubject(CARD_DESIGN_VERSION);
  document.setCreator('Prabasi Odia');
  return Buffer.from(await document.save());
}

export async function generateMemberCardBundle(data: MemberCardInput) {
  const images = await renderMemberCardImages(data);
  return { ...images, pdf: await memberCardImagesToPDF(images, data.memberId), designVersion: CARD_DESIGN_VERSION };
}

export async function generateMemberCardPDF(data: MemberCardInput): Promise<Buffer> {
  return (await generateMemberCardBundle(data)).pdf;
}

export async function generateMemberCardPng(data: MemberCardInput): Promise<Buffer> {
  return (await renderMemberCardImages(data)).front;
}
