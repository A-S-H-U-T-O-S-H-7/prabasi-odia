"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowRight, Check, Eye, EyeOff, Loader2, LockKeyhole, Mail, User, X } from "lucide-react";
import { useAuthStore } from "@/lib/store";

interface Step0AccountProps {
  initialName?: string;
  initialEmail?: string;
  onComplete: (details: { name: string; email: string; uid: string }) => Promise<void> | void;
}

export default function Step0Account({ initialName = "", initialEmail = "", onComplete }: Step0AccountProps) {
  const { signUp, googleLogin } = useAuthStore();
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [googleSaving, setGoogleSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (name.trim().length < 2) return setError("Enter your full name.");
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Enter a valid email address.");
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== confirmPassword) return setError("Passwords do not match.");

    setSaving(true);
    const result = await signUp(name.trim(), email.trim(), password);
    if (!result.success) {
      setSaving(false);
      setError(result.error || "Could not create your account.");
      return;
    }

    const signedInUser = useAuthStore.getState().user;
    if (!signedInUser?.uid) {
      setSaving(false);
      setError("Your account was created, but the application could not be submitted. Please try again.");
      return;
    }
    await onComplete({ name: name.trim(), email: email.trim(), uid: signedInUser.uid });
    setSaving(false);
  };

  const continueWithGoogle = async () => {
    setError("");
    setGoogleSaving(true);
    const result = await googleLogin();
    if (!result.success) {
      setGoogleSaving(false);
      setError(result.error || "Could not continue with Google.");
      return;
    }
    const signedInUser = useAuthStore.getState().user;
    if (!signedInUser?.uid) {
      setGoogleSaving(false);
      setError("Could not access the Google account. Please try again.");
      return;
    }
    await onComplete({
      name: signedInUser?.displayName || "",
      email: signedInUser?.email || "",
      uid: signedInUser.uid,
    });
    setGoogleSaving(false);
  };

  const inputClass = "w-full rounded-xl border border-[#D4C8C0]/60 bg-white px-3 py-2.5 pl-10 text-[#2A1636] outline-none focus:border-[#6B1E5B] focus:ring-2 focus:ring-[#6B1E5B]/15 sm:px-4 sm:py-3 sm:pl-11";

  return (
    <form onSubmit={submit} className="mx-auto max-w-lg space-y-3 sm:space-y-5">
      <div className="text-center">
        <h2 className="text-xl font-bold text-[#2A1636]">Create your account</h2>
        <p className="mt-1 text-sm text-[#6B5E5A]">Your account and membership application will be created together.</p>
      </div>
      <button type="button" onClick={continueWithGoogle} disabled={saving || googleSaving} className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#D4C8C0]/60 bg-white px-4 py-2.5 font-medium text-[#2A1636] hover:bg-[#FFF9F2] disabled:opacity-60 sm:px-5 sm:py-3">{googleSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Image src="/google.png" alt="" width={20} height={20} className="h-5 w-5" />} Continue with Google</button>
      <div className="flex items-center gap-3 text-xs text-[#6B5E5A]"><div className="h-px flex-1 bg-[#D4C8C0]/60" />or use email<div className="h-px flex-1 bg-[#D4C8C0]/60" /></div>
      {initialName ? (
        <div className="rounded-xl border border-[#D4C8C0]/60 bg-[#FFF9F2] px-4 py-3 text-sm text-[#6B5E5A]">
          Applying as <span className="font-semibold text-[#2A1636]">{initialName}</span>
        </div>
      ) : (
        <label className="block"><span className="mb-1.5 block text-sm font-medium text-[#2A1636]">Full name</span><div className="relative"><User className="absolute left-3.5 top-3.5 h-4 w-4 text-[#6B5E5A]" /><input className={inputClass} placeholder="Enter your full name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required /></div></label>
      )}
      <label className="block"><span className="mb-1.5 block text-sm font-medium text-[#2A1636]">Email address</span><div className="relative"><Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-[#6B5E5A]" /><input className={`${inputClass} ${initialEmail ? "bg-[#F7F3F1]/80 cursor-not-allowed" : ""}`} placeholder="you@example.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)} readOnly={Boolean(initialEmail)} autoComplete="email" required /></div></label>
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4"><label className="block"><span className="mb-1.5 block text-sm font-medium text-[#2A1636]">Password</span><div className="relative"><LockKeyhole className="absolute left-3.5 top-3 h-4 w-4 text-[#6B5E5A] sm:top-3.5" /><input className={`${inputClass} pr-11`} placeholder="At least 8 characters" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" required /><button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-[#6B5E5A] sm:top-3">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></label><label className="block"><span className="mb-1.5 block text-sm font-medium text-[#2A1636]">Confirm password</span><div className="relative"><input className="w-full rounded-xl border border-[#D4C8C0]/60 bg-white px-3 py-2.5 pr-20 text-[#2A1636] outline-none focus:border-[#6B1E5B] focus:ring-2 focus:ring-[#6B1E5B]/15 sm:px-4 sm:py-3" placeholder="Re-enter your password" type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" required />{password && confirmPassword && (password === confirmPassword ? <Check aria-label="Passwords match" className="absolute right-10 top-3 h-4 w-4 text-green-600 sm:top-3.5" strokeWidth={3} /> : <X aria-label="Passwords do not match" className="absolute right-10 top-3 h-4 w-4 text-red-600 sm:top-3.5" strokeWidth={3} />)}<button type="button" aria-label={showConfirmPassword ? "Hide password" : "Show password"} onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-2.5 text-[#6B5E5A] sm:top-3">{showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></label></div>
      {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <div className="flex justify-end">
        <button disabled={saving} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#6B1E5B] to-[#D9772B] px-4 py-2.5 font-semibold text-white disabled:opacity-60 sm:px-5 sm:py-3">
          {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Creating account…</> : <>Next <ArrowRight className="h-4 w-4" /></>}
        </button>
      </div>
    </form>
  );
}
