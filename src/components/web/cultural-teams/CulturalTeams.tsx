'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Music2, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuthStore, useUserStore } from '@/lib/store';
import { canUseMemberServices } from '@/lib/residency';
import {
  type CulturalTeam,
  type CulturalTeamDraft,
  type CulturalTeamEnquiryDraft,
  type TravelScope,
} from '@/lib/culturalTeams/types';
import { culturalTeamsService } from '@/lib/services/culturalTeamsService';
import CulturalTeamCard from './CulturalTeamCard';
import CulturalTeamDialog from './CulturalTeamDialog';
import CulturalTeamsFilters from './CulturalTeamsFilters';
import CulturalTeamsHero from './CulturalTeamsHero';
import CulturalTeamsHighlights from './CulturalTeamsHighlights';

type DialogMode = 'register' | 'detail' | 'enquiry';

export default function CulturalTeams() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuthStore();
  const profile = useUserStore((state) => state.profile);
  const currentProfile = profile?.uid === user?.uid ? profile : null;
  const canParticipate = Boolean(
    (currentProfile?.isVerified ?? user?.isVerified) &&
    (currentProfile?.hasJoinedCommunity ?? user?.hasJoinedCommunity) &&
    canUseMemberServices(currentProfile?.residencyStatus ?? user?.residencyStatus)
  );
  const [teams, setTeams] = useState<CulturalTeam[]>([]);
  const [mine, setMine] = useState<CulturalTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [artForm, setArtForm] = useState('All art forms');
  const [travel, setTravel] = useState('Anywhere');
  const [mode, setMode] = useState<DialogMode | null>(null);
  const [selected, setSelected] = useState<CulturalTeam | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [scopes, setScopes] = useState<TravelScope[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [formError, setFormError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setTeams(await culturalTeamsService.getApproved());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load cultural teams.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      void culturalTeamsService.getMine().then(setMine).catch(() => setMine([]));
    } else {
      setMine([]);
    }
  }, [isAuthenticated, user?.uid]);

  useEffect(() => {
    if (!mode) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mode]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return teams.filter((team) =>
      (artForm === 'All art forms' || team.artForm === artForm)
      && (travel === 'Anywhere' || team.travelScopes.includes(travel as TravelScope))
      && (!term || `${team.name} ${team.artForm} ${team.baseCity} ${team.baseState} ${team.availableStates.join(' ')}`.toLowerCase().includes(term))
    );
  }, [teams, search, artForm, travel]);

  const close = () => {
    if (!busy) {
      setMode(null);
      setSelected(null);
      setFormError('');
    }
  };

  const openRegistration = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!canParticipate) {
      toast.error('An approved Odia account is required to register a team.');
      return;
    }
    setFiles([]);
    setScopes(['national']);
    setStates([]);
    setFormError('');
    setMode('register');
  };

  const register = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    if (!scopes.length) {
      setFormError('Choose where your team can perform.');
      return;
    }
    if (scopes.includes('states') && !states.length) {
      setFormError('Choose at least one available state.');
      return;
    }

    const form = new FormData(event.currentTarget);
    const chosenLanguages = form.getAll('languages').map(String);
    const otherLanguage = String(form.get('otherLanguage') || '').trim();
    if (!chosenLanguages.length) {
      setFormError('Choose at least one language your team performs in.');
      return;
    }
    if (chosenLanguages.includes('Other') && !otherLanguage) {
      setFormError('Enter the other language your team performs in.');
      return;
    }
    const languages = [...chosenLanguages.filter((language) => language !== 'Other'), ...(chosenLanguages.includes('Other') ? [otherLanguage] : [])].join(', ');
    if (languages.length > 160) {
      setFormError('Keep the list of languages under 160 characters.');
      return;
    }
    const minimumCharge = String(form.get('minimumCharge') || '').trim();
    if (!/\d/.test(minimumCharge)) {
      setFormError('Enter a starting charge with a currency and amount.');
      return;
    }
    const draft: CulturalTeamDraft = {
      name: String(form.get('name') || '').trim(),
      artForm: String(form.get('artForm') || ''),
      description: String(form.get('description') || '').trim(),
      memberCount: Number(form.get('memberCount')),
      baseCity: String(form.get('baseCity') || '').trim(),
      baseState: String(form.get('baseState') || '').trim(),
      baseCountry: String(form.get('baseCountry') || '').trim(),
      languages,
      minimumCharge,
      travelScopes: scopes,
      availableStates: states,
    };
    const contact = {
      contactName: String(form.get('contactName') || '').trim(),
      email: String(form.get('email') || '').trim(),
      phone: String(form.get('phone') || '').trim(),
    };

    setBusy(true);
    setFormError('');
    try {
      await culturalTeamsService.register(draft, contact, files, (done, total) => {
        setUploadProgress(`Uploading image ${done} of ${total}`);
      });
      setMode(null);
      setFiles([]);
      setScopes([]);
      setStates([]);
      toast.success('Team registered for admin review.');
      void culturalTeamsService.getMine().then(setMine).catch(() => {});
    } catch (cause) {
      setFormError(cause instanceof Error ? cause.message : 'Could not register the team.');
    } finally {
      setBusy(false);
      setUploadProgress('');
    }
  };

  const enquire = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selected || busy) return;

    const form = new FormData(event.currentTarget);
    const draft: CulturalTeamEnquiryDraft = {
      organiserName: String(form.get('organiserName') || '').trim(),
      email: String(form.get('email') || '').trim(),
      phone: String(form.get('phone') || '').trim(),
      eventType: String(form.get('eventType') || '').trim(),
      eventDate: String(form.get('eventDate') || ''),
      eventLocation: String(form.get('eventLocation') || '').trim(),
      budget: String(form.get('budget') || '').trim(),
      message: String(form.get('message') || '').trim(),
    };

    setBusy(true);
    setFormError('');
    try {
      await culturalTeamsService.sendEnquiry(selected.id, draft);
      setMode(null);
      setSelected(null);
      toast.success('Enquiry sent to our coordination team.');
    } catch (cause) {
      setFormError(cause instanceof Error ? cause.message : 'Could not send the enquiry.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#fdf9f5] px-2 py-3 text-[#382333] sm:px-4 md:py-8">
      <div className="mx-1 max-w-8xl md:mx-10">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-3 inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-[#6B5E5A] transition-colors hover:text-[#713d55]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <CulturalTeamsHero onRegister={openRegistration} />
        <div>
          <CulturalTeamsHighlights />

          {isAuthenticated && mine.length > 0 && (
            <section aria-labelledby="team-applications-heading" className="mb-8 rounded-2xl border border-[#efdfd8] bg-white p-5 shadow-sm">
              <h2 id="team-applications-heading" className="text-xl font-bold">Your team applications</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {mine.map((team) => (
                  <span key={team.id} className="rounded-full bg-[#f7eee9] px-3 py-2 text-xs font-semibold">
                    {team.name} · <span className="capitalize">{team.status}</span>
                    {team.status === 'rejected' && team.rejectionReason ? ` · ${team.rejectionReason}` : ''}
                  </span>
                ))}
              </div>
            </section>
          )}

          <section id="explore-teams" aria-labelledby="explore-teams-heading" className="scroll-mt-24">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.18em] text-[#a65c52]">Approved teams</p>
                <h2 id="explore-teams-heading" className="mt-2 text-3xl font-bold">Explore cultural teams</h2>
                <p className="mt-2 text-sm text-[#806f75]">
                  {loading ? 'Loading…' : `${visible.length} ${visible.length === 1 ? 'team' : 'teams'}`} ready to explore
                </p>
              </div>
              <button
                type="button"
                onClick={openRegistration}
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#713d55] to-[#a65c52] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#713d55]/20 transition hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#713d55]"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Register your team
              </button>
            </div>

            <CulturalTeamsFilters
              search={search}
              artForm={artForm}
              travel={travel}
              onSearch={setSearch}
              onArtForm={setArtForm}
              onTravel={setTravel}
            />

            {error ? (
              <div role="alert" className="mt-6 rounded-2xl border border-[#efdfd8] bg-white p-8 text-center text-sm text-red-700">
                {error}
                <button type="button" onClick={() => void load()} className="ml-2 cursor-pointer font-bold underline">Try again</button>
              </div>
            ) : loading ? (
              <div role="status" className="mt-6 rounded-2xl border border-[#efdfd8] bg-white p-12 text-center text-sm text-[#806f75]">
                Loading cultural teams…
              </div>
            ) : visible.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-[#e5d5cd] bg-white p-12 text-center">
                <Music2 aria-hidden="true" className="mx-auto h-8 w-8 text-[#b16e58]" />
                <h3 className="mt-4 font-semibold">No teams match this search</h3>
                <p className="mt-2 text-sm text-[#806f75]">Try another art form or location.</p>
                <button
                  type="button"
                  onClick={() => { setSearch(''); setArtForm('All art forms'); setTravel('Anywhere'); }}
                  className="mt-4 cursor-pointer text-sm font-bold text-[#a65c52]"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="mt-6 grid items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3">
                {visible.map((team) => (
                  <CulturalTeamCard
                    key={team.id}
                    team={team}
                    onOpen={() => { setSelected(team); setMode('detail'); setFormError(''); }}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {mode && (
        <CulturalTeamDialog
          mode={mode}
          selected={selected}
          isAuthenticated={isAuthenticated}
          authLoading={authLoading}
          userName={user?.displayName || ''}
          userEmail={user?.email || ''}
          files={files}
          scopes={scopes}
          states={states}
          busy={busy}
          uploadProgress={uploadProgress}
          error={formError}
          onClose={close}
          onMode={(next) => {
            if (next === 'enquiry' && !canParticipate) {
              toast.error('An approved Odia account is required to contact a team.');
              return;
            }
            setMode(next);
          }}
          onRegister={register}
          onEnquire={enquire}
          onFiles={setFiles}
          onScopes={setScopes}
          onStates={setStates}
          onError={setFormError}
        />
      )}
    </main>
  );
}
