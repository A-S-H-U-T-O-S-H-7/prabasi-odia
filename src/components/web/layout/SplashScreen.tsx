'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function SplashScreen() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1.5;
      });
    }, 30);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Shadow that grows as the screen folds */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 0, scale: 0.9 }}
        exit={{ 
          opacity: 0.4,
          scale: 1,
          transition: { duration: 0.8 }
        }}
        className="fixed inset-0 z-[9998] bg-black/30 pointer-events-none"
        style={{ 
          transformOrigin: 'bottom center',
        }}
      />

      {/* Splash Screen */}
      <motion.div
        initial={{ 
          opacity: 1,
          rotateX: 0,
          rotateY: 0,
          scale: 1,
          skewX: 0,
        }}
        animate={{ 
          opacity: 1,
          rotateX: 0,
          rotateY: 0,
          scale: 1,
          skewX: 0,
        }}
        exit={{ 
          opacity: 0,
          rotateX: -160,
          rotateY: 30,
          skewX: 10,
          scale: 0.7,
          transition: {
            duration: 0.9,
            ease: [0.65, 0, 0.35, 1],
          }
        }}
        style={{
          transformStyle: 'preserve-3d',
          transformOrigin: 'bottom center',
          perspective: '1200px',
          border: `2px solid #E7D7E8`,
          boxShadow: '0 20px 60px rgba(107, 30, 91, 0.15)',
        }}
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#FFF8F2]"
      >
        <div className="relative flex flex-col items-center">
          {/* Decorative Purple Circle Behind Logo */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="absolute inset-0 w-48 h-48 rounded-full bg-primary blur-2xl"
          />

          {/* Logo */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              type: 'spring',
              stiffness: 200,
              damping: 25,
            }}
            className="relative"
          >
            <Image
              src="/logo.png"
              alt="Prabasi Odia"
              width={200}
              height={80}
              className="h-auto w-auto"
              priority
            />
          </motion.div>

          {/* Saffron + Gold Accent Line */}
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 80, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="h-0.5 mt-6 rounded-full"
            style={{
              background: 'linear-gradient(to right, #D9772B, #E6A11C)',
            }}
          />

          {/* Loading Progress Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-8 w-48"
          >
            <div className="h-1 bg-[#E7D7E8] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.2 }}
                className="h-full rounded-full"
                style={{
                  background: 'linear-gradient(to right, #6B1E5B, #D9772B, #E6A11C)',
                }}
              />
            </div>
          </motion.div>

          {/* Loading Dots */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-4 flex space-x-2"
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  y: [0, -6, 0],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: 'easeInOut',
                }}
                className="w-2 h-2 rounded-full"
                style={{
                  background: i === 0 ? '#6B1E5B' : i === 1 ? '#D9772B' : '#E6A11C',
                }}
              />
            ))}
          </motion.div>

          {/* Version */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="absolute -bottom-8 text-xs"
            style={{ color: '#6B5E5A' }}
          >
            v1.0.0
          </motion.p>
        </div>
      </motion.div>
    </>
  );
}