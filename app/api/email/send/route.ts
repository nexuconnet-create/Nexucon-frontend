import { NextRequest, NextResponse } from 'next/server';

const RESEND_API_KEY = process.env.RESEND_API_KEY || 're_T5fzGV4i_MxWq29RnxPKmDbJizUWHnPZ6';
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Nexucon Email notifications <notifications@nexucon.net>';

function getRoleTemplate(role: string, name: string, department: string, inviteUrl: string, email: string) {
  const roleLower = (role || '').toLowerCase();
  const currentYear = new Date().getFullYear();

  if (roleLower.includes('director') || roleLower.includes('commissioner') || roleLower.includes('executive')) {
    return {
      subject: `🏛️ Directorate Appointment & Onboarding: ${role} - Nexucon`,
      html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Directorate Invitation</title></head>
<body style="margin:0;padding:0;background-color:#0A1118;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 10px;">
    <table width="600" style="max-width:600px;background:#FFFFFF;border-radius:24px;overflow:hidden;box-shadow:0 25px 50px -12px rgba(0,0,0,0.35);">
      <tr><td style="background:linear-gradient(135deg,#022C4F 0%,#03467B 50%,#0A66C2 100%);padding:36px 40px;">
        <span style="color:#FFF;font-weight:900;font-size:20px;letter-spacing:1.5px;">NEXUCON</span>
        <span style="color:#93C5FD;font-size:11px;font-weight:700;padding-left:8px;margin-left:8px;border-left:1px solid rgba(255,255,255,0.3);">GOVERNMENT CONTROL</span>
      </td></tr>
      <tr><td style="padding:40px;">
        <span style="display:inline-block;background:#FEF3C7;color:#92400E;border:1px solid #FCD34D;padding:6px 14px;border-radius:20px;font-weight:800;font-size:12px;text-transform:uppercase;">Directorate Lead & Executive Sign-off</span>
        <h1 style="color:#0F172A;font-size:24px;font-weight:800;margin:16px 0;">Official Invitation: Directorate Appointment</h1>
        <p style="color:#334155;font-size:15px;line-height:24px;">Dear <strong>${name}</strong>,</p>
        <p style="color:#475569;font-size:14px;line-height:22px;">You have been formally designated as <strong>${role}</strong> for the <strong>${department}</strong> on the Nexucon Regulatory Management System.</p>
        <div style="text-align:center;margin:32px 0;">
          <a href="${inviteUrl}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#022C4F 0%,#03467B 100%);color:#FFF;text-decoration:none;border-radius:12px;font-weight:700;font-size:14px;box-shadow:0 4px 14px rgba(2,44,79,0.4);">Activate Directorate Account &rarr;</a>
        </div>
        <p style="color:#94A3B8;font-size:12px;">Direct link: <a href="${inviteUrl}" style="color:#0A66C2;">${inviteUrl}</a></p>
      </td></tr>
      <tr><td style="background:#F8FAFC;border-top:1px solid #E2E8F0;padding:24px 40px;text-align:center;">
        <p style="color:#64748B;font-size:11px;margin:0;">&copy; ${currentYear} Nexucon Physical Planning & Building Control Authority.</p>
      </td></tr>
    </table>
  </td></tr></table>
</body>
</html>`
    };
  } else if (roleLower.includes('inspector') || roleLower.includes('field') || roleLower.includes('hse') || roleLower.includes('surveillance')) {
    return {
      subject: `🔍 Field Inspector Terminal Onboarding: ${role} - Nexucon`,
      html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Field Inspector Onboarding</title></head>
<body style="margin:0;padding:0;background-color:#0A1118;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 10px;">
    <table width="600" style="max-width:600px;background:#FFFFFF;border-radius:24px;overflow:hidden;box-shadow:0 25px 50px -12px rgba(0,0,0,0.35);">
      <tr><td style="background:linear-gradient(135deg,#0369A1 0%,#0284C7 50%,#38BDF8 100%);padding:36px 40px;">
        <span style="color:#FFF;font-weight:900;font-size:20px;letter-spacing:1.5px;">NEXUCON</span>
        <span style="color:#E0F2FE;font-size:11px;font-weight:700;padding-left:8px;margin-left:8px;border-left:1px solid rgba(255,255,255,0.3);">FIELD SURVEILLANCE</span>
      </td></tr>
      <tr><td style="padding:40px;">
        <span style="display:inline-block;background:#E0F2FE;color:#0369A1;border:1px solid #BAE6FD;padding:6px 14px;border-radius:20px;font-weight:800;font-size:12px;text-transform:uppercase;">Field Inspector & Site Compliance Officer</span>
        <h1 style="color:#0F172A;font-size:24px;font-weight:800;margin:16px 0;">Field Inspector Account Provisioned</h1>
        <p style="color:#334155;font-size:15px;line-height:24px;">Hello <strong>${name}</strong>,</p>
        <p style="color:#475569;font-size:14px;line-height:22px;">You have been provisioned as an authorized <strong>${role}</strong> attached to <strong>${department}</strong>.</p>
        <div style="text-align:center;margin:32px 0;">
          <a href="${inviteUrl}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#0284C7 0%,#0369A1 100%);color:#FFF;text-decoration:none;border-radius:12px;font-weight:700;font-size:14px;box-shadow:0 4px 14px rgba(2,132,199,0.4);">Activate Inspector Terminal &rarr;</a>
        </div>
        <p style="color:#94A3B8;font-size:12px;">Direct link: <a href="${inviteUrl}" style="color:#0284C7;">${inviteUrl}</a></p>
      </td></tr>
      <tr><td style="background:#F8FAFC;border-top:1px solid #E2E8F0;padding:24px 40px;text-align:center;">
        <p style="color:#64748B;font-size:11px;margin:0;">&copy; ${currentYear} Nexucon Field Surveillance & Inspection Bureau.</p>
      </td></tr>
    </table>
  </td></tr></table>
</body>
</html>`
    };
  } else {
    return {
      subject: `📋 Official Invitation to Join Nexucon: ${role}`,
      html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Staff Invitation</title></head>
<body style="margin:0;padding:0;background-color:#0A1118;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 10px;">
    <table width="600" style="max-width:600px;background:#FFFFFF;border-radius:24px;overflow:hidden;box-shadow:0 25px 50px -12px rgba(0,0,0,0.35);">
      <tr><td style="background:linear-gradient(135deg,#022C4F 0%,#03467B 50%,#0A66C2 100%);padding:36px 40px;">
        <span style="color:#FFF;font-weight:900;font-size:20px;letter-spacing:1.5px;">NEXUCON</span>
        <span style="color:#93C5FD;font-size:11px;font-weight:700;padding-left:8px;margin-left:8px;border-left:1px solid rgba(255,255,255,0.3);">STAFF PORTAL</span>
      </td></tr>
      <tr><td style="padding:40px;">
        <span style="display:inline-block;background:#F1F5F9;color:#334155;border:1px solid #CBD5E1;padding:6px 14px;border-radius:20px;font-weight:800;font-size:12px;text-transform:uppercase;">${role} &bull; ${department}</span>
        <h1 style="color:#0F172A;font-size:24px;font-weight:800;margin:16px 0;">You've Been Invited to Join Nexucon</h1>
        <p style="color:#334155;font-size:15px;line-height:24px;">Hello <strong>${name}</strong>,</p>
        <p style="color:#475569;font-size:14px;line-height:22px;">You have been invited to join the Nexucon Building Regulatory Management System with the role of <strong>${role}</strong> in the <strong>${department}</strong> department.</p>
        <div style="text-align:center;margin:32px 0;">
          <a href="${inviteUrl}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#022C4F 0%,#03467B 100%);color:#FFF;text-decoration:none;border-radius:12px;font-weight:700;font-size:14px;box-shadow:0 4px 14px rgba(2,44,79,0.4);">Accept Invitation & Set Password &rarr;</a>
        </div>
        <p style="color:#94A3B8;font-size:12px;">Direct link: <a href="${inviteUrl}" style="color:#0A66C2;">${inviteUrl}</a></p>
      </td></tr>
      <tr><td style="background:#F8FAFC;border-top:1px solid #E2E8F0;padding:24px 40px;text-align:center;">
        <p style="color:#64748B;font-size:11px;margin:0;">&copy; ${currentYear} Nexucon Physical Planning & Building Control Authority.</p>
      </td></tr>
    </table>
  </td></tr></table>
</body>
</html>`
    };
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { to, subject, html, text, name, role, department, invite_token, otp_code } = body;

    const recipientEmail = to || body.email;
    if (!recipientEmail) {
      return NextResponse.json({ error: 'Missing recipient email' }, { status: 400 });
    }

    let finalSubject = subject;
    let finalHtml = html;

    // If template parameters are passed
    if (!finalHtml) {
      const host = req.headers.get('host') || 'localhost:3000';
      const protocol = host.includes('localhost') ? 'http' : 'https';
      const token = invite_token || Math.random().toString(36).substring(2, 15);
      const inviteUrl = `${protocol}://${host}/auth/accept-invite?token=${token}&email=${encodeURIComponent(recipientEmail)}`;

      if (otp_code) {
        finalSubject = finalSubject || `🔐 ${otp_code} is your Nexucon 2FA Security Passcode`;
        finalHtml = `<!DOCTYPE html><html><body style="font-family:sans-serif;padding:30px;background:#0A1118;color:#FFF;">
          <div style="max-width:500px;background:#FFF;color:#0F172A;padding:30px;border-radius:20px;text-align:center;">
            <h2 style="color:#022C4F;">2FA Verification Passcode</h2>
            <div style="font-size:36px;font-weight:900;letter-spacing:10px;color:#0284C7;margin:20px 0;">${otp_code}</div>
            <p style="color:#64748B;font-size:12px;">Expires in 10 minutes. Never share this code.</p>
          </div>
        </body></html>`;
      } else {
        const generated = getRoleTemplate(role || 'Staff Member', name || recipientEmail.split('@')[0], department || 'Building Control', inviteUrl, recipientEmail);
        finalSubject = finalSubject || generated.subject;
        finalHtml = generated.html;
      }
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: Array.isArray(recipientEmail) ? recipientEmail : [recipientEmail],
        subject: finalSubject,
        html: finalHtml,
        text: text || undefined
      })
    });

    const data = await res.json();
    if (!res.ok) {
      console.error('Resend API Error:', data);
      return NextResponse.json({ error: data.message || 'Failed to dispatch email via Resend' }, { status: res.status });
    }

    return NextResponse.json({
      success: true,
      id: data.id,
      message: `Invitation email dispatched to ${recipientEmail} via Resend`
    });
  } catch (err: any) {
    console.error('Email route error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
