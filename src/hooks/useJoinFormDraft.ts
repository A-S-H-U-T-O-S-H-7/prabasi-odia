"use client";

import { useEffect, useRef, useState } from 'react';
import type { FieldValues, UseFormReturn } from 'react-hook-form';
import { createJoinFormDraft, loadJoinFormDraft, saveJoinFormDraft } from '@/lib/joinFormDraft';

export function useJoinFormDraft<T extends FieldValues>(methods: UseFormReturn<T>, step: number, setStep: (step: number) => void) {
  const [ready, setReady] = useState(false);
  const stopped = useRef(false);
  const { getValues, reset, watch } = methods;

  useEffect(() => {
    let cancelled = false;
    void loadJoinFormDraft().then((draft) => {
      if (cancelled) return;
      if (draft) {
        const values = { ...draft.values };
        // Older drafts used the phone code to choose verification.
        if (values.residencyStatus !== 'RI' && values.residencyStatus !== 'NRI') {
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
      }
    }).catch(() => {}).finally(() => { if (!cancelled) setReady(true); });
    return () => { cancelled = true; };
  }, [getValues, reset, setStep]);

  useEffect(() => {
    if (!ready) return;
    const save = () => {
      if (stopped.current) return;
      void saveJoinFormDraft(createJoinFormDraft(getValues(), step)).catch(() => {});
    };
    save();
    const subscription = watch(save);
    return () => subscription.unsubscribe();
  }, [ready, step, getValues, watch]);

  const clearDraft = async () => {
    stopped.current = true;
    try { await saveJoinFormDraft(null); }
    catch {}
  };

  return { ready, clearDraft };
}
