'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import type { UrgentHelpRequest } from '@/lib/services/urgentHelpService';

type Values = {
  name: string;
  email: string;
  phone: string;
  address: string;
};

interface UrgentHelpOfferFormProps {
  request: UrgentHelpRequest;
  values: Values;
  submitting: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

const fieldClass =
  'mt-1.5 w-full rounded-xl border border-[#E7D7E8] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#B45337]';

export default function UrgentHelpOfferForm({
  request,
  values,
  submitting,
  error,
  onClose,
  onSubmit,
}: UrgentHelpOfferFormProps) {
  useEffect(() => {
    const prior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prior;
    };
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-[1001] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="offer-help-title"
        className="flex max-h-[calc(100dvh-32px)] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-[#FFF9F2] shadow-2xl"
      >
        <div className="flex items-start justify-between border-b border-[#E7D7E8] p-5 sm:px-7">
          <div>
            <p className="text-xs font-semibold text-[#B45337]">Offer to help</p>
            <h2 id="offer-help-title" className="mt-1 text-xl font-bold text-[#2A1636]">
              {request.title}
            </h2>
            <p className="mt-2 text-sm text-[#6B5E5A]">
              Your details go only to the coordination team.
            </p>
          </div>
          <button
            type="button"
            disabled={submitting}
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-lg p-2"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          id="offer-help-form"
          onSubmit={onSubmit}
          className="min-h-0 space-y-4 overflow-y-auto p-5 sm:p-7"
        >
          <label className="block text-sm font-medium text-[#2A1636]">
            Full name
            <input required name="name" defaultValue={values.name} className={fieldClass} />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-[#2A1636]">
              Email
              <input
                required
                type="email"
                name="email"
                defaultValue={values.email}
                className={fieldClass}
              />
            </label>
            <label className="block text-sm font-medium text-[#2A1636]">
              Phone number
              <input
                required
                type="tel"
                name="phone"
                defaultValue={values.phone}
                className={fieldClass}
              />
            </label>
          </div>
          <label className="block text-sm font-medium text-[#2A1636]">
            Address / location
            <textarea
              required
              name="address"
              defaultValue={values.address}
              rows={2}
              className={fieldClass}
            />
          </label>
          <label className="block text-sm font-medium text-[#2A1636]">
            How can you help? <span className="font-normal text-[#6B5E5A]">(optional)</span>
            <textarea
              name="message"
              rows={3}
              className={fieldClass}
              placeholder="For example: I can arrange transport or donate blood."
            />
          </label>
          <label className="flex items-start gap-2 text-xs leading-5 text-[#6B5E5A]">
            <input required name="consent" type="checkbox" className="mt-1" />
            <span>
              I agree that the Prabasi Odia coordination team may use these details to
              contact me about this help request.
            </span>
          </label>
          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        </form>

        <div className="flex justify-end gap-3 border-t border-[#E7D7E8] bg-white p-4 sm:px-7">
          <button
            type="button"
            disabled={submitting}
            onClick={onClose}
            className="rounded-xl border border-[#E7D7E8] px-4 py-2.5 text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="offer-help-form"
            disabled={submitting}
            className="rounded-xl bg-[#B45337] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {submitting ? 'Sending...' : 'Send to team'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
