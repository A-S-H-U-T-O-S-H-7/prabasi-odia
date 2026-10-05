'use client';

import { ArrowUpRight, Globe2, Images, MapPin, Users2 } from 'lucide-react';
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
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-[#eadbd8] bg-white shadow-[0_14px_35px_rgba(75,38,58,0.07)] transition duration-300 hover:-translate-y-1.5 hover:border-[#d6a9a3] hover:shadow-[0_24px_50px_rgba(75,38,58,0.16)]">
      <button
        type="button"
        onClick={onOpen}
        aria-label={`View ${team.name}`}
        className="relative block h-56 w-full cursor-pointer overflow-hidden bg-gradient-to-br from-[#d78f79] via-[#9b5870] to-[#55304e] text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8a465b]"
      >
        {team.images[0] ? (
          <img
            src={team.images[0].url}
            alt={`${team.name} performance`}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="absolute inset-0 grid place-items-center text-lg font-semibold text-white/80">Cultural team</span>
        )}
        <span className="absolute left-4 top-4 rounded-full border border-white/40 bg-white/95 px-3 py-1.5 text-xs font-bold text-[#713d55] shadow-sm">
          {team.artForm}
        </span>
        {team.images.length > 1 && (
          <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-[#241b2b]/65 px-2.5 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
            <Images className="h-3.5 w-3.5" aria-hidden="true" />
            {team.images.length} photos
          </span>
        )}
      </button>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h3 className="font-serif text-xl font-bold leading-tight text-[#382333] sm:text-2xl">{team.name}</h3>
        <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-[#806f75]">
          <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
          {team.baseCity}, {team.baseState}
        </p>
        <p className="mt-3 line-clamp-3 flex-1 text-sm leading-6 text-[#6f5964]">{team.description}</p>

        <div className="mt-5 flex flex-wrap gap-2 border-t border-[#f0e5e0] pt-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f9efed] px-3 py-1.5 text-xs font-semibold text-[#713d55]">
            <Users2 className="h-3.5 w-3.5" aria-hidden="true" />
            {team.memberCount} members
          </span>
          {availability(team) && (
            <span className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-[#f8f2ed] px-3 py-1.5 text-xs font-semibold text-[#795d64]">
              <Globe2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{availability(team)}</span>
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onOpen}
          className="mt-5 inline-flex w-full cursor-pointer items-center justify-between rounded-xl bg-gradient-to-r from-[#713d55] to-[#a65c52] px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:from-[#603047] hover:to-[#944d46] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8a465b]"
        >
          View team &amp; enquire
          <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}
