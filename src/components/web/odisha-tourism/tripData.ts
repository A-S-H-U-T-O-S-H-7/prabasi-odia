export const tripThemes = ['Spiritual', 'Heritage', 'Beaches', 'Hills', 'Waterfalls', 'Wildlife', 'Hidden Gems', 'Road Trips', 'Art & Culture'] as const;
export type TripTheme = (typeof tripThemes)[number];

export const tripGroups = [
  'Spiritual & heritage journeys',
  'Hills, valleys & cultural experiences',
  'Waterfall trails',
  'Beaches & coastal road trips',
  'Wildlife, lakes & nature stays',
  'Short breaks, crafts & quieter destinations',
  'Longer road trips & hidden gems',
] as const;
export type TripGroup = (typeof tripGroups)[number];

export type Trip = {
  id: number;
  title: string;
  days: number;
  nights: number;
  group: TripGroup;
  themes: TripTheme[];
  route: string[];
  stays: string;
  districts: string[];
  image: string;
  teaser: string;
  featured?: boolean;
  note?: string;
};

const sacred = tripGroups[0];
const hills = tripGroups[1];
const falls = tripGroups[2];
const coast = tripGroups[3];
const nature = tripGroups[4];
const short = tripGroups[5];
const long = tripGroups[6];

export const trips: Trip[] = [
  { id: 1, title: 'Odisha Golden Triangle', days: 4, nights: 3, group: sacred, themes: ['Spiritual', 'Heritage'], route: ['Bhubaneswar', 'Dhauli', 'Pipili', 'Puri', 'Konark'], stays: '1 Bhubaneswar + 2 Puri', districts: ['Khordha', 'Puri'], image: '/tourism/konark-hero.webp', teaser: 'Temple cities, craft lanes and the coast in one classic journey.', featured: true },
  { id: 2, title: 'Jagannath Pilgrimage', days: 3, nights: 2, group: sacred, themes: ['Spiritual'], route: ['Puri', 'Jagannath Temple', 'Gundicha Temple', 'Sakhigopal'], stays: '2 Puri', districts: ['Puri'], image: '/tourism/puri.webp', teaser: 'Follow the devotional heart of Puri and its nearby sacred places.' },
  { id: 3, title: 'Temple City & Yogini Trail', days: 3, nights: 2, group: sacred, themes: ['Spiritual', 'Heritage'], route: ['Bhubaneswar', 'Lingaraj', 'Mukteswar', 'Rajarani', 'Hirapur', 'Dhauli'], stays: '2 Bhubaneswar', districts: ['Khordha'], image: '/tourism/konark-hero.webp', teaser: 'A close look at the temples and layered history around Bhubaneswar.' },
  { id: 4, title: 'Biraja & Akhandalamani Journey', days: 3, nights: 2, group: sacred, themes: ['Spiritual', 'Hidden Gems'], route: ['Jajpur', 'Biraja Temple', 'Bhadrak', 'Bhadrakali', 'Aradi'], stays: '1 Jajpur + 1 Bhadrak', districts: ['Jajpur', 'Bhadrak'], image: '/tourism/odissi.webp', teaser: 'Two temple towns and a quieter pilgrimage through northern Odisha.' },
  { id: 5, title: 'Western Odisha Temple Trail', days: 5, nights: 4, group: sacred, themes: ['Spiritual', 'Road Trips'], route: ['Sambalpur', 'Samaleswari', 'Huma', 'Nrusinghanath', 'Harishankar'], stays: '2 Sambalpur + 1 Bargarh/Paikmal + 1 Balangir', districts: ['Sambalpur', 'Bargarh', 'Balangir'], image: '/tourism/koraput-hills.webp', teaser: 'Western shrines, hill foothills and a journey beyond the usual circuit.' },
  { id: 6, title: 'Buddhist Diamond Triangle', days: 3, nights: 2, group: sacred, themes: ['Spiritual', 'Heritage'], route: ['Bhubaneswar', 'Dhauli', 'Lalitgiri', 'Udayagiri', 'Ratnagiri'], stays: '2 Bhubaneswar or Cuttack', districts: ['Khordha', 'Cuttack', 'Jajpur'], image: '/tourism/konark-hero.webp', teaser: 'Trace Odisha’s Buddhist legacy across three celebrated sites.' },

  { id: 7, title: 'Best of Koraput', days: 5, nights: 4, group: hills, themes: ['Hills', 'Road Trips'], route: ['Koraput', 'Deomali', 'Kolab', 'Duduma', 'Gupteswar'], stays: '2 Koraput/Semiliguda + 2 Jeypore', districts: ['Koraput'], image: '/tourism/koraput-hills.webp', teaser: 'Highland views, reservoirs and waterfalls across the southern hills.', featured: true },
  { id: 8, title: 'Daringbadi Slow Escape', days: 4, nights: 3, group: hills, themes: ['Hills', 'Hidden Gems'], route: ['Brahmapur', 'Daringbadi', 'coffee gardens', 'Mandasaru', 'return'], stays: '3 Daringbadi', districts: ['Ganjam', 'Kandhamal'], image: '/tourism/road-trip.webp', teaser: 'A slower stay among hill roads, gardens and green viewpoints.', featured: true },
  { id: 9, title: 'Monastery & Waterfall Escape', days: 4, nights: 3, group: hills, themes: ['Hills', 'Waterfalls', 'Art & Culture'], route: ['Brahmapur', 'Taptapani', 'Jirang', 'Chandragiri', 'Gandahati', 'Paralakhemundi'], stays: '1 Taptapani + 1 Chandragiri area + 1 Paralakhemundi', districts: ['Ganjam', 'Gajapati'], image: '/tourism/koraput-hills.webp', teaser: 'A southern journey linking hill scenery, a monastery and a waterfall.' },
  { id: 10, title: 'Rayagada Hills & Culture', days: 3, nights: 2, group: hills, themes: ['Hills', 'Art & Culture', 'Hidden Gems'], route: ['Rayagada', 'Majhighariani', 'Therubali', 'Chatikona'], stays: '2 Rayagada', districts: ['Rayagada'], image: '/tourism/adivasi-art.webp', teaser: 'A short introduction to Rayagada’s landscapes and cultural places.' },

  { id: 11, title: 'Keonjhar Cascade Trail', days: 4, nights: 3, group: falls, themes: ['Waterfalls', 'Road Trips'], route: ['Keonjhar', 'Sanaghagara', 'Badaghagara', 'Gonasika', 'Khandadhar, Keonjhar'], stays: '3 Keonjhar', districts: ['Kendujhar'], image: '/tourism/similipal.webp', teaser: 'A waterfall-filled circuit through Keonjhar’s forested landscape.', featured: true, note: 'Khandadhar, Keonjhar is a separate waterfall from Khandadhar, Sundargarh.' },
  { id: 12, title: 'Sundargarh Waterfall Escape', days: 3, nights: 2, group: falls, themes: ['Waterfalls', 'Hidden Gems'], route: ['Rourkela', 'Vedvyas', 'Khandadhar, Sundargarh', 'return'], stays: '2 Rourkela', districts: ['Sundargarh'], image: '/tourism/koraput-hills.webp', teaser: 'Follow western Odisha’s hills to the Sundargarh Khandadhar falls.', note: 'Khandadhar, Sundargarh is a separate waterfall from Khandadhar, Keonjhar.' },
  { id: 13, title: 'Western Cascade Road Trip', days: 4, nights: 3, group: falls, themes: ['Waterfalls', 'Road Trips'], route: ['Deogarh', 'Pradhanpat', 'Jharsuguda', 'Koilighughar'], stays: '1 Deogarh + 2 Jharsuguda', districts: ['Debagarh', 'Jharsuguda'], image: '/tourism/koraput-hills.webp', teaser: 'A western route shaped by forest, cascades and smaller towns.' },
  { id: 14, title: 'Kalahandi Forest & Falls', days: 4, nights: 3, group: falls, themes: ['Waterfalls', 'Hidden Gems'], route: ['Bhawanipatna', 'Phurlijharan', 'Karlapat area', 'Junagarh'], stays: '3 Bhawanipatna', districts: ['Kalahandi'], image: '/tourism/similipal.webp', teaser: 'Make Bhawanipatna a base for forest and waterfall excursions.' },

  { id: 15, title: 'Puri Beach & Marine Drive', days: 3, nights: 2, group: coast, themes: ['Beaches', 'Road Trips'], route: ['Puri', 'coastal Marine Drive', 'Chandrabhaga', 'Konark'], stays: '2 Puri', districts: ['Puri'], image: '/tourism/puri.webp', teaser: 'Sea air, the coastal road and Konark from a Puri base.' },
  { id: 16, title: 'Southern Coast Retreat', days: 4, nights: 3, group: coast, themes: ['Beaches', 'Road Trips'], route: ['Brahmapur', 'Gopalpur', 'Tampara', 'Tara Tarini', 'Sonapur'], stays: '3 Gopalpur', districts: ['Ganjam'], image: '/tourism/chilika.webp', teaser: 'Settle by the sea and explore Ganjam’s coast and nearby landmarks.', featured: true },
  { id: 17, title: 'Northern Beach Trail', days: 4, nights: 3, group: coast, themes: ['Beaches', 'Road Trips'], route: ['Balasore', 'Chandipur', 'Panchalingeswar', 'Chandaneswar', 'Talasari'], stays: '2 Balasore/Chandipur + 1 Talasari area', districts: ['Balasore'], image: '/tourism/puri.webp', teaser: 'Discover northern beaches, a retreating sea and a hill shrine.' },
  { id: 18, title: 'Paradip Coastal Weekend', days: 2, nights: 1, group: coast, themes: ['Beaches', 'Hidden Gems'], route: ['Paradip beach', 'Marine Drive', 'aquarium', 'return'], stays: '1 Paradip', districts: ['Jagatsinghpur'], image: '/tourism/chilika.webp', teaser: 'A compact coastal break around Paradip.' },

  { id: 19, title: 'Chilika Birding & Lake Escape', days: 4, nights: 3, group: nature, themes: ['Wildlife', 'Hidden Gems'], route: ['Bhubaneswar', 'Mangalajodi', 'Barkul/Rambha', 'return'], stays: '1 Mangalajodi area + 2 Barkul/Rambha', districts: ['Khordha', 'Ganjam'], image: '/tourism/chilika.webp', teaser: 'Slow down beside the lagoon and watch for its seasonal birdlife.' },
  { id: 20, title: 'Bhitarkanika Mangrove Escape', days: 3, nights: 2, group: nature, themes: ['Wildlife', 'Hidden Gems'], route: ['Bhadrak', 'selected Bhitarkanika entrance', 'guided boat excursions', 'return'], stays: '2 near Bhitarkanika', districts: ['Bhadrak', 'Kendrapara'], image: '/tourism/chilika.webp', teaser: 'Explore mangrove waterways from a booked base and entrance.', featured: true },
  { id: 21, title: 'Similipal Forest Retreat', days: 4, nights: 3, group: nature, themes: ['Wildlife', 'Waterfalls'], route: ['Balasore', 'Baripada', 'Similipal nature stay', 'permitted waterfall excursions'], stays: '1 Baripada + 2 booked forest accommodation', districts: ['Balasore', 'Mayurbhanj'], image: '/tourism/similipal.webp', teaser: 'Forest time, nature stays and permitted waterfall excursions.', featured: true },
  { id: 22, title: 'Hirakud & Debrigarh Retreat', days: 4, nights: 3, group: nature, themes: ['Wildlife', 'Hidden Gems'], route: ['Sambalpur', 'Hirakud', 'Debrigarh', 'return'], stays: '1 Sambalpur + 2 Debrigarh', districts: ['Sambalpur', 'Bargarh'], image: '/tourism/similipal.webp', teaser: 'Reservoir views and a slower nature stay in western Odisha.', featured: true },
  { id: 23, title: 'Satkosia Riverside Escape', days: 3, nights: 2, group: nature, themes: ['Wildlife', 'Hidden Gems'], route: ['Angul', 'Tikarpada', 'Satkosia riverside experiences', 'return'], stays: '2 booked accommodation on the Angul side', districts: ['Angul'], image: '/tourism/chilika.webp', teaser: 'A river-led stay around the Mahanadi gorge and Angul side.' },

  { id: 24, title: 'Cuttack Crafts & Lake Weekend', days: 3, nights: 2, group: short, themes: ['Art & Culture', 'Heritage'], route: ['Cuttack museums', 'silver filigree workshops', 'Ansupa', 'return'], stays: '2 Cuttack', districts: ['Cuttack'], image: '/tourism/raghurajpur.webp', teaser: 'A short break for craft, museums and a quiet lake.' },
  { id: 25, title: 'Dhenkanal Hills & Heritage', days: 3, nights: 2, group: short, themes: ['Heritage', 'Hills'], route: ['Dhenkanal', 'Kapilash', 'Saptasajya', 'Joranda'], stays: '2 Dhenkanal', districts: ['Dhenkanal'], image: '/tourism/koraput-hills.webp', teaser: 'Hill shrines and heritage from a Dhenkanal base.' },
  { id: 26, title: 'Nayagarh Temple & Reservoir Trail', days: 3, nights: 2, group: short, themes: ['Spiritual', 'Hidden Gems'], route: ['Nayagarh', 'Sarankul', 'Kantilo', 'Dasapalla/Kuanria'], stays: '2 Nayagarh', districts: ['Nayagarh'], image: '/tourism/koraput-hills.webp', teaser: 'Temples and quieter landscapes on a compact district trip.' },

  { id: 27, title: 'Western Odisha Discovery', days: 7, nights: 6, group: long, themes: ['Road Trips', 'Heritage'], route: ['Boudh', 'Sonepur', 'Balangir', 'Bargarh', 'Sambalpur', 'Hirakud'], stays: '1 each Boudh, Sonepur, Balangir, Bargarh + 2 Sambalpur', districts: ['Boudh', 'Subarnapur', 'Balangir', 'Bargarh', 'Sambalpur'], image: '/tourism/road-trip.webp', teaser: 'A longer cross-state journey through western towns and waters.' },
  { id: 28, title: 'Nabarangpur Crafts & Countryside', days: 3, nights: 2, group: long, themes: ['Art & Culture', 'Hidden Gems'], route: ['Nabarangpur', 'artisan neighbourhoods', 'Papadahandi', 'return'], stays: '2 Nabarangpur', districts: ['Nabarangpur'], image: '/tourism/adivasi-art.webp', teaser: 'Meet local making traditions and explore a quieter landscape.' },
  { id: 29, title: 'Malkangiri Reservoir Road Trip', days: 4, nights: 3, group: long, themes: ['Road Trips', 'Hidden Gems'], route: ['Malkangiri', 'Satiguda', 'Balimela', 'Chitrakonda', 'return'], stays: '2 Malkangiri + 1 Balimela/Chitrakonda, subject to accommodation', districts: ['Malkangiri'], image: '/tourism/koraput-hills.webp', teaser: 'A southern reservoir route best arranged with local transport.' },
  { id: 30, title: 'Nuapada Quiet Escape', days: 3, nights: 2, group: long, themes: ['Hidden Gems', 'Road Trips'], route: ['Nuapada', 'Patora', 'Budhikomna', 'Patalganga', 'return'], stays: '2 Nuapada/Khariar Road', districts: ['Nuapada'], image: '/tourism/road-trip.webp', teaser: 'Reservoirs and smaller stops for a quieter western escape.' },
];

export const tripHref = (trip: Trip) => `/odisha-tourism/trips#trip-${trip.id}`;

export const homeTripIds = [1, 7, 8, 11, 16, 20];
export const homeTrips = homeTripIds.map((id) => trips.find((trip) => trip.id === id)!);

export const featuredTrips = trips.filter((trip) => trip.featured);
export const tripDistricts = [...new Set(trips.flatMap((trip) => trip.districts))].sort((a, b) => a.localeCompare(b));

export const planningNote = 'These are suggested durations and night splits, starting after arrival at the first destination. Travel from the visitor’s home city is additional. Routes show the main stops; some are day excursions from the overnight base.';
