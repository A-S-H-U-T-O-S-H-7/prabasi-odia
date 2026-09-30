'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import {
  URGENT_HELP_CATEGORIES,
  type UrgentHelpRequest,
} from '@/lib/services/urgentHelpService';

interface EditUrgentHelpModalProps {
  item: UrgentHelpRequest;
  onClose: () => void;
  onSave: (event: React.FormEvent<HTMLFormElement>) => void;
  saving: boolean;
}

const fieldInputClass = 'w-full rounded-xl border border-[#D4C8C0] bg-white px-4 py-3 font-normal';

export default function EditUrgentHelpModal({
  item,
  onClose,
  onSave,
  saving,
}: EditUrgentHelpModalProps) {
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-help-title"
        className="flex max-h-[calc(100dvh-32px)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-[#FFF9F2] shadow-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-[#E7D7E8] p-5 sm:px-7">
          <div>
            <p className="text-xs font-semibold text-[#B45337]">Admin edit</p>
            <h2 id="edit-help-title" className="mt-1 text-xl font-bold text-[#2A1636]">
              Edit help request
            </h2>
          </div>
          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            aria-label="Close edit dialog"
            className="rounded-lg p-2 hover:bg-[#E7D7E8]/50"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <form
          id="edit-help-form"
          onSubmit={onSave}
          className="min-h-0 space-y-5 overflow-y-auto p-5 sm:p-7"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Request title">
              <input
                name="title"
                required
                minLength={5}
                maxLength={120}
                defaultValue={item.title}
                className={fieldInputClass}
              />
            </Field>
            <Field label="Help type">
              <select
                name="category"
                defaultValue={item.category}
                className={fieldInputClass}
              >
                {URGENT_HELP_CATEGORIES.map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Location">
            <input
              name="location"
              required
              minLength={2}
              maxLength={160}
              defaultValue={item.location}
              className={fieldInputClass}
            />
          </Field>
          <Field label="Message">
            <textarea
              name="message"
              required
              minLength={30}
              maxLength={6000}
              rows={5}
              defaultValue={item.message}
              className={`${fieldInputClass} resize-y`}
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Contact name">
              <input
                name="contactName"
                required
                minLength={2}
                maxLength={100}
                defaultValue={item.contactName}
                className={fieldInputClass}
              />
            </Field>
            <Field label="Contact phone">
              <input
                name="phone"
                required
                minLength={7}
                maxLength={25}
                defaultValue={item.phone}
                className={fieldInputClass}
              />
            </Field>
          </div>
          <Field label="Email address">
            <input
              name="email"
              type="email"
              maxLength={200}
              defaultValue={item.email}
              className={fieldInputClass}
            />
          </Field>
        </form>

        <footer className="flex justify-end gap-3 border-t border-[#E7D7E8] bg-white p-4 sm:px-7">
          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="rounded-xl border border-[#E7D7E8] px-5 py-2.5 text-sm font-semibold text-[#6B5E5A]"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="edit-help-form"
            disabled={saving}
            className="rounded-xl bg-[#B45337] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </footer>
      </div>
    </div>,
    document.body
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-2 text-sm font-semibold text-[#2A1636]">
      {label}
      {children}
    </label>
  );
}
