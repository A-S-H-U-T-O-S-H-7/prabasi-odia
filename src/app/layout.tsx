'use client';

import { Libre_Baskerville, Poppins } from "next/font/google";
import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import SplashScreen from "@/components/web/layout/SplashScreen";
import { useAuthStore } from "@/lib/store";
import "./globals.css";

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

  return (
    <html lang="en" className={`${libreBaskerville.variable} ${poppins.variable}`}>
      <body className="font-body antialiased">
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