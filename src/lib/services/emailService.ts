// lib/services/emailService.ts
import axios from 'axios';

interface WelcomeEmailData {
  name: string;
  email: string;
}

interface VerificationEmailData {
  uid: string;
  name: string;
  email: string;
  memberId: string;
  memberSince: string;
  communityName: string;
  bloodGroup?: string;
  location?: string;
  photoURL?: string;
  residencyStatus?: 'RI' | 'NRI';
}

interface RejectionEmailData {
  name: string;
  email: string;
  applicationId: string;
  rejectionReason: string;
  communityName: string;
}

interface UrgentHelpNotificationData {
  requestTitle: string;
  helpType: string;
  location: string;
  situationMessage: string;
  contactName: string;
  contactPhone: string;
  accountEmail: string;
  attachmentsHtml: string;
  adminPanelLink: string;
}

interface JobApplicationNotificationData {
  posterEmail: string;
  posterName: string;
  jobTitle: string;
  companyName: string;
  jobLocation: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  applicantNote: string;
  resumeHtml: string;
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
        timeout: 25_000,
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
          uid: data.uid,
          name: data.name,
          email: data.email,
          memberId: data.memberId,
          memberSince: data.memberSince,
          communityName: data.communityName,
          bloodGroup: data.bloodGroup,
          location: data.location,
          photoURL: data.photoURL,
          residencyStatus: data.residencyStatus,
        },
        // Keep this below the API route's 60-second execution limit so the
        // admin receives a useful error instead of a terminated request.
        timeout: 55_000,
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
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
        message: error?.response?.data?.message || error?.message || "Email service error",
      };
    }
  },

  /** Send an application rejection email through the server-side proxy. */
  async sendRejectionEmail(data: RejectionEmailData): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await axios({
        method: "POST",
        url: "/api/email/rejection",
        headers: { "Content-Type": "application/json" },
        data,
        timeout: 30_000,
      });
      return response.data?.status === true
        ? { success: true, message: response.data.message }
        : { success: false, message: response.data?.message || "Failed to send rejection email" };
    } catch (error: any) {
      console.error("Rejection email error:", error);
      return { success: false, message: error?.response?.data?.message || error?.message || "Email service error" };
    }
  },

  /** Notify admins when a verified member submits an urgent-help request. */
  async sendUrgentHelpNotification(data: UrgentHelpNotificationData): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await axios({
        method: "POST",
        url: "/api/email/urgent-help",
        headers: { "Content-Type": "application/json" },
        data,
        timeout: 30_000,
      });
      return response.data?.status === true
        ? { success: true, message: response.data.message }
        : { success: false, message: response.data?.message || "Failed to notify admins" };
    } catch (error: any) {
      console.error("Urgent-help notification error:", error);
      return { success: false, message: error?.response?.data?.message || error?.message || "Email service error" };
    }
  },

  /** Notify the job poster when a member expresses interest in their job. */
  async sendJobApplicationNotification(data: JobApplicationNotificationData): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await axios({ method: "POST", url: "/api/email/job-application", headers: { "Content-Type": "application/json" }, data, timeout: 30_000 });
      return response.data?.status === true
        ? { success: true, message: response.data.message }
        : { success: false, message: response.data?.message || "Failed to notify the job poster" };
    } catch (error: any) {
      console.error("Job application notification error:", error);
      return { success: false, message: error?.response?.data?.message || error?.message || "Email service error" };
    }
  },
};
