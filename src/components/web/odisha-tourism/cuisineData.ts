export type DishCategory = 'Everyday' | 'Temple' | 'Coastal' | 'Street food' | 'Pitha' | 'Sweets';

export type Dish = {
  name: string;
  category: DishCategory;
  description: string;
  image?: string;
};

export const dishPalette: Record<DishCategory, { background: string; ink: string; glow: string }> = {
  Everyday: { background: '#D5E6CE', ink: '#244A36', glow: '#A9C996' },
  Temple: { background: '#F3DEB8', ink: '#65452A', glow: '#D4A469' },
  Coastal: { background: '#CDE4E5', ink: '#244E55', glow: '#91BCC0' },
  'Street food': { background: '#F2D3BC', ink: '#74442E', glow: '#DDA783' },
  Pitha: { background: '#E5D7E9', ink: '#5E4163', glow: '#C6A9D0' },
  Sweets: { background: '#F4DBD6', ink: '#754638', glow: '#E4A99B' },
};

export const dishes: Dish[] = [
  { name: 'Pakhala', category: 'Everyday', description: 'Rice soaked in water and enjoyed with a changing spread of sides.', image: '/tourism/pakhala.webp' },
  { name: 'Dalma', category: 'Everyday', description: 'Lentils, vegetables and gentle spice in a comforting Odia classic.', image: '/tourism/dalma.webp' },
  { name: 'Santula', category: 'Everyday', description: 'A lightly spiced medley of vegetables that lets the produce shine.' },
  { name: 'Mahaprasad', category: 'Temple', description: 'The sacred food offering of Puri’s Jagannath Temple.' },
  { name: 'Kanika', category: 'Temple', description: 'Fragrant sweet rice with ghee and warm spice.' },
  { name: 'Machha Besara', category: 'Coastal', description: 'Fish cooked with a bold mustard-based flavour.' },
  { name: 'Chingudi Bhaja', category: 'Coastal', description: 'Pan-fried prawns with local spices, often enjoyed beside pakhala.' },
  { name: 'Badi Chura', category: 'Everyday', description: 'Crumbled lentil badi mixed into a punchy, savoury accompaniment.' },
  { name: 'Dahi Bara Aloo Dum', category: 'Street food', description: 'Soft lentil dumplings with yoghurt and spiced potato, beloved on Odisha’s streets.' },
  { name: 'Mudhi Mansa', category: 'Street food', description: 'Baripada’s much-loved pairing of puffed rice and mutton curry.' },
  { name: 'Poda Pitha', category: 'Pitha', description: 'A slow-cooked festival pitha with a deep, toasted edge.' },
  { name: 'Chakuli Pitha', category: 'Pitha', description: 'A soft rice-and-lentil pancake served in many Odia homes.' },
  { name: 'Manda Pitha', category: 'Pitha', description: 'A rice dumpling filled with coconut and jaggery.' },
  { name: 'Enduri Pitha', category: 'Pitha', description: 'A fragrant steamed pitha wrapped in turmeric leaves.' },
  { name: 'Kakara Pitha', category: 'Pitha', description: 'A golden fried sweet made with semolina and coconut.' },
  { name: 'Arisa Pitha', category: 'Pitha', description: 'A festive rice-and-jaggery sweet with a satisfying bite.' },
  { name: 'Chhena Poda', category: 'Sweets', description: 'Baked chhena with a caramelised surface and soft centre.', image: '/tourism/chhena-poda.webp' },
  { name: 'Rasagola', category: 'Sweets', description: 'Soft chhena sweets soaked in syrup, linked to Odisha’s festive traditions.' },
  { name: 'Chhena Jhili', category: 'Sweets', description: 'A syrup-soaked chhena sweet associated with Nimapada.' },
  { name: 'Rasabali', category: 'Sweets', description: 'Chhena patties served in thickened, sweetened milk.' },
  { name: 'Khaja', category: 'Sweets', description: 'Crisp, layered sweet especially associated with Puri.' },
  { name: 'Korakhai', category: 'Sweets', description: 'A crunchy caramelised puffed-rice sweet from Bhubaneswar’s old town.' },
  { name: 'Malpua', category: 'Sweets', description: 'A rich, sweet pancake enjoyed across festive tables.' },
  { name: 'Chhena Gaja', category: 'Sweets', description: 'Fried chhena pieces finished in sugar syrup.' },
];
