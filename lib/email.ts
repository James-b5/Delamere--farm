// lib/email.ts - Email Service using Resend
// lib/email.ts - Email Service using Resend
import { Resend } from 'resend';

let resend: any;
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
} else {
  console.log('[DEV] Resend API key missing, email functions will be no-ops');
  resend = { emails: { send: async () => ({ id: 'dev-mode' }) } };
}
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'info@delamerefarm.co.ke';

// Send contact form email to admin
export async function sendContactFormEmail(
  name: string,
  email: string,
  phone: string | undefined,
  subject: string | undefined,
  message: string
) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.log(`📧 [DEV] Contact form from ${name} (${email}): ${message}`);
      return { success: true, id: 'dev-mode' };
    }

    const result = await resend.emails.send({
      from: 'contact@delamerefarm.co.ke',
      to: ADMIN_EMAIL,
      reply_to: email,
      subject: `New Contact Form: ${subject || 'No Subject'}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5;">
          <div style="background: white; padding: 20px; border-radius: 8px; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #15803d;">New Contact Form Submission</h2>
            <div style="margin: 20px 0; padding: 15px; background: #f9fafb; border-left: 4px solid #15803d;">
              <p><strong>From:</strong> ${name}</p>
              <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
              ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
              ${subject ? `<p><strong>Subject:</strong> ${subject}</p>` : ''}
              <p><strong>Message:</strong></p>
              <p>${message.replace(/\n/g, '<br>')}</p>
            </div>
            <p style="color: #666; font-size: 12px; margin-top: 20px;">
              Reply to: ${email}
            </p>
          </div>
        </div>
      `,
    });

    return { success: true, id: (result as any).id };
  } catch (error) {
    console.error('Failed to send contact email:', error);
    return { success: false, error };
  }
}

// Send booking confirmation email to customer
export async function sendBookingConfirmationEmail(
  email: string,
  name: string,
  bookingData: {
    bookingDate?: string | Date;
    numberOfPeople?: number;
    date?: string;
    participants?: number;
    bookingType?: string;
    program?: string;
  }
) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.log(`📧 [DEV] Booking confirmation for ${name} (${email})`);
      return { success: true, id: 'dev-mode' };
    }

    const bookingDate = bookingData.bookingDate || bookingData.date;
    const participants = bookingData.numberOfPeople || bookingData.participants || 1;

    const result = await resend.emails.send({
      from: 'bookings@delamerefarm.co.ke',
      to: email,
      subject: 'Booking Confirmation - Delamere Farm',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5;">
          <div style="background: white; padding: 20px; border-radius: 8px; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #15803d;">Booking Confirmed!</h2>
            <p>Hi ${name},</p>
            <p>Thank you for booking with Delamere Farm. Here are your booking details:</p>
            <div style="margin: 20px 0; padding: 15px; background: #f0fdf4; border-left: 4px solid #15803d;">
              ${bookingData.bookingType ? `<p><strong>Booking Type:</strong> ${bookingData.bookingType}</p>` : ''}
              ${bookingData.program ? `<p><strong>Program:</strong> ${bookingData.program}</p>` : ''}
              <p><strong>Date:</strong> ${new Date(bookingDate as any).toLocaleDateString('en-KE')}</p>
              <p><strong>Participants:</strong> ${participants}</p>
            </div>
            <p style="margin-top: 20px;">We'll send you a confirmation once we receive your booking request.</p>
            <p style="color: #666; font-size: 12px; margin-top: 20px;">
              Questions? Contact us at ${ADMIN_EMAIL}
            </p>
          </div>
        </div>
      `,
    });

    return { success: true, id: (result as any).id };
  } catch (error) {
    console.error('Failed to send booking confirmation email:', error);
    return { success: false, error };
  }
}

// Send order confirmation email
export async function sendOrderConfirmationEmail(
  email: string,
  customerName: string,
  orderId: string,
  orderData: {
    items: Array<{ name: string; quantity: number; price: number }>;
    totalAmount: number;
    shippingAddress?: string;
  }
) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.log(`📧 [DEV] Order confirmation ${orderId} for ${customerName}`);
      return { success: true, id: 'dev-mode' };
    }

    const itemsHtml = orderData.items
      .map(
        (item) =>
          `<tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 10px; text-align: left;">${item.name}</td>
            <td style="padding: 10px; text-align: center;">${item.quantity}</td>
            <td style="padding: 10px; text-align: right;">KES ${item.price.toLocaleString()}</td>
          </tr>`
      )
      .join('');

    const result = await resend.emails.send({
      from: 'orders@delamerefarm.co.ke',
      to: email,
      subject: `Order Confirmation - ${orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5;">
          <div style="background: white; padding: 20px; border-radius: 8px; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #15803d;">Order Confirmed!</h2>
            <p>Hi ${customerName},</p>
            <p>Your order has been received. Order ID: <strong>${orderId}</strong></p>
            
            <h3 style="color: #333; margin-top: 20px;">Order Items</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <thead>
                <tr style="background: #f0fdf4;">
                  <th style="padding: 10px; text-align: left; border-bottom: 2px solid #15803d;">Product</th>
                  <th style="padding: 10px; text-align: center; border-bottom: 2px solid #15803d;">Qty</th>
                  <th style="padding: 10px; text-align: right; border-bottom: 2px solid #15803d;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <div style="padding: 15px; background: #f0fdf4; border-radius: 4px; margin: 20px 0;">
              <p style="text-align: right; font-size: 18px; font-weight: bold; color: #15803d; margin: 0;">
                Total: KES ${orderData.totalAmount.toLocaleString()}
              </p>
            </div>

            ${orderData.shippingAddress ? `<p><strong>Shipping Address:</strong> ${orderData.shippingAddress}</p>` : ''}

            <p style="margin-top: 20px;">You will receive a payment link shortly.</p>
            <p style="color: #666; font-size: 12px; margin-top: 20px;">
              Questions? Contact us at ${ADMIN_EMAIL}
            </p>
          </div>
        </div>
      `,
    });

    return { success: true, id: (result as any).id };
  } catch (error) {
    console.error('Failed to send order confirmation email:', error);
    return { success: false, error };
  }
}

// Send payment confirmation email
export async function sendPaymentConfirmationEmail(
  email: string,
  customerName: string,
  paymentData: {
    orderId: string;
    transactionId: string;
    amount: number;
    provider: string;
  }
) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.log(`📧 [DEV] Payment confirmation for ${customerName}`);
      return { success: true, id: 'dev-mode' };
    }

    const result = await resend.emails.send({
      from: 'payments@delamerefarm.co.ke',
      to: email,
      subject: `Payment Confirmed - Delamere Farm`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5;">
          <div style="background: white; padding: 20px; border-radius: 8px; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #15803d;">✓ Payment Received</h2>
            <p>Hi ${customerName},</p>
            <p>Your payment has been successfully received. Thank you for your purchase!</p>
            
            <div style="margin: 20px 0; padding: 15px; background: #f0fdf4; border-left: 4px solid #15803d;">
              <p><strong>Order ID:</strong> ${paymentData.orderId}</p>
              <p><strong>Transaction ID:</strong> ${paymentData.transactionId}</p>
              <p><strong>Amount:</strong> KES ${paymentData.amount.toLocaleString()}</p>
              <p><strong>Payment Method:</strong> ${paymentData.provider}</p>
            </div>

            <p>Your order is now being processed. You'll receive updates as it progresses.</p>
            <p style="color: #666; font-size: 12px; margin-top: 20px;">
              Questions? Contact us at ${ADMIN_EMAIL}
            </p>
          </div>
        </div>
      `,
    });

    return { success: true, id: (result as any).id };
  } catch (error) {
    console.error('Failed to send payment confirmation email:', error);
    return { success: false, error };
  }
}

// Send admin notification
export async function sendAdminNotification(
  subject: string,
  message: string
) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.log(`📧 [DEV] Admin notification: ${subject}`);
      return { success: true, id: 'dev-mode' };
    }

    const result = await resend.emails.send({
      from: 'system@delamerefarm.co.ke',
      to: ADMIN_EMAIL,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>${subject}</h2>
          <p>${message.replace(/\n/g, '<br>')}</p>
        </div>
      `,
    });

    return { success: true, id: (result as any).id };
  } catch (error) {
    console.error('Failed to send admin notification:', error);
    return { success: false, error };
  }
}

export async function sendPaymentConfirmation(
  email: string,
  paymentData: {
    orderId: string;
    transactionId: string;
    amount: number;
    phoneNumber?: string;
    customerName?: string;
    deliveryAddress?: string;
    provider: string;
  }
) {
  const { orderId, transactionId, amount, phoneNumber, customerName, deliveryAddress, provider } = paymentData;
  
  await resend.emails.send({
    from: 'no-reply@delamerefarm.co.ke',
    to: email,
    subject: 'Payment Confirmed - Your Order is Ready! 🎉',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #15803d; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0;">Payment Confirmed!</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
          <p style="font-size: 16px; color: #374151;">Dear ${customerName || 'Valued Customer'},</p>
          
          <p style="font-size: 14px; color: #6b7280; margin: 15px 0;">Your payment has been successfully processed. Your order is now confirmed and ready for fulfillment.</p>
          
          <div style="background: white; border: 2px solid #dcfce7; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <h3 style="color: #15803d; margin-top: 0;">Order Details</h3>
            <p style="margin: 8px 0;"><strong>Order ID:</strong> ${orderId}</p>
            <p style="margin: 8px 0;"><strong>Transaction ID:</strong> ${transactionId}</p>
            <p style="margin: 8px 0;"><strong>Amount:</strong> KES ${amount.toLocaleString()}</p>
            <p style="margin: 8px 0;"><strong>Provider:</strong> ${provider}</p>
            ${phoneNumber ? `<p style="margin: 8px 0;"><strong>M-Pesa Phone:</strong> ${phoneNumber}</p>` : ''}
            ${deliveryAddress ? `<p style="margin: 8px 0;"><strong>Delivery Address:</strong> ${deliveryAddress}</p>` : ''}
          </div>
          
          <p style="font-size: 14px; color: #6b7280; margin: 15px 0;">
            <strong>What's Next?</strong><br/>
            We will process your order immediately and send you a tracking number via SMS or email within 2-4 hours.
          </p>
          
          <div style="margin: 25px 0;">
            <a href="https://delamerefarm.co.ke/dashboard" style="background: #15803d; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">View Order Status</a>
          </div>
          
          <p style="font-size: 12px; color: #9ca3af; margin-top: 20px; border-top: 1px solid #e5e7eb; padding-top: 15px;">
            If you have any questions, please contact us at info@delamerefarm.co.ke or call +254 XXX XXXX
          </p>
        </div>
      </div>
    `
  });
}

export async function sendPaymentFailureNotification(
  email: string,
  paymentData: {
    orderId?: string;
    amount: number;
    reason: string;
    phoneNumber?: string;
    customerName?: string;
  }
) {
  const { orderId, amount, reason, phoneNumber, customerName } = paymentData;
  
  await resend.emails.send({
    from: 'no-reply@delamerefarm.co.ke',
    to: email,
    subject: 'Payment Failed - Please Try Again',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0;">Payment Failed</h1>
        </div>
        <div style="background: #fef2f2; padding: 30px; border: 1px solid #fecaca; border-radius: 0 0 8px 8px;">
          <p style="font-size: 16px; color: #374151;">Dear ${customerName || 'Valued Customer'},</p>
          
          <p style="font-size: 14px; color: #6b7280; margin: 15px 0;">
            Unfortunately, your payment could not be processed. <strong>Reason: ${reason}</strong>
          </p>
          
          <div style="background: white; border: 2px solid #fee2e2; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <p style="margin: 8px 0;"><strong>Amount:</strong> KES ${amount.toLocaleString()}</p>
            ${orderId ? `<p style="margin: 8px 0;"><strong>Order ID:</strong> ${orderId}</p>` : ''}
            ${phoneNumber ? `<p style="margin: 8px 0;"><strong>M-Pesa Phone:</strong> ${phoneNumber}</p>` : ''}
          </div>
          
          <p style="font-size: 14px; color: #6b7280; margin: 15px 0;">
            <strong>Please try again:</strong><br/>
            • Check your M-Pesa PIN entry<br/>
            • Ensure you have sufficient M-Pesa balance<br/>
            • Try a different payment method
          </p>
          
          <div style="margin: 25px 0;">
            <a href="https://delamerefarm.co.ke/checkout" style="background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Retry Payment</a>
          </div>
          
          <p style="font-size: 12px; color: #9ca3af; margin-top: 20px; border-top: 1px solid #fee2e2; padding-top: 15px;">
            Need help? Contact us at info@delamerefarm.co.ke
          </p>
        </div>
      </div>
    `
  });
}

export async function sendAdminPaymentNotification(
  adminEmail: string,
  paymentData: {
    orderId: string;
    transactionId: string;
    amount: number;
    status: string;
    customerName?: string;
    phoneNumber?: string;
    provider: string;
  }
) {
  const { orderId, transactionId, amount, status, customerName, phoneNumber, provider } = paymentData;
  
  await resend.emails.send({
    from: 'no-reply@delamerefarm.co.ke',
    to: adminEmail,
    subject: `[${status}] Payment Notification - Order ${orderId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1f2937; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0;">Payment ${status}</h1>
        </div>
        <div style="background: #f3f4f6; padding: 20px; border: 1px solid #d1d5db; border-radius: 0 0 8px 8px; font-size: 14px;">
          <p><strong>Order ID:</strong> ${orderId}</p>
          <p><strong>Status:</strong> ${status}</p>
          <p><strong>Amount:</strong> KES ${amount.toLocaleString()}</p>
          <p><strong>Customer:</strong> ${customerName || 'N/A'} (${phoneNumber || 'N/A'})</p>
          <p><strong>Provider:</strong> ${provider}</p>
          <p><strong>Transaction ID:</strong> ${transactionId}</p>
          <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
        </div>
      </div>
    `
  });
}


// Usage in checkout API: await sendBookingConfirmation(email, bookingData, cart.total);
