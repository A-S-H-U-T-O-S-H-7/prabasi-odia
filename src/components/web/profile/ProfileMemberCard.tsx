"use client";

import Image from "next/image";
import {
  Download,
  CheckCircle,
  MapPin,
  Calendar,
  Droplet,
  IdCard,
  RotateCw,
  ScrollText,
  ShieldCheck,
  ArrowLeftRight,
} from "lucide-react";
import { useRef, useState, type CSSProperties } from "react";
import { domToCanvas } from "modern-screenshot";

interface ProfileMemberCardProps {
  profile: any;
}

const THEME = {
  primary: "#4A1942",
  terracotta: "#C1440E",
  gold: "#E8A33D",
};

const darkTextHalo: CSSProperties = {
  textShadow: "0 0 2px white, 0 0 4px white, 0 1px 2px white",
};

const boldTextHalo: CSSProperties = {
  textShadow: "0 0 4px rgba(255,255,255,0.9), 0 1px 3px rgba(255,255,255,0.8)",
};

const formatMemberDate = (dateString?: string) => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
};

const TERMS = [
  "This card certifies active membership in the Prabasi Odia community network, issued and maintained by Samudayik Vikas Samiti.",
  "Valid only for the named cardholder. It is non-transferable and must not be shared or lent to another person.",
  "Present this card to verify identity at community meetups, cultural events, and while claiming member-only benefits.",
  "If this card is lost, stolen, or misused, report it to Samudayik Vikas Samiti immediately for it to be blocked.",
  "Membership is subject to the community's code of conduct and may be revoked for violation of its terms.",
];

export default function ProfileMemberCard({ profile }: ProfileMemberCardProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  const flipperRef = useRef<HTMLDivElement>(null);
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);

  const toggleFlip = () => setIsFlipped((prev) => !prev);

  const captureFace = async (faceEl: HTMLElement, bgColor: string) => {
    if (typeof document !== "undefined" && document.fonts?.ready) {
      await document.fonts.ready.catch(() => {});
    }

    return domToCanvas(faceEl, {
      scale: 2,
      backgroundColor: bgColor,
      width: faceEl.scrollWidth,
      height: faceEl.scrollHeight,
    });
  };

  // Function to round corners of a canvas
  const roundCanvasCorners = (canvas: HTMLCanvasElement, radius: number) => {
    const width = canvas.width;
    const height = canvas.height;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const ctx = tempCanvas.getContext('2d');
    
    if (!ctx) return canvas;
    
    // Draw rounded rectangle path
    ctx.beginPath();
    ctx.moveTo(radius, 0);
    ctx.lineTo(width - radius, 0);
    ctx.quadraticCurveTo(width, 0, width, radius);
    ctx.lineTo(width, height - radius);
    ctx.quadraticCurveTo(width, height, width - radius, height);
    ctx.lineTo(radius, height);
    ctx.quadraticCurveTo(0, height, 0, height - radius);
    ctx.lineTo(0, radius);
    ctx.quadraticCurveTo(0, 0, radius, 0);
    ctx.closePath();
    
    // Clip and draw the original canvas
    ctx.clip();
    ctx.drawImage(canvas, 0, 0);
    
    return tempCanvas;
  };

  const downloadCard = async () => {
    const flipper = flipperRef.current;
    const frontEl = frontRef.current;
    const backEl = backRef.current;
    if (!flipper || !frontEl || !backEl || isDownloading) return;

    setIsDownloading(true);
    try {
      const { jsPDF } = await import("jspdf");

      const rect = flipper.getBoundingClientRect();
      const cardWidth = rect.width;
      const cardHeight = rect.height;
      
      const padding = 30;
      const pdfWidth = cardWidth + padding * 2;
      const pdfHeight = cardHeight + padding * 2;

      const uiElements = flipper.querySelectorAll<HTMLElement>('[data-hide-for-pdf]');
      uiElements.forEach(el => el.style.display = 'none');

      const originalFrontVisibility = frontEl.style.visibility;
      const originalBackVisibility = backEl.style.visibility;
      const originalFrontTransform = frontEl.style.transform;
      const originalBackTransform = backEl.style.transform;
      const originalFlipperTransform = flipper.style.transform;
      const originalFlipperTransition = flipper.style.transition;

      // Capture front
      flipper.style.transition = "none";
      flipper.style.transform = "none";
      frontEl.style.transform = "none";
      backEl.style.transform = "none";
      frontEl.style.visibility = "visible";
      backEl.style.visibility = "hidden";
      void flipper.offsetHeight;

      let frontCanvas = await captureFace(frontEl, "#F7F1E3");
      frontCanvas = roundCanvasCorners(frontCanvas, 16 * 2);

      // Capture back
      frontEl.style.visibility = "hidden";
      backEl.style.visibility = "visible";
      void flipper.offsetHeight;

      let backCanvas = await captureFace(backEl, "#4A1942");
      backCanvas = roundCanvasCorners(backCanvas, 16 * 2);

      // Restore
      frontEl.style.visibility = originalFrontVisibility || "visible";
      backEl.style.visibility = originalBackVisibility || "hidden";
      frontEl.style.transform = originalFrontTransform || "";
      backEl.style.transform = originalBackTransform || "rotateY(180deg)";
      flipper.style.transform = isFlipped ? "rotateY(180deg)" : "rotateY(0deg)";
      flipper.style.transition = originalFlipperTransition || "";
      
      uiElements.forEach(el => el.style.display = '');

      const fileName = `${(profile?.displayName || "member-card")
        .replace(/\s+/g, "-")
        .toLowerCase()}-member-card`;

      const pdf = new jsPDF({
        orientation: pdfWidth > pdfHeight ? "landscape" : "portrait",
        unit: "px",
        format: [pdfWidth, pdfHeight],
      });

      pdf.addImage(
        frontCanvas.toDataURL("image/png", 1.0),
        "PNG",
        padding,
        padding,
        cardWidth,
        cardHeight
      );

      pdf.addPage([pdfWidth, pdfHeight], pdfWidth > pdfHeight ? "landscape" : "portrait");
      
      pdf.addImage(
        backCanvas.toDataURL("image/png", 1.0),
        "PNG",
        padding,
        padding,
        cardWidth,
        cardHeight
      );

      pdf.save(`${fileName}.pdf`);
    } catch (error) {
      console.error("Download error:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const joinedDate = formatMemberDate(profile?.createdAt);

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50 p-6 shadow-sm w-full mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[#2A1636]">Member Card</h3>
        <span className="text-[11px] text-[#7A6A5E] hidden sm:flex items-center gap-1">
          <ArrowLeftRight className="w-3 h-3 animate-pulse" /> Tap card to flip
        </span>
      </div>

      <div
        className="relative w-full aspect-[7/3]"
        style={{ perspective: "1800px" }}
      >
        <div
          ref={flipperRef}
          role="button"
          tabIndex={0}
          aria-pressed={isFlipped}
          aria-label={isFlipped ? "Show member details" : "Show terms and use"}
          onClick={toggleFlip}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              toggleFlip();
            }
          }}
          className="relative w-full h-full cursor-pointer transition-transform duration-700 ease-out"
          style={{
            transformStyle: "preserve-3d",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* FRONT FACE */}
          <div
            ref={frontRef}
            className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl"
            style={{ 
              backfaceVisibility: "hidden",
              border: `1px solid ${THEME.primary}`,
              boxSizing: "border-box",
            }}
          >
            <div className="absolute inset-0 bg-[#F7F1E3] overflow-hidden">
              <Image
                src="/odisha.png"
                alt="Odisha"
                fill
                className="object-contain scale-105 blur-[1px]"
                sizes="(max-width: 768px) 100vw, 1024px"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#F7F1E3] via-[#F7F1E3]/75 to-transparent" />
            </div>

            {/* Prabasi Odia wordmark - Increased size */}
            <div className="absolute top-0 left-0 right-0 z-20 flex justify-center pt-3.5">
              <div className="flex items-center gap-3 bg-white/95 backdrop-blur-md border border-white/60 rounded-full pl-3 pr-5 py-2 shadow-lg whitespace-nowrap">
                <div className="relative h-8 w-8 shrink-0 rounded-full overflow-hidden bg-white">
                  <Image src="/logoicon.png" alt="" fill className="object-contain" />
                </div>
                <span
                  className="text-base font-bold tracking-wide font-serif md:text-lg"
                  style={{ color: THEME.primary }}
                >
                  Prabasi Odia
                </span>
              </div>
            </div>

            {/* Flip hint - hidden in PDF - Changed to ArrowLeftRight */}
            <div 
              data-hide-for-pdf
              className="absolute top-3.5 right-3.5 z-20 flex items-center justify-center h-7 w-7 rounded-full bg-white/90 shadow-md text-[#4A1942] animate-bounce"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
            </div>

            {/* Issuer */}
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

            {/* Main content */}
            <div className="absolute left-4 top-[72px] bottom-[52px] z-10 grid w-[66%] grid-cols-[76px_minmax(0,1fr)] items-start gap-3 sm:left-5 sm:w-[62%] sm:grid-cols-[88px_minmax(0,1fr)] sm:gap-4 md:grid-cols-[96px_minmax(0,1fr)]">
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
                        : "bg-white/85 border-[#DDD0BC] text-[#7A6A5E]"
                    }`}
                    style={!profile?.isVerified ? darkTextHalo : undefined}
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

              <div className="min-w-0">
                <h2
                  className="truncate font-serif text-lg font-bold leading-tight tracking-tight text-[#4A1942] sm:text-xl md:text-2xl mb-2"
                  style={boldTextHalo}
                >
                  {profile?.displayName || "Member Name"}
                </h2>

                <div className="space-y-1.5 text-[11px] sm:text-xs md:text-sm">
                  <div className="flex items-center gap-1.5 h-5">
                    <IdCard className="w-3.5 h-3.5 shrink-0 text-[#C1440E]" />
                    <span className="text-[#2A1636] opacity-70 whitespace-nowrap" style={darkTextHalo}>Member ID</span>
                    <span className="text-[#2A1636] opacity-70">—</span>
                    <span 
                      className="font-mono font-medium text-[#2A1636] truncate max-w-[120px]" 
                      style={boldTextHalo}
                      title={profile?.memberId || "Pending"}
                    >
                      {profile?.memberId || "Pending"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 h-5">
                    <Droplet className="w-3.5 h-3.5 shrink-0 text-[#C1440E]" />
                    <span className="text-[#2A1636] opacity-70 whitespace-nowrap" style={darkTextHalo}>Blood Group</span>
                    <span className="text-[#2A1636] opacity-70">—</span>
                    <span className="font-semibold text-red-600" style={boldTextHalo}>
                      {profile?.bloodGroup || "—"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 h-5">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-[#C1440E]" />
                    <span className="text-[#2A1636] opacity-70 whitespace-nowrap" style={darkTextHalo}>Location</span>
                    <span className="text-[#2A1636] opacity-70">—</span>
                    <span className="text-[#2A1636] truncate" style={boldTextHalo}>
                      {profile?.currentCity || "Not set"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 h-5">
                    <Calendar className="w-3.5 h-3.5 shrink-0 text-[#C1440E]" />
                    <span className="text-[#2A1636] opacity-70 whitespace-nowrap" style={darkTextHalo}>Joined</span>
                    <span className="text-[#2A1636] opacity-70">—</span>
                    <span className="text-[#2A1636]" style={boldTextHalo}>
                      {joinedDate || "Recently"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BACK FACE */}
          <div
            ref={backRef}
            className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl"
            style={{ 
              backfaceVisibility: "hidden", 
              transform: "rotateY(180deg)",
              border: `1px solid ${THEME.gold}`,
              boxSizing: "border-box",
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(120% 140% at 100% 0%, rgba(232,163,61,0.18) 0%, rgba(74,25,66,0) 55%), linear-gradient(135deg, #4A1942 0%, #3A1333 100%)",
              }}
            />
            <div className="absolute inset-0 opacity-[0.06]" style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, #fff 0px, #fff 1px, transparent 1px, transparent 14px)",
            }} />

            {/* Terms & Use - Keep original size */}
            <div className="absolute top-0 left-0 right-0 z-20 flex justify-center pt-3.5">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full pl-2 pr-4 py-1.5 whitespace-nowrap">
                <ScrollText className="w-4 h-4 text-[#E8A33D]" />
                <span className="text-sm font-bold tracking-wide font-serif text-white">
                  Terms &amp; Use
                </span>
              </div>
            </div>

            {/* Flip hint - hidden in PDF - Changed to ArrowLeftRight */}
            <div 
              data-hide-for-pdf
              className="absolute top-3.5 right-3.5 z-20 flex items-center justify-center h-7 w-7 rounded-full bg-white/10 border border-white/20 text-white animate-bounce"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
            </div>

            <div className="absolute left-4 right-4 top-[54px] bottom-[44px] sm:left-6 sm:right-6">
              <ul className="h-full flex flex-col justify-center gap-1.5 sm:gap-2">
                {TERMS.map((term, i) => (
                  <li key={i} className="flex items-start gap-2 text-white/90 text-[9.5px] leading-snug sm:text-[11px] md:text-xs">
                    <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 mt-[2px] text-[#E8A33D]" />
                    <span>{term}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="absolute bottom-3 left-4 right-3.5 z-20 flex items-center justify-between">
              <span className="text-[8px] sm:text-[9px] font-mono text-white/60">
                ID: {profile?.memberId || "Pending"}
              </span>
              <div className="flex items-center gap-2">
                <div className="relative h-6 w-6 sm:h-7 sm:w-7 shrink-0 rounded-full bg-white ring-2 ring-white/40 overflow-hidden">
                  <Image src="/svslogo.png" alt="Samudayik Vikas Samiti" fill className="object-contain p-0.5" sizes="28px" />
                </div>
                <p className="text-[7.5px] sm:text-[8.5px] font-semibold uppercase leading-tight text-white/80">
                  Samudayik Vikas Samiti
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5">
        <button
          onClick={downloadCard}
          disabled={isDownloading}
          style={{ background: `linear-gradient(120deg, ${THEME.primary} 0%, ${THEME.terracotta} 100%)` }}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white text-sm font-semibold hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:scale-100 cursor-pointer disabled:cursor-not-allowed"
        >
          {isDownloading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Preparing PDF...
            </span>
          ) : (
            <>
              <Download className="w-4 h-4" /> Download as PDF
            </>
          )}
        </button>
      </div>
    </div>
  );
}