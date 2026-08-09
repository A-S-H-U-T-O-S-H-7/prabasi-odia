// lib/services/emailService.ts
import axios from 'axios';

interface WelcomeEmailData {
  name: string;
  email: string;
}

interface VerificationEmailData {
  name: string;
  email: string;
  memberId: string;
  memberSince: string;
  communityName: string;
  memberCardPath: string;
}

export const emailService = {
  /**
   * Send welcome email - Uses Next.js API route as proxy (no CORS issues)
   */
  async sendWelcomeEmail(data: WelcomeEmailData): Promise<{ success: boolean; message?: string }> {
    try {
      // ✅ Call our own API route (server-side proxy)
      const response = await axios({
        method: "POST",
        url: "/api/email/welcome", // ← Local API route
        headers: {
          "Content-Type": "application/json",
        },
        data: {
          name: data.name,
          email: data.email,
        },
      });

      if (response.data?.status === true) {
        return { success: true, message: response.data.message };
      } else {
        return {
          success: false,
          message: response.data?.message || "Failed to send welcome email",
        };
      }
    } catch (error: any) {
      console.error("Welcome email error:", error);
      return {
        success: false,
        message: error?.message || "Email service error",
      };
    }
  },

  /**
   * Send verification email - Uses Next.js API route as proxy
   */
  async sendVerificationEmail(data: VerificationEmailData): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await axios({
        method: "POST",
        url: "/api/email/verification", // ← Local API route
        headers: {
          "Content-Type": "application/json",
        },
        data: {
          name: data.name,
          email: data.email,
          memberId: data.memberId,
          memberSince: data.memberSince,
          communityName: data.communityName,
          memberCardPath: data.memberCardPath,
        },
      });

      if (response.data?.status === true) {
        return { success: true, message: response.data.message };
      } else {
        return {
          success: false,
          message: response.data?.message || "Failed to send verification email",
        };
      }
    } catch (error: any) {
      console.error("Verification email error:", error);
      return {
        success: false,
        message: error?.message || "Email service error",
      };
    }
  },
};