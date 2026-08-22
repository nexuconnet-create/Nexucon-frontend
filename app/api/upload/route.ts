import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const directUrl = formData.get('url') as string | null;

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'fspyt1uw';
    const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || '226324943154255';
    const apiSecret = process.env.CLOUDINARY_API_SECRET || 'xEYPJUsx6Gih1uxUBZhiQ9K7VK0';

    if (!file && !directUrl) {
      return NextResponse.json({ error: 'No file or image URL provided' }, { status: 400 });
    }

    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = 'nexucon/daily_updates';
    
    // Generate Cloudinary SHA-1 Signature
    const paramsToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash('sha1').update(paramsToSign).digest('hex');

    const uploadData = new FormData();
    if (file) {
      uploadData.append('file', file);
    } else if (directUrl) {
      uploadData.append('file', directUrl);
    }
    uploadData.append('api_key', apiKey);
    uploadData.append('timestamp', String(timestamp));
    uploadData.append('signature', signature);
    uploadData.append('folder', folder);

    const cloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: uploadData
    });

    const data = await cloudinaryRes.json();
    if (!cloudinaryRes.ok) {
      console.error('Cloudinary upload error:', data);
      return NextResponse.json({ error: data.error?.message || 'Upload to Cloudinary failed' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      url: data.secure_url || data.url,
      public_id: data.public_id,
      format: data.format,
      width: data.width,
      height: data.height,
      bytes: data.bytes
    });
  } catch (err: any) {
    console.error('Upload handler error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
