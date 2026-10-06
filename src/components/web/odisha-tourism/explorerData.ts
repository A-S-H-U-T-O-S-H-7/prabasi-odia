export type ExplorerItem = {
  name: string;
  location: string;
  description: string;
  image: string;
  officialUrl: string;
};

export type ExplorerTab = {
  id: string;
  label: string;
  officialUrl: string;
  items: ExplorerItem[];
};

const attractions = 'https://odishatourism.gov.in/content/tourism/en/discover/attractions';
const foodGuide = 'https://apps.odishatourism.gov.in/the-taste-of-odisha';

// Curated starter content. Replace the illustrative images when the admin catalogue is ready.
export const explorerTabs: ExplorerTab[] = [
  {
    id: 'sacred',
    label: 'Sacred Odisha',
    officialUrl: `${attractions}/temples-monuments.html`,
    items: [
      {
        name: 'Jagannath Temple',
        location: 'Puri',
        description: 'The spiritual heart of Puri and a Char Dham pilgrimage site.',
        image: '/tourism/puri.webp',
        officialUrl: `${attractions}/temples-monuments/jagannath-temple.html`,
      },
      {
        name: 'Konark Sun Temple',
        location: 'Konark',
        description: 'An iconic stone chariot carved in honour of the Sun God.',
        image: '/tourism/konark-hero.webp',
        officialUrl: `${attractions}/temples-monuments/konark.html`,
      },
      {
        name: 'Lingaraj Temple',
        location: 'Bhubaneswar',
        description: 'A landmark of Kalinga temple architecture in the old city.',
        image: '/tourism/konark-hero.webp',
        officialUrl: `${attractions}/temples-monuments/lingaraja-temple.html`,
      },
      {
        name: 'Tara Tarini Temple',
        location: 'Ganjam',
        description: 'A revered hilltop shrine overlooking the Rushikulya River.',
        image: '/tourism/koraput-hills.webp',
        officialUrl: `${attractions}/temples-monuments/tara-tarini.html`,
      },
      {
        name: 'Samaleswari Temple',
        location: 'Sambalpur',
        description: 'A beloved centre of devotion in western Odisha.',
        image: '/tourism/puri.webp',
        officialUrl: `${attractions}/temples-monuments/samaleswari-temple.html`,
      },
    ],
  },
  {
    id: 'nature',
    label: 'Nature & Wildlife',
    officialUrl: `${attractions}/forest-wildlife.html`,
    items: [
      {
        name: 'Similipal',
        location: 'Mayurbhanj',
        description: 'A vast forest landscape of wildlife, streams and waterfalls.',
        image: '/tourism/similipal.webp',
        officialUrl: `${attractions}/forest-wildlife/similipal-nature-camp.html`,
      },
      {
        name: 'Bhitarkanika',
        location: 'Kendrapara',
        description: 'Explore the winding waterways and mangrove forests of the coast.',
        image: '/tourism/chilika.webp',
        officialUrl: `${attractions}/forest-wildlife/bhitarkanika-nature-camps.html`,
      },
      {
        name: 'Satkosia Gorge',
        location: 'Angul',
        description: 'Forest and river meet along the great Mahanadi gorge.',
        image: '/tourism/koraput-hills.webp',
        officialUrl: `${attractions}/forest-wildlife/tikarapara.html`,
      },
      {
        name: 'Debrigarh',
        location: 'Sambalpur',
        description: 'Wildlife and quiet forest trails beside Hirakud Reservoir.',
        image: '/tourism/similipal.webp',
        officialUrl: `${attractions}/forest-wildlife/debrigarh.html`,
      },
      {
        name: 'Chilika Birdlife',
        location: 'Chilika',
        description: 'A lagoon where open water and seasonal birdlife shape the view.',
        image: '/tourism/chilika.webp',
        officialUrl: `${attractions}/lakes-waterfalls/chilika-nature-camps.html`,
      },
    ],
  },
  {
    id: 'beaches',
    label: 'Beaches & Coastal Experiences',
    officialUrl: `${attractions}/beaches.html`,
    items: [
      {
        name: 'Puri Beach',
        location: 'Puri',
        description: 'A lively shoreline woven into the rhythm of the temple town.',
        image: '/tourism/puri.webp',
        officialUrl: `${attractions}/beaches/puri-beach.html`,
      },
      {
        name: 'Chandrabhaga Beach',
        location: 'Konark',
        description: 'Sea air and wide sands close to the Sun Temple.',
        image: '/tourism/puri.webp',
        officialUrl: `${attractions}/beaches/chandrabagha-beach.html`,
      },
      {
        name: 'Gopalpur Beach',
        location: 'Ganjam',
        description: 'An easygoing seaside escape on the southern coast.',
        image: '/tourism/chilika.webp',
        officialUrl: `${attractions}/beaches/gopalpur.html`,
      },
      {
        name: 'Chandipur Beach',
        location: 'Balasore',
        description: 'Known for the sea retreating far out at low tide.',
        image: '/tourism/puri.webp',
        officialUrl: `${attractions}/beaches/chandipur.html`,
      },
      {
        name: 'Talasari Beach',
        location: 'Balasore',
        description: 'Palm-lined sands near the Subarnarekha estuary.',
        image: '/tourism/chilika.webp',
        officialUrl: `${attractions}/beaches/talasari-beach.html`,
      },
    ],
  },
  {
    id: 'landscapes',
    label: 'Waterfalls & Scenic Landscapes',
    officialUrl: `${attractions}/lakes-waterfalls.html`,
    items: [
      {
        name: 'Khandadhar Falls',
        location: 'Sundargarh',
        description: 'A dramatic waterfall framed by thick green hills.',
        image: '/tourism/koraput-hills.webp',
        officialUrl: `${attractions}/lakes-waterfalls/khandadhar-nature-camp.html`,
      },
      {
        name: 'Sanaghagara Falls',
        location: 'Keonjhar',
        description: 'A forest waterfall and a refreshing stop in northern Odisha.',
        image: '/tourism/similipal.webp',
        officialUrl: `${attractions}/lakes-waterfalls/sanaghagra-nature-camp.html`,
      },
      {
        name: 'Ansupa Lake',
        location: 'Cuttack',
        description: 'Slow down beside a picturesque freshwater lake.',
        image: '/tourism/chilika.webp',
        officialUrl: `${attractions}/lakes-waterfalls/ansupa-nature-camp.html`,
      },
      {
        name: 'Chilika Lake',
        location: 'Coastal Odisha',
        description: 'A vast lagoon of islands, water and ever-changing light.',
        image: '/tourism/chilika.webp',
        officialUrl: `${attractions}/lakes-waterfalls/chilika-nature-camps.html`,
      },
      {
        name: 'Daringbadi',
        location: 'Kandhamal',
        description: 'Hill roads, cool air and green scenery in the Eastern Ghats.',
        image: '/tourism/koraput-hills.webp',
        officialUrl: `${attractions}/forest-wildlife/daringibadi.html`,
      },
    ],
  },
  {
    id: 'heritage',
    label: 'Art, Craft & Heritage',
    officialUrl: `${attractions}/arts-crafts.html`,
    items: [
      {
        name: 'Raghurajpur',
        location: 'Puri',
        description: 'Meet the artists of the celebrated Pattachitra village.',
        image: '/tourism/raghurajpur.webp',
        officialUrl: `${attractions}/arts-crafts/raghurajpur.html`,
      },
      {
        name: 'Pipili',
        location: 'Puri',
        description: 'A colourful home for the applique craft tradition.',
        image: '/tourism/pipili.webp',
        officialUrl: `${attractions}/arts-crafts/pipili.html`,
      },
      {
        name: 'Sukuapada',
        location: 'Dhenkanal',
        description: 'Discover a village known for traditional stone carving.',
        image: '/tourism/adivasi-art.webp',
        officialUrl: `${attractions}/arts-crafts/sukuapada.html`,
      },
      {
        name: 'Udayagiri & Khandagiri',
        location: 'Bhubaneswar',
        description: 'Ancient rock-cut caves tell stories of early Odisha.',
        image: '/tourism/konark-hero.webp',
        officialUrl: `${attractions}/temples-monuments/udaygiri-and-amp-khandagiri-caves-temple.html`,
      },
      {
        name: 'Dhauli Peace Pagoda',
        location: 'Bhubaneswar',
        description: 'A hilltop monument linked to the story of Emperor Ashoka.',
        image: '/tourism/odissi.webp',
        officialUrl: `${attractions}/buddhist-sites/dhauligiri.html`,
      },
    ],
  },
  {
    id: 'cuisine',
    label: 'Cuisines of Odisha',
    officialUrl: foodGuide,
    items: [
      {
        name: 'Pakhala',
        location: 'Everyday Odisha',
        description: 'Cooling rice served with sides that make it feel like home.',
        image: '/tourism/pakhala.webp',
        officialUrl: foodGuide,
      },
      {
        name: 'Dalma',
        location: 'Odia kitchens',
        description: 'A comforting blend of lentils, vegetables and gentle spice.',
        image: '/tourism/dalma.webp',
        officialUrl: foodGuide,
      },
      {
        name: 'Chhena Poda',
        location: 'Odia sweets',
        description: 'A caramelised baked cheese sweet with a distinct Odia character.',
        image: '/tourism/chhena-poda.webp',
        officialUrl: foodGuide,
      },
      {
        name: 'Mahaprasad',
        location: 'Puri',
        description: 'Temple food with a deep connection to Jagannath culture.',
        image: '/tourism/dalma.webp',
        officialUrl: foodGuide,
      },
      {
        name: 'Rasagola',
        location: 'Odia sweets',
        description: 'Soft chhena sweets with a place in festive food traditions.',
        image: '/tourism/chhena-poda.webp',
        officialUrl: foodGuide,
      },
    ],
  },
];

export const slugForPlace = (name: string) =>
  name.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const explorerPlaces = explorerTabs.flatMap((tab) =>
  tab.items.map((item) => ({ ...item, slug: slugForPlace(item.name), category: tab.id, categoryLabel: tab.label })),
);

export const placeHref = (name: string) => `/odisha-tourism/places/${slugForPlace(name)}`;
