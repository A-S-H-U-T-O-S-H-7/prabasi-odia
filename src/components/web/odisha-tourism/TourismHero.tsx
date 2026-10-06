import TourismHeroVideo from './TourismHeroVideo';

export default function TourismHero() {
  return (
    <section className="relative isolate aspect-video overflow-hidden bg-[#21332A] md:aspect-auto md:min-h-[560px] lg:min-h-[620px]">
      <h1 className="sr-only">Explore Odisha</h1>
      <TourismHeroVideo />
    </section>
  );
}
