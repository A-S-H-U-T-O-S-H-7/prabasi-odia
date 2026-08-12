// app/api/member-card-pdf/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { jsPDF } from 'jspdf';

interface MemberCardData {
  name: string;
  memberId: string;
  memberSince: string;
  communityName: string;
  bloodGroup: string;
  city: string;
  state: string;
  isVerified: boolean;
  photoURL: string;
  backgroundImage: string;
  svsLogo: string;
  prabasiLogo: string;
}

// ============================================
// PDF GENERATION FUNCTION
// ============================================
async function generateMemberCardPDF(data: MemberCardData): Promise<string> {
  const html2canvas = await import('html2canvas');

  // Create HTML card
  const cardHTML = `
    <div style="width: 600px; padding: 40px; background: #F7F1E3; font-family: 'Georgia', serif; border: 2px solid #4A1942; border-radius: 16px; position: relative; overflow: hidden;">
      
      <!-- Background Image -->
      <div style="position: absolute; inset: 0; opacity: 0.3; background-image: url('${data.backgroundImage}'); background-size: cover; background-position: center; background-repeat: no-repeat;"></div>
      <div style="position: absolute; inset: 0; background: linear-gradient(to right, #F7F1E3 60%, transparent);"></div>
      
      <!-- Prabasi Odia Logo - Top Center -->
      <div style="position: relative; z-index: 10; display: flex; justify-content: center; margin-bottom: 16px;">
        <div style="display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.95); padding: 6px 16px 6px 10px; border-radius: 9999px; border: 1px solid rgba(255,255,255,0.6); box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
          <div style="width: 32px; height: 32px; border-radius: 50%; overflow: hidden; background: white;">
            <img src="${data.prabasiLogo}" alt="Prabasi Odia" style="width: 100%; height: 100%; object-fit: contain;" />
          </div>
          <span style="color: #4A1942; font-size: 20px; font-weight: bold; letter-spacing: 0.5px; font-family: 'Georgia', serif;">Prabasi Odia</span>
        </div>
      </div>

      <!-- QR Code - Top Right -->
      <div style="position: relative; z-index: 10; display: flex; justify-content: flex-end; margin-top: -40px; margin-bottom: 8px;">
        <div style="background: white; padding: 4px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border: 1px solid rgba(255,255,255,0.8);">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(data.memberId)}" alt="QR" style="width: 60px; height: 60px; display: block;" />
        </div>
      </div>

      <!-- Main Content -->
      <div style="position: relative; z-index: 10; display: flex; gap: 16px; align-items: center; margin-top: 4px;">
        <!-- Profile Photo -->
        <div style="flex-shrink: 0;">
          <div style="width: 80px; height: 80px; border-radius: 12px; overflow: hidden; border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.15); background: #4A1942;">
            ${data.photoURL ? 
              `<img src="${data.photoURL}" alt="${data.name}" style="width: 100%; height: 100%; object-fit: cover;" />` :
              `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: white; font-size: 32px; font-weight: bold;">${data.name.charAt(0).toUpperCase()}</div>`
            }
          </div>
          <div style="text-align: center; margin-top: 4px;">
            <span style="display: inline-block; padding: 2px 10px; border-radius: 9999px; font-size: 10px; font-weight: 600; background: ${data.isVerified ? '#10b981' : '#f59e0b'}; color: white; border: 1px solid rgba(255,255,255,0.3);">
              ${data.isVerified ? '✅ Verified' : '⏳ Pending'}
            </span>
          </div>
        </div>

        <!-- Member Details -->
        <div style="flex: 1; min-width: 0;">
          <h2 style="color: #4A1942; font-size: 22px; font-weight: bold; margin: 0 0 8px 0; font-family: 'Georgia', serif; text-shadow: 0 0 4px rgba(255,255,255,0.9);">
            ${data.name}
          </h2>

          <div style="display: flex; flex-direction: column; gap: 4px; font-size: 13px;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="color: #C1440E; font-weight: bold;">🪪</span>
              <span style="color: #2A1636; opacity: 0.7;">Member ID</span>
              <span style="color: #2A1636; opacity: 0.7;">—</span>
              <span style="color: #4A1942; font-weight: 600;">${data.memberId}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="color: #C1440E; font-weight: bold;">🩸</span>
              <span style="color: #2A1636; opacity: 0.7;">Blood Group</span>
              <span style="color: #2A1636; opacity: 0.7;">—</span>
              <span style="color: #dc2626; font-weight: 600;">${data.bloodGroup || '—'}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="color: #C1440E; font-weight: bold;">📍</span>
              <span style="color: #2A1636; opacity: 0.7;">Location</span>
              <span style="color: #2A1636; opacity: 0.7;">—</span>
              <span style="color: #2A1636; font-weight: 600;">${data.city || ''} ${data.state ? `, ${data.state}` : ''}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="color: #C1440E; font-weight: bold;">📅</span>
              <span style="color: #2A1636; opacity: 0.7;">Joined</span>
              <span style="color: #2A1636; opacity: 0.7;">—</span>
              <span style="color: #2A1636; font-weight: 600;">${data.memberSince}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- SVS Logo - Bottom Right -->
      <div style="position: relative; z-index: 10; display: flex; justify-content: flex-end; align-items: center; gap: 8px; margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(74,25,66,0.1);">
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="width: 28px; height: 28px; border-radius: 50%; overflow: hidden; background: white; border: 2px solid rgba(255,255,255,0.7); box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <img src="${data.svsLogo}" alt="SVS" style="width: 100%; height: 100%; object-fit: contain; padding: 2px;" />
          </div>
          <div>
            <p style="color: #C1440E; font-size: 7px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin: 0;">Issued by</p>
            <p style="color: #4A1942; font-size: 9px; font-weight: 700; text-transform: uppercase; margin: 0; line-height: 1.2;">Samudayik Vikas Samiti</p>
          </div>
        </div>
      </div>
    </div>
  `;

  // Create a temporary DOM element
  const div = document.createElement('div');
  div.innerHTML = cardHTML;
  document.body.appendChild(div);

  // Convert to canvas
  const canvas = await html2canvas.default(div, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#F7F1E3',
    allowTaint: true,
    logging: false,
  });
  document.body.removeChild(div);

  const imgData = canvas.toDataURL('image/png');

  // Create PDF
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'px',
    format: [canvas.width, canvas.height],
  });
  pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);

  // Return Base64 string
  return pdf.output('datauristring').split(',')[1];
}

// ============================================
// GET HANDLER
// ============================================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get('uid');
    const apiKey = searchParams.get('api_key');

    // ✅ Validate API Key
    const VALID_API_KEY = process.env.MEMBER_CARD_API_KEY;
    if (!apiKey || apiKey !== VALID_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Invalid API key' },
        { status: 401 }
      );
    }

    // ✅ Validate UID
    if (!uid) {
      return NextResponse.json(
        { success: false, error: 'User ID (uid) is required' },
        { status: 400 }
      );
    }

    // ✅ Fetch user data
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const data = userSnap.data();

    // ✅ Get base URL for images
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://prabasiodia.svsamiti.com';

    // ✅ Prepare member data for PDF generation
    const memberData: MemberCardData = {
      name: data.displayName || 'Member',
      memberId: data.memberId || 'Pending',
      memberSince: data.createdAt 
        ? new Date(data.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        : 'N/A',
      communityName: data.nearbyCommunityName || data.currentCity || 'Prabasi Odia',
      bloodGroup: data.bloodGroup || '',
      city: data.currentCity || '',
      state: data.currentState || '',
      isVerified: data.isVerified || false,
      photoURL: data.photoURL || '',
      backgroundImage: `${baseUrl}/odisha.png`,
      svsLogo: `${baseUrl}/svslogo.png`,
      prabasiLogo: `${baseUrl}/logoicon.png`,
    };

    // ✅ Generate PDF
    const base64PDF = await generateMemberCardPDF(memberData);

    // ✅ Return response with all data
    return NextResponse.json({
      success: true,
      data: {
        member_id: data.memberId || 'Pending',
        name: data.displayName || 'Member',
        email: data.email || '',
        blood_group: data.bloodGroup || '',
        location: `${data.currentCity || ''}${data.currentCity && data.currentState ? ', ' : ''}${data.currentState || ''}`,
        photo_url: data.photoURL || '',
        background_image_url: `${baseUrl}/odisha.png`,
        svs_logo_url: `${baseUrl}/svslogo.png`,
        prabasi_logo_url: `${baseUrl}/logoicon.png`,
        verification_status: data.isVerified || false,
        member_since: memberData.memberSince,
        community: memberData.communityName,
        qr_data: `${baseUrl}/member/${data.memberId || data.uid}`,
        member_card_base64: base64PDF,
        file_name: `member-card-${data.memberId || uid}.pdf`,
      }
    });

  } catch (error) {
    console.error('Error generating member card:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate member card' },
      { status: 500 }
    );
  }
}