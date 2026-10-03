export type Trail = {
  name: string;
  theme: string;
  duration: string;
  image: string;
  introduction: string;
  stops: string[];
};

export const trails: Trail[] = [
  {
    name: 'The Golden Coast',
    theme: 'Heritage · Coast',
    duration: 'Suggested 3 days',
    image: '/tourism/konark-hero.webp',
    introduction: 'From carved stone to the open sea, follow the places that make Odisha’s coast unforgettable.',
    stops: ['Bhubaneswar', 'Konark', 'Puri', 'Chilika'],
  },
  {
    name: 'The Artist’s Path',
    theme: 'Craft · Culture',
    duration: 'Suggested 2 days',
    image: '/tourism/raghurajpur.webp',
    introduction: 'Meet the hands and traditions behind Pattachitra, appliqué and the colour of everyday life.',
    stops: ['Puri', 'Raghurajpur', 'Pipili'],
  },
  {
    name: 'Into the Green',
    theme: 'Forest · Nature',
    duration: 'Suggested 3 days',
    image: '/tourism/similipal.webp',
    introduction: 'Trade the rush of the city for forest air, quiet roads and the sound of falling water.',
    stops: ['Baripada', 'Similipal', 'Barehipani'],
  },
];
