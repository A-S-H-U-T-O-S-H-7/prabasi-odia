export type AdivasiStory = {
  slug: string;
  title: string;
  theme: string;
  image?: string;
  description: string;
  detail: string;
  region: string;
  highlights: string[];
  visitNote: string;
};

export const adivasiStories: AdivasiStory[] = [
  {
    slug: 'saura-painting',
    title: 'Saura painting',
    theme: 'Art & expression',
    image: '/tourism/adivasi-art.webp',
    description: 'Painted forms carry stories of belief, ancestry and everyday life.',
    detail: 'Saura painting is part of a living visual tradition. Figures, animals and geometric forms can hold meanings tied to community life and spiritual practice. The work deserves to be understood through the people who make and interpret it today.',
    region: 'Southern Odisha',
    highlights: ['Ritual imagery', 'Painted narratives', 'Living knowledge'],
    visitNote: 'Learn from local artists or guides, and ask before photographing people or their work.',
  },
  {
    slug: 'kotpad-weaving',
    title: 'Kotpad weaving',
    theme: 'Cloth & colour',
    description: 'Root-dyed textiles from southern Odisha carry an earthy, unmistakable palette.',
    detail: 'Kotpad textiles are known for colours drawn from natural roots and for the skill involved in weaving them. Their warm reds, browns and creams are closely associated with the handloom traditions of southern Odisha.',
    region: 'Kotpad, Koraput',
    highlights: ['Natural root dyes', 'Handloom weaving', 'Earthy colour'],
    visitNote: 'When visiting a weaving space, give artisans room to work and buy directly from makers where possible.',
  },
  {
    slug: 'dokra-metalwork',
    title: 'Dokra metalwork',
    theme: 'Craft & making',
    description: 'Lost-wax casting turns patient handwork into richly textured metal forms.',
    detail: 'In Dokra making, a wax model helps shape a mould before metal is cast. Odisha’s artisan communities use the process to make figurines, jewellery and everyday objects, each with the marks of handwork.',
    region: 'Dhenkanal, Mayurbhanj and beyond',
    highlights: ['Lost-wax process', 'Hand-cast objects', 'Artisan workshops'],
    visitNote: 'Choose a workshop visit arranged locally and ask before watching or photographing the casting process.',
  },
  {
    slug: 'southern-highlands',
    title: 'Southern highlands',
    theme: 'Land & community',
    image: '/tourism/koraput-hills.webp',
    description: 'Koraput and neighbouring hill districts hold many landscapes and community histories.',
    detail: 'The hills and valleys of southern Odisha are home to many communities with distinct traditions and ways of knowing the land. A journey here can bring together landscapes, local markets and craft, guided by the people who call the region home.',
    region: 'Koraput, Rayagada and Malkangiri',
    highlights: ['Hill landscapes', 'Local markets', 'Community histories'],
    visitNote: 'Plan with a local guide, respect community boundaries and check access before travelling to remote areas.',
  },
  {
    slug: 'stone-work',
    title: 'Stone work',
    theme: 'Hands & heritage',
    image: '/tourism/konark-hero.webp',
    description: 'Odisha’s stone carvers give form to sculpture, architecture and everyday objects.',
    detail: 'Stone carving connects Odisha’s historic architecture with workshops still active today. Artisans carve figures, decorative pieces and useful objects; Sukuapada is one of the villages where this craft continues.',
    region: 'Across Odisha, including Sukuapada',
    highlights: ['Living workshops', 'Hand-carved forms', 'Temple craft heritage'],
    visitNote: 'Visit workshops with care, ask before entering work areas and allow time for conversation with artisans.',
  },
  {
    slug: 'tribal-museum',
    title: 'Tribal Museum',
    theme: 'Begin in Bhubaneswar',
    image: '/tourism/adivasi-museum.webp',
    description: 'Artefacts and recreated dwellings introduce the diversity of Odisha’s Adivasi communities.',
    detail: 'The Museum of Tribal Arts and Artefacts in Bhubaneswar brings together objects, textiles and recreated dwellings from communities across Odisha. It offers a starting point for learning, while living cultures extend far beyond any collection.',
    region: 'Bhubaneswar',
    highlights: ['Artefact galleries', 'Recreated dwellings', 'A place to begin'],
    visitNote: 'Check current opening hours and the museum’s photography rules before visiting.',
  },
];
