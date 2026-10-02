'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CalendarDays, HeartPulse, MessageCircle, ShieldCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuthStore, useUserStore } from '@/lib/store';
import { canUseMemberServices } from '@/lib/residency';
import type { ConsultationDraft, Doctor } from '@/lib/doctors/types';
import { doctorsService } from '@/lib/services/doctorsService';
import DoctorCard from './DoctorCard';
import DoctorDialog from './DoctorDialog';
import DoctorFilters from './DoctorFilters';
import DoctorHero from './DoctorHero';

export default function Doctors() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuthStore();
  const profile = useUserStore((state) => state.profile);
  const currentProfile = profile?.uid === user?.uid ? profile : null;
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [specialty, setSpecialty] = useState('All specialties');
  const [mode, setMode] = useState('All modes');
  const [selected, setSelected] = useState<Doctor | null>(null);
  const [requesting, setRequesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setDoctors(await doctorsService.getPublished());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load doctors.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return doctors.filter(
      (doctor) =>
        (specialty === 'All specialties' || doctor.specialty === specialty) &&
        (mode === 'All modes' ||
          doctor.modes.includes(mode as Doctor['modes'][number])) &&
        (!term ||
          `${doctor.name} ${doctor.specialty} ${doctor.city} ${doctor.country} ${doctor.degrees}`
            .toLowerCase()
            .includes(term))
    );
  }, [doctors, search, specialty, mode]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selected || saving) return;

    const form = new FormData(event.currentTarget);
    const draft: ConsultationDraft = {
      patientName: String(form.get('patientName') || '').trim(),
      age: Number(form.get('age')),
      phone: String(form.get('phone') || '').trim(),
      email: String(form.get('email') || '').trim(),
      city: String(form.get('city') || '').trim(),
      concern: String(form.get('concern') || '').trim(),
      mode: String(form.get('mode')) as ConsultationDraft['mode'],
      preferredDate: String(form.get('preferredDate') || ''),
      preferredTime: String(form.get('preferredTime') || ''),
    };
    setSaving(true);
    setFormError('');
    try {
      await doctorsService.requestConsultation(selected.id, draft);
      setSelected(null);
      setRequesting(false);
      toast.success('Request sent. Check My consultations for updates.');
    } catch (cause) {
      setFormError(cause instanceof Error ? cause.message : 'Could not send your request.');
    } finally {
      setSaving(false);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setSpecialty('All specialties');
    setMode('All modes');
  };

  return (
    <main className="min-h-screen bg-[#f5faf8] px-2 py-3 text-[#153b45] sm:px-4 md:py-8">
      <div className="mx-1 max-w-8xl md:mx-10">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-3 inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-[#657c80] transition-colors hover:text-[#167f82]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <DoctorHero />

        <div className="mb-9 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#d6e9e5] bg-white p-5">
            <ShieldCheck className="text-[#16868a]" size={24} />
            <strong className="mt-3 block text-sm">Admin listed doctors</strong>
            <p className="mt-1 text-xs leading-5 text-[#657c80]">
              Profiles are added and managed by our team.
            </p>
          </div>
          <div className="rounded-2xl border border-[#d6e9e5] bg-white p-5">
            <CalendarDays className="text-[#16868a]" size={24} />
            <strong className="mt-3 block text-sm">Scheduled by our team</strong>
            <p className="mt-1 text-xs leading-5 text-[#657c80]">
              We confirm a time after reviewing your request.
            </p>
          </div>
          <div className="rounded-2xl border border-[#d6e9e5] bg-white p-5">
            <MessageCircle className="text-[#16868a]" size={24} />
            <strong className="mt-3 block text-sm">Connect outside the site</strong>
            <p className="mt-1 text-xs leading-5 text-[#657c80]">
              Chat, phone and video calls use external services.
            </p>
          </div>
        </div>

        <section id="find-a-doctor" className="scroll-mt-24">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.18em] text-[#16868a]">
                Doctor directory
              </p>
              <h2 className="mt-2 font-serif text-3xl font-bold">Find your doctor</h2>
            </div>
            <span className="text-sm text-[#657c80]">
              {loading ? 'Loading...' : `${visible.length} available`}
            </span>
          </div>
          <DoctorFilters
            search={search}
            specialty={specialty}
            mode={mode}
            onSearch={setSearch}
            onSpecialty={setSpecialty}
            onMode={setMode}
          />

          {error ? (
            <div role="alert" className="mt-6 rounded-2xl bg-white p-8 text-center text-sm text-red-700">
              {error}
              <button
                type="button"
                onClick={() => void load()}
                className="ml-2 font-semibold underline"
              >
                Try again
              </button>
            </div>
          ) : loading ? (
            <div role="status" className="mt-6 rounded-2xl bg-white p-12 text-center text-sm text-[#657c80]">
              Loading doctors...
            </div>
          ) : visible.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-[#c8deda] bg-white p-12 text-center">
              <HeartPulse className="mx-auto text-[#16868a]" />
              <h3 className="mt-4 font-semibold">No doctors match your search</h3>
              <p className="mt-2 text-sm text-[#657c80]">
                Try a different specialty or city.
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 text-sm font-bold text-[#167f82]"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {visible.map((doctor) => (
                <DoctorCard
                  key={doctor.id}
                  doctor={doctor}
                  onOpen={() => {
                    setSelected(doctor);
                    setRequesting(false);
                    setFormError('');
                  }}
                />
              ))}
            </div>
          )}
        </section>

        <p className="mt-10 rounded-2xl border border-[#d5e6e5] bg-[#ecf6f4] p-5 text-sm leading-6 text-[#496c70]">
          <strong className="text-[#174a55]">For emergencies:</strong> This service does
          not provide immediate care. Please contact your local emergency service or go to
          the nearest emergency department.
        </p>
      </div>

      {selected && (
        <DoctorDialog
          doctor={selected}
          requesting={requesting}
          saving={saving}
          formError={formError}
          isAuthenticated={isAuthenticated}
          authLoading={authLoading}
          name={user?.displayName || ''}
          email={user?.email || ''}
          onClose={() => {
            if (!saving) setSelected(null);
          }}
          onRequesting={(next) => {
            if (next && (!(currentProfile?.isVerified ?? user?.isVerified) ||
              !(currentProfile?.hasJoinedCommunity ?? user?.hasJoinedCommunity) ||
              !canUseMemberServices(currentProfile?.residencyStatus ?? user?.residencyStatus))) {
              toast.error('An approved Odia account is required to contact a doctor.');
              return;
            }
            setRequesting(next);
          }}
          onSubmit={submit}
        />
      )}
    </main>
  );
}
