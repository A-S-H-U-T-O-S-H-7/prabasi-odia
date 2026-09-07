"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ArrowRight, Check, Eye, EyeOff, Loader2, LockKeyhole, Mail, User, X } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { useFormContext } from "react-hook-form";
import { useJoinFormSupport } from "./JoinFormSupport";

interface Step0AccountProps {
  initialName?: string;
  initialEmail?: string;
  onBack?: () => void;
  isSubmitting?: boolean;
  onComplete: (details: { name: string; email: string; uid: string }) => Promise<void> | void;
}

export default function Step0Account({ initialName = "", initialEmail = "", onBack, onComplete, isSubmitting = false }: Step0AccountProps) {
  const { signUp, googleLogin, user } = useAuthStore();
  const { setValue } = useFormContext();
  const support = useJoinFormSupport();
  const [emailLocked] = useState(Boolean(initialEmail));
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [googleSaving, setGoogleSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const operationInFlight = useRef(false);
  const busy = saving || googleSaving || isSubmitting;
  const fail = (message: string) => { setError(message); support.recordNextFailure(); };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy || operationInFlight.current) return;
    setError('');
    if (name.trim().length < 2) return fail('Enter your full name.');
    if (!/^\S+@\S+\.\S+$/.test(email)) return fail('Enter a valid email address.');
    if (password.length < 8) return fail('Password must be at least 8 characters.');
    if (password !== confirmPassword) return fail('Passwords do not match.');
    operationInFlight.current = true;
    setSaving(true);
    try {
      const result = await signUp(name.trim(), email.trim(), password);
      if (!result.success) return fail(result.error || 'Could not create your account.');
      const signedInUser = useAuthStore.getState().user;
      if (!signedInUser?.uid) return fail('Your account was created, but the application could not be submitted. Please try again.');
      await onComplete({ name: name.trim(), email: email.trim(), uid: signedInUser.uid });
    } catch (error) {
      fail(error instanceof Error ? error.message : 'Could not submit your application. Please try again.');
    } finally {
      operationInFlight.current = false;
      setSaving(false);
    }
  };

  const continueWithGoogle = async () => {
    if (busy || operationInFlight.current) return;
    operationInFlight.current = true;
    setError('');
    setGoogleSaving(true);
    try {
      const result = await googleLogin();
      if (!result.success) return fail(result.error || 'Could not continue with Google.');
      const signedInUser = useAuthStore.getState().user;
      if (!signedInUser?.uid) return fail('Could not access the Google account. Please try again.');
      await onComplete({ name: signedInUser.displayName || '', email: signedInUser.email || '', uid: signedInUser.uid });
    } catch (error) {
      fail(error instanceof Error ? error.message : 'Could not submit your application. Please try again.');
    } finally {
      operationInFlight.current = false;
      setGoogleSaving(false);
    }
  };

  const inputClass = "w-full rounded-xl border border-[#D4C8C0]/60 bg-white px-3 py-2.5 pl-10 text-[#2A1636] outline-none focus:border-[#6B1E5B] focus:ring-2 focus:ring-[#6B1E5B]/15 sm:px-4 sm:py-3 sm:pl-11";

  if (user?.uid) {
    return <div className="mx-auto max-w-lg space-y-4">
      <h2 className="text-xl font-bold text-[#2A1636]">Submit your application</h2>
      <p className="text-sm text-[#6B5E5A]">Signed in as {user.email}. Your saved details are ready for review.</p>
      {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <div className="flex justify-between gap-3">
        <button type="button" disabled={busy} onClick={onBack} className="rounded-xl border border-[#D4C8C0] px-4 py-2.5">Back</button>
        <button type="button" disabled={busy} onClick={async () => {
          if (busy || operationInFlight.current) return;
          operationInFlight.current = true;
          setError('');
          setSaving(true);
          try { await onComplete({ name: initialName || user.displayName || '', email: user.email || email, uid: user.uid }); }
          catch (error) { fail(error instanceof Error ? error.message : 'Could not submit your application. Please try again.'); }
          finally { operationInFlight.current = false; setSaving(false); }
        }} className="rounded-xl bg-[#6B1E5B] px-4 py-2.5 font-semibold text-white disabled:opacity-60">{busy ? 'Submitting…' : 'Submit application'}</button>
      </div>
    </div>;
  }

  return (
    <form noValidate onSubmit={submit} className="mx-auto max-w-lg space-y-3 sm:space-y-5">
      <div className="text-center">
        <h2 className="text-xl font-bold text-[#2A1636]">Create your account</h2>
        <p className="mt-1 text-sm text-[#6B5E5A]">Your account and membership application will be created together.</p>
      </div>
      <button type="button" onClick={continueWithGoogle} disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#D4C8C0]/60 bg-white px-4 py-2.5 font-medium text-[#2A1636] hover:bg-[#FFF9F2] disabled:opacity-60 sm:px-5 sm:py-3">{googleSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Image src="/google.png" alt="" width={20} height={20} className="h-5 w-5" />} Continue with Google</button>
      <div className="flex items-center gap-3 text-xs text-[#6B5E5A]"><div className="h-px flex-1 bg-[#D4C8C0]/60" />or use email<div className="h-px flex-1 bg-[#D4C8C0]/60" /></div>
      {initialName ? (
        <div className="rounded-xl border border-[#D4C8C0]/60 bg-[#FFF9F2] px-4 py-3 text-sm text-[#6B5E5A]">
          Applying as <span className="font-semibold text-[#2A1636]">{initialName}</span>
        </div>
      ) : (
        <label className="block"><span className="mb-1.5 block text-sm font-medium text-[#2A1636]">Full name</span><div className="relative"><User className="absolute left-3.5 top-3.5 h-4 w-4 text-[#6B5E5A]" /><input className={inputClass} placeholder="Enter your full name" value={name} onChange={(e) => { setName(e.target.value); setValue("fullName", e.target.value); }} autoComplete="name" required /></div></label>
      )}
      <label className="block"><span className="mb-1.5 block text-sm font-medium text-[#2A1636]">Email address</span><div className="relative"><Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-[#6B5E5A]" /><input className={`${inputClass} ${emailLocked ? "bg-[#F7F3F1]/80 cursor-not-allowed" : ""}`} placeholder="you@example.com" type="email" value={email} onChange={(e) => { setEmail(e.target.value); setValue("email", e.target.value); }} readOnly={emailLocked} autoComplete="email" required /></div></label>
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4"><label className="block"><span className="mb-1.5 block text-sm font-medium text-[#2A1636]">Password</span><div className="relative"><LockKeyhole className="absolute left-3.5 top-3 h-4 w-4 text-[#6B5E5A] sm:top-3.5" /><input className={`${inputClass} pr-11`} placeholder="At least 8 characters" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" required /><button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-[#6B5E5A] sm:top-3">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></label><label className="block"><span className="mb-1.5 block text-sm font-medium text-[#2A1636]">Confirm password</span><div className="relative"><input className="w-full rounded-xl border border-[#D4C8C0]/60 bg-white px-3 py-2.5 pr-20 text-[#2A1636] outline-none focus:border-[#6B1E5B] focus:ring-2 focus:ring-[#6B1E5B]/15 sm:px-4 sm:py-3" placeholder="Re-enter your password" type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" required />{password && confirmPassword && (password === confirmPassword ? <Check aria-label="Passwords match" className="absolute right-10 top-3 h-4 w-4 text-green-600 sm:top-3.5" strokeWidth={3} /> : <X aria-label="Passwords do not match" className="absolute right-10 top-3 h-4 w-4 text-red-600 sm:top-3.5" strokeWidth={3} />)}<button type="button" aria-label={showConfirmPassword ? "Hide password" : "Show password"} onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-2.5 text-[#6B5E5A] sm:top-3">{showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></label></div>
      {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <div className="flex justify-between">
        <button type="button" disabled={busy} onClick={onBack} className="rounded-xl border border-[#D4C8C0] px-4 py-2.5">Back</button>
        <button disabled={busy} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#6B1E5B] to-[#D9772B] px-4 py-2.5 font-semibold text-white disabled:opacity-60 sm:px-5 sm:py-3">
          {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Creating account…</> : <>Next <ArrowRight className="h-4 w-4" /></>}
        </button>
      </div>
    </form>
  );
}
