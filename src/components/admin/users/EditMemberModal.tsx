"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { Loader2, Save, Upload, User, X } from "lucide-react";
import { toast } from "react-hot-toast";
import { MemberUpdateData, UserData, adminUserService } from "@/lib/services/adminUserService";
import { userService } from "@/lib/services/userService";

interface Props {
  user: UserData | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

type FormData = Record<string, string>;

const fieldGroups = [
  ["displayName", "Full name", "text"], ["mobileNumber", "Mobile number", "tel"],
  ["dob", "Date of birth", "date"], ["gender", "Gender", "text"],
  ["bloodGroup", "Blood group", "text"], ["occupation", "Occupation", "text"],
  ["organization", "Organization", "text"], ["currentAddress", "Current address", "text"],
  ["currentCity", "Current city", "text"], ["currentState", "Current state", "text"],
  ["currentCountry", "Current country", "text"], ["currentPinCode", "Current PIN code", "text"],
  ["odishaHomeAddress", "Odisha home address", "text"], ["odishaDistrict", "Odisha district", "text"],
  ["odishaCity", "Odisha city", "text"], ["odishaPinCode", "Odisha PIN code", "text"],
] as const;

export default function EditMemberModal({ user, isOpen, onClose, onSaved }: Props) {
  const [form, setForm] = useState<FormData>({});
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user || !isOpen) return;
    const next: FormData = {};
    fieldGroups.forEach(([key]) => { next[key] = String(user[key] ?? ""); });
    next.interests = (user.interests || []).join(", ");
    setForm(next);
    setPhoto(null);
    setPreview(user.photoURL || user.documents?.profilePhoto || "");
  }, [user, isOpen]);

  const selectPhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Please select an image file");
    if (file.size > 5 * 1024 * 1024) return toast.error("Image must be 5 MB or smaller");
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!user) return;
    if (!form.displayName.trim()) return toast.error("Full name is required");
    setSaving(true);
    try {
      const data: MemberUpdateData = {
        ...Object.fromEntries(fieldGroups.map(([key]) => [key, form[key].trim()])),
        interests: form.interests.split(",").map((interest) => interest.trim()).filter(Boolean),
      } as MemberUpdateData;
      data.age = form.dob
        ? Math.max(0, new Date().getFullYear() - new Date(form.dob).getFullYear())
        : undefined;
      const result = await adminUserService.updateMember(user.uid, data);
      if (!result.success) throw new Error(result.error);
      if (photo) {
        const imageResult = await userService.uploadDocument(user.uid, photo, "profilePhoto");
        if (!imageResult.success) throw new Error("Member data was updated, but the photo could not be uploaded");
      }
      toast.success("Member details updated");
      onSaved();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update member");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !user) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-label="Edit member">
      <form onSubmit={submit} className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-[#FFF9F2] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#E7D7E8] bg-white/70 px-5 py-4">
          <div><h2 className="text-xl font-bold text-[#2A1636]">Edit Member</h2><p className="text-sm text-[#6B5E5A]">Correct submitted details and replace the profile photo if needed.</p></div>
          <button type="button" onClick={onClose} className="rounded-xl p-2 hover:bg-[#6B1E5B]/10" aria-label="Close"><X className="h-5 w-5" /></button>
        </div>
        <div className="overflow-y-auto p-5">
          <div className="mb-6 flex items-center gap-4 rounded-2xl border border-[#E7D7E8] bg-white/60 p-4">
            <div className="h-20 w-20 overflow-hidden rounded-full bg-[#6B1E5B]/10">{preview ? <img src={preview} alt="Profile preview" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-[#6B1E5B]"><User /></div>}</div>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#6B1E5B]/30 px-3 py-2 text-sm font-medium text-[#6B1E5B] hover:bg-[#6B1E5B]/5"><Upload className="h-4 w-4" /> Replace photo<input type="file" accept="image/*" className="hidden" onChange={selectPhoto} /></label>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {fieldGroups.map(([key, label, type]) => <label key={key} className={key.includes("Address") ? "sm:col-span-2" : ""}><span className="mb-1 block text-xs font-medium text-[#2A1636]">{label}{key === "displayName" && " *"}</span><input required={key === "displayName"} type={type} value={form[key] || ""} onChange={(event) => setForm({ ...form, [key]: event.target.value })} className="w-full rounded-xl border border-[#D4C8C0] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#6B1E5B]" /></label>)}
            <label className="sm:col-span-2"><span className="mb-1 block text-xs font-medium text-[#2A1636]">Interests (comma-separated)</span><input type="text" value={form.interests || ""} onChange={(event) => setForm({ ...form, interests: event.target.value })} className="w-full rounded-xl border border-[#D4C8C0] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#6B1E5B]" /></label>
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t border-[#E7D7E8] bg-white/70 px-5 py-4"><button type="button" onClick={onClose} disabled={saving} className="rounded-xl px-4 py-2.5 text-sm font-medium text-[#6B5E5A] hover:bg-[#6B1E5B]/5">Cancel</button><button disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-[#6B1E5B] px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save changes</button></div>
      </form>
    </div>
  );
}
