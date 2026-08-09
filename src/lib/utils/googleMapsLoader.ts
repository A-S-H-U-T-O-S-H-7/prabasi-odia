let isScriptLoaded = false;
let loadPromise: Promise<void> | null = null;

export const loadGoogleMapsScript = (): Promise<void> => {
  if (typeof window !== "undefined" && window.google?.maps) {
    return Promise.resolve();
  }

  if (loadPromise) {
    return loadPromise;
  }

  const existingScript = document.querySelector(
    'script[src*="/api/maps/script"]'
  );
  if (existingScript) {
    return new Promise((resolve) => {
      const checkLoaded = setInterval(() => {
        if (window.google?.maps) {
          clearInterval(checkLoaded);
          resolve();
        }
      }, 100);
    });
  }

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `/api/maps/script?libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      isScriptLoaded = true;
      loadPromise = null;
      resolve();
    };

    script.onerror = () => {
      loadPromise = null;
      reject(new Error("Failed to load Google Maps"));
    };

    document.head.appendChild(script);
  });

  return loadPromise;
};