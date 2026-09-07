"use client";

import { useEffect, useRef, useState } from 'react';
import type { FieldValues, UseFormReturn } from 'react-hook-form';
import { createJoinFormDraft, loadJoinFormDraft, saveJoinFormDraft } from '@/lib/joinFormDraft';

export function useJoinFormDraft<T extends FieldValues>(methods: UseFormReturn<T>, step: number, setStep: (step: number) => void) {
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState('');
  const stopped = useRef(false);
  const restored = useRef(false);
  const { getValues, reset, watch } = methods;

  useEffect(() => {
    let cancelled = false;
    void loadJoinFormDraft().then((draft) => {
      if (cancelled) return;
      if (draft) {
        restored.current = true;
        reset({ ...getValues(), ...draft.values } as T);
        setStep(draft.step);
        setStatus('Your draft was restored. Verify your contact again before submitting.');
      }
    }).catch(() => {
      if (!cancelled) setStatus('Progress could not be restored in this browser.');
    }).finally(() => { if (!cancelled) setReady(true); });
    return () => { cancelled = true; };
  }, [getValues, reset, setStep]);

  useEffect(() => {
    if (!ready) return;
    const save = () => {
      if (stopped.current) return;
      void saveJoinFormDraft(createJoinFormDraft(getValues(), step)).then(() => {
        if (!stopped.current) setStatus(restored.current
          ? 'Progress restored and saved on this device. Verify your contact again before submitting.'
          : 'Progress saved on this device.');
      }).catch(() => {
        if (!stopped.current) setStatus('Progress could not be saved. Keep this page open to retain your entries.');
      });
    };
    save();
    const subscription = watch(save);
    return () => subscription.unsubscribe();
  }, [ready, step, getValues, watch]);

  const clearDraft = async () => {
    stopped.current = true;
    try { await saveJoinFormDraft(null); }
    catch { setStatus('Application submitted, but the saved draft could not be cleared on this device.'); }
  };

  return { ready, status, clearDraft };
}
