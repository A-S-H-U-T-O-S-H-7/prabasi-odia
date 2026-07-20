"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

// Components
import LoginForm from "@/components/web/auth/LoginForm";

// Store
import { useAuthStore } from "@/lib/store";

// ============================================
// TYPES
// ============================================
interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { signIn, googleLogin } = useAuthStore();

  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
    setError,
  } = useForm<LoginFormData>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const result = await signIn(data.email, data.password);
      if (result.success) {
        toast.success("Welcome back!");
        router.push("/");
      } else {
        if (result.error?.toLowerCase().includes("password")) {
          setError("password", { message: result.error });
        } else if (result.error?.toLowerCase().includes("email")) {
          setError("email", { message: result.error });
        } else {
          toast.error(result.error || "Invalid email or password.");
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      const result = await googleLogin();
      if (result.success) {
        toast.success("Signed in with Google successfully!");
        router.push("/");
      } else {
        toast.error(result.error || "Google login failed. Please try again.");
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
        <Image src="/loginbg3.png" alt="Background" fill priority className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#FFF9F2]/80 via-[#FFF9F2]/10 to-transparent" />
        {/* <div className="absolute inset-0 backdrop-blur-[2px]" /> */}
      </div>

      {/* Background - Mobile */}
      <div className="absolute inset-0 md:hidden">
        <Image src="/loginmobbg.png" alt="Background" fill priority className="object-cover" />
      </div>

      {/* Content */}
      <section className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center gap-8 px-4 py-10 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:gap-0 lg:py-0 lg:px-10">
        {/* Left Content - Desktop only */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="hidden max-w-xl lg:block"
        >
          <Image
            src="/logo.png"
            alt="Prabasi Odia"
            width={76}
            height={76}
            className="h-20 w-20 object-contain"
          />

          <h2 className="mt-4 text-4xl font-bold text-[#6B1E5B]">
            Prabasi <span className="text-[#D9772B]">Odia</span>
          </h2>
          <p className="mt-1 text-xs font-semibold tracking-[0.2em] text-[#6B1E5B]/70">
            CONNECT · CULTURE · COMMUNITY
          </p>

          <h1 className="mt-8 text-5xl font-bold leading-tight text-[#2A1636]">
            Welcome Back!
          </h1>

          <p className="mt-4 text-base leading-7 text-gray-700 max-w-md">
            Sign in to continue your journey with the Global{" "}
            <span className="font-semibold text-[#6B1E5B]">Prabasi Odia</span>{" "}
            Community.
          </p>
        </motion.div>

        {/* Mobile Welcome Text */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md text-center lg:hidden"
        >
          <Image
            src="/logo.png"
            alt="Prabasi Odia"
            width={56}
            height={56}
            className="mx-auto mb-2 h-14 w-14 object-contain"
          />
          <h2 className="text-2xl font-bold text-[#6B1E5B]">
            Prabasi <span className="text-[#D9772B]">Odia</span>
          </h2>
          <p className="mt-1 text-[10px] font-semibold tracking-[0.2em] text-[#6B1E5B]/70">
            CONNECT · CULTURE · COMMUNITY
          </p>
          <h1 className="mt-4 text-3xl font-bold text-[#2A1636]">Welcome Back!</h1>
          <p className="mt-2 text-sm text-gray-700">
            Sign in to continue your journey with us.
          </p>
        </motion.div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-full max-w-md"
        >
          <LoginForm
            register={register}
            handleSubmit={handleSubmit}
            errors={errors}
            touchedFields={touchedFields}
            isLoading={isLoading}
            isGoogleLoading={isGoogleLoading}
            onSubmit={onSubmit}
            onGoogleLogin={handleGoogleLogin}
          />
        </motion.div>
      </section>
    </main>
  );
}