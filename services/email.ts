export interface EmailDispatchPayload {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  type?: 'INVITE_DIRECTOR' | 'INVITE_INSPECTOR' | 'INVITE_REVIEWER' | 'INVITE_CONTRACTOR' | 'TWO_FACTOR_AUTH' | 'GENERAL';
  metadata?: Record<string, any>;
}

export const sendEmailViaResend = async (payload: EmailDispatchPayload): Promise<{ success: boolean; id?: string; error?: string }> => {
  try {
    const res = await fetch('/api/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Email dispatch failed' };
    }
    return { success: true, id: data.id };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error sending email' };
  }
};
