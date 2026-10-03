export type StoryCard = {
  title: string;
  image: string;
  description: string;
  detail: string;
  href: string;
};

export const cuisine: StoryCard[] = [
  {
    title: 'Pakhala',
    image: '/tourism/pakhala.webp',
    description: 'The cooling comfort of home.',
    detail: 'Water-soaked rice, often enjoyed with vegetables and other sides.',
    href: 'https://odishatourism.gov.in/content/tourism/en/the-taste-of-odisha.html',
  },
  {
    title: 'Dalma',
    image: '/tourism/dalma.webp',
    description: 'Simple, generous and deeply Odia.',
    detail: 'Lentils and vegetables come together in a much-loved everyday dish.',
    href: 'https://odishatourism.gov.in/content/tourism/en/the-taste-of-odisha.html',
  },
  {
    title: 'Chhena Poda',
    image: '/tourism/chhena-poda.webp',
    description: 'A sweet worth saving room for.',
    detail: 'Baked fresh cheese and a caramelised crust make a memorable finish.',
    href: 'https://odishatourism.gov.in/content/tourism/en/the-taste-of-odisha.html',
  },
];

export type RoadTrip = {
  name: string;
  image: string;
  duration: string;
  theme: string;
  description: string;
  stops: string[];
};

export const roadTrips: RoadTrip[] = [
  {
    name: 'The coastal loop',
    image: '/tourism/puri.webp',
    duration: '3–4 day idea',
    theme: 'Sea · Heritage',
    description: 'Temple towns, carved stone and the wide-open water of Chilika.',
    stops: ['Bhubaneswar', 'Konark', 'Puri', 'Chilika'],
  },
  {
    name: 'Into the highlands',
    image: '/tourism/road-trip.webp',
    duration: '3 day idea',
    theme: 'Hills · Nature',
    description: 'Take the slower roads south, with green hills and quiet mornings.',
    stops: ['Berhampur', 'Daringbadi', 'Koraput'],
  },
  {
    name: 'The artful detour',
    image: '/tourism/pipili.webp',
    duration: '1–2 day idea',
    theme: 'Craft · Culture',
    description: 'Make time for the hands behind Odisha’s colour and craft.',
    stops: ['Bhubaneswar', 'Pipili', 'Raghurajpur'],
  },
];

export const adivasiStories: StoryCard[] = [
  {
    title: 'Art that remembers',
    image: '/tourism/adivasi-art.webp',
    description: 'Patterns, stories and knowledge carried through generations.',
    detail: 'Explore artistic traditions with attention to the communities who create them.',
    href: 'https://odishatourism.gov.in/content/tourism/en/experience/themes/ethinic.html',
  },
  {
    title: 'Meet the heritage',
    image: '/tourism/adivasi-museum.webp',
    description: 'Objects are a doorway into living cultures, never the whole story.',
    detail: 'Begin with Odisha’s Tribal Museum and learn from its collections.',
    href: 'https://odishatourism.gov.in/content/tourism/en/experience/themes/ethinic.html',
  },
  {
    title: 'The southern highlands',
    image: '/tourism/koraput-hills.webp',
    description: 'Landscapes shaped by many communities and ways of life.',
    detail: 'Travel thoughtfully, with local guidance and respect for local customs.',
    href: 'https://odishatourism.gov.in/content/tourism/en/experience/themes/ethinic.html',
  },
];

export const cultureStories: StoryCard[] = [
  {
    title: 'Odissi',
    image: '/tourism/odissi.webp',
    description: 'Movement that gives stories a language of their own.',
    detail: 'Discover Odisha’s classical dance tradition.',
    href: 'https://odishatourism.gov.in/content/tourism/en/experience/themes/odissi-dance.html',
  },
  {
    title: 'Pattachitra',
    image: '/tourism/raghurajpur.webp',
    description: 'Stories painted with patience, line by line.',
    detail: 'Visit the heritage craft village of Raghurajpur.',
    href: 'https://odishatourism.gov.in/content/tourism/en/discover/attractions/arts-crafts/raghurajpur.html',
  },
  {
    title: 'Pipili appliqué',
    image: '/tourism/pipili.webp',
    description: 'Colour stitched into celebration and everyday life.',
    detail: 'See the craft village behind the vibrant textiles.',
    href: 'https://odishatourism.gov.in/content/tourism/en/discover/attractions/arts-crafts/pipili.html',
  },
];
