export type District = { name: string; place: string; summary: string; image: string; food: string; foodImage: string };

// Curated district highlights for the Explore Odisha selector.
export const districts: District[] = [
  { name: 'Sundargarh', place: 'Khandadhar Falls', summary: 'A dramatic cascade framed by the forests and hills of north-west Odisha.', image: '/tourism/koraput-hills.webp', food: 'Rugda curry', foodImage: '/tourism/dalma.webp' },
  { name: 'Mayurbhanj', place: 'Similipal National Park', summary: 'Waterfalls, sal forests and rich wildlife in Odisha’s green north.', image: '/tourism/similipal.webp', food: 'Mudhi mansa', foodImage: '/tourism/dalma.webp' },
  { name: 'Balasore', place: 'Chandipur Beach', summary: 'A quiet coastal escape known for its remarkable disappearing sea.', image: '/tourism/puri.webp', food: 'Fresh coastal fish', foodImage: '/tourism/dalma.webp' },
  { name: 'Kendujhar', place: 'Sanaghagara Falls', summary: 'A forest waterfall tucked into the uplands of northern Odisha.', image: '/tourism/similipal.webp', food: 'Mandia pej', foodImage: '/tourism/pakhala.webp' },
  { name: 'Jharsuguda', place: 'Koilighughar Waterfall', summary: 'A scenic forest waterfall and a peaceful stop in western Odisha.', image: '/tourism/koraput-hills.webp', food: 'Chaul bara', foodImage: '/tourism/chhena-poda.webp' },
  { name: 'Sambalpur', place: 'Hirakud Reservoir', summary: 'Wide waters, island viewpoints and the living culture of western Odisha.', image: '/tourism/chilika.webp', food: 'Sambalpuri bara', foodImage: '/tourism/pakhala.webp' },
  { name: 'Bargarh', place: 'Nrusinghanath Temple', summary: 'A sacred foothill retreat beneath the forested Gandhamardan range.', image: '/tourism/koraput-hills.webp', food: 'Bara and ghuguni', foodImage: '/tourism/dalma.webp' },
  { name: 'Debagarh', place: 'Pradhanpat Waterfall', summary: 'A leafy escape with a beautiful cascade close to Deogarh town.', image: '/tourism/similipal.webp', food: 'Pakhala bhata', foodImage: '/tourism/pakhala.webp' },
  { name: 'Angul', place: 'Satkosia Gorge', summary: 'A spectacular river gorge where the Mahanadi winds through forest.', image: '/tourism/chilika.webp', food: 'Chhena poda', foodImage: '/tourism/chhena-poda.webp' },
  { name: 'Dhenkanal', place: 'Kapilash Temple', summary: 'A hilltop Shiva shrine reached through forested Eastern Ghats.', image: '/tourism/konark-hero.webp', food: 'Dhenkanal bara', foodImage: '/tourism/pakhala.webp' },
  { name: 'Jajpur', place: 'Ratnagiri Buddhist Complex', summary: 'Ancient monasteries and sculpted heritage in Odisha’s historic heartland.', image: '/tourism/konark-hero.webp', food: 'Chhena jhili', foodImage: '/tourism/chhena-poda.webp' },
  { name: 'Bhadrak', place: 'Akhandalamani Temple', summary: 'A revered riverside temple and a gateway to the northern coast.', image: '/tourism/puri.webp', food: 'Chhena sweets', foodImage: '/tourism/chhena-poda.webp' },
  { name: 'Kendrapara', place: 'Bhitarkanika National Park', summary: 'Mangrove creeks, birdlife and one of India’s great estuarine habitats.', image: '/tourism/chilika.webp', food: 'Crab curry', foodImage: '/tourism/dalma.webp' },
  { name: 'Jagatsinghpur', place: 'Paradeep coast', summary: 'Explore the meeting of river, port and Bay of Bengal on Odisha’s central coast.', image: '/tourism/chilika.webp', food: 'Coastal fish curry', foodImage: '/tourism/dalma.webp' },
  { name: 'Cuttack', place: 'Barabati Fort', summary: 'Explore the old river city, its silver filigree and historic fort.', image: '/tourism/konark-hero.webp', food: 'Dahi bara aloo dum', foodImage: '/tourism/pakhala.webp' },
  { name: 'Khordha', place: 'Lingaraj Temple', summary: 'Bhubaneswar’s ancient temples, lively lanes and celebrated local cuisine.', image: '/tourism/konark-hero.webp', food: 'Dahi bara aloo dum', foodImage: '/tourism/pakhala.webp' },
  { name: 'Puri', place: 'Jagannath Temple & Beach', summary: 'A beloved pilgrimage town where temple traditions meet the Bay of Bengal.', image: '/tourism/puri.webp', food: 'Mahaprasad', foodImage: '/tourism/dalma.webp' },
  { name: 'Nayagarh', place: 'Kuanria Wildlife Sanctuary', summary: 'Forest trails, reservoirs and quiet countryside in central Odisha.', image: '/tourism/koraput-hills.webp', food: 'Arisa pitha', foodImage: '/tourism/chhena-poda.webp' },
  { name: 'Boudh', place: 'Boudh heritage temples', summary: 'Riverside shrines and a slower journey through central Odisha.', image: '/tourism/konark-hero.webp', food: 'Mandia pej', foodImage: '/tourism/pakhala.webp' },
  { name: 'Subarnapur', place: 'Sonepur river ghats', summary: 'A historic river town known for temples, weaving and tranquil ghats.', image: '/tourism/raghurajpur.webp', food: 'Sonepuri rasabali', foodImage: '/tourism/chhena-poda.webp' },
  { name: 'Balangir', place: 'Harishankar Temple', summary: 'A forested pilgrimage destination with a waterfall at the foothills.', image: '/tourism/koraput-hills.webp', food: 'Kandhamula bhaja', foodImage: '/tourism/dalma.webp' },
  { name: 'Nuapada', place: 'Patora Dam', summary: 'Open landscapes and a peaceful reservoir in Odisha’s west.', image: '/tourism/chilika.webp', food: 'Local millet dishes', foodImage: '/tourism/pakhala.webp' },
  { name: 'Kandhamal', place: 'Daringbadi', summary: 'Cool hill air, pine groves and winding roads in the Eastern Ghats.', image: '/tourism/koraput-hills.webp', food: 'Turmeric tea & local honey', foodImage: '/tourism/dalma.webp' },
  { name: 'Kalahandi', place: 'Phurlijharan Waterfall', summary: 'A refreshing woodland cascade near the historic town of Bhawanipatna.', image: '/tourism/similipal.webp', food: 'Kalahandi bara', foodImage: '/tourism/pakhala.webp' },
  { name: 'Ganjam', place: 'Tara Tarini Temple', summary: 'Hilltop views, coastal towns and the warm flavours of southern Odisha.', image: '/tourism/koraput-hills.webp', food: 'Gopalpur seafood', foodImage: '/tourism/dalma.webp' },
  { name: 'Rayagada', place: 'Chatikona Waterfall', summary: 'Eastern Ghats scenery and vibrant weekly markets in tribal country.', image: '/tourism/koraput-hills.webp', food: 'Manda pitha', foodImage: '/tourism/chhena-poda.webp' },
  { name: 'Gajapati', place: 'Mahendragiri Hills', summary: 'Sacred peaks and sweeping views over the southern Eastern Ghats.', image: '/tourism/koraput-hills.webp', food: 'Saura-style mandia', foodImage: '/tourism/pakhala.webp' },
  { name: 'Nabarangpur', place: 'Papadahandi waterfall', summary: 'Forest roads and riverside picnic spots in the south-west.', image: '/tourism/similipal.webp', food: 'Ragi mudde', foodImage: '/tourism/pakhala.webp' },
  { name: 'Koraput', place: 'Deomali Peak', summary: 'Odisha’s highest peak rises above coffee country and rolling green hills.', image: '/tourism/koraput-hills.webp', food: 'Koraput coffee & manda', foodImage: '/tourism/pakhala.webp' },
  { name: 'Malkangiri', place: 'Bonda Hills', summary: 'A remarkable highland landscape in Odisha’s far south-west.', image: '/tourism/koraput-hills.webp', food: 'Local bamboo shoot dishes', foodImage: '/tourism/dalma.webp' },
];





