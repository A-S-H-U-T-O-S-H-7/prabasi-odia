// components/web/join-community/step1/ProfilePhotoUpload.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useFormContext } from "react-hook-form";
import { AlertCircle, Check, CheckCircle2, Info, RotateCcw, Upload, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface ProfilePhotoUploadProps {
  hasAttemptedSubmit: boolean;
}

export default function ProfilePhotoUpload({ hasAttemptedSubmit }: ProfilePhotoUploadProps) {
  const { setValue, watch, trigger, formState: { errors, touchedFields } } = useFormContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cropFrameRef = useRef<HTMLDivElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [cropSource, setCropSource] = useState<string | null>(null);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);
  const [frameSize, setFrameSize] = useState({ width: 240, height: 320 });
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const dragStart = useRef<{ x: number; y: number; cropX: number; cropY: number } | null>(null);

  const watchPhoto = watch("photo");
  useEffect(() => {
    if (!(watchPhoto instanceof File)) { setPhotoPreview(null); return; }
    const url = URL.createObjectURL(watchPhoto);
    setPhotoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [watchPhoto]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
      if (!validTypes.includes(file.type)) {
        setPhotoError("Please upload a valid image (JPEG, PNG, WEBP)");
        setValue("photo", null);
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setPhotoError("Image size should be less than 5MB");
        setValue("photo", null);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoError(null);
        setCropFile(file);
        setCropSource(reader.result as string);
        setImageSize(null);
        setZoom(1);
        setPosition({ x: 0, y: 0 });
      };
      reader.readAsDataURL(file);
    }
  };

  const shouldShowError = () => {
    return Boolean((hasAttemptedSubmit || touchedFields.photo) && errors.photo);
  };

  const getCropBounds = (nextZoom = zoom) => {
    if (!imageSize) return { maxX: 0, maxY: 0, scale: 1 };
    const scale = Math.max(frameSize.width / imageSize.width, frameSize.height / imageSize.height) * nextZoom;
    return {
      maxX: Math.max(0, (imageSize.width * scale - frameSize.width) / 2),
      maxY: Math.max(0, (imageSize.height * scale - frameSize.height) / 2),
      scale,
    };
  };

  const clampPosition = (next: { x: number; y: number }, nextZoom = zoom) => {
    const { maxX, maxY } = getCropBounds(nextZoom);
    return { x: Math.max(-maxX, Math.min(maxX, next.x)), y: Math.max(-maxY, Math.min(maxY, next.y)) };
  };

  const confirmCrop = async () => {
    if (!cropSource || !cropFile || !imageSize) return;
    const { scale } = getCropBounds();
    const outputWidth = 300;
    const outputHeight = 400;
    const outputScale = outputWidth / frameSize.width;
    const canvas = document.createElement("canvas");
    canvas.width = outputWidth;
    canvas.height = outputHeight;
    const context = canvas.getContext("2d");
    if (!context) return;

    const image = new window.Image();
    image.src = cropSource;
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Could not crop image"));
    });
    const drawnWidth = imageSize.width * scale * outputScale;
    const drawnHeight = imageSize.height * scale * outputScale;
    const x = (outputWidth - drawnWidth) / 2 + position.x * outputScale;
    const y = (outputHeight - drawnHeight) / 2 + position.y * outputScale;
    context.drawImage(image, x, y, drawnWidth, drawnHeight);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const croppedFile = new File([blob], `profile-${Date.now()}.jpg`, { type: "image/jpeg" });
      setValue("photo", croppedFile, { shouldValidate: true });
      if (hasAttemptedSubmit || touchedFields.photo) trigger("photo");
      setCropSource(null);
      setCropFile(null);
    }, "image/jpeg", 0.92);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-[#2A1636] mb-2">
        Profile Photo <span className="text-red-400">*</span>
      </label>
      <div className="mb-2 flex items-start gap-2 rounded-xl border border-[#D9772B]/20 bg-[#FFF7E8] px-2.5 py-2 text-xs leading-4 text-[#6B5E5A] sm:mb-3 sm:gap-2.5 sm:px-3 sm:py-2.5 sm:leading-5">
        <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#D9772B]" />
        <p>
          Please upload only a recent, clear <strong className="font-semibold text-[#2A1636]">passport-size photo</strong> with your face clearly visible. This photo will be printed on your Prabasi Odia member card, so please avoid selfies, group photos, filters.
        </p>
      </div>
      <div className="flex items-start gap-3 sm:gap-4">
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => fileInputRef.current?.click()}
          className={`relative h-20 w-20 rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden flex items-center justify-center bg-gradient-to-br from-white/40 to-[#6B1E5B]/5 hover:from-white/60 hover:to-[#6B1E5B]/10 group flex-shrink-0 sm:h-24 sm:w-24 sm:rounded-2xl ${
            watchPhoto instanceof File
              ? "border-green-500 bg-green-50/30"
              : shouldShowError() || photoError
              ? "border-red-400 bg-red-50/30"
              : "border-[#D4C8C0] hover:border-[#6B1E5B]"
          }`}
        >
          {photoPreview ? (
            <Image src={photoPreview} alt="Profile" fill className="object-contain p-1" />
          ) : (
            <div className="text-center">
              <Upload className="w-6 h-6 text-[#6B5E5A]/40 mx-auto group-hover:text-[#6B1E5B]/60 transition-colors" />
              <p className="text-[10px] text-[#6B5E5A]/40 mt-1">Upload</p>
            </div>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
        </motion.div>

        <div className="flex min-h-20 flex-1 items-center sm:min-h-24">
          <AnimatePresence mode="wait">
            {(shouldShowError() || photoError) && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="flex items-start gap-1.5 text-red-400 text-sm"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{photoError || (errors.photo?.message as string)}</span>
              </motion.div>
            )}
            {watchPhoto instanceof File && !photoError && !errors.photo && (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="flex items-center gap-1.5 text-green-600 text-sm"
              >
                <Check className="w-4 h-4" /> Photo uploaded
              </motion.div>
            )}
            {!photoPreview && !photoError && !errors.photo && (
              <motion.p key="hint" className="text-xs text-[#6B5E5A]/50">
                JPEG, PNG or WEBP · up to 5MB
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {cropSource && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Crop profile photo"
          className="fixed inset-0 z-[100] flex h-[100dvh] flex-col overflow-hidden bg-[#090D0F] text-white"
        >
          <header className="relative z-10 flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
            <button type="button" onClick={() => { setCropSource(null); setCropFile(null); }} className="inline-flex items-center gap-1.5 py-1 text-sm font-semibold text-white/90 hover:text-white" aria-label="Cancel crop">
              <X className="h-5 w-5" />
              Cancel
            </button>
            <div className="text-center">
              <h3 className="text-sm font-semibold sm:text-base">Adjust profile photo</h3>
              <p className="mt-0.5 text-[11px] text-white/60">Move and zoom to keep your face inside the frame</p>
            </div>
            <div className="w-[4.75rem]" aria-hidden="true" />
          </header>

          <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden px-4 py-2">
            {/* Shows the complete original image so the crop area is never ambiguous. */}
            <img src={cropSource} alt="Original photo" className="pointer-events-none absolute inset-0 h-full w-full select-none object-contain opacity-35" />
            <div className="absolute inset-0 bg-black/20" />

            <div
              ref={cropFrameRef}
              className="relative z-10 h-[52dvh] max-h-full w-auto max-w-[88vw] aspect-[3/4] touch-none overflow-hidden bg-black shadow-[0_0_0_999px_rgba(0,0,0,0.48)] sm:h-[60dvh] lg:h-[64dvh]"
              onPointerDown={(event) => {
                event.currentTarget.setPointerCapture(event.pointerId);
                dragStart.current = { x: event.clientX, y: event.clientY, cropX: position.x, cropY: position.y };
              }}
              onPointerMove={(event) => {
                if (!dragStart.current) return;
                setPosition(clampPosition({ x: dragStart.current.cropX + event.clientX - dragStart.current.x, y: dragStart.current.cropY + event.clientY - dragStart.current.y }));
              }}
              onPointerUp={() => { dragStart.current = null; }}
              onPointerCancel={() => { dragStart.current = null; }}
            >
              {imageSize && (
                <img
                  src={cropSource}
                  alt="Crop preview"
                  draggable={false}
                  className="pointer-events-none absolute left-1/2 top-1/2 max-w-none select-none"
                  style={{
                    width: `${imageSize.width * getCropBounds().scale}px`,
                    height: `${imageSize.height * getCropBounds().scale}px`,
                    transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
                  }}
                />
              )}
              <div className="pointer-events-none absolute inset-0 border-2 border-white/95" />
              <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((cell) => (
                  <span key={cell} className="border border-white/35" />
                ))}
              </div>
              <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-white/60" />
              <img
                src={cropSource}
                alt=""
                className="hidden"
                onLoad={(event) => {
                  const frame = cropFrameRef.current?.getBoundingClientRect();
                  if (frame) setFrameSize({ width: frame.width, height: frame.height });
                  setImageSize({ width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight });
                }}
              />
            </div>
          </div>

          <footer className="relative z-10 border-t border-white/10 bg-[#0D1214] px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 sm:px-6 sm:pb-5">
            <div className="mx-auto flex max-w-md items-center gap-3">
              <span className="text-xs font-medium text-white/75">Zoom</span>
              <input type="range" min="1" max="3" step="0.05" value={zoom} onChange={(event) => {
                const nextZoom = Number(event.target.value);
                setZoom(nextZoom);
                setPosition((current) => clampPosition(current, nextZoom));
              }} className="h-1 flex-1 accent-[#34C759]" />
              <button type="button" onClick={() => { setZoom(1); setPosition({ x: 0, y: 0 }); }} className="rounded-lg p-1.5 text-white/75 hover:bg-white/10 hover:text-white" aria-label="Reset photo position"><RotateCcw className="h-4 w-4" /></button>
            </div>

            <div className="mx-auto mt-4 flex max-w-md gap-3">
              <button type="button" onClick={() => { setCropSource(null); setCropFile(null); }} className="flex-1 rounded-xl border border-white/25 px-4 py-2.5 text-sm font-semibold text-white/90 hover:bg-white/10">Cancel</button>
              <button type="button" disabled={!imageSize} onClick={confirmCrop} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#34C759] px-4 py-2.5 text-sm font-semibold text-[#06240E] hover:bg-[#47D66C] disabled:opacity-50"><CheckCircle2 className="h-4 w-4" />Done</button>
            </div>
          </footer>
        </div>
      )}
    </div>
  );
}
