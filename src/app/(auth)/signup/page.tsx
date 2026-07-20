"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

// Components
import SignupForm from "@/components/web/auth/SignupForm";

// Store
import { useAuthStore } from "@/lib/store";

export default function SignupPage() {
  const router = useRouter();
  const { signUp, googleLogin } = useAuthStore();

  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, touchedFields },
    setError,
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreeTerms: false,
    },
  });

  const password = watch("password");
  const agreeTerms = watch("agreeTerms");

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const result = await signUp(data.name, data.email, data.password);
      if (result.success) {
        toast.success("Account created successfully! Welcome to Prabasi Odia.");
        router.push("/");
      } else {
        if (result.error?.includes("email")) {
          setError("email", { message: result.error });
        } else {
          toast.error(result.error || "Signup failed. Please try again.");
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true);
    try {
      const result = await googleLogin();
      if (result.success) {
        toast.success("Signed up with Google successfully!");
        router.push("/");
      } else {
        toast.error(result.error || "Google signup failed. Please try again.");
      }
    } catch (error: any) {
      toast.error(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#FFF9F2]">
      {/* Background - Desktop */}
      <div className="absolute inset-0 hidden md:block">
        <Image src="/signupbg.png" alt="Background" fill priority className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#FFF9F2]/60 via-[#FFF9F2]/50 to-transparent" />
        {/* <div className="absolute inset-0 backdrop-blur-[1px]" /> */}
      </div>

      {/* Background - Mobile */}
      <div className="absolute inset-0 md:hidden">
        <Image src="/signupmob.png" alt="Background" fill priority className="object-cover" />
        <div className="absolute inset-0 bg-[#FFF9F2]/55" />
        {/* <div className="absolute inset-0 backdrop-blur-[1px]" /> */}
      </div>

      {/* Floating Golden Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [Math.random() * 100 - 50, Math.random() * 100 - 50],
              x: [Math.random() * 100 - 50, Math.random() * 100 - 50],
              opacity: [0, 0.4, 0],
            }}
            transition={{
              duration: 10 + Math.random() * 15,
              repeat: Infinity,
              delay: Math.random() * 10,
              ease: "easeInOut",
            }}
            className="absolute w-1.5 h-1.5 rounded-full bg-[#E8B84C]/30 blur-[1px]"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <section className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center gap-6 px-4 py-10 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:gap-0 lg:py-0 lg:px-10">
        {/* Left Content - Desktop only */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="hidden max-w-xl lg:block"
        >
          {/* Logo */}
          <Image
            src="/logo.png"
            alt="Prabasi Odia"
            width={76}
            height={76}
            className=" h-26 w-26 object-contain"
          />

          <span className="inline-flex items-center gap-2 rounded-full bg-[#6B1E5B]/10 px-5 py-2 text-sm font-medium text-[#6B1E5B]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6B1E5B] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#6B1E5B]" />
            </span>
            Welcome to Prabasi Odia
          </span>

          <h1 className="mt-8 text-6xl font-bold leading-tight text-[#2A1636]">
            Far From Odisha,
            <br />
            <span className="bg-gradient-to-r from-[#6B1E5B] via-[#D9772B] to-[#E6A11C] bg-clip-text text-transparent">
              Never Far From Home
            </span>
          </h1>

          <p className="mt-6 text-lg leading-9 text-gray-700 max-w-lg">
            Connect with Odias across the world. Discover events, communities, 
            culture, opportunities and lifelong friendships.
          </p>

          <p className="mt-8 text-sm text-gray-500 italic">
            "ନୂଆ ଯାତ୍ରା" — A New Journey Begins
          </p>
        </motion.div>

        {/* Mobile Welcome Text - visible below lg only */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-lg text-center lg:hidden"
        >
          <Image
            src="/logo.png"
            alt="Prabasi Odia"
            width={56}
            height={56}
            className="mx-auto mb-3 h-14 w-14 object-contain"
          />

          <span className="inline-flex items-center gap-2 rounded-full bg-[#6B1E5B]/10 px-4 py-1.5 text-xs font-medium text-[#6B1E5B]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6B1E5B] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#6B1E5B]" />
            </span>
            Welcome to Prabasi Odia
          </span>

          <h1 className="mt-4 text-3xl font-bold leading-tight text-[#2A1636] sm:text-4xl">
            Far From Odisha,{" "}
            <span className="bg-gradient-to-r from-[#6B1E5B] via-[#D9772B] to-[#E6A11C] bg-clip-text text-transparent">
              Never Far From Home
            </span>
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-700">
            Connect with Odias across the world — events, community, culture & more.
          </p>
        </motion.div>

        {/* Signup Form */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-full max-w-lg"
        >
          <SignupForm
            register={register}
            handleSubmit={handleSubmit}
            errors={errors}
            touchedFields={touchedFields}
            password={password}
            agreeTerms={agreeTerms}
            isLoading={isLoading}
            isGoogleLoading={isGoogleLoading}
            onSubmit={onSubmit}
            onGoogleSignup={handleGoogleSignup}
          />
        </motion.div>
      </section>
    </main>
  );
}