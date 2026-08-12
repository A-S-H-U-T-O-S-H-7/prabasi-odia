interface MemberCardData {
  name: string;
  memberId: string;
  memberSince: string;
  bloodGroup: string;
  location: string;
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

// Simple inline icon set (matches the meaning of the Lucide icons used in the React component)
const ICON = {
  idCard: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="6" y1="10" x2="6" y2="14"/><line x1="10" y1="9" x2="16" y2="9"/><line x1="10" y1="13" x2="14" y2="13"/></svg>`,
  droplet: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2s6 7.2 6 11.5A6 6 0 0 1 6 13.5C6 9.2 12 2 12 2z"/></svg>`,
  mapPin: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
  calendar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  checkCircle: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/></svg>`,
  scrollText: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21h9a2 2 0 0 0 2-2V4H8a2 2 0 0 0-2 2v13a2 2 0 0 1-2 2 2 2 0 0 1-2-2V8h4"/><line x1="12" y1="9" x2="16" y2="9"/><line x1="12" y1="13" x2="16" y2="13"/></svg>`,
  shieldCheck: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z"/><path d="M9 12l2 2 4-4"/></svg>`,
};

export function renderMemberCardHTML(data: MemberCardData): string {
  const verifiedBadge = data.isVerified
    ? `<span class="badge verified">${ICON.checkCircle}<span>Verified</span></span>`
    : `<span class="badge unverified">Unverified</span>`;

  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
  @page { margin: 0; size: 900px 500px; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Georgia', 'Times New Roman', serif; }
  svg { display: block; width: 100%; height: 100%; }

  .card {
    width: 860px; height: 460px;
    border-radius: 24px; overflow: hidden;
    position: relative;
    page-break-after: always;
  }
  .front { background: #F7F1E3; border: 1px solid #4A1942; }
  .front::before {
    content: "";
    position: absolute; inset: 0;
    background: url('${data.bgImageUrl}') center/cover no-repeat;
    filter: blur(1px);
    opacity: 0.6;
  }
  .front::after {
    content: "";
    position: absolute; inset: 0;
    background: linear-gradient(to right, #F7F1E3 0%, rgba(247,241,227,0.75) 55%, transparent 100%);
  }

  /* Wordmark */
  .wordmark {
    position: absolute; top: 14px; left: 50%; transform: translateX(-50%);
    display: flex; align-items: center; gap: 12px;
    background: rgba(255,255,255,0.95);
    border-radius: 999px; padding: 8px 20px 8px 12px;
    box-shadow: 0 4px 14px rgba(0,0,0,0.15);
    z-index: 20;
  }
  .wordmark .icon { width: 32px; height: 32px; flex-shrink: 0; border-radius: 50%; background: #fff; overflow: hidden; }
  .wordmark .icon img { width: 100%; height: 100%; object-fit: contain; }
  .wordmark span { font-size: 18px; font-weight: 700; letter-spacing: 0.02em; color: #4A1942; }

  /* QR */
  .qr-box {
    position: absolute; right: 24px; top: 50%; transform: translateY(-50%);
    background: #fff; border-radius: 12px; padding: 4px;
    box-shadow: 0 4px 14px rgba(0,0,0,0.15);
    border: 1px solid rgba(255,255,255,0.8);
    z-index: 20;
  }
  .qr-box img { width: 96px; height: 96px; display: block; border-radius: 8px; }

  /* Issuer (front) */
  .issuer {
    position: absolute; bottom: 12px; right: 14px; z-index: 20;
    display: flex; align-items: center; gap: 8px;
  }
  .issuer .icon {
    width: 36px; height: 36px; border-radius: 50%; background: #fff;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2); border: 2px solid rgba(255,255,255,0.7);
    padding: 4px; flex-shrink: 0;
  }
  .issuer .icon img { width: 100%; height: 100%; object-fit: contain; }
  .issuer .label { font-size: 8px; text-transform: uppercase; letter-spacing: 0.05em; color: #C1440E; font-weight: 600; text-shadow: 0 0 4px rgba(255,255,255,0.9); }
  .issuer .name { font-size: 10px; text-transform: uppercase; color: #4A1942; font-weight: 700; text-shadow: 0 0 4px rgba(255,255,255,0.9); }

  /* Main content band */
  .content {
    position: absolute; left: 16px; top: 72px; bottom: 52px; width: 50%; z-index: 10;
    display: flex; align-items: center; gap: 16px;
  }

  .photo-col { flex-shrink: 0; display: flex; flex-direction: column; align-items: center; }
  .photo {
    width: 96px; height: 96px; border-radius: 12px;
    border: 3px solid #fff; background: #EFE7DC; overflow: hidden;
    box-shadow: 0 4px 14px rgba(0,0,0,0.2);
    display: flex; align-items: center; justify-content: center;
  }
  .photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .photo .placeholder { font-size: 36px; opacity: 0.35; }

  .badge {
    margin-top: 8px;
    display: inline-flex; align-items: center; gap: 4px;
    padding: 3px 10px; border-radius: 999px;
    font-size: 10px; font-weight: 600; border: 1px solid;
  }
  .badge .icon { width: 12px; height: 12px; }
  .badge.verified { background: #ECFDF5; border-color: #6EE7B7; color: #047857; }
  .badge.unverified { background: rgba(255,255,255,0.85); border-color: #DDD0BC; color: #7A6A5E; text-shadow: 0 0 2px #fff, 0 0 4px #fff; }

  .details { flex: 1; min-width: 0; }
  .details h2 {
    font-size: 24px; font-weight: 700; color: #4A1942; margin-bottom: 8px;
    line-height: 1.15; letter-spacing: -0.01em;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    text-shadow: 0 0 4px rgba(255,255,255,0.9), 0 1px 3px rgba(255,255,255,0.8);
  }
  .rows { display: flex; flex-direction: column; gap: 6px; }
  .row { display: flex; align-items: center; gap: 6px; height: 20px; }
  .row .icon { width: 14px; height: 14px; flex-shrink: 0; color: #C1440E; }
  .row .label { font-size: 12px; color: #2A1636; opacity: 0.7; white-space: nowrap; text-shadow: 0 0 2px #fff, 0 0 4px #fff; }
  .row .dash { font-size: 12px; color: #2A1636; opacity: 0.7; }
  .row .value {
    font-size: 12px; font-weight: 600; color: #2A1636;
    text-shadow: 0 0 4px rgba(255,255,255,0.9), 0 1px 3px rgba(255,255,255,0.8);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 130px;
  }
  .row .value.blood { color: #DC2626; }
  .row .value.pending { color: #C1440E; }

  /* BACK */
  .back { background: linear-gradient(135deg, #4A1942 0%, #3A1333 100%); color: #fff; }
  .back::before {
    content: "";
    position: absolute; inset: 0;
    background: radial-gradient(120% 140% at 100% 0%, rgba(232,163,61,0.18) 0%, rgba(74,25,66,0) 55%);
  }

  .terms-title {
    position: absolute; top: 14px; left: 50%; transform: translateX(-50%);
    background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);
    border-radius: 999px; padding: 6px 16px 6px 8px;
    display: flex; align-items: center; gap: 8px;
    font-size: 14px; font-weight: 700; color: #fff; z-index: 20;
  }
  .terms-title .icon { width: 16px; height: 16px; color: #E8A33D; }

  .terms-list { position: absolute; left: 24px; right: 24px; top: 54px; bottom: 44px; z-index: 10;
    display: flex; flex-direction: column; justify-content: center; gap: 6px; list-style: none; }
  .terms-list li { display: flex; align-items: flex-start; gap: 8px; font-size: 12px; line-height: 1.4; color: rgba(255,255,255,0.9); }
  .terms-list li .icon { width: 12px; height: 12px; flex-shrink: 0; margin-top: 2px; color: #E8A33D; }

  .back-footer {
    position: absolute; bottom: 12px; left: 16px; right: 14px; z-index: 20;
    display: flex; align-items: center; justify-content: space-between;
  }
  .back-footer .idtag { font-size: 9px; font-family: monospace; color: rgba(255,255,255,0.6); }
  .back-footer .issuer-mini { display: flex; align-items: center; gap: 8px; }
  .back-footer .issuer-mini .icon { width: 28px; height: 28px; border-radius: 50%; background: #fff; padding: 2px; box-shadow: none; border: 2px solid rgba(255,255,255,0.4); }
  .back-footer .issuer-mini .name { font-size: 8.5px; font-weight: 600; text-transform: uppercase; color: rgba(255,255,255,0.8); }
</style>
</head>
<body>

  <div class="card front">
    <div class="wordmark">
      <div class="icon"><img src="${data.logoIconUrl}" /></div>
      <span>Prabasi Odia</span>
    </div>

    <div class="qr-box"><img src="${data.qrDataUrl}" /></div>

    <div class="issuer">
      <div class="icon"><img src="${data.svsLogoUrl}" /></div>
      <div>
        <div class="label">Issued by</div>
        <div class="name">Samudayik Vikas Samiti</div>
      </div>
    </div>

    <div class="content">
      <div class="photo-col">
        <div class="photo">
          ${data.photoURL ? `<img src="${data.photoURL}" onerror="this.remove()" />` : `<span class="placeholder">👤</span>`}
        </div>
        ${verifiedBadge}
      </div>
      <div class="details">
        <h2>${escapeHtml(data.name)}</h2>
        <div class="rows">
          <div class="row">
            <span class="icon">${ICON.idCard}</span>
            <span class="label">Member ID</span><span class="dash">—</span>
            <span class="value ${data.memberId === "Pending" ? "pending" : ""}">${escapeHtml(data.memberId)}</span>
          </div>
          <div class="row">
            <span class="icon">${ICON.droplet}</span>
            <span class="label">Blood Group</span><span class="dash">—</span>
            <span class="value blood">${escapeHtml(data.bloodGroup || "—")}</span>
          </div>
          <div class="row">
            <span class="icon">${ICON.mapPin}</span>
            <span class="label">Location</span><span class="dash">—</span>
            <span class="value">${escapeHtml(data.location || "Not set")}</span>
          </div>
          <div class="row">
            <span class="icon">${ICON.calendar}</span>
            <span class="label">Joined</span><span class="dash">—</span>
            <span class="value">${escapeHtml(data.memberSince || "Recently")}</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="card back">
    <div class="terms-title"><span class="icon">${ICON.scrollText}</span><span>Terms &amp; Use</span></div>
    <ul class="terms-list">
      ${TERMS.map((t) => `<li><span class="icon">${ICON.shieldCheck}</span><span>${t}</span></li>`).join("\n")}
    </ul>
    <div class="back-footer">
      <span class="idtag">ID: ${escapeHtml(data.memberId)}</span>
      <div class="issuer-mini">
        <div class="icon"><img src="${data.svsLogoUrl}" /></div>
        <span class="name">Samudayik Vikas Samiti</span>
      </div>
    </div>
  </div>

</body>
</html>`;
}

function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}