'use client';

import { Libre_Baskerville, Poppins } from "next/font/google";
import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import SplashScreen from "@/components/web/layout/SplashScreen";
import { useAuthStore } from "@/lib/store";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const libreBaskerville = Libre_Baskerville({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-libre-baskerville",
  display: "swap",
});

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isLoading, setIsLoading] = useState(true);
  const { initialize } = useAuthStore();

  useEffect(() => {
    // Initialize auth listener
    const unsubscribe = initialize();
    
    // Splash screen timer
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, [initialize]);

  useEffect(() => {
    const blockKeyboardZoom = (event: KeyboardEvent) => {
      if (event.ctrlKey && ["+", "-", "=", "0"].includes(event.key)) event.preventDefault();
    };
    const blockPinchZoom = (event: WheelEvent) => {
      if (event.ctrlKey) event.preventDefault();
    };
    const blockGestureZoom = (event: Event) => event.preventDefault();

    window.addEventListener("keydown", blockKeyboardZoom);
    window.addEventListener("wheel", blockPinchZoom, { passive: false });
    document.addEventListener("gesturestart", blockGestureZoom, { passive: false });
    document.addEventListener("gesturechange", blockGestureZoom, { passive: false });
    document.addEventListener("gestureend", blockGestureZoom, { passive: false });

    return () => {
      window.removeEventListener("keydown", blockKeyboardZoom);
      window.removeEventListener("wheel", blockPinchZoom);
      document.removeEventListener("gesturestart", blockGestureZoom);
      document.removeEventListener("gesturechange", blockGestureZoom);
      document.removeEventListener("gestureend", blockGestureZoom);
    };
  }, []);

  return (
    <html lang="en" className={`${libreBaskerville.variable} ${poppins.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no" />
      </head>
      <body className="font-body antialiased">
        <Toaster position="top-center" />
        <AnimatePresence mode="wait">
          {isLoading ? (
            <SplashScreen key="splash" />
          ) : (
            <div key="content">{children}</div>
          )}
        </AnimatePresence>
      </body>
    </html>
  );
}
