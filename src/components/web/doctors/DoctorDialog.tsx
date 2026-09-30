'use client';

import { useEffect, type FormEvent } from 'react';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import { ArrowRight, MessageCircle, Phone, Video, X } from 'lucide-react';
import type { Doctor } from '@/lib/doctors/types';

const modeLabel = {
  chat: 'Chat',
  video: 'Video call',
  phone: 'Phone call',
};
const modeIcon = { chat: MessageCircle, video: Video, phone: Phone };
const field =
  'mt-1.5 w-full rounded-xl border border-[#cbdedc] bg-white px-3.5 py-3 text-sm text-[#153b45] outline-none transition focus:border-[#167f82] focus:ring-2 focus:ring-[#167f82]/15';
const today = () => {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
};

interface DoctorDialogProps {
  doctor: Doctor;
  requesting: boolean;
  saving: boolean;
  formError: string;
  isAuthenticated: boolean;
  authLoading: boolean;
  name: string;
  email: string;
  onClose: () => void;
  onRequesting: (value: boolean) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export default function DoctorDialog({
  doctor,
  requesting,
  saving,
  formError,
  isAuthenticated,
  authLoading,
  name,
  email,
  onClose,
  onRequesting,
  onSubmit,
}: DoctorDialogProps) {
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  return createPortal(
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#0c2e3b]/65 p-3 backdrop-blur-sm sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="doctor-dialog-title"
        className="flex max-h-[calc(100dvh-24px)] w-full max-w-2xl flex-col overflow-hidden rounded-[26px] bg-[#f8fcfa] shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#d9e8e6] bg-white p-5 sm:p-7">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.15em] text-[#16868a]">
              {requesting ? 'REQUEST CONSULTATION' : doctor.specialty}
            </p>
            <h2 id="doctor-dialog-title" className="mt-2 font-serif text-2xl font-bold">
              {doctor.name}
            </h2>
            <p className="mt-1 text-sm text-[#657c80]">
              {doctor.degrees} · {doctor.city}, {doctor.country}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close"
            className="rounded-full border border-[#d9e8e6] p-2"
          >
            <X size={18} />
          </button>
        </div>

        <div className="min-h-0 overflow-y-auto p-5 sm:p-7">
          {requesting ? (
            !isAuthenticated && !authLoading ? (
              <div className="rounded-2xl bg-white p-8 text-center">
                <h3 className="font-semibold">Sign in to request a consultation</h3>
                <p className="mt-2 text-sm text-[#657c80]">
                  Your account lets you track the request and see the confirmed connection details.
                </p>
                <Link
                  href="/login"
                  className="mt-5 inline-flex rounded-xl bg-[#167f82] px-5 py-3 text-sm font-semibold text-white"
                >
                  Sign in
                </Link>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-xs font-semibold">
                    Patient name *
                    <input
                      name="patientName"
                      defaultValue={name}
                      required
                      minLength={2}
                      maxLength={100}
                      className={field}
                    />
                  </label>
                  <label className="text-xs font-semibold">
                    Age *
                    <input
                      name="age"
                      type="number"
                      min={0}
                      max={120}
                      required
                      className={field}
                    />
                  </label>
                  <label className="text-xs font-semibold">
                    Phone with country code *
                    <input
                      name="phone"
                      type="tel"
                      required
                      minLength={7}
                      maxLength={25}
                      placeholder="+91 98765 43210"
                      className={field}
                    />
                  </label>
                  <label className="text-xs font-semibold">
                    Email *
                    <input
                      name="email"
                      type="email"
                      defaultValue={email}
                      required
                      maxLength={200}
                      className={field}
                    />
                  </label>
                  <label className="text-xs font-semibold sm:col-span-2">
                    City and country *
                    <input
                      name="city"
                      required
                      minLength={2}
                      maxLength={120}
                      placeholder="Bhubaneswar, India"
                      className={field}
                    />
                  </label>
                </div>
                <label className="block text-xs font-semibold">
                  Briefly describe the concern *
                  <textarea
                    name="concern"
                    required
                    minLength={15}
                    maxLength={1500}
                    rows={4}
                    placeholder="Share the main symptoms or reason for consultation. Avoid uploading reports here."
                    className={field}
                  />
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-xs font-semibold">
                    Consultation type *
                    <select
                      name="mode"
                      required
                      defaultValue={doctor.modes[0]}
                      className={field}
                    >
                      {doctor.modes.map((value) => (
                        <option key={value} value={value}>
                          {modeLabel[value]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-xs font-semibold">
                    Preferred date *
                    <input
                      name="preferredDate"
                      type="date"
                      min={today()}
                      required
                      className={field}
                    />
                  </label>
                  <label className="text-xs font-semibold sm:col-span-2">
                    Preferred time *
                    <select name="preferredTime" required className={field}>
                      <option value="Morning">Morning</option>
                      <option value="Afternoon">Afternoon</option>
                      <option value="Evening">Evening</option>
                    </select>
                  </label>
                </div>
                <label className="flex gap-3 rounded-xl bg-[#eaf5f2] p-4 text-xs leading-5 text-[#496c70]">
                  <input type="checkbox" required className="mt-1 accent-[#167f82]" />
                  <span>
                    I consent to sharing these details with the consultation team and the
                    selected doctor for scheduling. I understand this is not an emergency service.
                  </span>
                </label>
                {formError && (
                  <p role="alert" className="text-sm text-red-700">
                    {formError}
                  </p>
                )}
                <div className="flex flex-wrap justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => onRequesting(false)}
                    disabled={saving}
                    className="rounded-xl border border-[#cbdedc] px-5 py-3 text-sm font-semibold"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-xl bg-[#167f82] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {saving ? 'Sending...' : 'Send request'}
                  </button>
                </div>
              </form>
            )
          ) : (
            <>
              <p className="text-sm leading-7 text-[#4f7074]">{doctor.about}</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-[#d9e8e6] bg-white p-4">
                  <p className="text-xs text-[#657c80]">Experience</p>
                  <strong className="mt-1 block">{doctor.experienceYears} years</strong>
                </div>
                <div className="rounded-xl border border-[#d9e8e6] bg-white p-4">
                  <p className="text-xs text-[#657c80]">Languages</p>
                  <strong className="mt-1 block">{doctor.languages}</strong>
                </div>
              </div>
              <p className="mt-6 text-xs font-bold uppercase tracking-wide text-[#657c80]">
                Consultation options
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {doctor.modes.map((value) => {
                  const Icon = modeIcon[value];
                  return (
                    <span
                      key={value}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#e8f4f1] px-3 py-1.5 text-xs font-semibold text-[#167f82]"
                    >
                      <Icon size={14} />
                      {modeLabel[value]}
                    </span>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={() => onRequesting(true)}
                className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#167f82] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#12686e]"
              >
                Request consultation
                <ArrowRight size={16} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
