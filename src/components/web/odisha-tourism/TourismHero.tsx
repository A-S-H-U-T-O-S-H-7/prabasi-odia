import Image from 'next/image';
import TourismHeroVideo from './TourismHeroVideo';

export default function TourismHero() {
  return (
    <section className="relative isolate min-h-[500px] overflow-hidden bg-[#21332A] sm:min-h-[560px] lg:min-h-[620px]">
      <h1 className="sr-only">Explore Odisha</h1>
      <Image
        src="/tourism/konark-hero.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-[62%_center]"
      />
      <TourismHeroVideo />
    </section>
  );
}
