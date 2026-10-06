export type PerformanceStory = {
  id: string;
  title: string;
  form: string;
  region: string;
  description: string;
  detail: string;
  visualWord: string;
  background: string;
  glow: string;
  image?: string;
};

export const performanceStories: PerformanceStory[] = [
  {
    id: 'odissi',
    title: 'Odissi',
    form: 'Classical dance',
    region: 'Across Odisha',
    description: 'Sculptural poses and expressive movement turn devotion and storytelling into dance.',
    detail: 'Rooted in Odisha’s temple traditions, Odissi continues to grow through the artists who perform and teach it today.',
    visualWord: 'ODISSI',
    background: '#6B302C',
    glow: '#CB8B55',
    image: '/tourism/odissi.webp',
  },
  {
    id: 'sambalpuri',
    title: 'Sambalpuri & Dalkhai',
    form: 'Folk music & dance',
    region: 'Western Odisha',
    description: 'Colour, rhythm and group movement give western Odisha’s celebrations their energy.',
    detail: 'Sambalpuri music and dances such as Dalkhai are closely tied to festivals and community gatherings.',
    visualWord: 'RHYTHM',
    background: '#8B4836',
    glow: '#E2A268',
  },
  {
    id: 'chhau',
    title: 'Mayurbhanj Chhau',
    form: 'Dance theatre',
    region: 'Mayurbhanj',
    description: 'Powerful movement brings martial energy and dramatic storytelling together.',
    detail: 'This distinctive form is one of Odisha’s most striking performance traditions, shaped by the artists and communities of Mayurbhanj.',
    visualWord: 'CHHAU',
    background: '#59405D',
    glow: '#B68BA0',
  },
  {
    id: 'community-rhythms',
    title: 'Community rhythms',
    form: 'Music & gathering',
    region: 'Across Odisha',
    description: 'Music and dance accompany harvests, rituals and shared moments in many communities.',
    detail: 'Each tradition has its own context and meaning. The best way to understand it is to listen to the people who carry it.',
    visualWord: 'BEAT',
    background: '#5F5A37',
    glow: '#C3AD70',
  },
  {
    id: 'dhanu-jatra',
    title: 'Dhanu Jatra',
    form: 'Open-air theatre',
    region: 'Western Odisha',
    description: 'A town becomes a stage as performers and audiences share a theatrical celebration.',
    detail: 'Dhanu Jatra shows how storytelling can move beyond a theatre building and become part of public life.',
    visualWord: 'JATRA',
    background: '#734039',
    glow: '#DA9073',
  },
  {
    id: 'pala-sahi-jatra',
    title: 'Pala & Sahi Jatra',
    form: 'Storytelling traditions',
    region: 'Across Odisha',
    description: 'Music, dialogue and performance bring familiar stories into the present.',
    detail: 'These traditions keep local narratives alive through the voices, timing and presence of performers.',
    visualWord: 'STORY',
    background: '#674356',
    glow: '#BF8BA7',
  },
];

export const craftHighlights = [
  {
    title: 'Pattachitra',
    place: 'Raghurajpur',
    image: '/tourism/raghurajpur.webp',
    description: 'Painters keep a richly detailed storytelling tradition alive, one line at a time.',
  },
  {
    title: 'Pipili appliqué',
    place: 'Pipili',
    image: '/tourism/pipili.webp',
    description: 'Fabric, colour and careful stitching turn everyday making into celebration.',
  },
];
