interface MemberCardData {
  name: string;
  memberId: string;
  memberSince: string;
  bloodGroup: string;
  location: string;
  communityName?: string;
  isVerified: boolean;
  photoURL: string;
  qrDataUrl: string;
  bgImageUrl: string;
  logoIconUrl: string;
  svsLogoUrl: string;
}

const TERMS = [
  "This card certifies active membership in the Prabasi Odia community network, issued and maintained by Samudayik Vikas Samiti.",
  "Valid only for the named cardholder. It is non-transferable and must not be shared or lent to another person.",
  "Present this card to verify identity at community meetups, cultural events, and while claiming member-only benefits.",
  "If this card is lost, stolen, or misused, report it to Samudayik Vikas Samiti immediately for it to be blocked.",
  "Membership is subject to the community's code of conduct and may be revoked for violation of its terms.",
];

const ICON = {
  idCard: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C1440E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="6" y1="10" x2="6" y2="14"/><line x1="10" y1="9" x2="16" y2="9"/><line x1="10" y1="13" x2="14" y2="13"/></svg>`,
  droplet: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C1440E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2s6 7.2 6 11.5A6 6 0 0 1 6 13.5C6 9.2 12 2 12 2z"/></svg>`,
  mapPin: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C1440E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
  calendar: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C1440E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  users: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C1440E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  checkCircle: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#047857" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/></svg>`,
  scrollText: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E8A33D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21h9a2 2 0 0 0 2-2V4H8a2 2 0 0 0-2 2v13a2 2 0 0 1-2 2 2 2 0 0 1-2-2V8h4"/><line x1="12" y1="9" x2="16" y2="9"/><line x1="12" y1="13" x2="16" y2="13"/></svg>`,
  shieldCheck: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E8A33D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z"/><path d="M9 12l2 2 4-4"/></svg>`,
};

function infoRow(icon: string, label: string, value: string, extraClass = "") {
  return `
    <tr>
      <td class="icon-cell">${icon}</td>
      <td class="label-cell">${escapeHtml(label)}</td>
      <td class="dash-cell">—</td>
      <td class="value-cell ${extraClass}">${escapeHtml(value)}</td>
    </tr>
  `;
}

export function renderMemberCardHTML(data: MemberCardData): string {
  const verifiedBadge = data.isVerified
    ? `<span class="badge verified">${ICON.checkCircle}<span>Verified</span></span>`
    : `<span class="badge unverified">Unverified</span>`;

  const photo = data.photoURL
    ? `<img src="${data.photoURL}" alt="" />`
    : `<span class="placeholder">👤</span>`;

  const communityRow = data.communityName
    ? infoRow(ICON.users, "Community", data.communityName)
    : "";

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
  @page { margin: 0; size: 900px 500px; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 900px; background: #fff; }
  body { font-family: Georgia, "Times New Roman", serif; color: #2A1636; }
  img { display: block; max-width: 100%; }

  .card {
    width: 900px;
    height: 500px;
    position: relative;
    overflow: hidden;
    border-radius: 28px;
    page-break-after: always;
    break-after: page;
  }
  .card:last-child { page-break-after: auto; break-after: auto; }

  .front { background: #F7F1E3; border: 2px solid #4A1942; }
  .bg-map {
    position: absolute; inset: 0;
    width: 100%; height: 100%;
    object-fit: contain;
    object-position: center right;
    transform: scale(1.08);
    filter: blur(0.6px);
    opacity: 0.55;
  }
  .bg-fade {
    position: absolute; inset: 0;
    background: linear-gradient(90deg, #F7F1E3 0%, rgba(247,241,227,0.92) 42%, rgba(247,241,227,0.35) 72%, rgba(247,241,227,0.08) 100%);
  }

  .wordmark {
    position: absolute; top: 18px; left: 50%; transform: translateX(-50%);
    display: flex; align-items: center; gap: 12px;
    background: rgba(255,255,255,0.96);
    border: 1px solid rgba(74,25,66,0.08);
    border-radius: 999px;
    padding: 8px 22px 8px 10px;
    box-shadow: 0 6px 18px rgba(42,22,54,0.12);
    z-index: 5;
  }
  .wordmark .icon { width: 36px; height: 36px; border-radius: 50%; overflow: hidden; background: #fff; }
  .wordmark .icon img { width: 36px; height: 36px; object-fit: contain; }
  .wordmark span { font-size: 20px; font-weight: 700; letter-spacing: 0.04em; color: #4A1942; }

  .qr-box {
    position: absolute; right: 28px; top: 50%; transform: translateY(-50%);
    background: #fff;
    border-radius: 16px;
    padding: 8px;
    box-shadow: 0 8px 20px rgba(42,22,54,0.16);
    border: 1px solid #fff;
    z-index: 5;
  }
  .qr-box img { width: 118px; height: 118px; border-radius: 8px; }
  .qr-caption {
    text-align: center;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 9px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #4A1942;
    margin-top: 6px;
    font-weight: 700;
  }

  .issuer {
    position: absolute; right: 22px; bottom: 16px;
    display: flex; align-items: center; gap: 10px; z-index: 5;
  }
  .issuer .icon {
    width: 40px; height: 40px; border-radius: 50%; background: #fff;
    border: 2px solid #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.18); overflow: hidden;
  }
  .issuer .icon img { width: 40px; height: 40px; object-fit: contain; padding: 4px; }
  .issuer .label { font-family: Arial, Helvetica, sans-serif; font-size: 9px; text-transform: uppercase; letter-spacing: 0.08em; color: #C1440E; font-weight: 700; }
  .issuer .name { font-family: Arial, Helvetica, sans-serif; font-size: 11px; text-transform: uppercase; color: #4A1942; font-weight: 800; }

  .content {
    position: absolute;
    left: 28px; top: 86px; bottom: 28px;
    width: 560px;
    z-index: 4;
    display: flex;
    align-items: center;
    gap: 22px;
  }

  .photo-col { width: 128px; flex-shrink: 0; text-align: center; }
  .photo {
    width: 128px; height: 128px; border-radius: 18px;
    border: 4px solid #fff; background: #EFE7DC; overflow: hidden;
    box-shadow: 0 8px 18px rgba(42,22,54,0.18);
  }
  .photo img { width: 128px; height: 128px; object-fit: cover; }
  .photo .placeholder { width: 128px; height: 128px; display: flex; align-items: center; justify-content: center; font-size: 52px; opacity: 0.35; }

  .badge {
    margin-top: 10px;
    display: inline-flex; align-items: center; justify-content: center; gap: 5px;
    padding: 4px 12px; border-radius: 999px;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 11px; font-weight: 700; border: 1px solid;
  }
  .badge.verified { background: #ECFDF5; border-color: #6EE7B7; color: #047857; }
  .badge.unverified { background: #fff; border-color: #DDD0BC; color: #7A6A5E; }

  .details { flex: 1; min-width: 0; }
  .details h2 {
    font-size: 30px; font-weight: 700; color: #4A1942;
    line-height: 1.15; letter-spacing: -0.02em;
    margin-bottom: 12px;
    text-shadow: 0 1px 0 rgba(255,255,255,0.85);
    word-break: break-word;
  }

  .info { border-collapse: collapse; width: 100%; }
  .info td { vertical-align: middle; padding: 5px 0; font-family: Arial, Helvetica, sans-serif; }
  .icon-cell { width: 22px; }
  .label-cell { width: 108px; font-size: 13px; color: #6B5E5A; white-space: nowrap; }
  .dash-cell { width: 16px; color: #6B5E5A; font-size: 13px; }
  .value-cell { font-size: 14px; font-weight: 700; color: #2A1636; }
  .value-cell.blood { color: #DC2626; }
  .value-cell.pending { color: #C1440E; }

  .back {
    background: linear-gradient(135deg, #4A1942 0%, #3A1333 100%);
    color: #fff;
    border: 2px solid #E8A33D;
  }
  .back-glow {
    position: absolute; inset: 0;
    background: radial-gradient(120% 140% at 100% 0%, rgba(232,163,61,0.2) 0%, rgba(74,25,66,0) 55%);
  }
  .terms-title {
    position: absolute; top: 18px; left: 50%; transform: translateX(-50%);
    background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.22);
    border-radius: 999px; padding: 8px 18px 8px 12px;
    display: flex; align-items: center; gap: 8px;
    font-size: 16px; font-weight: 700; z-index: 2;
  }
  .terms-list {
    position: absolute; left: 36px; right: 36px; top: 72px; bottom: 58px;
    list-style: none; display: flex; flex-direction: column; justify-content: center; gap: 12px;
  }
  .terms-list li {
    display: flex; align-items: flex-start; gap: 10px;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 14px; line-height: 1.45; color: rgba(255,255,255,0.92);
  }
  .terms-list li svg { flex-shrink: 0; margin-top: 2px; }
  .back-footer {
    position: absolute; left: 28px; right: 22px; bottom: 16px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .back-footer .idtag { font-family: Consolas, "Courier New", monospace; font-size: 12px; color: rgba(255,255,255,0.7); }
  .issuer-mini { display: flex; align-items: center; gap: 8px; }
  .issuer-mini .icon { width: 30px; height: 30px; border-radius: 50%; background: #fff; overflow: hidden; }
  .issuer-mini .icon img { width: 30px; height: 30px; object-fit: contain; padding: 3px; }
  .issuer-mini .name { font-family: Arial, Helvetica, sans-serif; font-size: 10px; font-weight: 700; text-transform: uppercase; color: rgba(255,255,255,0.85); }
</style>
</head>
<body>
  <div class="card front">
    <img class="bg-map" src="${data.bgImageUrl}" alt="" />
    <div class="bg-fade"></div>

    <div class="wordmark">
      <div class="icon"><img src="${data.logoIconUrl}" alt="" /></div>
      <span>Prabasi Odia</span>
    </div>

    <div class="qr-box">
      <img src="${data.qrDataUrl}" alt="" />
      <div class="qr-caption">Scan to verify</div>
    </div>

    <div class="issuer">
      <div class="icon"><img src="${data.svsLogoUrl}" alt="" /></div>
      <div>
        <div class="label">Issued by</div>
        <div class="name">Samudayik Vikas Samiti</div>
      </div>
    </div>

    <div class="content">
      <div class="photo-col">
        <div class="photo">${photo}</div>
        ${verifiedBadge}
      </div>
      <div class="details">
        <h2>${escapeHtml(data.name)}</h2>
        <table class="info">
          ${infoRow(ICON.idCard, "Member ID", data.memberId, data.memberId === "Pending" ? "pending" : "")}
          ${infoRow(ICON.droplet, "Blood Group", data.bloodGroup || "—", "blood")}
          ${infoRow(ICON.mapPin, "Location", data.location || "Not set")}
          ${infoRow(ICON.calendar, "Joined", data.memberSince || "Recently")}
          ${communityRow}
        </table>
      </div>
    </div>
  </div>

  <div class="card back">
    <div class="back-glow"></div>
    <div class="terms-title">${ICON.scrollText}<span>Terms &amp; Use</span></div>
    <ul class="terms-list">
      ${TERMS.map((term) => `<li>${ICON.shieldCheck}<span>${escapeHtml(term)}</span></li>`).join("")}
    </ul>
    <div class="back-footer">
      <span class="idtag">ID: ${escapeHtml(data.memberId)}</span>
      <div class="issuer-mini">
        <div class="icon"><img src="${data.svsLogoUrl}" alt="" /></div>
        <span class="name">Samudayik Vikas Samiti</span>
      </div>
    </div>
  </div>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
