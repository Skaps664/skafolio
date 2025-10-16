/**
 * PayFast Payment Gateway Integration
 * Official PayFast integration for South African payments
 */

import crypto from 'crypto';

interface PayFastConfig {
  merchantId: string;
  merchantKey: string;
  passphrase: string;
  mode: 'sandbox' | 'live';
}

interface PayFastPaymentData {
  merchant_id: string;
  merchant_key: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
  name_first?: string;
  name_last?: string;
  email_address: string;
  cell_number?: string;
  m_payment_id: string;
  amount: string;
  item_name: string;
  item_description?: string;
  custom_str1?: string;
  custom_str2?: string;
  custom_str3?: string;
  email_confirmation?: string;
  confirmation_address?: string;
}

const config: PayFastConfig = {
  merchantId: process.env.PAYFAST_MERCHANT_ID || '10000100',
  merchantKey: process.env.PAYFAST_MERCHANT_KEY || '46f0cd694581a',
  passphrase: process.env.PAYFAST_PASSPHRASE || '',
  mode: (process.env.PAYFAST_MODE as 'sandbox' | 'live') || 'sandbox',
};

/**
 * Generate PayFast signature
 */
function generateSignature(data: Record<string, string>, passphrase: string = ''): string {
  // Create parameter string
  let pfParamString = '';
  for (const key in data) {
    if (data.hasOwnProperty(key) && key !== 'signature') {
      pfParamString += `${key}=${encodeURIComponent(data[key].trim()).replace(/%20/g, '+')}&`;
    }
  }
  
  // Remove last ampersand
  pfParamString = pfParamString.slice(0, -1);
  
  // Add passphrase if provided
  if (passphrase) {
    pfParamString += `&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, '+')}`;
  }
  
  // Generate MD5 hash
  return crypto.createHash('md5').update(pfParamString).digest('hex');
}

/**
 * Create PayFast payment URL
 */
export function createPayFastPayment(paymentData: {
  orderId: string;
  amount: number;
  itemName: string;
  itemDescription?: string;
  userEmail: string;
  userName?: string;
  userPhone?: string;
  customData?: Record<string, string>;
}): { url: string; signature: string; data: Record<string, string> } {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  const data: Record<string, string> = {
    merchant_id: config.merchantId,
    merchant_key: config.merchantKey,
    return_url: `${baseUrl}/orders/success`,
    cancel_url: `${baseUrl}/orders/cancel`,
    notify_url: `${baseUrl}/api/payfast/ipn`,
    email_address: paymentData.userEmail,
    m_payment_id: paymentData.orderId,
    amount: paymentData.amount.toFixed(2),
    item_name: paymentData.itemName,
  };
  
  if (paymentData.itemDescription) {
    data.item_description = paymentData.itemDescription;
  }
  
  if (paymentData.userName) {
    const nameParts = paymentData.userName.split(' ');
    data.name_first = nameParts[0] || '';
    data.name_last = nameParts.slice(1).join(' ') || '';
  }
  
  if (paymentData.userPhone) {
    data.cell_number = paymentData.userPhone;
  }
  
  // Add custom data
  if (paymentData.customData) {
    if (paymentData.customData.str1) data.custom_str1 = paymentData.customData.str1;
    if (paymentData.customData.str2) data.custom_str2 = paymentData.customData.str2;
    if (paymentData.customData.str3) data.custom_str3 = paymentData.customData.str3;
  }
  
  // Generate signature
  const signature = generateSignature(data, config.passphrase);
  data.signature = signature;
  
  // Build payment URL
  const paymentUrl = config.mode === 'sandbox'
    ? process.env.PAYFAST_SANDBOX_URL || 'https://sandbox.payfast.co.za/eng/process'
    : process.env.PAYFAST_LIVE_URL || 'https://www.payfast.co.za/eng/process';
  
  const queryString = Object.keys(data)
    .map(key => `${key}=${encodeURIComponent(data[key])}`)
    .join('&');
  
  return {
    url: `${paymentUrl}?${queryString}`,
    signature,
    data,
  };
}

/**
 * Verify PayFast IPN notification
 */
export function verifyPayFastSignature(postData: Record<string, string>, passphrase: string = ''): boolean {
  const signature = postData.signature;
  if (!signature) return false;
  
  const calculatedSignature = generateSignature(postData, passphrase);
  return signature === calculatedSignature;
}

/**
 * Validate PayFast IPN data
 */
export async function validatePayFastIPN(data: Record<string, string>): Promise<boolean> {
  try {
    // 1. Verify signature
    if (!verifyPayFastSignature(data, config.passphrase)) {
      console.error('PayFast IPN: Invalid signature');
      return false;
    }
    
    // 2. Verify merchant ID
    if (data.merchant_id !== config.merchantId) {
      console.error('PayFast IPN: Invalid merchant ID');
      return false;
    }
    
    // 3. Verify payment status
    if (data.payment_status !== 'COMPLETE') {
      console.log('PayFast IPN: Payment not complete:', data.payment_status);
      return false;
    }
    
    // 4. Verify amount (should be done in the handler by checking against DB)
    // This is handled in the API route
    
    return true;
  } catch (error) {
    console.error('PayFast IPN validation error:', error);
    return false;
  }
}

/**
 * Parse PayFast IPN data
 */
export interface PayFastIPNData {
  m_payment_id: string;
  pf_payment_id: string;
  payment_status: string;
  item_name: string;
  item_description?: string;
  amount_gross: string;
  amount_fee: string;
  amount_net: string;
  custom_str1?: string;
  custom_str2?: string;
  custom_str3?: string;
  name_first?: string;
  name_last?: string;
  email_address: string;
  merchant_id: string;
  signature: string;
}

export { config as payfastConfig };
