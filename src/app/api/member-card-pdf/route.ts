import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { generateMemberCardPDF } from "@/lib/services/memberCardPDF";

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get("x-api-key");
    if (!apiKey || apiKey !== process.env.MEMBER_CARD_API_KEY) {
      return NextResponse.json(
        { success: false, error: "Unauthorized - invalid API key" },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => null);
    const uid = body?.uid;
    if (!uid) {
      return NextResponse.json(
        { success: false, error: "uid is required" },
        { status: 400 }
      );
    }

    const userSnap = await getDoc(doc(db, "users", uid));
    if (!userSnap.exists()) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const data = userSnap.data();

    if (!data.isVerified) {
      return NextResponse.json(
        { success: false, error: "User is not verified" },
        { status: 422 }
      );
    }
    if (!data.memberId || data.memberId === "Pending") {
      return NextResponse.json(
        { success: false, error: "Member ID not yet assigned" },
        { status: 422 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://prabasiodia.svsamiti.com";

    const memberSince = data.createdAt
      ? new Date(data.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "N/A";

    const location = [data.currentCity, data.currentState].filter(Boolean).join(", ");

    const pdfBuffer = await generateMemberCardPDF({
      name: data.displayName || "Member",
      memberId: data.memberId,
      memberSince,
      bloodGroup: data.bloodGroup || "",
      location,
      isVerified: true,
      photoURL: data.photoURL || "",
      baseUrl,
    });

    const fileName = `member-card-${data.memberId}.pdf`;

    return NextResponse.json({
      success: true,
      data: {
        member_id: data.memberId,
        name: data.displayName || "Member",
        email: data.email || "",
        blood_group: data.bloodGroup || "",
        location,
        member_since: memberSince,
        verification_status: true,
        file_name: fileName,
        mime_type: "application/pdf",
        member_card_base64: pdfBuffer.toString("base64"),
      },
    });
  } catch (error) {
    console.error("Error generating member card:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate member card" },
      { status: 500 }
    );
  }
}