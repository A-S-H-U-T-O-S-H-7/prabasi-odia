// lib/utils/googleMapsLoader.ts
let isScriptLoaded = false;
let loadPromise: Promise<void> | null = null;

export const loadGoogleMapsScript = (): Promise<void> => {
  // If already loaded, resolve immediately
  if (typeof window !== "undefined" && window.google?.maps) {
    return Promise.resolve();
  }

  if (loadPromise) {
    return loadPromise;
  }

  // Check if script already exists
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
    // ✅ Include marker library
    script.src = `/api/maps/script?libraries=places,marker`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      // ✅ Wait for google.maps to be available
      let attempts = 0;
      const maxAttempts = 30;
      const checkInterval = setInterval(() => {
        attempts++;
        if (window.google?.maps) {
          clearInterval(checkInterval);
          isScriptLoaded = true;
          loadPromise = null;
          resolve();
        } else if (attempts >= maxAttempts) {
          clearInterval(checkInterval);
          reject(new Error("Google Maps failed to initialize"));
        }
      }, 100);
    };

    script.onerror = () => {
      loadPromise = null;
      reject(new Error("Failed to load Google Maps"));
    };

    document.head.appendChild(script);
  });

  return loadPromise;
};