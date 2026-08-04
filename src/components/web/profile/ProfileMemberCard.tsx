"use client";

import Image from "next/image";
import { Download, CheckCircle, MapPin, Calendar, Droplet, IdCard } from "lucide-react";
import { useRef, useState, type CSSProperties } from "react";

interface ProfileMemberCardProps {
  profile: any;
}

// Theme drawn from the same Pattachitra / temple palette as the rest of the site
const THEME = {
  primary: "#4A1942",
  terracotta: "#C1440E",
  gold: "#E8A33D",
};

// --- STYLE FIXES ---
// 1. For DARK text (labels, "Member ID", "Blood Group"):
// This creates a thick solid white shadow behind the text for absolute readability.
const darkTextHalo: CSSProperties = {
  textShadow: "0 0 4px white, 0 0 4px white, 0 0 8px white, 0 0 12px white",
};

// 2. For BOLD text (Name, Values, ID Number):
// This creates a soft glow around the text, making dark letters pop on any background.
const boldTextHalo: CSSProperties = {
  textShadow:
    "0 0 6px rgba(255,255,255,0.9), 0 0 3px rgba(255,255,255,0.9), 0 1px 2px rgba(255,255,255,0.8)",
};

// Tailwind 4 may serialize computed colors as oklab()/oklch(). html2canvas
// currently only understands older RGB-style color functions, so convert those
// computed values in its detached clone before it starts painting the card.
const toSrgbChannel = (value: number) => {
  const linear = Math.max(0, Math.min(1, value));
  const gammaCorrected =
    linear <= 0.0031308 ? linear * 12.92 : 1.055 * linear ** (1 / 2.4) - 0.055;
  return Math.round(gammaCorrected * 255);
};

const oklabToRgba = (lightness: number, a: number, b: number, alpha = 1) => {
  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;

  const red = toSrgbChannel(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s);
  const green = toSrgbChannel(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s);
  const blue = toSrgbChannel(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
};

const labToRgba = (lightness: number, a: number, b: number, alpha = 1) => {
  const delta = 6 / 29;
  const inverseLab = (value: number) =>
    value > delta ? value ** 3 : 3 * delta ** 2 * (value - 4 / 29);

  const fy = (lightness + 16) / 116;
  const xD50 = 0.96422 * inverseLab(fy + a / 500);
  const yD50 = inverseLab(fy);
  const zD50 = 0.82521 * inverseLab(fy - b / 200);

  // CSS Lab uses a D50 white point; convert it to sRGB's D65 white point.
  const x = 0.9555766 * xD50 - 0.0230393 * yD50 + 0.0631636 * zD50;
  const y = -0.0282895 * xD50 + 1.0099416 * yD50 + 0.0210077 * zD50;
  const z = 0.0122982 * xD50 - 0.020483 * yD50 + 1.3299098 * zD50;

  const red = toSrgbChannel(3.2404542 * x - 1.5371385 * y - 0.4985314 * z);
  const green = toSrgbChannel(-0.969266 * x + 1.8760108 * y + 0.041556 * z);
  const blue = toSrgbChannel(0.0556434 * x - 0.2040259 * y + 1.0572252 * z);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
};

const parseCssNumber = (value: string, percentageScale = 1) =>
  value.endsWith("%") ? (Number(value.slice(0, -1)) / 100) * percentageScale : Number(value);

const normalizeCanvasColor = (value: string) =>
  value
    .replace(/oklab\(([^)]+)\)/g, (_, contents: string) => {
      const parts = contents.trim().replace("/", " / ").split(/\s+/);
      const slashIndex = parts.indexOf("/");
      const [lightness, a, b] = parts.slice(0, slashIndex === -1 ? 3 : slashIndex).map(Number);
      const alpha = slashIndex === -1 ? 1 : Number(parts[slashIndex + 1]);
      return [lightness, a, b].every(Number.isFinite) && Number.isFinite(alpha)
        ? oklabToRgba(lightness, a, b, alpha)
        : _;
    })
    .replace(/oklch\(([^)]+)\)/g, (_, contents: string) => {
      const parts = contents.trim().replace("/", " / ").split(/\s+/);
      const slashIndex = parts.indexOf("/");
      const [lightness, chroma, hue] = parts.slice(0, slashIndex === -1 ? 3 : slashIndex).map(Number);
      const alpha = slashIndex === -1 ? 1 : Number(parts[slashIndex + 1]);
      if (![lightness, chroma, hue, alpha].every(Number.isFinite)) return _;

      const radians = (hue * Math.PI) / 180;
      return oklabToRgba(lightness, chroma * Math.cos(radians), chroma * Math.sin(radians), alpha);
    })
    .replace(/lab\(([^)]+)\)/g, (_, contents: string) => {
      const parts = contents.trim().replace("/", " / ").split(/\s+/);
      const slashIndex = parts.indexOf("/");
      const [lightnessValue, a, b] = parts.slice(0, slashIndex === -1 ? 3 : slashIndex);
      const lightness = parseCssNumber(lightnessValue, 100);
      const alpha = slashIndex === -1 ? 1 : parseCssNumber(parts[slashIndex + 1]);
      return [lightness, Number(a), Number(b)].every(Number.isFinite) && Number.isFinite(alpha)
        ? labToRgba(lightness, Number(a), Number(b), alpha)
        : _;
    })
    .replace(/lch\(([^)]+)\)/g, (_, contents: string) => {
      const parts = contents.trim().replace("/", " / ").split(/\s+/);
      const slashIndex = parts.indexOf("/");
      const [lightnessValue, chromaValue, hueValue] = parts.slice(0, slashIndex === -1 ? 3 : slashIndex);
      const lightness = parseCssNumber(lightnessValue, 100);
      const chroma = Number(chromaValue);
      const hue = Number(hueValue);
      const alpha = slashIndex === -1 ? 1 : parseCssNumber(parts[slashIndex + 1]);
      if (![lightness, chroma, hue, alpha].every(Number.isFinite)) return _;

      const radians = (hue * Math.PI) / 180;
      return labToRgba(lightness, chroma * Math.cos(radians), chroma * Math.sin(radians), alpha);
    });

const prepareCardForCanvas = (clonedDocument: Document) => {
  clonedDocument
    .querySelectorAll<HTMLElement>("[data-member-card], [data-member-card] *")
    .forEach((element) => {
      const styles = clonedDocument.defaultView?.getComputedStyle(element);
      if (!styles) return;

      for (const property of styles) {
        const value = styles.getPropertyValue(property);
      if (/\b(?:oklab|oklch|lab|lch)\(/.test(value)) {
          element.style.setProperty(property, normalizeCanvasColor(value));
        }
      }
    });
};

// 3. Function to format date nicely (Matches your ProfileActivity)
const formatMemberDate = (dateString?: string) => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  } catch {
    return "";
  }
};

export default function ProfileMemberCard({ profile }: ProfileMemberCardProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const downloadCard = async (format: "png" | "pdf") => {
    if (!cardRef.current || isDownloading) return;

    setIsDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        onclone: prepareCardForCanvas,
      });

      const fileName = `${(profile?.displayName || "member-card").replace(/\s+/g, "-").toLowerCase()}-member-card`;
      const imageData = canvas.toDataURL("image/png", 1.0);

      if (format === "png") {
        const link = document.createElement("a");
        link.href = imageData;
        link.download = `${fileName}.png`;
        link.click();
      } else {
        const { jsPDF } = await import("jspdf");
        const pdf = new jsPDF({
          orientation: canvas.width > canvas.height ? "landscape" : "portrait",
          unit: "px",
          format: [canvas.width, canvas.height],
        });

        pdf.addImage(imageData, "PNG", 0, 0, canvas.width, canvas.height);
        pdf.save(`${fileName}.pdf`);
      }
    } finally {
      setIsDownloading(false);
    }
  };

  // Pre-calculate formatted date
  const joinedDate = formatMemberDate(profile?.createdAt);

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50 p-6 shadow-sm w-full mx-auto">
      <h3 className="text-sm font-semibold text-[#2A1636] mb-4">Member Card</h3>

      {/* --- CARD AREA --- */}
      <div
        ref={cardRef}
        data-member-card
        className="relative w-full aspect-[7/3] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-black/10"
      >

        {/* Background layer - RIGHT ALIGNED */}
        <div className="absolute inset-0 bg-[#F7F1E3] overflow-hidden">
          <Image
            src="/odisha.png"
            alt="Odisha"
            fill
            className="object-contain  scale-105 blur-[1px]"
            sizes="(max-width: 768px) 100vw, 1024px"
            priority
          />
          {/* REVERSED Gradient: Solid Cream on Left, Fades to Transparent on Right to show Image */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#F7F1E3] via-[#F7F1E3]/75 to-transparent" />
        </div>

        {/* --- TOP CENTER: Prabasi Odia icon + wordmark --- */}
        <div className="absolute top-0 left-0 right-0 z-20 flex justify-center pt-3.5">
          <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md border border-white/60 rounded-full pl-2 pr-4 py-1.5 shadow-lg">
            <div className="relative h-6 w-6 shrink-0 rounded-full overflow-hidden bg-white">
              <Image src="/logoicon.png" alt="" fill className="object-contain" />
            </div>
            <span
              className="text-sm font-bold tracking-wide font-serif"
              style={{ color: THEME.primary }}
            >
              Prabasi Odia
            </span>
          </div>
        </div>

        {/* --- BOTTOM RIGHT CORNER: issuer credit --- */}
        <div className="absolute bottom-3 right-3.5 z-20 flex items-center gap-2">
          <div className="relative h-8 w-8 sm:h-9 sm:w-9 shrink-0 rounded-full bg-white ring-2 ring-white/70 shadow-md overflow-hidden">
            <Image src="/svslogo.png" alt="Samudayik Vikas Samiti" fill className="object-contain p-1" sizes="36px" />
          </div>
          <div className="leading-tight text-left" style={boldTextHalo}>
            <p className="text-[7.5px] sm:text-[8px] tracking-wide uppercase font-semibold text-[#C1440E]">
              Issued by
            </p>
            <p className="text-[9px] sm:text-[10px] font-bold uppercase leading-tight text-[#4A1942]">
              Samudayik Vikas Samiti
            </p>
          </div>
        </div>

        {/* --- MAIN CONTENT ROW --- */}
        <div className="absolute left-4 top-[68px] bottom-[52px] z-10 grid w-[66%] grid-cols-[76px_minmax(0,1fr)] items-center gap-3 rounded-xl bg-[rgba(255,248,242,0.82)] px-3 py-2 sm:left-5 sm:w-[62%] sm:grid-cols-[88px_minmax(0,1fr)] sm:gap-4 sm:px-4 md:grid-cols-[96px_minmax(0,1fr)]">

          {/* LEFT — user photo */}
          <div className="self-center">
            <div className="relative h-[76px] w-[76px] overflow-hidden rounded-xl border-[3px] border-white bg-white shadow-lg sm:h-[88px] sm:w-[88px] md:h-[96px] md:w-[96px]">
              {profile?.photoURL ? (
                <Image
                  src={profile.photoURL}
                  alt={profile?.displayName || "Member"}
                  fill
                  className="object-cover"
                  sizes="112px"
                />
              ) : (
                <div className="flex items-center justify-center h-full w-full bg-[#4A1942]/10 text-[#4A1942]">
                  <span className="text-3xl">👤</span>
                </div>
              )}
            </div>
            <div className="mt-2 flex justify-center">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold border ${
                  profile?.isVerified
                    ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                    : "bg-white/80 border-[#DDD0BC] text-[#7A6A5E]"
                }`}
              >
                {profile?.isVerified ? (
                  <>
                    <CheckCircle className="w-3 h-3" /> Verified
                  </>
                ) : (
                  "Unverified"
                )}
              </span>
            </div>
          </div>

          {/* MIDDLE — name + detail lines */}
          <div className="min-w-0 space-y-1.5">
            {/* Name with glow */}
            <h2
              className="truncate font-serif text-lg font-bold leading-tight tracking-tight text-[#4A1942] sm:text-xl md:text-2xl"
              style={boldTextHalo}
            >
              {profile?.displayName || "Member Name"}
            </h2>

            {/* Details with fixed visibility - Labels have darkTextHalo, Values have boldTextHalo */}
            <div className="space-y-1 text-[11px] sm:text-xs md:text-sm">
              
              <div className="flex min-w-0 items-center gap-1.5">
                <IdCard className="w-3.5 h-3.5 shrink-0 text-[#C1440E]" />
                <span className="text-[#2A1636] opacity-60" style={darkTextHalo}>Member ID —</span>
                <span className="truncate font-mono font-medium text-[#2A1636]" style={boldTextHalo}>{profile?.memberId || "Pending"}</span>
              </div>

              <div className="flex min-w-0 items-center gap-1.5">
                <Droplet className="w-3.5 h-3.5 shrink-0 text-[#C1440E]" />
                <span className="text-[#2A1636] opacity-60" style={darkTextHalo}>Blood Group —</span>
                <span className="font-semibold text-red-600" style={boldTextHalo}>{profile?.bloodGroup || "—"}</span>
              </div>

              <div className="flex min-w-0 items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 shrink-0 text-[#C1440E]" />
                <span className="text-[#2A1636] opacity-60" style={darkTextHalo}>Location —</span>
                <span className="text-[#2A1636] truncate" style={boldTextHalo}>{profile?.currentCity || "Not set"}</span>
              </div>

              <div className="flex min-w-0 items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 shrink-0 text-[#C1440E]" />
                <span className="text-[#2A1636] opacity-60" style={darkTextHalo}>Joined —</span>
                <span className="text-[#2A1636]" style={boldTextHalo}>
                  {joinedDate || "Recently"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Download Buttons */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={() => downloadCard("png")}
          disabled={isDownloading}
          style={{ background: `linear-gradient(120deg, ${THEME.primary} 0%, ${THEME.terracotta} 100%)` }}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white text-sm font-semibold hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:scale-100 cursor-pointer disabled:cursor-not-allowed"
        >
          {isDownloading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Downloading...
            </span>
          ) : (
            <>
              <Download className="w-4 h-4" /> Download as Image
            </>
          )}
        </button>
        <button
          onClick={() => downloadCard("pdf")}
          disabled={isDownloading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold border border-[#6B1E5B]/25 text-[#6B1E5B] bg-white hover:bg-[#6B1E5B]/5 transition-all duration-300 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" /> Download as PDF
        </button>
      </div>
    </div>
  );
}
