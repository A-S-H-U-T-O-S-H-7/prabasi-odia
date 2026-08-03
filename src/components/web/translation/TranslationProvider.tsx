"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export const LANGUAGES = [
  { code: "en", label: "English", native: "English" },
  { code: "or", label: "Odia", native: "ଓଡ଼ିଆ" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["code"];

type TranslationContextValue = {
  language: LanguageCode;
  isTranslating: boolean;
  changeLanguage: (language: LanguageCode) => Promise<void>;
};

const TranslationContext = createContext<TranslationContextValue | null>(null);

const ignoredTags = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "INPUT", "SELECT", "OPTION", "CODE", "PRE"]);

function decodeHtml(value: string) {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = value;
  return textarea.value;
}

function getTranslatableTextNodes(root: Element) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.nodeValue?.trim()) return NodeFilter.FILTER_REJECT;
      const parent = node.parentElement;
      if (!parent || ignoredTags.has(parent.tagName) || parent.closest(".notranslate, [translate='no'], [data-no-translate]")) {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const nodes: Text[] = [];
  let node = walker.nextNode();
  while (node) {
    nodes.push(node as Text);
    node = walker.nextNode();
  }
  return nodes;
}

function createTranslationBatches(nodes: Text[]) {
  const batches: Text[][] = [];
  let batch: Text[] = [];
  let characterCount = 0;

  nodes.forEach((node) => {
    const length = node.nodeValue?.length ?? 0;
    if (batch.length === 75 || (batch.length > 0 && characterCount + length > 20_000)) {
      batches.push(batch);
      batch = [];
      characterCount = 0;
    }
    batch.push(node);
    characterCount += length;
  });
  if (batch.length) batches.push(batch);
  return batches;
}

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [language, setLanguage] = useState<LanguageCode>("en");
  const [isTranslating, setIsTranslating] = useState(false);
  const originals = useRef(new Map<Text, string>());
  const languageRef = useRef(language);
  const skipNextRouteTranslation = useRef(false);

  useEffect(() => {
    languageRef.current = language;
  }, [language]);

  const restoreEnglish = useCallback(() => {
    originals.current.forEach((original, node) => {
      if (node.isConnected) node.nodeValue = original;
    });
  }, []);

  const translatePage = useCallback(async (target: LanguageCode) => {
    const root = document.querySelector("[data-translation-root]");
    if (!root) return;

    restoreEnglish();
    if (target === "en") return;

    const nodes = getTranslatableTextNodes(root);
    nodes.forEach((node) => {
      if (!originals.current.has(node)) originals.current.set(node, node.nodeValue ?? "");
    });

    for (const batch of createTranslationBatches(nodes)) {
      const texts = batch.map((node) => originals.current.get(node) ?? node.nodeValue ?? "");
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target, texts }),
      });

      if (!response.ok) {
        const error = (await response.json().catch(() => null)) as { details?: string } | null;
        throw new Error(error?.details || "Translation request failed");
      }

      const { translations } = (await response.json()) as { translations: string[] };
      batch.forEach((node, index) => {
        if (node.isConnected && translations[index]) node.nodeValue = decodeHtml(translations[index]);
      });
    }
  }, [restoreEnglish]);

  const changeLanguage = useCallback(async (target: LanguageCode) => {
    if (target === languageRef.current || isTranslating) return;

    setIsTranslating(true);
    try {
      await translatePage(target);
      skipNextRouteTranslation.current = true;
      setLanguage(target);
    } catch (error) {
      console.error("Unable to translate this page.", error);
      restoreEnglish();
      const message = error instanceof Error ? error.message : "Translation request failed";
      window.alert(`Translation could not be completed. ${message}`);
    } finally {
      setIsTranslating(false);
    }
  }, [isTranslating, restoreEnglish, translatePage]);

  useEffect(() => {
    if (language === "en") return;
    if (skipNextRouteTranslation.current) {
      skipNextRouteTranslation.current = false;
      return;
    }

    const timer = window.setTimeout(() => {
      setIsTranslating(true);
      translatePage(language)
        .catch((error) => {
          console.error("Unable to translate the new page.", error);
          restoreEnglish();
        })
        .finally(() => setIsTranslating(false));
    }, 100);

    return () => window.clearTimeout(timer);
  }, [language, pathname, restoreEnglish, translatePage]);

  // Community/event records and contact details are fetched after the route has
  // rendered. Watch for those newly inserted DOM nodes and translate them too.
  useEffect(() => {
    if (language === "en") return;

    const root = document.querySelector("[data-translation-root]");
    if (!root) return;

    let timer: number | undefined;
    const hasTranslatableContent = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) return Boolean(node.nodeValue?.trim());
      if (!(node instanceof Element)) return false;
      return !node.closest(".notranslate, [translate='no'], [data-no-translate]") && Boolean(node.textContent?.trim());
    };

    const observer = new MutationObserver((records) => {
      const hasNewContent = records.some((record) =>
        Array.from(record.addedNodes).some(hasTranslatableContent)
      );
      if (!hasNewContent) return;

      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        setIsTranslating(true);
        translatePage(language)
          .catch((error) => {
            console.error("Unable to translate dynamically loaded content.", error);
            restoreEnglish();
          })
          .finally(() => setIsTranslating(false));
      }, 350);
    });

    observer.observe(root, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, [language, pathname, restoreEnglish, translatePage]);

  const value = useMemo(() => ({ language, isTranslating, changeLanguage }), [language, isTranslating, changeLanguage]);
  return <TranslationContext.Provider value={value}>{children}</TranslationContext.Provider>;
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) throw new Error("useTranslation must be used inside TranslationProvider");
  return context;
}
