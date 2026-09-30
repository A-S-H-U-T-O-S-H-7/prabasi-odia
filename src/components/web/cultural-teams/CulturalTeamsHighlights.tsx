import { Globe2, Images, Users } from 'lucide-react';

const highlights = [
  {
    icon: Images,
    title: 'Showcase your work',
    description: 'Register with up to 10 performance photos.',
  },
  {
    icon: Globe2,
    title: 'Travel that fits',
    description: 'Set availability for selected states, India-wide or international programs.',
  },
  {
    icon: Users,
    title: 'Introductions through us',
    description: 'Your private contact details stay with the admin team.',
  },
];

export default function CulturalTeamsHighlights() {
  return (
    <section aria-label="How the cultural team directory works" className="mb-8 grid gap-4 sm:grid-cols-3">
      {highlights.map(({ icon: Icon, title, description }) => (
        <article key={title} className="rounded-2xl border border-[#efdfd8] bg-white p-5 shadow-sm shadow-[#713d55]/5">
          <Icon aria-hidden="true" className="h-5 w-5 text-[#b16e58]" />
          <h2 className="mt-3 text-sm font-bold text-[#382333]">{title}</h2>
          <p className="mt-1 text-xs leading-5 text-[#806f75]">{description}</p>
        </article>
      ))}
    </section>
  );
}
