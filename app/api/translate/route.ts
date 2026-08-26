import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const getPrivateKey = () => {
  const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || '';
  return rawKey.replace(/\\n/g, '\n');
};

const SERVICE_ACCOUNT = {
  get project_id() {
    return process.env.GOOGLE_SERVICE_ACCOUNT_PROJECT_ID || "serious-water-469715-f9";
  },
  get client_email() {
    return process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL || "nexucon-language@serious-water-469715-f9.iam.gserviceaccount.com";
  },
  get private_key() {
    return getPrivateKey();
  }
};

let cachedToken: string | null = null;
let tokenExpiry = 0;

function createSignedJwt(): string {
  const privateKey = SERVICE_ACCOUNT.private_key;
  if (!privateKey) {
    throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY in environment variables");
  }

  const header = {
    alg: "RS256",
    typ: "JWT"
  };

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: SERVICE_ACCOUNT.client_email,
    scope: "https://www.googleapis.com/auth/cloud-translation https://www.googleapis.com/auth/cloud-platform",
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

async function getAccessToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && tokenExpiry > now + 60000) {
    return cachedToken;
  }

  const jwt = createSignedJwt();
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
    throw new Error(`Google Cloud OAuth token exchange failed: ${text}`);
  }

  const data = await res.json();
  cachedToken = data.access_token;
  tokenExpiry = now + (data.expires_in || 3600) * 1000;
  return cachedToken!;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, target_language, message_id } = body;

    if (!text || !target_language) {
      return NextResponse.json({ error: "Missing text or target_language" }, { status: 400 });
    }

    const languageMap: Record<string, string> = {
      yo: "Yorùbá",
      ig: "Igbo",
      ha: "Hausa",
      en: "English"
    };

    let translatedContent = "";

    try {
      const accessToken = await getAccessToken();
      const translateRes = await fetch(
        "https://translation.googleapis.com/language/translate/v2",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json; charset=utf-8"
          },
          body: JSON.stringify({
            q: text,
            target: target_language,
            format: "text"
          })
        }
      );

      if (translateRes.ok) {
        const translateData = await translateRes.json();
        translatedContent = translateData.data?.translations?.[0]?.translatedText || text;
      } else {
        const errorText = await translateRes.text();
        console.warn("Google Translate API v2 returned status:", translateRes.status, errorText);
      }
    } catch (apiErr: any) {
      console.warn("Google Translate API failed:", apiErr.message);
    }

    // Direct fallback to original text if API fails
    if (!translatedContent) {
      translatedContent = text;
    }

    return NextResponse.json({
      translated_content: translatedContent,
      target_language,
      language_name: languageMap[target_language] || target_language,
      message_id: message_id || `msg-${Date.now()}`,
      original_content: text,
      provider: "Google Cloud Translation API v2",
      is_cached: false
    });
  } catch (error: any) {
    console.error("Translate API Route Error:", error);
    return NextResponse.json({ error: error.message || "Failed to translate text" }, { status: 500 });
  }
}
