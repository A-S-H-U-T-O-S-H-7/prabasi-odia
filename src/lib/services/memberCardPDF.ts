import QRCode from "qrcode";
import puppeteer from "puppeteer-core";
import { renderMemberCardHTML } from "./memberCardTemplate";

interface MemberCardInput {
  name: string;
  memberId: string;
  memberSince: string;
  bloodGroup: string;
  location: string;
  isVerified: boolean;
  photoURL: string;
  baseUrl: string;
}

function resolveChromePath(): string {
  // Set this in .env.local — see setup guide below
  if (process.env.CHROME_EXECUTABLE_PATH) return process.env.CHROME_EXECUTABLE_PATH;

  // Common default install locations, in case env var isn't set
  const guesses = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium-browser",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  ];
  return guesses[0]; // safe default for your Windows setup; override via env var if wrong
}

export async function generateMemberCardPDF(data: MemberCardInput): Promise<Buffer> {
  const verifyUrl = `${data.baseUrl}/member/${encodeURIComponent(data.memberId)}`;
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
    width: 300,
    margin: 2,
    color: { dark: "#4A1942", light: "#FFFFFF" },
  });

  const html = renderMemberCardHTML({
    ...data,
    qrDataUrl,
    bgImageUrl: `${data.baseUrl}/odisha.png`,
    logoIconUrl: `${data.baseUrl}/logoicon.png`,
    svsLogoUrl: `${data.baseUrl}/svslogo.png`,
  });

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: resolveChromePath(),
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 900, height: 500 });
await page.setContent(html);
await page.waitForNetworkIdle({ idleTime: 500 });

    const pdfBuffer = await page.pdf({
      width: "900px",
      height: "500px",
      printBackground: true,
      pageRanges: "1-2",
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}