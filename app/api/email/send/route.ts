import { NextRequest, NextResponse } from 'next/server';

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const FROM_EMAIL = 'Nexucon Email notifications <onboarding@resend.dev>';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { to, subject, html, text, type, metadata } = body;

    if (!to || !subject || !html) {
      return NextResponse.json({ error: 'Missing required parameters: to, subject, or html' }, { status: 400 });
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
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
      message: 'Email dispatched successfully via Resend'
    });
  } catch (err: any) {
    console.error('Email route error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
