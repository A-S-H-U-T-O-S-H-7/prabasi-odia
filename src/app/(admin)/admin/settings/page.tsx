"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Phone, Share2 } from "lucide-react";
import { toast } from "react-hot-toast";
import useAdminAuthStore from "@/lib/store/useAdminAuthStore";
import { useActivityLogger } from "@/hooks/useActivityLogger";
import SocialLinks from "@/components/admin/settings/SocialLinks";
import ContactSettings from "@/components/admin/settings/ContactSettings";
import { 
  getSettings, 
  updateSocialLinks, 
  updateContactSettings 
} from "@/lib/services/settingsService";
import { ActivityActions, ActivityEntityTypes } from "@/lib/services/activityLogService";

const tabs = [
  { id: "social", name: "Social Links", icon: Share2 },
  { id: "contact", name: "Contact", icon: Phone },
];

export default function SettingsPage() {
  const router = useRouter();
  const { admin } = useAdminAuthStore();
  const { log } = useActivityLogger();
  const [activeTab, setActiveTab] = useState("social");
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const hasPermission = admin?.role === 'super_admin' || admin?.permissions?.includes('manage_settings');

  useEffect(() => {
    if (!hasPermission) {
      toast.error("You don't have permission to access this page");
      router.push('/admin/dashboard');
      return;
    }
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const result = await getSettings();
      if (result.success) {
        setSettings(result.settings);
      } else {
        toast.error("Failed to load settings");
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSocial = async (data: any) => {
    const result = await updateSocialLinks(data, admin);
    if (result.success) {
      await log({
        action: ActivityActions.UPDATE,
        entityType: ActivityEntityTypes.SETTINGS,
        entityId: 'social',
        entityTitle: 'Social Links',
        details: 'Updated social media links',
      });
      toast.success("Social links updated");
      fetchSettings();
    } else {
      toast.error(result.error || "Failed to update settings");
    }
  };

  const handleUpdateContact = async (data: any) => {
    const result = await updateContactSettings(data, admin);
    if (result.success) {
      await log({
        action: ActivityActions.UPDATE,
        entityType: ActivityEntityTypes.SETTINGS,
        entityId: 'contact',
        entityTitle: 'Contact Settings',
        details: 'Updated contact information',
      });
      toast.success("Contact information updated");
      fetchSettings();
    } else {
      toast.error(result.error || "Failed to update contact info");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-10 h-10 border-4 border-[#6B1E5B] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!hasPermission) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-2xl font-serif font-bold text-[#2A1636]">Access Denied</h2>
          <p className="text-[#6B5E5A] mt-2">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl border-2 border-[#6B1E5B]/20 text-[#6B1E5B] hover:bg-[#6B1E5B]/5 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#2A1636]">Settings</h1>
          <p className="text-sm text-[#6B5E5A] mt-1">Manage your website configuration</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#E7D7E8]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all duration-200 border-b-2 ${
                activeTab === tab.id
                  ? "border-[#6B1E5B] text-[#6B1E5B]"
                  : "border-transparent text-[#6B5E5A] hover:text-[#2A1636]"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="pt-2">
        {activeTab === "social" && settings?.social && (
          <SocialLinks
            settings={settings.social}
            onUpdate={handleUpdateSocial}
          />
        )}

        {activeTab === "contact" && settings?.contact && (
          <ContactSettings
            settings={settings.contact}
            onUpdate={handleUpdateContact}
          />
        )}
      </div>
    </div>
  );
}