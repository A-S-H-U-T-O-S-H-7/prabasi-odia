import { cardText as text, wrapCardText } from './memberCardTypography';

export const CARD_WIDTH = 1000;
export const CARD_HEIGHT = 630;
export const CARD_DESIGN_VERSION = 'odisha-heritage-v1';
export interface MemberCardData {
  name: string;
  memberId: string;
  memberSince: string;
  bloodGroup: string;
  location: string;
  communityName?: string;
  residencyStatus?: 'RI' | 'NRI';
  isVerified: boolean;
  photoURL: string;
  qrDataUrl: string;
  logoIconUrl: string;
  svsLogoUrl: string;
}
const C = { ivory: '#FFF9EF', ink: '#452330', maroon: '#582636', gold: '#C59B58', muted: '#826F6D', pale: '#E7D6BC', green: '#346353' };
const esc = (value: string) => String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const rect = (x: number, y: number, w: number, h: number, color: string, radius = 0, stroke = 'none') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${radius}" fill="${color}" stroke="${stroke}"/>`;
const image = (url: string, x: number, y: number, w: number, h: number) => `<image href="${esc(url)}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid meet"/>`;
const line = (x: number, y: number, end: number, color: string) => `<path d="M${x} ${y}H${end}" stroke="${color}" fill="none"/>`;
function lotus(cx: number, cy: number, size: number, color: string) {
  return `<g transform="translate(${cx},${cy}) scale(${size / 40})" fill="none" stroke="${color}" stroke-width="1.6"><path d="M0 14C-14 2-10-12 0-23C10-12 14 2 0 14Z"/><path d="M0 14C-21 14-28-1-25-14C-9-12-2-3 0 14ZM0 14C21 14 28-1 25-14C9-12 2-3 0 14Z"/><path d="M-29 17Q0 30 29 17M-23 24Q0 33 23 24"/></g>`;
}
function border(y: number) {
  return `<g>${rect(0, y, 1000, 22, C.maroon)}${line(0, y + 2, 1000, C.gold)}${line(0, y + 20, 1000, C.gold)}${Array.from({ length: 40 }, (_, i) => `<g transform="translate(${i * 26 + 5},${y + 11})"><path d="M0 0Q6-9 12 0Q6 9 0 0ZM12 0L18-4L24 0L18 4Z" fill="none" stroke="${C.gold}" stroke-width="1"/></g>`).join('')}</g>`;
}
function waves(color: string, opacity: number, offset = 0) {
  return `<g opacity="${opacity}" fill="none" stroke="${color}" stroke-width="1.3">${Array.from({ length: 8 }, (_, i) => `<path d="M${520 + offset} ${444 + i * 12}C680 ${368 + i * 13} 770 ${550 + i * 3} 1040 ${410 + i * 12}"/>`).join('')}</g>`;
}
function label(value: string, x: number, y: number) { return text(value, x, y, 12, C.muted, 'bold'); }
function openSvg(title: string, bg: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${CARD_WIDTH}" height="${CARD_HEIGHT}" viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}" role="img"><title>${esc(title)}</title><defs><clipPath id="card-edge"><rect width="1000" height="630" rx="24"/></clipPath></defs><g clip-path="url(#card-edge)">${rect(0, 0, 1000, 630, bg)}`;
}
const closeSvg = '</g><rect x="0.5" y="0.5" width="999" height="629" rx="24" fill="none" stroke="#C59B58" stroke-opacity="0.6"/></svg>';

export function renderMemberCardFaces(data: MemberCardData): { front: string; back: string } {
  const nameLines = wrapCardText(data.name || 'Member', 510, 36, 'title');
  const nameSize = nameLines.length > 2 ? 27 : 36;
  const fittedName = wrapCardText(data.name || 'Member', 510, nameSize, 'title');
  const name = fittedName.length <= 2 ? fittedName : [fittedName[0], fittedName.slice(1).join(' ')];
  const locationLines = wrapCardText(data.location || 'Not provided', 680, 17);
  const residency = data.residencyStatus === 'NRI' ? 'NON-RESIDENT INDIAN' : data.residencyStatus === 'RI' ? 'RESIDENT INDIAN' : 'COMMUNITY MEMBER';
  const front = openSvg(`Prabasi Odia member card for ${data.name}`, C.ivory) + `
    ${border(0)}${border(608)}
    ${image(data.logoIconUrl, 48, 48, 60, 60)}
    ${text('Prabasi Odia', 124, 79, 32, C.maroon, 'title')}
    ${text('ROOTED IN ODISHA. CONNECTED EVERYWHERE.', 126, 103, 10.5, C.muted, 'bold')}
    ${text('MEMBERSHIP CARD', 759, 66, 12, C.maroon, 'bold')}
    ${text(residency, 759, 90, 10, C.muted, 'bold', 198)}
    ${line(48, 132, 952, C.pale)}
    ${rect(48, 166, 178, 230, '#FFFFFF', 14, C.pale)}
    ${data.photoURL ? image(data.photoURL, 56, 174, 162, 214) : `<circle cx="137" cy="253" r="30" fill="${C.pale}"/><path d="M78 353Q78 292 137 292Q196 292 196 353Z" fill="${C.pale}"/>`}
    ${rect(65, 413, 144, 30, data.isVerified ? '#E7EFE9' : '#EEE7DE', 15)}
    ${text(data.isVerified ? 'VERIFIED MEMBER' : 'NOT YET VERIFIED', 79, 433, 10.5, data.isVerified ? C.green : C.muted, 'bold', 121)}
    ${label('MEMBER NAME', 262, 177)}
    ${name.map((part, i) => text(part, 260, 217 + i * 43, nameSize, C.ink, 'title', 510)).join('')}
    ${label('MEMBER ID', 262, 289)}
    ${text(data.memberId, 260, 319, 27, C.maroon, 'bold', 510)}
    ${rect(810, 180, 146, 174, '#FFFFFF', 12, C.pale)}
    ${image(data.qrDataUrl, 820, 190, 126, 126)}
    ${text('SCAN TO VERIFY', 829, 338, 10.5, C.maroon, 'bold')}
    ${line(260, 343, 766, C.pale)}
    ${label('MEMBER SINCE', 262, 367)}
    ${text(data.memberSince, 260, 394, 19, C.ink, 'body', 252)}
    ${label('BLOOD GROUP', 554, 367)}
    ${text(data.bloodGroup || 'Not provided', 552, 394, 22, C.maroon, 'bold', 180)}
    ${waves(C.gold, 0.16)}
    ${label('CURRENT LOCATION', 262, 436)}
    ${locationLines.slice(0, 2).map((part, i) => text(i === 1 ? locationLines.slice(1).join(' ') : part, 260, 461 + i * 24, 17, C.ink, 'body', 680)).join('')}
    ${line(48, 515, 952, C.pale)}
    ${image(data.svsLogoUrl, 49, 539, 42, 42)}
    ${text('ISSUED BY', 106, 547, 9, C.muted, 'bold')}
    ${text('Samudayik Vikas Samiti', 105, 570, 18, C.maroon, 'bold')}
    ${lotus(925, 558, 27, C.gold)}
    ${text('A shared heritage. A worldwide family.', 570, 568, 13, C.muted, 'body', 309)}
  ` + closeSvg;

  const terms = [
    ['Personal membership', 'Valid only for the named member. This card is non-transferable.'],
    ['Community access', 'Present this card at community events and for member benefits.'],
    ['Keep your card safe', 'Report loss, theft or misuse to Samudayik Vikas Samiti.'],
    ['Respect our community', "Membership is subject to the community's code of conduct."],
  ];
  const community = wrapCardText(data.communityName || 'Prabasi Odia Community', 575, 18, 'bold');
  const back = openSvg('Prabasi Odia membership information and terms', C.maroon) + `
    ${border(0)}${border(608)}
    ${rect(24, 22, 256, 586, '#642E3D')}
    <g opacity="0.55">${lotus(152, 154, 103, C.gold)}${lotus(152, 154, 66, C.gold)}</g>
    ${text('Our roots.', 55, 291, 28, C.ivory, 'title', 196)}
    ${text('Our people.', 55, 331, 28, C.ivory, 'title', 196)}
    ${text('Our Odisha.', 55, 371, 28, C.ivory, 'title', 196)}
    ${text('ONE COMMUNITY', 55, 432, 11, '#E1BE85', 'bold')}
    ${text('BEYOND BORDERS', 55, 453, 11, '#E1BE85', 'bold')}
    ${waves('#E1BE85', 0.18, -660)}
    ${text('Membership & care', 326, 81, 29, C.ivory, 'title')}
    ${text('YOUR COMMUNITY', 327, 122, 11, '#E1BE85', 'bold')}
    ${community.slice(0, 2).map((part, i) => text(i === 1 ? community.slice(1).join(' ') : part, 326, 151 + i * 24, 18, C.ivory, 'bold', 575)).join('')}
    ${line(326, 194, 946, '#825361')}
    ${terms.map(([title, detail], i) => {
      const y = 231 + i * 64;
      return text(`0${i + 1}`, 328, y, 13, '#E1BE85', 'bold') + text(title, 367, y, 16, C.ivory, 'bold') + text(detail, 367, y + 24, 12.5, '#E7D3D5', 'body', 574);
    }).join('')}
    ${line(326, 489, 946, '#825361')}
    ${text('Issued and maintained by', 328, 521, 10, '#D5B6BD')}
    ${text('Samudayik Vikas Samiti', 328, 545, 18, C.ivory, 'bold')}
    ${text(`ID  ${data.memberId}`, 328, 574, 11, '#E1BE85', 'body', 440)}
    ${rect(886, 517, 58, 58, C.ivory, 10)}${image(data.svsLogoUrl, 893, 524, 44, 44)}
  ` + closeSvg;
  return { front, back };
}
