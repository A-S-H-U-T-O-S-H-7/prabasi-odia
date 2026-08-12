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

export function renderMemberCardHTML(data: MemberCardData): string {
  const verifiedBadge = data.isVerified
    ? `<span class="badge verified">✓ Verified</span>`
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

  .card {
    width: 860px; height: 460px;
    border-radius: 24px; overflow: hidden;
    position: relative;
    page-break-after: always;
  }
  .front {
    background: #F7F1E3;
    border: 1px solid #4A1942;
  }
  .front::before {
    content: "";
    position: absolute; inset: 0;
    background: url('${data.bgImageUrl}') center/cover no-repeat;
    filter: blur(1px);
    opacity: 0.5;
  }
  .front::after {
    content: "";
    position: absolute; inset: 0;
    background: linear-gradient(to right, #F7F1E3 0%, rgba(247,241,227,0.75) 55%, transparent 100%);
  }

  .wordmark {
    position: absolute; top: 16px; left: 50%; transform: translateX(-50%);
    display: flex; align-items: center; gap: 10px;
    background: rgba(255,255,255,0.95);
    border-radius: 999px; padding: 8px 20px 8px 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 20;
  }
  .wordmark img { width: 32px; height: 32px; border-radius: 50%; }
  .wordmark span { font-size: 20px; font-weight: 700; color: #4A1942; }

  .qr-box {
    position: absolute; right: 24px; top: 50%; transform: translateY(-50%);
    background: #fff; border-radius: 12px; padding: 4px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 20;
  }
  .qr-box img { width: 96px; height: 96px; display: block; border-radius: 8px; }

  .issuer {
    position: absolute; bottom: 14px; right: 16px; z-index: 20;
    display: flex; align-items: center; gap: 8px;
  }
  .issuer img { width: 36px; height: 36px; border-radius: 50%; background: #fff; padding: 3px; box-shadow: 0 2px 6px rgba(0,0,0,0.2); }
  .issuer .label { font-size: 8px; text-transform: uppercase; color: #C1440E; font-weight: 600; }
  .issuer .name { font-size: 10px; text-transform: uppercase; color: #4A1942; font-weight: 700; }

  .content {
    position: absolute; left: 20px; top: 72px; bottom: 52px; z-index: 10;
    display: flex; align-items: center; gap: 20px; width: 55%;
  }
  .photo-wrap { flex-shrink: 0; text-align: center; }
  .photo {
    width: 96px; height: 96px; border-radius: 12px;
    border: 3px solid #fff; background: #fff; overflow: hidden;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  }
  .photo img { width: 100%; height: 100%; object-fit: cover; }
  .badge {
    display: inline-flex; align-items: center; gap: 4px;
    margin-top: 8px; padding: 3px 10px; border-radius: 999px;
    font-size: 10px; font-weight: 600; border: 1px solid;
  }
  .badge.verified { background: #ECFDF5; border-color: #6EE7B7; color: #047857; }
  .badge.unverified { background: rgba(255,255,255,0.85); border-color: #DDD0BC; color: #7A6A5E; }

  .details { flex: 1; min-width: 0; }
  .details h2 {
    font-size: 22px; font-weight: 700; color: #4A1942; margin-bottom: 10px;
    line-height: 1.15; word-break: break-word;
  }
  .row { display: flex; align-items: center; gap: 6px; height: 20px; font-size: 12px; margin-bottom: 4px; }
  .row .label { color: #2A1636; opacity: 0.7; white-space: nowrap; }
  .row .value { font-weight: 600; color: #2A1636; }
  .row .value.blood { color: #DC2626; }
  .row .value.pending { color: #C1440E; }

  .back {
    background: linear-gradient(135deg, #4A1942 0%, #3A1333 100%);
    color: #fff;
  }
  .terms-title {
    position: absolute; top: 16px; left: 50%; transform: translateX(-50%);
    background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);
    border-radius: 999px; padding: 8px 20px;
    font-size: 15px; font-weight: 700; color: #fff; z-index: 20;
  }
  .terms-list {
    position: absolute; left: 32px; right: 32px; top: 60px; bottom: 44px;
    display: flex; flex-direction: column; justify-content: center; gap: 8px;
  }
  .terms-list li { list-style: none; display: flex; gap: 8px; font-size: 12px; line-height: 1.4; color: rgba(255,255,255,0.9); }
  .terms-list li::before { content: "✓"; color: #E8A33D; flex-shrink: 0; }
  .back-footer {
    position: absolute; bottom: 12px; left: 16px; right: 16px; z-index: 20;
    display: flex; align-items: center; justify-content: space-between;
  }
  .back-footer .idtag { font-size: 9px; font-family: monospace; color: rgba(255,255,255,0.6); }
  .back-footer .issuer { position: static; }
  .back-footer .name { color: rgba(255,255,255,0.8); }
</style>
</head>
<body>

  <div class="card front">
    <div class="wordmark">
      <img src="${data.logoIconUrl}" />
      <span>Prabasi Odia</span>
    </div>
    <div class="qr-box"><img src="${data.qrDataUrl}" /></div>
    <div class="issuer">
      <img src="${data.svsLogoUrl}" />
      <div>
        <div class="label">Issued by</div>
        <div class="name">Samudayik Vikas Samiti</div>
      </div>
    </div>
    <div class="content">
      <div class="photo-wrap">
        <div class="photo">
          ${data.photoURL ? `<img src="${data.photoURL}" />` : ""}
        </div>
        ${verifiedBadge}
      </div>
      <div class="details">
        <h2>${escapeHtml(data.name)}</h2>
        <div class="row"><span class="label">Member ID —</span> <span class="value ${data.memberId === "Pending" ? "pending" : ""}">${escapeHtml(data.memberId)}</span></div>
        <div class="row"><span class="label">Blood Group —</span> <span class="value blood">${escapeHtml(data.bloodGroup || "—")}</span></div>
        <div class="row"><span class="label">Location —</span> <span class="value">${escapeHtml(data.location || "Not set")}</span></div>
        <div class="row"><span class="label">Joined —</span> <span class="value">${escapeHtml(data.memberSince)}</span></div>
      </div>
    </div>
  </div>

  <div class="card back">
    <div class="terms-title">📜 Terms &amp; Use</div>
    <ul class="terms-list">
      ${TERMS.map((t) => `<li>${t}</li>`).join("\n")}
    </ul>
    <div class="back-footer">
      <span class="idtag">ID: ${escapeHtml(data.memberId)}</span>
      <div class="issuer">
        <img src="${data.svsLogoUrl}" />
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