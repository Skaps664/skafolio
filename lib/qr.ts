/**
 * QR Code Generation Utilities
 * Fast server-side QR generation with Cloudinary upload
 */

import QRCode from 'qrcode';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Generate QR code as data URL
 */
export async function generateQRCode(url: string): Promise<string> {
  try {
    return await QRCode.toDataURL(url, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 512,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
  } catch (error) {
    console.error('QR generation error:', error);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Generate QR code and upload to Cloudinary
 */
export async function generateAndUploadQRCode(url: string, cardId: string): Promise<string> {
  try {
    const dataUrl = await generateQRCode(url);
    
    const uploadResult = await cloudinary.uploader.upload(dataUrl, {
      folder: 'skafolio/qr-codes',
      public_id: `qr-${cardId}`,
      overwrite: true,
      resource_type: 'image',
    });
    
    return uploadResult.secure_url;
  } catch (error) {
    console.error('QR upload error:', error);
    throw new Error('Failed to upload QR code');
  }
}

/**
 * Generate QR code as buffer (for direct download)
 */
export async function generateQRCodeBuffer(url: string): Promise<Buffer> {
  try {
    return await QRCode.toBuffer(url, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 512,
    });
  } catch (error) {
    console.error('QR buffer generation error:', error);
    throw new Error('Failed to generate QR code buffer');
  }
}
