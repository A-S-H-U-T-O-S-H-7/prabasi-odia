import Link from 'next/link';
import { ArrowRight, Heart, Sparkles } from 'lucide-react';
import TourismHero from './TourismHero';
import DestinationExplorer from './DestinationExplorer';
import DistrictExplorer from './DistrictExplorer';
import RoadTripsSection from './RoadTripsSection';
import CuisineSection from './CuisineSection';
import AdivasiSection from './AdivasiSection';
import CultureSection from './CultureSection';
import TrailStories from './TrailStories';

export default function OdishaTourism() {
  return (
    <div className="overflow-x-hidden bg-[#FFF9F2]">
      <TourismHero />
      <DestinationExplorer />
      <DistrictExplorer />
      <RoadTripsSection />
      <CuisineSection />
      <AdivasiSection />
      <CultureSection />
      <TrailStories />

      <section className="relative isolate overflow-hidden bg-[#4D1D45] px-4 py-14 text-white sm:px-6 lg:px-0 lg:py-18">
        <div className="absolute -right-28 -top-28 h-80 w-80 rounded-full border-[45px] border-white/5 sm:h-[450px] sm:w-[450px]" aria-hidden="true" />
        <div className="absolute bottom-[-210px] left-[-120px] h-[400px] w-[400px] rounded-full border-[45px] border-[#F0B87C]/10" aria-hidden="true" />
        <div className="relative mx-auto flex max-w-[90rem] flex-col gap-7 lg:mx-10 lg:flex-row lg:items-end lg:justify-between 2xl:mx-auto">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-[#F5CCA0]"><Sparkles className="h-4 w-4" />07 / Your story belongs here</p>
            <h2 className="mt-4 font-serif text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
              What does <span className="italic font-normal text-[#F4C58B]">home</span> look like to you?
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/75 sm:text-base">
              A lane in your hometown. A festival you never miss. A place you would take a friend first. Join Prabasi Odia and help us shape a guide made of real connections.
            </p>
          </div>
          <Link href="/join-community" className="inline-flex min-h-13 shrink-0 items-center justify-center gap-3 self-start rounded-full bg-[#F4C58B] px-7 py-3 text-sm font-bold text-[#352018] transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white lg:self-auto">
            <Heart className="h-4 w-4" aria-hidden="true" />
            Join the community
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}
