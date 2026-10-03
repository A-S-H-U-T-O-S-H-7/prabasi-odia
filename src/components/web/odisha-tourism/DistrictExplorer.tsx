'use client';

import Image from 'next/image';
import { useMemo, useRef, useState } from 'react';
import { ArrowUpRight, ChevronLeft, ChevronRight, CloudSun, MapPin, UtensilsCrossed } from 'lucide-react';
import { explorerTabs } from './explorerData';

type District = { name: string; x: number; y: number; place: string; summary: string; image: string; food: string; foodImage: string; temperature: number; sky: string; path: string };

// Odisha-shaped locator map with clickable district cells placed in their approximate locations.
const districts: District[] = [
  { name: 'Sundargarh', x: 22, y: 12, place: 'Khandadhar Falls', summary: 'A dramatic cascade framed by the forests and hills of north-west Odisha.', image: '/tourism/koraput-hills.webp', food: 'Rugda curry', foodImage: '/tourism/dalma.webp', temperature: 29, sky: 'Partly cloudy', path: 'M42 20 L58 9 L82 17 L100 10 L118 19 L138 14 L153 28 L147 45 L128 53 L113 46 L94 56 L77 47 L58 54 L43 41 Z' },
  { name: 'Mayurbhanj', x: 67, y: 15, place: 'Similipal National Park', summary: 'Waterfalls, sal forests and rich wildlife in Odishaâ€™s green north.', image: '/tourism/similipal.webp', food: 'Mudhi mansa', foodImage: '/tourism/dalma.webp', temperature: 30, sky: 'Clear skies', path: 'M166 22 L184 13 L206 19 L223 10 L245 22 L258 39 L249 56 L229 62 L216 78 L196 69 L181 74 L168 57 L151 51 L156 35 Z' },
  { name: 'Balasore', x: 87, y: 24, place: 'Chandipur Beach', summary: 'A quiet coastal escape known for its remarkable disappearing sea.', image: '/tourism/puri.webp', food: 'Fresh coastal fish', foodImage: '/tourism/dalma.webp', temperature: 31, sky: 'Sunny', path: 'M246 68 L263 60 L279 67 L290 83 L283 98 L267 105 L251 95 L239 83 Z' },
  { name: 'Kendujhar', x: 62, y: 28, place: 'Sanaghagara Falls', summary: 'A forest waterfall tucked into the uplands of northern Odisha.', image: '/tourism/similipal.webp', food: 'Mandia pej', foodImage: '/tourism/pakhala.webp', temperature: 28, sky: 'Light clouds', path: 'M148 58 L169 55 L181 76 L197 70 L216 81 L223 101 L211 116 L193 112 L180 127 L163 117 L145 121 L132 102 L137 83 Z' },
  { name: 'Jharsuguda', x: 19, y: 27, place: 'Koilighughar Waterfall', summary: 'A scenic forest waterfall and a peaceful stop in western Odisha.', image: '/tourism/koraput-hills.webp', food: 'Chaul bara', foodImage: '/tourism/chhena-poda.webp', temperature: 32, sky: 'Mostly sunny', path: 'M40 56 L59 53 L77 59 L82 78 L68 93 L50 88 L37 98 L25 83 Z' },
  { name: 'Sambalpur', x: 30, y: 38, place: 'Hirakud Reservoir', summary: 'Wide waters, island viewpoints and the living culture of western Odisha.', image: '/tourism/chilika.webp', food: 'Sambalpuri bara', foodImage: '/tourism/pakhala.webp', temperature: 33, sky: 'Sunny', path: 'M78 96 L95 83 L114 90 L131 84 L143 100 L137 120 L119 132 L99 123 L82 131 L68 117 Z' },
  { name: 'Bargarh', x: 22, y: 49, place: 'Nrusinghanath Temple', summary: 'A sacred foothill retreat beneath the forested Gandhamardan range.', image: '/tourism/koraput-hills.webp', food: 'Bara and ghuguni', foodImage: '/tourism/dalma.webp', temperature: 32, sky: 'Clear skies', path: 'M38 103 L55 91 L71 99 L68 119 L82 133 L73 151 L53 148 L42 160 L28 146 L30 125 Z' },
  { name: 'Debagarh', x: 42, y: 39, place: 'Pradhanpat Waterfall', summary: 'A leafy escape with a beautiful cascade close to Deogarh town.', image: '/tourism/similipal.webp', food: 'Pakhala bhata', foodImage: '/tourism/pakhala.webp', temperature: 29, sky: 'Partly cloudy', path: 'M137 124 L151 119 L166 126 L176 140 L165 156 L146 160 L132 149 Z' },
  { name: 'Angul', x: 55, y: 49, place: 'Satkosia Gorge', summary: 'A spectacular river gorge where the Mahanadi winds through forest.', image: '/tourism/chilika.webp', food: 'Chhena poda', foodImage: '/tourism/chhena-poda.webp', temperature: 31, sky: 'Hazy sunshine', path: 'M178 134 L193 119 L212 119 L225 132 L217 151 L226 167 L210 180 L190 173 L176 184 L163 165 Z' },
  { name: 'Dhenkanal', x: 70, y: 48, place: 'Kapilash Temple', summary: 'A hilltop Shiva shrine reached through forested Eastern Ghats.', image: '/tourism/konark-hero.webp', food: 'Dhenkanal bara', foodImage: '/tourism/pakhala.webp', temperature: 30, sky: 'Partly cloudy', path: 'M225 132 L244 124 L260 138 L263 157 L249 169 L257 184 L239 198 L222 186 L226 168 L216 151 Z' },
  { name: 'Jajpur', x: 82, y: 39, place: 'Ratnagiri Buddhist Complex', summary: 'Ancient monasteries and sculpted heritage in Odishaâ€™s historic heartland.', image: '/tourism/konark-hero.webp', food: 'Chhena jhili', foodImage: '/tourism/chhena-poda.webp', temperature: 31, sky: 'Sunny', path: 'M258 109 L275 102 L291 112 L295 132 L281 145 L264 140 L260 157 L245 145 Z' },
  { name: 'Bhadrak', x: 91, y: 38, place: 'Akhandalamani Temple', summary: 'A revered riverside temple and a gateway to the northern coast.', image: '/tourism/puri.webp', food: 'Chhena sweets', foodImage: '/tourism/chhena-poda.webp', temperature: 31, sky: 'Sunny', path: 'M293 105 L312 111 L320 126 L308 143 L291 138 L281 146 L275 130 Z' },
  { name: 'Kendrapara', x: 89, y: 49, place: 'Bhitarkanika National Park', summary: 'Mangrove creeks, birdlife and one of Indiaâ€™s great estuarine habitats.', image: '/tourism/chilika.webp', food: 'Crab curry', foodImage: '/tourism/dalma.webp', temperature: 30, sky: 'Breezy', path: 'M280 148 L295 140 L310 148 L315 166 L300 178 L284 172 L269 182 L258 169 Z' },
  { name: 'Cuttack', x: 76, y: 59, place: 'Barabati Fort', summary: 'Explore the old river city, its silver filigree and historic fort.', image: '/tourism/konark-hero.webp', food: 'Dahi bara aloo dum', foodImage: '/tourism/pakhala.webp', temperature: 32, sky: 'Sunny', path: 'M248 171 L261 165 L276 176 L272 191 L258 198 L247 211 L232 198 L238 183 Z' },
  { name: 'Khordha', x: 69, y: 70, place: 'Lingaraj Temple', summary: 'Bhubaneswarâ€™s ancient temples, lively lanes and celebrated local cuisine.', image: '/tourism/konark-hero.webp', food: 'Dahi bara aloo dum', foodImage: '/tourism/pakhala.webp', temperature: 33, sky: 'Clear skies', path: 'M224 198 L240 194 L251 207 L246 224 L230 232 L214 224 L205 213 Z' },
  { name: 'Puri', x: 76, y: 81, place: 'Jagannath Temple & Beach', summary: 'A beloved pilgrimage town where temple traditions meet the Bay of Bengal.', image: '/tourism/puri.webp', food: 'Mahaprasad', foodImage: '/tourism/dalma.webp', temperature: 31, sky: 'Sea breeze', path: 'M248 214 L263 207 L279 216 L286 231 L271 239 L254 234 L239 242 L228 231 Z' },
  { name: 'Nayagarh', x: 61, y: 68, place: 'Kuanria Wildlife Sanctuary', summary: 'Forest trails, reservoirs and quiet countryside in central Odisha.', image: '/tourism/koraput-hills.webp', food: 'Arisa pitha', foodImage: '/tourism/chhena-poda.webp', temperature: 29, sky: 'Partly cloudy', path: 'M191 191 L207 182 L222 190 L227 207 L215 222 L198 225 L186 214 L179 201 Z' },
  { name: 'Boudh', x: 45, y: 61, place: 'Boudh heritage temples', summary: 'Riverside shrines and a slower journey through central Odisha.', image: '/tourism/konark-hero.webp', food: 'Mandia pej', foodImage: '/tourism/pakhala.webp', temperature: 30, sky: 'Sunny spells', path: 'M157 169 L175 164 L188 177 L184 197 L170 207 L153 198 L144 184 Z' },
  { name: 'Subarnapur', x: 31, y: 66, place: 'Sonepur river ghats', summary: 'A historic river town known for temples, weaving and tranquil ghats.', image: '/tourism/raghurajpur.webp', food: 'Sonepuri rasabali', foodImage: '/tourism/chhena-poda.webp', temperature: 32, sky: 'Clear skies', path: 'M102 151 L119 139 L137 147 L143 166 L132 181 L113 181 L99 171 Z' },
  { name: 'Balangir', x: 20, y: 67, place: 'Harishankar Temple', summary: 'A forested pilgrimage destination with a waterfall at the foothills.', image: '/tourism/koraput-hills.webp', food: 'Kandhamula bhaja', foodImage: '/tourism/dalma.webp', temperature: 31, sky: 'Sunny', path: 'M60 153 L80 145 L99 154 L101 173 L91 190 L71 195 L56 181 Z' },
  { name: 'Nuapada', x: 10, y: 68, place: 'Patora Dam', summary: 'Open landscapes and a peaceful reservoir in Odishaâ€™s west.', image: '/tourism/chilika.webp', food: 'Local millet dishes', foodImage: '/tourism/pakhala.webp', temperature: 32, sky: 'Sunny', path: 'M25 160 L43 151 L58 162 L57 183 L43 194 L27 187 L17 174 Z' },
  { name: 'Kandhamal', x: 48, y: 78, place: 'Daringbadi', summary: 'Cool hill air, pine groves and winding roads in the Eastern Ghats.', image: '/tourism/koraput-hills.webp', food: 'Turmeric tea & local honey', foodImage: '/tourism/dalma.webp', temperature: 26, sky: 'Cool and cloudy', path: 'M133 207 L151 198 L168 207 L181 220 L177 240 L158 247 L140 239 L128 224 Z' },
  { name: 'Kalahandi', x: 28, y: 83, place: 'Phurlijharan Waterfall', summary: 'A refreshing woodland cascade near the historic town of Bhawanipatna.', image: '/tourism/similipal.webp', food: 'Kalahandi bara', foodImage: '/tourism/pakhala.webp', temperature: 30, sky: 'Partly cloudy', path: 'M62 198 L81 191 L99 196 L111 211 L106 232 L88 241 L68 232 L57 216 Z' },
  { name: 'Ganjam', x: 67, y: 91, place: 'Tara Tarini Temple', summary: 'Hilltop views, coastal towns and the warm flavours of southern Odisha.', image: '/tourism/koraput-hills.webp', food: 'Gopalpur seafood', foodImage: '/tourism/dalma.webp', temperature: 30, sky: 'Breezy', path: 'M182 245 L197 231 L215 232 L229 242 L244 241 L255 251 L246 266 L227 273 L207 266 L192 273 L177 262 Z' },
  { name: 'Rayagada', x: 48, y: 96, place: 'Chatikona Waterfall', summary: 'Eastern Ghats scenery and vibrant weekly markets in tribal country.', image: '/tourism/koraput-hills.webp', food: 'Manda pitha', foodImage: '/tourism/chhena-poda.webp', temperature: 28, sky: 'Cloudy intervals', path: 'M123 246 L139 237 L156 245 L171 260 L168 279 L151 290 L133 283 L118 269 Z' },
  { name: 'Gajapati', x: 60, y: 106, place: 'Mahendragiri Hills', summary: 'Sacred peaks and sweeping views over the southern Eastern Ghats.', image: '/tourism/koraput-hills.webp', food: 'Saura-style mandia', foodImage: '/tourism/pakhala.webp', temperature: 27, sky: 'Mountain clouds', path: 'M158 291 L174 280 L191 275 L207 283 L211 301 L197 313 L180 308 L165 317 L151 307 Z' },
  { name: 'Nabarangpur', x: 27, y: 101, place: 'Papadahandi waterfall', summary: 'Forest roads and riverside picnic spots in the south-west.', image: '/tourism/similipal.webp', food: 'Ragi mudde', foodImage: '/tourism/pakhala.webp', temperature: 29, sky: 'Partly cloudy', path: 'M65 239 L85 235 L101 244 L110 260 L102 277 L84 285 L68 275 L55 262 Z' },
  { name: 'Koraput', x: 36, y: 116, place: 'Deomali Peak', summary: 'Odishaâ€™s highest peak rises above coffee country and rolling green hills.', image: '/tourism/koraput-hills.webp', food: 'Koraput coffee & manda', foodImage: '/tourism/pakhala.webp', temperature: 25, sky: 'Cool and clear', path: 'M93 287 L111 278 L128 287 L145 301 L141 321 L124 333 L105 326 L91 312 Z' },
  { name: 'Malkangiri', x: 17, y: 117, place: 'Bonda Hills', summary: 'A remarkable highland landscape in Odishaâ€™s far south-west.', image: '/tourism/koraput-hills.webp', food: 'Local bamboo shoot dishes', foodImage: '/tourism/dalma.webp', temperature: 28, sky: 'Cloudy intervals', path: 'M42 281 L60 273 L76 284 L86 300 L78 317 L61 324 L46 316 L34 301 Z' },
];

const districtBlocks = districts.slice(0, 29);

const featured: Record<string, { place: string; summary: string; image: string; food: string; foodImage: string; temperature: number; sky: string }> = {
  Sundargarh: { place: 'Khandadhar Falls', summary: 'A dramatic cascade framed by the forests and hills of north-west Odisha.', image: '/tourism/koraput-hills.webp', food: 'Rugda curry', foodImage: '/tourism/dalma.webp', temperature: 29, sky: 'Partly cloudy' },
  Mayurbhanj: { place: 'Similipal National Park', summary: 'Waterfalls, sal forests and rich wildlife in Odishaâ€™s green north.', image: '/tourism/similipal.webp', food: 'Mudhi mansa', foodImage: '/tourism/dalma.webp', temperature: 30, sky: 'Clear skies' },
  Khordha: { place: 'Lingaraj Temple', summary: 'Bhubaneswarâ€™s ancient temples, lively lanes and celebrated local cuisine.', image: '/tourism/konark-hero.webp', food: 'Dahi bara aloo dum', foodImage: '/tourism/pakhala.webp', temperature: 33, sky: 'Clear skies' },
  Puri: { place: 'Jagannath Temple & Beach', summary: 'A beloved pilgrimage town where temple traditions meet the Bay of Bengal.', image: '/tourism/puri.webp', food: 'Mahaprasad', foodImage: '/tourism/dalma.webp', temperature: 31, sky: 'Sea breeze' },
  Ganjam: { place: 'Tara Tarini Temple', summary: 'Hilltop views, coastal towns and the warm flavours of southern Odisha.', image: '/tourism/koraput-hills.webp', food: 'Gopalpur seafood', foodImage: '/tourism/dalma.webp', temperature: 30, sky: 'Breezy' },
};

const cuisineTab = explorerTabs.find((tab) => tab.id === 'cuisine');
const foodGuideUrl = cuisineTab?.officialUrl ?? 'https://apps.odishatourism.gov.in/the-taste-of-odisha';

export default function DistrictExplorer() {
  const [selected, setSelected] = useState(districtBlocks[0].name);
  const carouselRef = useRef<HTMLDivElement>(null);
  const district = useMemo(() => districts.find((item) => item.name === selected) ?? districts[0], [selected]);
  const details = featured[selected] ?? district;

  return (
    <>
    <section id="district-guide" className="relative isolate overflow-hidden bg-[#19231F] px-4 py-14 text-white sm:px-6 lg:px-10 lg:py-20">
      <Image src="/tourism/koraput-hills.webp" alt="" fill sizes="100vw" className="-z-20 object-cover opacity-25" aria-hidden="true" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#171A17]/95 via-[#1E241E]/90 to-[#342012]/90" aria-hidden="true" />
      <div className="mx-auto max-w-[90rem]">
        <div className="mb-8 max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#F5A623]">Explore by district</p>
          <h2 className="mt-2 font-serif text-4xl font-normal sm:text-5xl">Navigate Odisha</h2>
          <div className="mt-4 h-1 w-14 rounded-full bg-[#F58A0A]" />
          <p className="mt-3 text-sm text-white/75">Choose a district to discover its highlights, local flavours and weather.</p>
        </div>

        <div className="grid items-center gap-8 lg:grid-cols-[minmax(360px,0.92fr)_minmax(420px,1.08fr)] xl:gap-12">
          <article className="overflow-hidden rounded-[1.6rem] border border-white/15 bg-[#171614]/80 shadow-2xl backdrop-blur-md">
            <div className="flex items-start justify-between gap-4 p-5 sm:p-7">
              <div>
                <p className="flex items-center gap-2 text-2xl font-bold sm:text-3xl"><MapPin className="h-6 w-6 fill-[#F58A0A] text-[#F58A0A]" />{district.name}</p>
                <p className="mt-1 pl-8 text-xs uppercase tracking-[0.14em] text-white/50">Odisha, India</p>
              </div>
              <div className="flex shrink-0 items-center gap-2 text-right">
                <CloudSun className="h-6 w-6 text-[#F5A623]" />
                <div><p className="text-2xl font-semibold leading-none">{details.temperature}Â°</p><p className="mt-1 text-[11px] text-white/65">{details.sky}</p></div>
              </div>
            </div>
            <p className="px-5 text-sm leading-6 text-white/70 sm:px-7">{details.summary}</p>
            <div className="flex gap-3 overflow-x-auto p-5 sm:gap-4 sm:p-7">
              <div className="group relative h-[250px] min-w-[78%] flex-1 overflow-hidden rounded-3xl text-left sm:h-[290px] sm:min-w-0">
                <Image src={details.image} alt={details.place} fill sizes="(max-width: 639px) 78vw, 40vw" className="object-cover transition duration-500 group-hover:scale-105" />
                <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/10" />
                <span className="absolute left-4 top-4 rounded-full bg-black/35 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider backdrop-blur">Must-see place</span>
                <span className="absolute bottom-4 left-4 right-4 font-semibold leading-snug">{details.place}</span>
              </div>
              <div className="group relative h-[250px] min-w-[78%] flex-1 overflow-hidden rounded-3xl text-left sm:h-[290px] sm:min-w-0">
                <Image src={details.foodImage} alt={details.food} fill sizes="(max-width: 639px) 78vw, 40vw" className="object-cover transition duration-500 group-hover:scale-105" />
                <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/10" />
                <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-black/35 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider backdrop-blur"><UtensilsCrossed className="h-3 w-3" />Taste of the district</span>
                <span className="absolute bottom-4 left-4 right-4 font-semibold leading-snug">{details.food}</span>
              </div>
            </div>
            <a href={foodGuideUrl} target="_blank" rel="noopener noreferrer" className="mx-5 mb-5 inline-flex items-center gap-2 text-xs font-semibold text-[#FFC36C] hover:text-white sm:mx-7 sm:mb-7">Explore Odisha Tourism <ArrowUpRight className="h-4 w-4" /></a>
          </article>

          <div className="w-full">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-white/90">Choose a district</h3>
              <span className="text-xs text-white/55">{districtBlocks.length} districts</span>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 xl:grid-cols-5" role="group" aria-label="Choose an Odisha district">
              {districtBlocks.map((item, index) => (
                <button
                  key={item.name}
                  type="button"
                  aria-pressed={selected === item.name}
                  onClick={() => setSelected(item.name)}
                  className={`group relative flex min-h-[68px] flex-col items-start justify-between overflow-hidden rounded-xl border p-3 text-left transition duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFC170] ${
                    selected === item.name
                      ? 'border-[#FFC170] bg-[#F58A0A] text-white shadow-lg shadow-orange-950/30'
                      : 'border-white/10 bg-[#272923]/90 text-white/80 hover:border-[#F5A623]/70 hover:bg-[#39372E] hover:text-white'
                  }`}
                >
                  <span className="text-[9px] font-bold uppercase tracking-[0.16em] opacity-55">{String(index + 1).padStart(2, '0')}</span>
                  <span className="text-xs font-semibold leading-tight sm:text-sm">{item.name}</span>
                  {selected === item.name && <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-white" aria-hidden="true" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
    <section id="district-highlights" className="relative isolate overflow-hidden bg-[#F5F6F3] px-4 py-12 text-[#303A3B] sm:px-6 lg:px-10 lg:py-16">
      <Image src="/tourism/koraput-hills.webp" alt="" fill sizes="100vw" className="-z-20 object-cover opacity-[0.14]" aria-hidden="true" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white/85 via-[#F8F9F6]/85 to-white/90" aria-hidden="true" />
      <div className="mx-auto max-w-[90rem]">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#E97908]">A closer look at Odisha</p>
            <h2 className="mt-2 font-serif text-3xl font-normal sm:text-4xl">Find your next favourite place</h2>
            <p className="mt-2 text-sm text-[#697580]">Browse district highlights, then choose a district to see its details above.</p>
          </div>
          <div className="flex gap-2 self-end">
            <button type="button" aria-label="Previous district highlights" onClick={() => carouselRef.current?.scrollBy({ left: -380, behavior: 'smooth' })} className="grid h-10 w-10 place-items-center rounded-full border border-[#D9DFE0] bg-white text-[#35404A] shadow-sm transition hover:border-[#F58A0A] hover:bg-[#F58A0A] hover:text-white"><ChevronLeft className="h-5 w-5" /></button>
            <button type="button" aria-label="Next district highlights" onClick={() => carouselRef.current?.scrollBy({ left: 380, behavior: 'smooth' })} className="grid h-10 w-10 place-items-center rounded-full border border-[#D9DFE0] bg-white text-[#35404A] shadow-sm transition hover:border-[#F58A0A] hover:bg-[#F58A0A] hover:text-white"><ChevronRight className="h-5 w-5" /></button>
          </div>
        </div>
        <div ref={carouselRef} className="flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="group" aria-label="District highlight carousel">
          {districtBlocks.map((item, index) => (
            <button key={item.name} type="button" aria-pressed={selected === item.name} onClick={() => { setSelected(item.name); document.getElementById('district-guide')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }} className={`group relative isolate flex h-[330px] w-[78vw] max-w-[360px] shrink-0 snap-start flex-col justify-end overflow-hidden rounded-[1.35rem] border p-5 text-left text-white shadow-[0_14px_32px_rgba(28,42,42,0.12)] transition sm:h-[350px] sm:w-[40vw] lg:h-[370px] lg:w-[calc((100%-3rem)/4)] lg:max-w-none ${selected === item.name ? 'border-[#F58A0A] ring-2 ring-[#F58A0A]/50' : 'border-white/60 hover:border-[#F58A0A]/70'}`}>
              <Image src={item.image} alt="" fill sizes="(max-width: 639px) 78vw, (max-width: 1023px) 40vw, 24vw" className="-z-20 object-cover transition-transform duration-700 group-hover:scale-105" />
              <span className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/15 to-transparent" aria-hidden="true" />
              <span className="absolute left-4 top-4 rounded-full border border-white/50 bg-black/25 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] backdrop-blur-sm">District {String(index + 1).padStart(2, '0')}</span>
              <span className="font-serif text-xl font-bold leading-tight sm:text-2xl">{item.name}</span>
              <span className="mt-1.5 line-clamp-2 text-xs leading-5 text-white/85 sm:text-sm">{item.place}</span>
              <span className="mt-4 inline-flex min-h-9 w-fit items-center gap-2 rounded-full bg-[#F58A0A] px-4 text-xs font-bold text-white shadow-lg transition group-hover:bg-white group-hover:text-[#26362C]">Explore more <ArrowUpRight className="h-3.5 w-3.5" /></span>
            </button>
          ))}
        </div>
      </div>
    </section>
    </>
  );
}
