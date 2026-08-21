import { existsSync, readFileSync } from "node:fs";
import { extname, join } from "node:path";
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
    await page.setViewport({ width: 900, height: 500, deviceScaleFactor: 2 });
    await page.setContent(html, { waitUntil: "load" });
    await waitForCardAssets(page);
    return await render(page);
  } finally {
    await browser.close();
  }
}

export async function generateMemberCardPDF(data: MemberCardInput): Promise<Buffer> {
  return withCardPage(data, async (page) => {
    const pdfBuffer = await page.pdf({
      width: "900px",
      height: "500px",
      printBackground: true,
      pageRanges: "1-2",
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });
    return Buffer.from(pdfBuffer);
  });
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
