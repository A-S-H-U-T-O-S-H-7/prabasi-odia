'use client';

import { ArrowRight, Globe2, MapPin } from 'lucide-react';
import type { CulturalTeam } from '@/lib/culturalTeams/types';

export const availability = (team: CulturalTeam) => [
  team.travelScopes.includes('states') ? team.availableStates.join(', ') : '',
  team.travelScopes.includes('national') ? 'Across India' : '',
  team.travelScopes.includes('international') ? 'International' : '',
].filter(Boolean).join(' · ');

interface CulturalTeamCardProps {
  team: CulturalTeam;
  onOpen: () => void;
}

export default function CulturalTeamCard({ team, onOpen }: CulturalTeamCardProps) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-[#efdfd8] bg-white shadow-sm shadow-[#713d55]/5 transition duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#713d55]/10">
      <div className="relative h-52 overflow-hidden bg-[linear-gradient(135deg,#e9b99e,#8a465b)]">
        {team.images[0] && (
          <img
            src={team.images[0].url}
            alt={`${team.name} performance`}
            className="h-full w-full object-cover transition duration-500 hover:scale-105"
          />
        )}
        {!team.images[0] && <span className="absolute inset-0 grid place-items-center text-white/80">Cultural team</span>}
        <span className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-[#8a465b]">
          {team.artForm}
        </span>
        {team.images.length > 1 && (
          <span className="absolute bottom-3 right-3 rounded-full bg-[#382333]/80 px-3 py-1.5 text-xs text-white">
            +{team.images.length - 1} photos
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-xl font-bold text-[#382333]">{team.name}</h3>
        <p className="mt-2 flex items-center gap-1.5 text-xs text-[#806f75]">
          <MapPin aria-hidden="true" className="h-3.5 w-3.5" /> {team.baseCity}, {team.baseState}
        </p>
        <p className="mt-4 line-clamp-3 flex-1 text-sm leading-6 text-[#6f5964]">{team.description}</p>
        <p className="mt-4 line-clamp-2 text-xs text-[#806f75]">
          <Globe2 aria-hidden="true" className="mr-1 inline h-3.5 w-3.5" /> {availability(team)}
        </p>
        <button
          type="button"
          onClick={onOpen}
          className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-[#8a465b] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#71374c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8a465b]"
        >
          View team &amp; enquire <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
}
