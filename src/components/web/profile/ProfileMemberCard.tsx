// components/web/profile/ProfileMemberCard.tsx

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
  Lock,
} from "lucide-react";
import { useRef, useState, type CSSProperties } from "react";
import { domToCanvas } from "modern-screenshot";
import { toast } from "react-hot-toast";

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

  const isVerified = profile?.isVerified === true;
  const hasMemberId = profile?.memberId && profile.memberId !== "Pending";
  const canDownload = isVerified && hasMemberId;

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

  const roundCanvasCorners = (canvas: HTMLCanvasElement, radius: number) => {
    const width = canvas.width;
    const height = canvas.height;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const ctx = tempCanvas.getContext('2d');
    
    if (!ctx) return canvas;
    
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
    
    ctx.clip();
    ctx.drawImage(canvas, 0, 0);
    
    return tempCanvas;
  };

  const handleDownloadClick = () => {
    if (!canDownload) {
      if (!isVerified) {
        toast.error("Your profile is not verified yet. Please wait for admin verification.");
      } else if (!hasMemberId) {
        toast.error("Member ID is pending. Please wait for admin to assign your Member ID.");
      } else {
        toast.error("Member card is not available yet. Please complete your profile.");
      }
      return;
    }
    downloadCard();
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

      flipper.style.transition = "none";
      flipper.style.transform = "none";
      frontEl.style.transform = "none";
      backEl.style.transform = "none";
      frontEl.style.visibility = "visible";
      backEl.style.visibility = "hidden";
      void flipper.offsetHeight;

      let frontCanvas = await captureFace(frontEl, "#F7F1E3");
      frontCanvas = roundCanvasCorners(frontCanvas, 16 * 2);

      frontEl.style.visibility = "hidden";
      backEl.style.visibility = "visible";
      void flipper.offsetHeight;

      let backCanvas = await captureFace(backEl, "#4A1942");
      backCanvas = roundCanvasCorners(backCanvas, 16 * 2);

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
      toast.success("Member card downloaded successfully!");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download member card. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const joinedDate = formatMemberDate(profile?.createdAt);

  // Get download button status message
  const getDownloadStatusMessage = () => {
    if (!isVerified) {
      return "Profile not verified";
    }
    if (!hasMemberId) {
      return "Member ID pending";
    }
    return "Download PDF";
  };

  const getDownloadStatusIcon = () => {
    if (!canDownload) {
      return <Lock className="w-3 h-3 sm:w-4 sm:h-4" />;
    }
    return <Download className="w-3 h-3 sm:w-4 sm:h-4" />;
  };

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50 p-3 sm:p-6 shadow-sm w-full mx-auto">
      <div className="flex items-center justify-between mb-2 sm:mb-4">
        <h3 className="text-xs sm:text-sm font-semibold text-[#2A1636]">Member Card</h3>
        <span className="text-[10px] sm:text-[11px] text-[#7A6A5E] hidden xs:flex items-center gap-1">
          <ArrowLeftRight className="w-3 h-3 animate-pulse" /> Tap to flip
        </span>
      </div>

      <div
        className="relative w-full aspect-[7/4] sm:aspect-[7/3] min-h-[240px] sm:min-h-[0]"
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

            {/* Prabasi Odia wordmark */}
            <div className="absolute top-0 left-0 right-0 z-20 flex justify-center pt-2 sm:pt-3.5">
              <div className="flex items-center gap-2 sm:gap-3 bg-white/95 backdrop-blur-md border border-white/60 rounded-full pl-2 sm:pl-3 pr-3.5 sm:pr-5 py-1.5 sm:py-2 shadow-lg whitespace-nowrap">
                <div className="relative h-6 w-6 sm:h-8 sm:w-8 shrink-0 rounded-full overflow-hidden bg-white">
                  <Image src="/logoicon.png" alt="" fill className="object-contain" />
                </div>
                <span
                  className="text-xs sm:text-base md:text-lg font-bold tracking-wide font-serif"
                  style={{ color: THEME.primary }}
                >
                  Prabasi Odia
                </span>
              </div>
            </div>

            {/* Flip hint - hidden in PDF */}
            <div 
              data-hide-for-pdf
              className="absolute top-2 sm:top-3.5 right-2 sm:right-3.5 z-20 flex items-center justify-center h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-white/90 shadow-md text-[#4A1942] animate-bounce"
            >
              <ArrowLeftRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </div>

            {/* Issuer */}
            <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3.5 z-20 flex items-center gap-1.5 sm:gap-2">
              <div className="relative h-6 w-6 sm:h-9 sm:w-9 shrink-0 rounded-full bg-white ring-2 ring-white/70 shadow-md overflow-hidden">
                <Image src="/svslogo.png" alt="Samudayik Vikas Samiti" fill className="object-contain p-0.5 sm:p-1" sizes="36px" />
              </div>
              <div className="leading-tight text-left" style={boldTextHalo}>
                <p className="text-[5px] sm:text-[8px] tracking-wide uppercase font-semibold text-[#C1440E]">
                  Issued by
                </p>
                <p className="text-[6px] sm:text-[10px] font-bold uppercase leading-tight text-[#4A1942]">
                  Samudayik Vikas Samiti
                </p>
              </div>
            </div>

            {/* Main content */}
            <div className="absolute left-2 sm:left-4 top-[42px] sm:top-[72px] bottom-[30px] sm:bottom-[52px] z-10 flex items-center w-[72%] sm:w-[66%] gap-2 sm:gap-4 sm:left-5 sm:w-[62%]">
              {/* Photo */}
              <div className="flex-shrink-0 self-center">
                <div className="relative h-[60px] w-[60px] sm:h-[88px] sm:w-[88px] md:h-[96px] md:w-[96px] overflow-hidden rounded-lg sm:rounded-xl border-2 sm:border-[3px] border-white bg-white shadow-lg">
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
                      <span className="text-2xl sm:text-3xl">👤</span>
                    </div>
                  )}
                </div>
                <div className="mt-1 sm:mt-2 flex justify-center">
                  <span
                    className={`inline-flex items-center gap-0.5 sm:gap-1 rounded-full px-1.5 sm:px-2.5 py-0.5 text-[8px] sm:text-[10px] font-semibold border ${
                      profile?.isVerified
                        ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                        : "bg-white/85 border-[#DDD0BC] text-[#7A6A5E]"
                    }`}
                    style={!profile?.isVerified ? darkTextHalo : undefined}
                  >
                    {profile?.isVerified ? (
                      <>
                        <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Verified
                      </>
                    ) : (
                      "Unverified"
                    )}
                  </span>
                </div>
              </div>

              {/* Details - Increased font sizes */}
              <div className="flex-1 min-w-0 self-center">
                <h2
                  className="truncate font-serif text-sm sm:text-lg md:text-2xl font-bold leading-tight tracking-tight text-[#4A1942] mb-1 sm:mb-2"
                  style={boldTextHalo}
                >
                  {profile?.displayName || "Member Name"}
                </h2>

                <div className="space-y-1 sm:space-y-1.5">
                  {/* Member ID */}
                  <div className="flex items-center gap-1.5 sm:gap-1.5 h-4 sm:h-5">
                    <IdCard className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 text-[#C1440E]" />
                    <span className="text-[#2A1636] opacity-70 whitespace-nowrap text-[9px] sm:text-xs" style={darkTextHalo}>Member ID</span>
                    <span className="text-[#2A1636] opacity-70 text-[9px] sm:text-xs">—</span>
                    <span 
                      className={`font-semibold truncate max-w-[60px] sm:max-w-[120px] text-[9px] sm:text-xs ${
                        profile?.memberId && profile.memberId !== "Pending" 
                          ? "text-[#2A1636]" 
                          : "text-[#C1440E]"
                      }`}
                      style={boldTextHalo}
                      title={profile?.memberId || "Pending"}
                    >
                      {profile?.memberId || "Pending"}
                    </span>
                  </div>

                  {/* Blood Group */}
                  <div className="flex items-center gap-1.5 sm:gap-1.5 h-4 sm:h-5">
                    <Droplet className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 text-[#C1440E]" />
                    <span className="text-[#2A1636] opacity-70 whitespace-nowrap text-[9px] sm:text-xs" style={darkTextHalo}>Blood Group</span>
                    <span className="text-[#2A1636] opacity-70 text-[9px] sm:text-xs">—</span>
                    <span className="font-semibold text-red-600 text-[9px] sm:text-xs" style={boldTextHalo}>
                      {profile?.bloodGroup || "—"}
                    </span>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-1.5 sm:gap-1.5 h-4 sm:h-5">
                    <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 text-[#C1440E]" />
                    <span className="text-[#2A1636] opacity-70 whitespace-nowrap text-[9px] sm:text-xs" style={darkTextHalo}>Location</span>
                    <span className="text-[#2A1636] opacity-70 text-[9px] sm:text-xs">—</span>
                    <span className="font-semibold text-[#2A1636] truncate text-[9px] sm:text-xs" style={boldTextHalo}>
                      {profile?.currentCity || "Not set"}
                    </span>
                  </div>

                  {/* Joined */}
                  <div className="flex items-center gap-1.5 sm:gap-1.5 h-4 sm:h-5">
                    <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 text-[#C1440E]" />
                    <span className="text-[#2A1636] opacity-70 whitespace-nowrap text-[9px] sm:text-xs" style={darkTextHalo}>Joined</span>
                    <span className="text-[#2A1636] opacity-70 text-[9px] sm:text-xs">—</span>
                    <span className="font-semibold text-[#2A1636] text-[9px] sm:text-xs" style={boldTextHalo}>
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

            {/* Terms & Use */}
            <div className="absolute top-0 left-0 right-0 z-20 flex justify-center pt-2 sm:pt-3.5">
              <div className="flex items-center gap-2 sm:gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full pl-2 sm:pl-2 pr-3.5 sm:pr-4 py-1.5 sm:py-1.5 whitespace-nowrap">
                <ScrollText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#E8A33D]" />
                <span className="text-[10px] sm:text-sm font-bold tracking-wide font-serif text-white">
                  Terms &amp; Use
                </span>
              </div>
            </div>

            {/* Flip hint - hidden in PDF */}
            <div 
              data-hide-for-pdf
              className="absolute top-2 sm:top-3.5 right-2 sm:right-3.5 z-20 flex items-center justify-center h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-white/10 border border-white/20 text-white animate-bounce"
            >
              <ArrowLeftRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </div>

            {/* Terms list */}
            <div className="absolute left-2 sm:left-4 right-2 sm:right-4 top-[32px] sm:top-[54px] bottom-[28px] sm:bottom-[44px] sm:left-6 sm:right-6">
              <ul className="h-full flex flex-col justify-center gap-1 sm:gap-1.5">
                {TERMS.map((term, i) => (
                  <li key={i} className="flex items-start gap-1.5 sm:gap-2 text-white/90 text-[8px] sm:text-[9.5px] leading-snug sm:leading-snug sm:text-[11px] md:text-xs">
                    <ShieldCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0 mt-[1px] sm:mt-[2px] text-[#E8A33D]" />
                    <span>{term}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Bottom */}
            <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-4 right-2 sm:right-3.5 z-20 flex items-center justify-between">
              <span className="text-[6px] sm:text-[9px] font-mono text-white/60">
                ID: {profile?.memberId || "Pending"}
              </span>
              <div className="flex items-center gap-1 sm:gap-2">
                <div className="relative h-4 w-4 sm:h-7 sm:w-7 shrink-0 rounded-full bg-white ring-2 ring-white/40 overflow-hidden">
                  <Image src="/svslogo.png" alt="Samudayik Vikas Samiti" fill className="object-contain p-0.5" sizes="28px" />
                </div>
                <p className="text-[5px] sm:text-[8.5px] font-semibold uppercase leading-tight text-white/80">
                  Samudayik Vikas Samiti
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 sm:mt-5">
        {/* Download Button - Disabled if not verified or no member ID */}
        <button
          onClick={handleDownloadClick}
          disabled={isDownloading || !canDownload}
          style={{ 
            background: canDownload 
              ? `linear-gradient(120deg, ${THEME.primary} 0%, ${THEME.terracotta} 100%)`
              : "#A0A0A0"
          }}
          className={`w-full flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-xl text-white text-[11px] sm:text-sm font-semibold transition-all duration-300 ${
            canDownload 
              ? "hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] cursor-pointer" 
              : "cursor-not-allowed opacity-70"
          } disabled:opacity-60 disabled:scale-100`}
          title={!canDownload ? "Verification required to download member card" : ""}
        >
          {isDownloading ? (
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Preparing PDF...
            </span>
          ) : (
            <>
              {getDownloadStatusIcon()}
              {getDownloadStatusMessage()}
            </>
          )}
        </button>

        {/* Status Message for disabled state */}
        {!canDownload && (
          <p className="text-[10px] sm:text-xs text-center text-amber-600 mt-2 flex items-center justify-center gap-1">
            <Lock className="w-3 h-3" />
            {!isVerified 
              ? "🔒 Profile verification required to download member card" 
              : "🔒 Member ID assignment pending from admin"
            }
          </p>
        )}
      </div>
    </div>
  );
}