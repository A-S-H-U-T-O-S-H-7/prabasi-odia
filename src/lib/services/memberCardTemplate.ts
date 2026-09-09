import { cardText as text, wrapCardText } from './memberCardTypography';

export const CARD_WIDTH = 1000;
export const CARD_HEIGHT = 540;
export const CARD_DESIGN_VERSION = 'odisha-heritage-v9';
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
  logoUrl: string;
  odishaArtUrl: string;
  jagannathArtUrl?: string;
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
function label(value: string, x: number, y: number) { return text(value, x, y, 12, C.muted, 'bold'); }
function openSvg(title: string, bg: string, height = CARD_HEIGHT) {
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${CARD_WIDTH}" height="${height}" viewBox="0 0 ${CARD_WIDTH} ${height}" role="img"><title>${esc(title)}</title><defs><clipPath id="card-edge"><rect width="1000" height="${height}" rx="24"/></clipPath></defs><g clip-path="url(#card-edge)">${rect(0, 0, 1000, height, bg)}`;
}
const closeSvg = (height = CARD_HEIGHT) => `</g><rect x="0.5" y="0.5" width="999" height="${height - 1}" rx="24" fill="none" stroke="#C59B58" stroke-opacity="0.6"/></svg>`;

export function renderMemberCardFaces(data: MemberCardData): { front: string; back: string } {
  const nameLines = wrapCardText(data.name || 'Member', 510, 36, 'title');
  const nameSize = nameLines.length > 2 ? 27 : 36;
  const fittedName = wrapCardText(data.name || 'Member', 510, nameSize, 'title');
  const name = fittedName.length <= 2 ? fittedName : [fittedName[0], fittedName.slice(1).join(' ')];
  const locationLines = wrapCardText(data.location || 'Not provided', 680, 17);
  const residency = data.residencyStatus === 'NRI' ? 'NON-RESIDENT INDIAN' : data.residencyStatus === 'RI' ? 'RESIDENT INDIAN' : 'COMMUNITY MEMBER';
  const front = openSvg(`Prabasi Odia member card for ${data.name}`, C.ivory) + `
    <g opacity="0.15">${image(data.jagannathArtUrl || data.odishaArtUrl, 250, 15, 510, 510)}</g>
    ${border(0)}${border(518)}
    ${image(data.logoUrl, 340, 28, 300, 91)}
    ${text('MEMBERSHIP CARD', 759, 64, 12, C.maroon, 'bold')}
    ${text(residency, 759, 88, 10, C.muted, 'bold', 198)}
    ${line(48, 118, 952, C.pale)}
    ${rect(45, 145, 184, 186, C.maroon, 16)}
    ${rect(48, 148, 178, 180, '#FFFFFF', 13, C.gold)}
    ${data.photoURL ? image(data.photoURL, 56, 156, 162, 164) : `<circle cx="137" cy="210" r="30" fill="${C.pale}"/><path d="M78 302Q78 246 137 246Q196 246 196 302Z" fill="${C.pale}"/>`}
    ${rect(50, 346, 174, 30, data.isVerified ? '#E7EFE9' : '#EEE7DE', 15)}
    ${data.isVerified ? `<g fill="none" stroke="${C.green}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="70" cy="361" r="7"/><path d="M66.5 361L69 363.5L73.5 358.5"/></g>` : ''}
    ${text(data.isVerified ? 'VERIFIED MEMBER' : 'NOT YET VERIFIED', data.isVerified ? 84 : 68, 366, 10.5, data.isVerified ? C.green : C.muted, 'bold', 126)}
    ${label('MEMBER NAME', 262, 153)}
    ${name.map((part, i) => text(part, 260, 190 + i * 39, nameSize, C.ink, 'title', 510)).join('')}
    ${label('MEMBER ID', 262, 256)}
    ${text(data.memberId, 260, 284, 27, C.maroon, 'bold', 510)}
    ${rect(810, 151, 146, 174, '#FFFFFF', 12, C.pale)}
    ${image(data.qrDataUrl, 820, 161, 126, 126)}
    ${text('SCAN TO VERIFY', 829, 309, 10.5, C.maroon, 'bold')}
    ${line(260, 304, 766, C.pale)}
    ${label('MEMBER SINCE', 262, 326)}
    ${text(data.memberSince, 260, 352, 19, C.ink, 'body', 252)}
    ${label('BLOOD GROUP', 554, 326)}
    ${text(data.bloodGroup || 'Not provided', 552, 352, 22, C.maroon, 'bold', 180)}
    ${label('CURRENT LOCATION', 262, 386)}
    ${locationLines.slice(0, 2).map((part, i) => text(i === 1 ? locationLines.slice(1).join(' ') : part, 260, 410 + i * 22, 17, C.ink, 'body', 680)).join('')}
    ${line(48, 451, 952, C.pale)}
    ${image(data.svsLogoUrl, 49, 464, 42, 42)}
    ${text('ISSUED BY', 106, 475, 9, C.muted, 'bold')}
    ${text('Samudayik Vikas Samiti', 105, 497, 18, C.maroon, 'bold')}
    ${lotus(925, 484, 27, C.gold)}
  ` + closeSvg();

  const terms = [
    ['Personal membership', 'Valid only for the named member. This card is non-transferable.'],
    ['Community access', 'Present this card at community events and for member benefits.'],
    ['Keep your card safe', 'Report loss, theft or misuse to Samudayik Vikas Samiti.'],
    ['Respect our community', "Membership is subject to the community's code of conduct."],
  ];
  const community = wrapCardText(data.communityName || 'Prabasi Odia Community', 575, 18, 'bold');
  const back = openSvg('Prabasi Odia membership information and terms', C.maroon) + `
    ${border(0)}${border(518)}
    ${rect(24, 22, 256, 496, C.ivory)}
    ${image(data.jagannathArtUrl || data.odishaArtUrl, 38, 38, 228, 186)}
    ${text('Our roots.', 55, 268, 28, C.maroon, 'title', 196)}
    ${text('Our people.', 55, 308, 28, C.maroon, 'title', 196)}
    ${text('Our Odisha.', 55, 348, 28, C.maroon, 'title', 196)}
    ${text('ONE COMMUNITY', 55, 412, 11, C.muted, 'bold')}
    ${text('BEYOND BORDERS', 55, 433, 11, C.muted, 'bold')}
    ${text('Membership & care', 326, 66, 29, C.ivory, 'title')}
    ${text('YOUR COMMUNITY', 327, 103, 11, '#E1BE85', 'bold')}
    ${community.slice(0, 2).map((part, i) => text(i === 1 ? community.slice(1).join(' ') : part, 326, 129 + i * 22, 18, C.ivory, 'bold', 575)).join('')}
    ${line(326, 166, 946, '#825361')}
    ${terms.map(([title, detail], i) => {
      const y = 197 + i * 55;
      return text(`0${i + 1}`, 328, y, 13, '#E1BE85', 'bold') + text(title, 367, y, 16, C.ivory, 'bold') + text(detail, 367, y + 22, 12.5, '#E7D3D5', 'body', 574);
    }).join('')}
    ${line(326, 407, 946, '#825361')}
    ${text('Issued and maintained by', 328, 435, 10, '#D5B6BD')}
    ${text('Samudayik Vikas Samiti', 328, 459, 18, C.ivory, 'bold')}
    ${text(`ID  ${data.memberId}`, 328, 488, 11, '#E1BE85', 'body', 440)}
    ${rect(886, 433, 58, 58, C.ivory, 10)}${image(data.svsLogoUrl, 893, 440, 44, 44)}
  ` + closeSvg();
  return { front, back };
}
