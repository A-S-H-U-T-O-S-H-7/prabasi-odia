import { existsSync, readFileSync } from "node:fs";
import { extname, join } from "node:path";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import QRCode from "qrcode";
import puppeteer, { type Page } from "puppeteer-core";
import { renderMemberCardHTML } from "./memberCardTemplate";

export interface MemberCardInput {
  name: string;
  memberId: string;
  memberSince: string;
  bloodGroup: string;
  location: string;
  communityName?: string;
  isVerified: boolean;
  photoURL: string;
  baseUrl: string;
}

function resolveChromePath(): string {
  const configured = process.env.CHROME_EXECUTABLE_PATH?.trim();
  const guesses = [
    configured,
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium-browser",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  ].filter(Boolean) as string[];

  return guesses.find((path) => existsSync(path)) || guesses[0];
}

function mimeFromExt(filePath: string) {
  const ext = extname(filePath).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  if (ext === ".svg") return "image/svg+xml";
  return "image/png";
}

function fileToDataUrl(fileName: string): string {
  const filePath = join(process.cwd(), "public", fileName);
  const buffer = readFileSync(filePath);
  return `data:${mimeFromExt(filePath)};base64,${buffer.toString("base64")}`;
}

async function urlToDataUrl(url: string): Promise<string> {
  if (!url) return "";
  if (url.startsWith("data:")) return url;

  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) return "";
    const buffer = Buffer.from(await response.arrayBuffer());
    const mime = response.headers.get("content-type") || "image/jpeg";
    return `data:${mime.split(";")[0]};base64,${buffer.toString("base64")}`;
  } catch (error) {
    console.error("Failed to inline member photo:", error);
    return "";
  }
}

async function waitForCardAssets(page: Page) {
  await page.evaluate(async () => {
    if (document.fonts?.ready) {
      await document.fonts.ready.catch(() => undefined);
    }

    await Promise.all(
      Array.from(document.images).map(
        (img) =>
          img.complete ||
          new Promise((resolve) => {
            img.onload = () => resolve(null);
            img.onerror = () => resolve(null);
          })
      )
    );
  });
}

async function withCardPage<T>(
  data: MemberCardInput,
  render: (page: Page) => Promise<T>
): Promise<T> {
  const verifyUrl = `${data.baseUrl.replace(/\/$/, "")}/member/${encodeURIComponent(data.memberId)}`;
  const [qrDataUrl, photoURL] = await Promise.all([
    QRCode.toDataURL(verifyUrl, {
      width: 320,
      margin: 1,
      color: { dark: "#4A1942", light: "#FFFFFF" },
      errorCorrectionLevel: "M",
    }),
    urlToDataUrl(data.photoURL),
  ]);

  const html = renderMemberCardHTML({
    name: data.name,
    memberId: data.memberId,
    memberSince: data.memberSince,
    bloodGroup: data.bloodGroup,
    location: data.location,
    communityName: data.communityName,
    isVerified: data.isVerified,
    photoURL,
    qrDataUrl,
    bgImageUrl: fileToDataUrl("odisha.png"),
    logoIconUrl: fileToDataUrl("logoicon.png"),
    svsLogoUrl: fileToDataUrl("svslogo.png"),
  });

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: resolveChromePath(),
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--font-render-hinting=none"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 900, height: 500, deviceScaleFactor: 1 });
    await page.setContent(html, { waitUntil: "load" });
    await waitForCardAssets(page);
    return await render(page);
  } finally {
    await browser.close();
  }
}

function dataUrlBytes(dataUrl: string): Buffer | null {
  const value = dataUrl.split(",", 2)[1];
  return value ? Buffer.from(value, "base64") : null;
}

function fitTextSize(font: any, text: string, maxWidth: number, initial: number, minimum = 12) {
  let size = initial;
  while (size > minimum && font.widthOfTextAtSize(text, size) > maxWidth) size -= 1;
  return size;
}

async function embedRemotePhoto(document: PDFDocument, photoUrl: string) {
  if (!photoUrl) return null;
  const bytes = dataUrlBytes(photoUrl);
  if (!bytes) return null;

  try {
    return /^data:image\/jpe?g/i.test(photoUrl)
      ? await document.embedJpg(bytes)
      : await document.embedPng(bytes);
  } catch {
    return null;
  }
}

export async function generateMemberCardPDF(data: MemberCardInput): Promise<Buffer> {
  // Keep email generation independent of Chrome/Puppeteer: production hosts
  // often have no browser executable, which otherwise prevents email delivery.
  const document = await PDFDocument.create();
  const [serif, sans, bold, qrDataUrl, photoDataUrl] = await Promise.all([
    document.embedFont(StandardFonts.TimesRomanBold),
    document.embedFont(StandardFonts.Helvetica),
    document.embedFont(StandardFonts.HelveticaBold),
    QRCode.toDataURL(`${data.baseUrl.replace(/\/$/, "")}/member/${encodeURIComponent(data.memberId)}`, {
      width: 220,
      margin: 1,
      color: { dark: "#4A1942", light: "#FFFFFF" },
      errorCorrectionLevel: "M",
    }),
    urlToDataUrl(data.photoURL),
  ]);

  const [logoImage, svsImage, qrImage, photoImage] = await Promise.all([
    document.embedPng(readFileSync(join(process.cwd(), "public", "logoicon.png"))),
    document.embedPng(readFileSync(join(process.cwd(), "public", "svslogo.png"))),
    document.embedPng(dataUrlBytes(qrDataUrl)!),
    embedRemotePhoto(document, photoDataUrl),
  ]);

  const page = document.addPage([900, 500]);
  page.drawRectangle({ x: 0, y: 0, width: 900, height: 500, color: rgb(0.97, 0.945, 0.89) });
  page.drawCircle({ x: 715, y: 270, size: 225, color: rgb(0.91, 0.72, 0.42), opacity: 0.1 });
  page.drawCircle({ x: 715, y: 270, size: 150, color: rgb(0.29, 0.1, 0.26), opacity: 0.05 });
  page.drawRectangle({ x: 0, y: 0, width: 900, height: 500, borderColor: rgb(0.29, 0.1, 0.26), borderWidth: 3 });

  page.drawRectangle({ x: 340, y: 430, width: 230, height: 48, color: rgb(1, 1, 1), borderColor: rgb(0.9, 0.88, 0.86), borderWidth: 1 });
  page.drawImage(logoImage, { x: 352, y: 439, width: 30, height: 30 });
  page.drawText("Prabasi Odia", { x: 398, y: 446, size: 23, font: serif, color: rgb(0.29, 0.1, 0.26) });

  page.drawRectangle({ x: 46, y: 177, width: 140, height: 140, color: rgb(1, 1, 1), borderColor: rgb(0.9, 0.88, 0.86), borderWidth: 4 });
  if (photoImage) {
    page.drawImage(photoImage, { x: 50, y: 181, width: 132, height: 132 });
  } else {
    page.drawCircle({ x: 116, y: 255, size: 29, color: rgb(0.68, 0.62, 0.67) });
    page.drawCircle({ x: 116, y: 284, size: 16, color: rgb(0.68, 0.62, 0.67) });
  }
  page.drawRectangle({ x: 63, y: 142, width: 106, height: 27, color: rgb(0.92, 0.99, 0.96), borderColor: rgb(0.2, 0.8, 0.58), borderWidth: 1 });
  page.drawText(data.isVerified ? "Verified" : "Unverified", { x: 83, y: 151, size: 12, font: bold, color: data.isVerified ? rgb(0.02, 0.47, 0.34) : rgb(0.45, 0.4, 0.36) });

  const name = data.name || "Member Name";
  const nameSize = fitTextSize(serif, name, 390, 31, 16);
  page.drawText(name, { x: 218, y: 350, size: nameSize, font: serif, color: rgb(0.29, 0.1, 0.26) });
  const rows = [
    ["Member ID", data.memberId],
    ["Blood Group", data.bloodGroup || "—"],
    ["Location", data.location || "Not set"],
    ["Joined", data.memberSince || "Recently"],
    ["Community", data.communityName || "Prabasi Odia Community"],
  ];
  rows.forEach(([label, value], index) => {
    const y = 310 - index * 38;
    page.drawText(label, { x: 218, y, size: 14, font: sans, color: rgb(0.38, 0.32, 0.3) });
    page.drawText("—", { x: 330, y, size: 14, font: sans, color: rgb(0.38, 0.32, 0.3) });
    const valueSize = fitTextSize(bold, value, 275, 15, 10);
    page.drawText(value, { x: 350, y, size: valueSize, font: bold, color: label === "Blood Group" ? rgb(0.86, 0.08, 0.1) : rgb(0.16, 0.08, 0.2) });
  });

  page.drawRectangle({ x: 725, y: 165, width: 132, height: 155, color: rgb(1, 1, 1), borderColor: rgb(0.92, 0.9, 0.88), borderWidth: 1 });
  page.drawImage(qrImage, { x: 736, y: 198, width: 110, height: 110 });
  page.drawText("SCAN TO VERIFY", { x: 741, y: 178, size: 10, font: bold, color: rgb(0.29, 0.1, 0.26) });
  page.drawImage(svsImage, { x: 688, y: 26, width: 38, height: 38 });
  page.drawText("ISSUED BY", { x: 736, y: 48, size: 9, font: bold, color: rgb(0.76, 0.27, 0.05) });
  page.drawText("SAMUDAYIK VIKAS SAMITI", { x: 736, y: 30, size: 11, font: bold, color: rgb(0.29, 0.1, 0.26) });

  const back = document.addPage([900, 500]);
  back.drawRectangle({ x: 0, y: 0, width: 900, height: 500, color: rgb(0.29, 0.1, 0.26) });
  back.drawRectangle({ x: 0, y: 0, width: 900, height: 500, borderColor: rgb(0.91, 0.64, 0.24), borderWidth: 3 });
  back.drawText("Terms & Use", { x: 365, y: 440, size: 25, font: serif, color: rgb(1, 1, 1) });
  const terms = [
    "This card certifies active membership in the Prabasi Odia community network.",
    "It is valid only for the named member and is non-transferable.",
    "Present it at community meetups, events, and for member-only benefits.",
    "Report a lost, stolen, or misused card to Samudayik Vikas Samiti.",
    "Membership is subject to the community's code of conduct.",
  ];
  terms.forEach((term, index) => {
    const y = 355 - index * 58;
    back.drawText("•", { x: 70, y, size: 20, font: bold, color: rgb(0.91, 0.64, 0.24) });
    back.drawText(term, { x: 96, y: y + 3, size: 15, font: sans, color: rgb(0.96, 0.94, 0.96) });
  });
  back.drawText(`ID: ${data.memberId}`, { x: 40, y: 32, size: 12, font: sans, color: rgb(0.85, 0.8, 0.85) });
  back.drawImage(svsImage, { x: 697, y: 20, width: 32, height: 32 });
  back.drawText("SAMUDAYIK VIKAS SAMITI", { x: 740, y: 30, size: 10, font: bold, color: rgb(0.96, 0.94, 0.96) });

  document.setTitle(`Prabasi Odia Member Card - ${data.memberId}`);
  return Buffer.from(await document.save());
}

export async function generateMemberCardPng(data: MemberCardInput): Promise<Buffer> {
  return withCardPage(data, async (page) => {
    const front = await page.$(".card.front");
    if (!front) {
      throw new Error("Member card front was not rendered");
    }
    const png = await front.screenshot({ type: "png", omitBackground: true });
    return Buffer.from(png);
  });
}
