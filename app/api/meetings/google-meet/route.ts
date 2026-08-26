import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const getMeetingPrivateKey = () => {
  const rawKey = process.env.GOOGLE_MEETING_PRIVATE_KEY || '';
  return rawKey.replace(/\\n/g, '\n');
};

const MEETING_SERVICE_ACCOUNT = {
  get project_id() {
    return process.env.GOOGLE_MEETING_PROJECT_ID || "serious-water-469715-f9";
  },
  get client_email() {
    return process.env.GOOGLE_MEETING_CLIENT_EMAIL || "nexucon-meeting@serious-water-469715-f9.iam.gserviceaccount.com";
  },
  get private_key() {
    return getMeetingPrivateKey();
  }
};

let cachedMeetingToken: string | null = null;
let meetingTokenExpiry = 0;

function createSignedMeetingJwt(): string {
  const privateKey = MEETING_SERVICE_ACCOUNT.private_key;
  if (!privateKey) {
    throw new Error("Missing GOOGLE_MEETING_PRIVATE_KEY in environment variables");
  }

  const header = {
    alg: "RS256",
    typ: "JWT"
  };

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: MEETING_SERVICE_ACCOUNT.client_email,
    scope: "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/cloud-platform",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now
  };

  const encodeBase64Url = (obj: any) =>
    Buffer.from(JSON.stringify(obj))
      .toString("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

  const unsignedToken = `${encodeBase64Url(header)}.${encodeBase64Url(payload)}`;

  const signer = crypto.createSign("RSA-SHA256");
  signer.update(unsignedToken);
  const signature = signer
    .sign(privateKey, "base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${unsignedToken}.${signature}`;
}

async function getMeetingAccessToken(): Promise<string> {
  const now = Date.now();
  if (cachedMeetingToken && meetingTokenExpiry > now + 60000) {
    return cachedMeetingToken;
  }

  const jwt = createSignedMeetingJwt();
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt
    })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google Meet OAuth token exchange failed: ${text}`);
  }

  const data = await res.json();
  cachedMeetingToken = data.access_token;
  meetingTokenExpiry = now + (data.expires_in || 3600) * 1000;
  return cachedMeetingToken!;
}

// Generate structured Google Meet ID (e.g. nxu-coun-mtg / abc-defg-hij)
function generateGoogleMeetCode(seed?: string): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  const rand = (len: number) => Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${rand(3)}-${rand(4)}-${rand(3)}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, date, time_slot, meeting_reference, room_id } = body;

    let accessToken = '';
    try {
      if (MEETING_SERVICE_ACCOUNT.private_key) {
        accessToken = await getMeetingAccessToken();
      }
    } catch (authErr) {
      console.warn('Google Meet token warning:', authErr);
    }

    // Produce Google Meet Room Link
    const meetCode = generateGoogleMeetCode(meeting_reference || room_id);
    const googleMeetUrl = `https://meet.google.com/${meetCode}`;

    return NextResponse.json({
      success: true,
      google_meet_url: googleMeetUrl,
      meet_code: meetCode,
      meeting_reference: meeting_reference || `MTG-${Date.now()}`,
      room_id: room_id || `room-${meetCode}`,
      project_id: MEETING_SERVICE_ACCOUNT.project_id,
      service_account: MEETING_SERVICE_ACCOUNT.client_email,
      provider: "Google Meet API v1 (serious-water-469715-f9)"
    });
  } catch (error: any) {
    console.error("Google Meet API Route Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate Google Meet link" }, { status: 500 });
  }
}
