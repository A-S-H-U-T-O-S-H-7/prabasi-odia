import { explorerPlaces } from './explorerData';

type PlaceStory = {
  story: string;
  core: string;
  activities: [string, string, string];
  travelTarget?: string;
  mapQuery?: string;
};

const stories: Record<string, PlaceStory> = {
  'jagannath-temple': {
    story: 'Puri revolves around the Jagannath Temple. The streets, food and festival traditions around the shrine make this a journey through living culture as much as a visit to a monument.',
    core: 'Spend time in the temple quarter and notice how worship, craft and everyday life meet in the heart of Puri.',
    activities: ['Walk the temple quarter and Grand Road', 'Discover local food and market lanes', 'Continue to Puri’s seafront'],
  },
  'konark-sun-temple': {
    story: 'Konark’s great stone chariot rewards a slow visit. Its sculpted wheels and layered carvings reveal the imagination and craftsmanship behind one of Odisha’s best-known landmarks.',
    core: 'Circle the monument slowly to take in the scale and detail of its chariot-inspired architecture.',
    activities: ['Explore the carved wheels and walls', 'Visit the interpretation areas', 'Pair the visit with Chandrabhaga Beach'],
    travelTarget: 'Konark',
  },
  'lingaraj-temple': {
    story: 'In Bhubaneswar’s old town, Lingaraj stands among lanes and shrines that tell the story of Odisha’s temple architecture.',
    core: 'Walk the old-town temple precinct and appreciate the silhouette and stonework of this sacred landscape.',
    activities: ['Explore the old-town lanes', 'See nearby temple architecture', 'Visit a local craft or food stop'],
  },
  'tara-tarini-temple': {
    story: 'A hilltop pilgrimage above the Rushikulya River, Tara Tarini combines devotion with wide views of the Ganjam landscape.',
    core: 'Make the climb or ascent part of the experience, then pause at the hilltop for the surrounding view.',
    activities: ['Visit the hilltop shrine', 'Take in the river valley views', 'Explore nearby Ganjam towns'],
    travelTarget: 'Tara Tarini Temple, Ganjam',
  },
  'samaleswari-temple': {
    story: 'Samaleswari Temple is closely tied to the identity of Sambalpur and offers a welcoming starting point for discovering western Odisha.',
    core: 'Experience the temple precinct, then follow Sambalpur’s craft and river stories beyond it.',
    activities: ['Spend time at the temple', 'Explore Sambalpur’s local markets', 'Pair the trip with Hirakud'],
  },
  similipal: {
    story: 'Similipal is a broad forest landscape in Mayurbhanj where woodland, streams and wildlife shape the journey. Access and permitted activities can change with the season.',
    core: 'Let the forest set the pace: travel through designated routes and watch how the landscape changes along the way.',
    activities: ['Explore permitted forest routes', 'Pause at viewpoints and waterfalls', 'Learn about local ecology'],
    travelTarget: 'Similipal, Mayurbhanj',
  },
  bhitarkanika: {
    story: 'Bhitarkanika’s mangrove waterways offer a different view of coastal Odisha. Guided boat journeys bring the forest and its wildlife into focus.',
    core: 'Move slowly through the waterways and experience the mangroves from the water.',
    activities: ['Take an authorised boat trip', 'Observe mangrove habitats', 'Watch for birdlife and wildlife from a safe distance'],
    travelTarget: 'Bhitarkanika National Park',
  },
  'satkosia-gorge': {
    story: 'At Satkosia, the Mahanadi cuts between forested hills. The wide river and steep slopes make the landscape feel especially expansive.',
    core: 'Find a designated riverside viewpoint and take in the scale of the gorge.',
    activities: ['Enjoy river viewpoints', 'Explore approved nature trails', 'Stay at a local nature camp'],
    travelTarget: 'Satkosia Gorge, Angul',
  },
  debrigarh: {
    story: 'Debrigarh brings together forest, wildlife and views across the Hirakud Reservoir near Sambalpur.',
    core: 'Experience the quieter side of western Odisha on a permitted forest outing.',
    activities: ['Join an authorised forest excursion', 'Look out over Hirakud Reservoir', 'Spend time at a nature camp'],
    travelTarget: 'Debrigarh Wildlife Sanctuary',
  },
  'chilika-birdlife': {
    story: 'The open water and islands of Chilika create a changing habitat for birdlife. The experience varies with the season and the part of the lagoon you visit.',
    core: 'Watch the lagoon come alive from a responsible viewing point or authorised boat route.',
    activities: ['Watch birds from a respectful distance', 'Take a permitted lagoon boat trip', 'Explore a lakeside village'],
    travelTarget: 'Chilika Lake',
    mapQuery: 'Chilika Lake Odisha',
  },
  'puri-beach': {
    story: 'Puri Beach is part of the city’s daily rhythm, with its broad shore, sea breeze and nearby temple-town energy.',
    core: 'Take an unhurried shoreline walk and see Puri from the edge of the Bay of Bengal.',
    activities: ['Walk the promenade', 'Watch the changing light over the sea', 'Explore Puri’s nearby food and craft lanes'],
  },
  'chandrabhaga-beach': {
    story: 'Near Konark, Chandrabhaga offers a wide coastal pause that pairs naturally with a visit to the Sun Temple.',
    core: 'Enjoy the open shoreline after spending time with Konark’s stone carvings.',
    activities: ['Walk the beach', 'Visit Konark Sun Temple', 'Explore the coastal road'],
    travelTarget: 'Chandrabhaga Beach, Konark',
  },
  'gopalpur-beach': {
    story: 'Gopalpur is an easygoing coastal stop in Ganjam, suited to a slow walk and time by the sea.',
    core: 'Follow the shoreline and enjoy the quieter pace of southern Odisha’s coast.',
    activities: ['Walk the seafront', 'Discover local seafood and markets', 'Explore nearby Ganjam'],
    travelTarget: 'Gopalpur, Odisha',
  },
  'chandipur-beach': {
    story: 'Chandipur is known for its striking low-tide shoreline, where the sea can withdraw a long way across the sand.',
    core: 'Time your visit around the tide and watch the shoreline change in front of you.',
    activities: ['Observe the tidal landscape', 'Take a shore walk when conditions permit', 'Explore Balasore’s coastal surroundings'],
    travelTarget: 'Chandipur Beach, Balasore',
  },
  'talasari-beach': {
    story: 'Talasari’s sands and estuary setting give this part of the northern coast a quieter, open feel.',
    core: 'Follow the meeting of river and sea and linger over the coastal views.',
    activities: ['Walk the shoreline', 'See the estuary landscape', 'Explore nearby coastal villages'],
    travelTarget: 'Talasari Beach, Balasore',
  },
  'khandadhar-falls': {
    story: 'Khandadhar is a dramatic waterfall in a green, hilly setting. The journey through the surrounding landscape is part of the visit.',
    core: 'Pause at a safe viewpoint to take in the height, sound and forest setting of the falls.',
    activities: ['View the waterfall', 'Enjoy the surrounding hills', 'Explore designated nature routes'],
    travelTarget: 'Khandadhar Falls, Sundargarh',
  },
  'sanaghagara-falls': {
    story: 'Sanaghagara makes a refreshing nature stop near Keonjhar, with water, trees and open spaces to slow down in.',
    core: 'Spend a relaxed stretch beside the falls and forested setting.',
    activities: ['Visit the waterfall viewpoint', 'Walk the nearby green spaces', 'Explore Keonjhar’s landscape'],
    travelTarget: 'Sanaghagara Falls, Keonjhar',
  },
  'ansupa-lake': {
    story: 'Ansupa is a freshwater lake near Cuttack whose calm waters and surrounding greenery invite a slower day outdoors.',
    core: 'Take in the lakeside landscape and its changing reflections.',
    activities: ['Walk by the lake', 'Watch for local birdlife', 'Explore the surrounding countryside'],
    travelTarget: 'Ansupa Lake, Cuttack',
  },
  'chilika-lake': {
    story: 'Chilika stretches across a broad coastal lagoon with islands, fishing communities and wide skies. Each shore offers a different way to experience the water.',
    core: 'Choose a lakeside base and let the lagoon’s water and light lead the day.',
    activities: ['Take an authorised boat trip', 'Visit a lakeside village', 'Watch the changing light and birdlife'],
    travelTarget: 'Chilika Lake',
    mapQuery: 'Chilika Lake Odisha',
  },
  daringbadi: {
    story: 'Daringbadi’s hill roads and cooler highland scenery make for an easy change of pace from Odisha’s coast.',
    core: 'Enjoy the winding journey and take time for the surrounding hills and viewpoints.',
    activities: ['Explore local viewpoints', 'Take a scenic drive', 'Discover the highland landscape'],
    travelTarget: 'Daringbadi, Kandhamal',
  },
  raghurajpur: {
    story: 'Raghurajpur is a living craft village near Puri where artists keep Pattachitra and other traditional practices visible in everyday life.',
    core: 'Meet artists respectfully and see the care behind a handmade work.',
    activities: ['Browse Pattachitra artwork', 'Watch a craft demonstration when available', 'Pair the visit with Puri'],
    travelTarget: 'Raghurajpur Heritage Crafts Village',
  },
  pipili: {
    story: 'Pipili’s applique tradition fills its shops and workshops with colour, pattern and hand-stitched detail.',
    core: 'See how fabric and careful stitching become Odisha’s distinctive applique craft.',
    activities: ['Browse applique workshops', 'Choose a locally made piece', 'Continue along the Puri–Bhubaneswar route'],
    travelTarget: 'Pipili, Odisha',
  },
  sukuapada: {
    story: 'Sukuapada in Dhenkanal invites a closer look at the skill and patience behind traditional stone carving.',
    core: 'Spend time with the craft process and the people who shape each piece.',
    activities: ['Explore stone carving work', 'Meet local makers when possible', 'Visit the Dhenkanal area'],
    travelTarget: 'Sukuapada, Dhenkanal',
  },
  'udayagiri-and-khandagiri': {
    story: 'The rock-cut caves at Udayagiri and Khandagiri add an older layer to Bhubaneswar’s story, with carved spaces and views over the city.',
    core: 'Walk the cave complexes slowly and notice the details cut into the stone.',
    activities: ['Explore the rock-cut caves', 'Look for carved details', 'Take in the hilltop views'],
    travelTarget: 'Udayagiri and Khandagiri Caves',
  },
  'dhauli-peace-pagoda': {
    story: 'Dhauli’s hilltop pagoda is a place to reflect on the Kalinga War and its place in the story of Ashoka.',
    core: 'Take a quiet moment at the monument while looking across the surrounding landscape.',
    activities: ['Visit the Peace Pagoda', 'Explore the historical setting', 'Enjoy views from the hill'],
    travelTarget: 'Dhauli Shanti Stupa',
  },
  pakhala: {
    story: 'Pakhala is rice prepared with water and served with a changing spread of sides. It is an everyday taste of home for many Odia families.',
    core: 'Try a full pakhala meal and discover how its sides change the balance of flavour.',
    activities: ['Try it with seasonal sides', 'Explore a local Odia restaurant', 'Ask about regional variations'],
    travelTarget: 'Bhubaneswar',
    mapQuery: 'Odia restaurants Bhubaneswar Odisha',
  },
  dalma: {
    story: 'Dalma combines lentils and vegetables in a gently spiced dish found across Odia kitchens and menus.',
    core: 'Taste dalma as part of a traditional meal and notice its comforting, layered flavours.',
    activities: ['Order an Odia thali', 'Try dalma with rice', 'Explore other vegetable dishes'],
    travelTarget: 'Bhubaneswar',
    mapQuery: 'Odia restaurants Bhubaneswar Odisha',
  },
  'chhena-poda': {
    story: 'Chhena Poda is a baked cheese sweet with a caramelised edge and a special place among Odisha’s desserts.',
    core: 'Find a fresh slice and enjoy the contrast between its soft centre and browned surface.',
    activities: ['Try a fresh slice', 'Visit a local sweet shop', 'Explore more Odia desserts'],
    travelTarget: 'Bhubaneswar',
    mapQuery: 'Odia sweet shops Bhubaneswar Odisha',
  },
  mahaprasad: {
    story: 'Mahaprasad is food offered at Puri’s Jagannath Temple. Its meaning comes from the temple tradition and the shared experience of receiving it.',
    core: 'Approach this as a cultural and devotional experience, with respect for the temple’s current customs.',
    activities: ['Learn about the temple food tradition', 'Explore Puri’s culinary lanes', 'Visit the Jagannath Temple precinct'],
    travelTarget: 'Jagannath Temple, Puri',
    mapQuery: 'Jagannath Temple Puri Odisha',
  },
  rasagola: {
    story: 'Odia Rasagola is a soft chhena sweet enjoyed across the state and woven into festive food traditions.',
    core: 'Taste it fresh from a local sweet shop and compare the styles you encounter on your journey.',
    activities: ['Try a fresh Odia Rasagola', 'Explore local sweet shops', 'Discover related chhena sweets'],
    travelTarget: 'Bhubaneswar',
    mapQuery: 'Odia sweet shops Bhubaneswar Odisha',
  },
};

const railByLocation: Record<string, string> = {
  Puri: 'Puri railway station', Konark: 'Puri or Bhubaneswar railway station',
  Bhubaneswar: 'Bhubaneswar railway station', Sambalpur: 'Sambalpur railway station',
  Ganjam: 'Berhampur railway station', Balasore: 'Balasore railway station',
  Cuttack: 'Cuttack railway station', Keonjhar: 'Keonjhar railway station',
  Mayurbhanj: 'Baripada railway station', Kendrapara: 'Cuttack railway station',
  Angul: 'Angul railway station', Chilika: 'Balugaon railway station',
  'Coastal Odisha': 'Balugaon railway station', Sundargarh: 'Jharsuguda railway station',
  Kandhamal: 'Berhampur railway station', Dhenkanal: 'Dhenkanal railway station',
};

export const detailedPlaces = explorerPlaces.map((place) => {
  const story = stories[place.slug];
  if (!story) throw new Error(`Missing destination details for ${place.slug}`);
  const destination = story.travelTarget ?? place.location;
  const isFood = place.category === 'cuisine';
  const airport = ['Sambalpur', 'Sundargarh'].includes(place.location)
    ? 'Jharsuguda Airport'
    : 'Biju Patnaik International Airport, Bhubaneswar';

  return {
    ...place,
    ...story,
    destination,
    mapQuery: story.mapQuery ?? `${destination}, Odisha, India`,
    travelNote: isFood
      ? `This is a food experience, so the map points to ${destination} as a place to begin exploring. Restaurants, shops and availability vary.`
      : 'Check current opening hours, permits, weather and local conditions before you travel.',
    reach: {
      road: `Plan a road trip to ${destination}. Use a local bus, taxi or private vehicle for the final stretch.`,
      air: `Fly into ${airport}, then continue toward ${destination} by road. Check current flight routes before booking.`,
      rail: `Take a train to ${isFood ? (place.slug === 'mahaprasad' ? 'Puri railway station' : 'Bhubaneswar railway station') : (railByLocation[place.location] ?? 'a railway station serving the region')}, then continue locally toward ${destination}. Check current services before travelling.`,
    },
  };
});

export type DetailedPlace = (typeof detailedPlaces)[number];
