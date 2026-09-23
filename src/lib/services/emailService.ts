// lib/services/emailService.ts
import axios from 'axios';
import { parseVerificationEmailResponse } from './verificationEmailResponse';
import { VERIFICATION_EMAIL_ENDPOINT } from './verificationEmailEndpoint';

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
   * Generate the PDF and send to PHP through the server-side verification route.
   */
  async sendVerificationEmail(data: VerificationEmailData): Promise<{ success: boolean; message?: string }> {
    try {
      // The server prepares the card only. The browser then sends the JSON
      // format required by the PHP email endpoint, avoiding a slow Next.js
      // relay while preserving the backend's data-URI attachment contract.
      const prepared = await axios({
        method: "POST",
        url: "/api/email/verification?prepareOnly=1",
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
        // This request generates the PDF but does not send an email.
        timeout: 55_000,
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      });

      const fields = prepared.data?.fields;
      if (!prepared.data?.success || !fields || typeof fields !== 'object') {
        return { success: false, message: 'Could not prepare the member-card attachment.' };
      }

      const rawPdf = typeof fields.member_card_path === 'string' ? fields.member_card_path : '';
      if (!rawPdf) {
        return { success: false, message: 'The member-card attachment is missing.' };
      }

      const memberSince = typeof fields.member_since === 'string'
        ? fields.member_since.replace(/^(\d{2})-(\d{2})-(\d{4})$/, '$3-$2-$1')
        : '';
      const providerPayload = {
        name: String(fields.name || ''),
        email: String(fields.email || ''),
        member_id: String(fields.member_id || ''),
        member_since: memberSince,
        community_name: String(fields.community_name || ''),
        // The PHP API's verified request format requires this prefix.
        member_card_path: `data:application/pdf;base64,${rawPdf}`,
      };

      const response = await fetch(VERIFICATION_EMAIL_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(providerPayload),
        credentials: 'omit',
      });
      const body = await response.text();
      return parseVerificationEmailResponse(response.status, body);
    } catch (error: any) {
      // Do not log the Axios request: it contains member details and the PDF.
      // A browser fetch failure is normally a connectivity or CORS issue.
      return {
        success: false,
        message: error?.response?.data?.message ||
          'Could not contact the email provider directly. Check its CORS setting and the inbox before retrying.',
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
