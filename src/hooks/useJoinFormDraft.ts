"use client";

import { useEffect, useRef, useState } from 'react';
import type { FieldValues, UseFormReturn } from 'react-hook-form';
import { createJoinFormDraft, loadJoinFormDraft, saveJoinFormDraft } from '@/lib/joinFormDraft';

export function useJoinFormDraft<T extends FieldValues>(methods: UseFormReturn<T, any, any>, step: number, setStep: (step: number) => void, enabled = true) {
  const [ready, setReady] = useState(false);
  const [restoredStatus, setRestoredStatus] = useState<string | null>(null);
  const stopped = useRef(false);
  const { getValues, reset, watch } = methods;

  useEffect(() => {
    let cancelled = false;
    void loadJoinFormDraft().then((draft) => {
      if (cancelled) return;
      if (draft) {
        const values = { ...draft.values };
        // Older drafts used the phone code to choose verification.
        if (!['RI', 'NRI', 'RO', 'GUEST'].includes(String(values.residencyStatus))) {
          values.residencyStatus = (values.mobileCountryCode && values.mobileCountryCode !== '+91') ||
            values.idType === 'passport' || (values.currentCountry && values.currentCountry !== 'India') ? 'NRI' : 'RI';
        }
        if (values.residencyStatus === 'RI') {
          values.idType = 'aadhar';
          values.identityDocumentSelected = true;
          values.currentCountry = values.currentCountry || 'India';
        }
        reset({ ...getValues(), ...values } as T);
        setStep(draft.step);
        setRestoredStatus(String(values.residencyStatus));
      }
    }).catch(() => {}).finally(() => { if (!cancelled) setReady(true); });
    return () => { cancelled = true; };
  }, [getValues, reset, setStep]);

  useEffect(() => {
    if (!ready || !enabled) return;
    const save = () => {
      if (stopped.current) return;
      void saveJoinFormDraft(createJoinFormDraft(getValues(), step)).catch(() => {});
    };
    save();
    const subscription = watch(save);
    return () => subscription.unsubscribe();
  }, [ready, enabled, step, getValues, watch]);

  const clearDraft = async () => {
    stopped.current = true;
    try { await saveJoinFormDraft(null); }
    catch {}
  };

  return { ready, restoredStatus, clearDraft };
}
