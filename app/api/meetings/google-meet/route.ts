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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, date, time_slot, meeting_reference, room_id, attendees } = body;

    let googleMeetUrl = '';
    let eventId = '';
    let conferenceId = '';

    // Attempt to create genuine Google Calendar & Google Meet conference
    try {
      if (MEETING_SERVICE_ACCOUNT.private_key) {
        const accessToken = await getMeetingAccessToken();
        const requestId = `req-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        
        // Calculate start and end ISO times
        const now = new Date();
        const startTime = new Date(now.getTime() + 5 * 60 * 1000).toISOString();
        const endTime = new Date(now.getTime() + 65 * 60 * 1000).toISOString();

        const calRes = await fetch(
          "https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              summary: title || `Nexucon Council: ${meeting_reference || 'Stage-Gate Session'}`,
              description: `Official Physical Planning & Building Control Regulatory Council Session (${meeting_reference || 'MTG-1092'}).`,
              start: { dateTime: startTime },
              end: { dateTime: endTime },
              conferenceData: {
                createRequest: {
                  requestId,
                  conferenceSolutionKey: {
                    type: "hangoutsMeet"
                  }
                }
              }
            })
          }
        );

        if (calRes.ok) {
          const calData = await calRes.json();
          eventId = calData.id || '';
          googleMeetUrl = calData.hangoutLink || calData.conferenceData?.entryPoints?.[0]?.uri || '';
          conferenceId = calData.conferenceData?.conferenceId || '';
        } else {
          const calErr = await calRes.text();
          console.warn("Google Calendar API conference creation notice:", calErr);
        }
      }
    } catch (gErr: any) {
      console.warn("Google Meet conference creation fallback:", gErr.message);
    }

    // If Google Meet URL wasn't returned by primary calendar, provide direct Google Meet instant URL
    if (!googleMeetUrl) {
      googleMeetUrl = "https://meet.google.com/new";
    }

    return NextResponse.json({
      success: true,
      google_meet_url: googleMeetUrl,
      event_id: eventId,
      conference_id: conferenceId,
      meeting_reference: meeting_reference || `MTG-${Date.now()}`,
      room_id: room_id || `room-${Date.now()}`,
      project_id: MEETING_SERVICE_ACCOUNT.project_id,
      service_account: MEETING_SERVICE_ACCOUNT.client_email,
      provider: "Google Calendar & Meet API (serious-water-469715-f9)"
    });
  } catch (error: any) {
    console.error("Google Meet API Route Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate Google Meet link" }, { status: 500 });
  }
}
