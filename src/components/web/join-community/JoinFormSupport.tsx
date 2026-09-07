"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { useFormContext } from 'react-hook-form';
import { FaWhatsapp } from 'react-icons/fa';
import { Loader2, X } from 'lucide-react';
import { createSupportAttemptTracker, JOIN_WHATSAPP_URL, normalizeSupportMobile } from '@/lib/joinFormSupport';

const SupportContext = createContext({ recordOtpAttempt: (_key: string) => {}, recordNextFailure: () => {}, resetNextFailures: () => {} });
export const useJoinFormSupport = () => useContext(SupportContext);

export default function JoinFormSupport({ children, step }: { children: ReactNode; step: number }) {
  const { getValues } = useFormContext();
  const tracker = useRef(createSupportAttemptTracker());
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [mobile, setMobile] = useState('');
  const [problem, setProblem] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) dialog.current?.showModal();
    else dialog.current?.close();
  }, [open]);

  const show = (manual = false) => {
    if (open || sending || (sent && !manual)) return;
    if (manual) setSent(false);
    const number = String(getValues('mobileNumber') || '').trim();
    const code = String(getValues('mobileCountryCode') || '').trim();
    setMobile((current) => current || (number ? normalizeSupportMobile(`${code}${number}`) || number : ''));
    setError('');
    setOpen(true);
  };

  const send = async (event: React.FormEvent) => {
    event.preventDefault();
    if (sending || !problem.trim()) return;
    const contactMobile = normalizeSupportMobile(mobile);
    if (!contactMobile) { setError('Enter a contact phone number with 4–14 digits.'); return; }
    setSending(true);
    setError('');
    try {
      const response = await fetch('/api/support/join-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile: contactMobile, message: problem.trim(),
        }),
        signal: AbortSignal.timeout(25_000),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || result?.success !== true) {
        throw new Error(result?.message || 'Your message could not be sent. Please try again or contact us on WhatsApp.');
      }
      setSent(true);
      setProblem('');
    } catch (error) {
      setError(error instanceof Error && error.name !== 'TimeoutError' ? error.message : 'Sending took too long. Please try again or contact us on WhatsApp.');
    } finally { setSending(false); }
  };

  return (
    <SupportContext.Provider value={{
      recordOtpAttempt: (key) => { if (tracker.current.record('otp_retry', key)) show(); },
      recordNextFailure: () => { if (tracker.current.record('next_blocked', String(step))) show(); },
      resetNextFailures: () => tracker.current.resetNext(step),
    }}>
      {children}
      <div className="fixed bottom-5 right-4 z-40 flex items-center gap-2 rounded-full border border-green-200 bg-white px-3 py-2 shadow-lg sm:bottom-6 sm:right-6">
        <span className="text-sm font-medium text-[#2A1636]">Any issue?</span>
        <a href={JOIN_WHATSAPP_URL} target="_blank" rel="noopener noreferrer" aria-label="Get help on WhatsApp" className="rounded-full bg-[#15803D] p-2.5 text-white hover:bg-green-800"><FaWhatsapp className="h-6 w-6" /></a>
        <button type="button" onClick={() => show(true)} className="border-l border-green-200 pl-2 text-xs font-medium text-[#6B1E5B] underline">Report issue</button>
      </div>
      <dialog ref={dialog} onCancel={(event) => { if (sending) event.preventDefault(); else setOpen(false); }} onClose={() => setOpen(false)} aria-labelledby="join-support-title" className="fixed inset-0 m-auto max-h-[85dvh] w-[calc(100%_-_2rem)] max-w-md overflow-y-auto rounded-2xl border border-[#E7D7E8] bg-white p-5 text-[#2A1636] shadow-2xl backdrop:bg-black/50 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <h2 id="join-support-title" className="text-xl font-semibold">{sent ? 'Thank you for letting us know' : 'Facing an issue? Tell us what happened'}</h2>
          <button type="button" disabled={sending} onClick={() => setOpen(false)} aria-label="Close support form" className="rounded-lg p-1 hover:bg-gray-100 disabled:opacity-50"><X className="h-5 w-5" /></button>
        </div>
        {sent ? <p role="status" className="mt-4 text-sm text-[#6B5E5A]">Your message has been sent to our support team. You can continue filling out your form.</p> : (
          <form onSubmit={send} className="mt-4 space-y-4">
            <p className="text-sm text-[#6B5E5A]">Describe the problem and our team will help you.</p>
            <label className="block text-sm font-medium">Phone number
              <input type="tel" autoComplete="tel" required maxLength={25} value={mobile} onChange={(event) => {
                if (event.target.value.replace(/\D/g, '').length <= 14) setMobile(event.target.value);
              }} disabled={sending} placeholder="Phone number (4–14 digits)" className="mt-2 w-full rounded-xl border border-[#D4C8C0] p-3 outline-none focus:border-[#6B1E5B] focus:ring-2 focus:ring-[#6B1E5B]/20" />
            </label>
            <label className="block text-sm font-medium">Your problem
              <textarea autoFocus required maxLength={2000} rows={5} value={problem} onChange={(event) => setProblem(event.target.value)} disabled={sending} placeholder="Tell us where you got stuck…" className="mt-2 w-full resize-y rounded-xl border border-[#D4C8C0] p-3 outline-none focus:border-[#6B1E5B] focus:ring-2 focus:ring-[#6B1E5B]/20" />
            </label>
            {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            <div className="flex items-center justify-between gap-3">
              <a href={JOIN_WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-green-700"><FaWhatsapp /> WhatsApp us</a>
              <button type="submit" disabled={sending || !problem.trim() || !mobile.trim()} className="flex items-center gap-2 rounded-xl bg-[#6B1E5B] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{sending && <Loader2 className="h-4 w-4 animate-spin" />}{sending ? 'Sending…' : 'Send'}</button>
            </div>
          </form>
        )}
      </dialog>
    </SupportContext.Provider>
  );
}
