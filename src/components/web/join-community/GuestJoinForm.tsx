'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuthStore, useUserStore } from '@/lib/store';
import { isResidencyContactVerified } from '@/lib/residency';
import { normalizeIndianPhone } from '@/lib/mobileVerification';
import { userService } from '@/lib/services/userService';
import { emailService } from '@/lib/services/emailService';
import JoinCommunityLayout from './JoinCommunityLayout';
import JoinFormSupport from './JoinFormSupport';
import ProfilePhotoUpload from './step1/ProfilePhotoUpload';
import ContactVerification from './step1/ContactVerification';

const guestSchema = z.object({
  residencyStatus: z.literal('GUEST'),
  photo: z.any().refine((file) => file instanceof File, 'Profile photo is required'),
  fullName: z.string().trim().min(2, 'Enter your full name'),
  email: z.email('Enter a valid email address'),
  mobileCountryCode: z.string().min(1, 'Choose a country code'),
  mobileNumber: z.string().trim().min(4, 'Enter your mobile number').max(20, 'Mobile number is too long'),
  emailVerified: z.boolean(),
  verifiedEmail: z.string(),
  mobileVerified: z.boolean(),
  verifiedMobileNumber: z.string(),
  password: z.string().min(8, 'Use at least 8 characters'),
  confirmPassword: z.string(),
}).superRefine((data, ctx) => {
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({ code: 'custom', message: 'Passwords do not match', path: ['confirmPassword'] });
  }
  if (data.mobileCountryCode === '+91' && !normalizeIndianPhone(`+91${data.mobileNumber}`)) {
    ctx.addIssue({ code: 'custom', message: 'Enter a valid 10-digit Indian mobile number', path: ['mobileNumber'] });
  }
});

type GuestFormData = z.infer<typeof guestSchema>;

export default function GuestJoinForm({ onChangeType }: { onChangeType: () => void }) {
  const router = useRouter();
  const { user, signUp, logout } = useAuthStore();
  const isDraftAccount = Boolean(
    user?.uid && user.applicationStatus === 'draft' &&
    !user.hasJoinedCommunity && !user.isVerified
  );
  const fetchUserProfile = useUserStore((state) => state.fetchUserProfile);
  const [attempted, setAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const inFlight = useRef(false);

  const form = useForm<GuestFormData>({
    resolver: zodResolver(guestSchema) as never,
    defaultValues: {
      residencyStatus: 'GUEST',
      fullName: '',
      email: '',
      mobileCountryCode: '+91',
      mobileNumber: '',
      emailVerified: false,
      verifiedEmail: '',
      mobileVerified: false,
      verifiedMobileNumber: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  });
  const { setValue } = form;

  useEffect(() => {
    if (!isDraftAccount) return;
    setValue('email', user.email || '');
    setValue('password', 'existing-account');
    setValue('confirmPassword', 'existing-account');
  }, [isDraftAccount, user?.email, setValue]);

  const email = form.watch('email');
  const errors = form.formState.errors;
  const fieldClass = 'mt-1.5 w-full rounded-xl border border-[#D4C8C0] bg-white px-4 py-3 text-sm text-[#2A1636] outline-none focus:border-[#6B1E5B] focus:ring-2 focus:ring-[#6B1E5B]/20';

  const submit = async (values: GuestFormData) => {
    if (inFlight.current || success) return;
    inFlight.current = true;
    setSubmitting(true);
    setError('');

    try {
      if (user?.uid && !isDraftAccount) {
        throw new Error('Sign out before creating a new Guest account.');
      }
      if (user?.uid) {
        if (user.email?.toLowerCase() !== values.email.trim().toLowerCase()) {
          throw new Error('Use the email address of your signed-in account.');
        }
        const existing = await userService.getUserProfile(user.uid);
        if (existing.data?.hasJoinedCommunity || existing.data?.isVerified) {
          throw new Error('This account already has a member application.');
        }
      }
      if (!isResidencyContactVerified(values)) {
        throw new Error('Please verify your email address before creating your Guest account.');
      }

      const duplicate = await userService.findDuplicateIdentity({
        uid: user?.uid || '',
        phoneNumber: values.mobileNumber,
        mobileCountryCode: values.mobileCountryCode,
      });
      if (duplicate.field === 'phone') {
        throw new Error('This mobile number is already linked to another account.');
      }

      if (!isDraftAccount) {
        const created = await signUp(values.fullName, values.email.trim(), values.password);
        if (!created.success) throw new Error(created.error || 'Could not create your account.');
      }
      const uid = useAuthStore.getState().user?.uid;
      if (!uid) throw new Error('Your account was created, but your profile could not be saved. Please sign in and try again.');

      const photo = await userService.uploadDocument(uid, values.photo as File, 'profilePhoto', false);
      await userService.createUserProfile(uid, {
        uid,
        displayName: values.fullName.trim(),
        email: values.email.trim(),
        phoneNumber: values.mobileNumber.trim(),
        mobileCountryCode: values.mobileCountryCode,
        phoneKey: `${values.mobileCountryCode}${values.mobileNumber}`.replace(/[^0-9+]/g, ''),
        residencyStatus: 'GUEST',
        photoURL: photo.url,
        documents: { profilePhoto: photo.url },
        age: 0,
        gender: '',
        bloodGroup: '',
        odishaHomeAddress: '',
        odishaDistrict: '',
        odishaCity: '',
        odishaPinCode: '',
        currentAddress: '',
        currentCity: '',
        currentState: '',
        currentCountry: '',
        currentPinCode: '',
        interests: [],
        familyMembers: [],
        hasJoinedCommunity: false,
        isVerified: false,
        applicationStatus: 'draft',
      });
      await fetchUserProfile(uid);
      const welcomeEmail = await emailService.sendWelcomeEmail({
        name: values.fullName.trim(),
        email: values.email.trim(),
      });
      setSuccess(true);
      toast.success('Guest account created. Welcome!');
      if (!welcomeEmail.success) {
        toast.error('Your account is ready, but the welcome email could not be sent.');
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not create your Guest account. Please try again.');
    } finally {
      inFlight.current = false;
      setSubmitting(false);
    }
  };

  return (
    <FormProvider {...form}>
      <JoinFormSupport step={1}>
        <JoinCommunityLayout currentStep={1} totalSteps={1} title={success ? 'Welcome to Prabasi Odia' : 'Create a Guest account'} subtitle={success ? 'Your account is ready' : 'One short form to explore the site'}>
          {success ? (
            <div className="mx-auto max-w-md py-8 text-center">
              <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-600" />
              <h2 className="mt-4 font-serif text-2xl font-bold text-[#2A1636]">You are all set</h2>
              <p className="mt-2 text-sm leading-6 text-[#6B5E5A]">You can browse Prabasi Odia. Member actions become available only through an approved Odia member application.</p>
              <button type="button" onClick={() => router.replace('/')} className="mt-6 rounded-xl bg-[#6B1E5B] px-6 py-3 font-semibold text-white">Explore the site</button>
            </div>
          ) : user?.uid && !isDraftAccount ? (
            <div className="mx-auto max-w-md py-8 text-center">
              <h2 className="font-serif text-2xl font-bold text-[#2A1636]">You are signed in</h2>
              <p className="mt-3 text-sm leading-6 text-[#6B5E5A]">Sign out to create a separate Guest account with a new email and password.</p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button type="button" onClick={onChangeType} className="rounded-xl border border-[#D4C8C0] px-5 py-3 font-semibold text-[#2A1636]">Choose another option</button>
                <button type="button" onClick={() => void logout()} className="rounded-xl bg-[#6B1E5B] px-5 py-3 font-semibold text-white">Sign out and continue</button>
              </div>
            </div>
          ) : (
            <form noValidate onSubmit={form.handleSubmit(submit, () => { setAttempted(true); setError('Please check the highlighted fields.'); })} className="mx-auto max-w-2xl space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#6B1E5B]/15 bg-[#6B1E5B]/5 px-4 py-3 text-sm">
                <span className="font-semibold text-[#2A1636]">Joining as Guest</span>
                <button type="button" onClick={onChangeType} className="font-semibold text-[#6B1E5B] underline underline-offset-2">Change</button>
              </div>
              <ProfilePhotoUpload hasAttemptedSubmit={attempted} />
              <label className="block text-sm font-medium text-[#2A1636]">Full name
                <input {...form.register('fullName')} autoComplete="name" className={fieldClass} placeholder="Your full name" />
                {errors.fullName && <span className="mt-1 block text-xs text-red-600">{errors.fullName.message}</span>}
              </label>
              <ContactVerification loginEmail={email} lockedEmail={isDraftAccount} verificationChannel="email" />
              {isDraftAccount && <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">Finish setting up your existing account. Your password was already created.</p>}
              {!isDraftAccount && <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-[#2A1636]">Password
                  <input {...form.register('password')} type="password" autoComplete="new-password" className={fieldClass} placeholder="At least 8 characters" />
                  {errors.password && <span className="mt-1 block text-xs text-red-600">{errors.password.message}</span>}
                </label>
                <label className="block text-sm font-medium text-[#2A1636]">Confirm password
                  <input {...form.register('confirmPassword')} type="password" autoComplete="new-password" className={fieldClass} placeholder="Re-enter your password" />
                  {errors.confirmPassword && <span className="mt-1 block text-xs text-red-600">{errors.confirmPassword.message}</span>}
                </label>
              </div>}
              {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
              <button type="submit" disabled={submitting} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#6B1E5B] px-5 py-3 font-semibold text-white disabled:opacity-60">
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}{submitting ? 'Creating account...' : 'Create Guest account'}
              </button>
            </form>
          )}
        </JoinCommunityLayout>
      </JoinFormSupport>
    </FormProvider>
  );
}
