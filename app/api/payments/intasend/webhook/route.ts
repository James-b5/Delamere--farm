import { NextResponse } from "next/server";
import crypto from "crypto";
import {
  sendPaymentConfirmation,
  sendPaymentFailureNotification,
  sendAdminPaymentNotification,
} from "@/lib/email";

/**
 * POST /api/payments/intasend/webhook
 * Receives webhooks from IntaSend when payment is completed/failed
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const signature = request.headers.get("x-intasend-signature");

    console.log("📨 IntaSend webhook received");

    // Verify webhook signature for security
    if (signature) {
      if (!verifyWebhookSignature(body, signature)) {
        console.warn("❌ Invalid webhook signature - rejecting");
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401 }
        );
      }
      console.log("✅ Webhook signature verified");
    } else {
      console.warn(
        "⚠️  No webhook signature provided - continuing in development mode"
      );
    }

    // Extract payment details
    const {
      status,
      request_id,
      phone_number,
      amount,
      currency,
      transaction_id,
      email,
      metadata,
    } = body;

    console.log("📋 Webhook data:", {
      status,
      request_id,
      phone_number,
      amount,
      transaction_id,
    });

    // Handle different payment statuses
    switch (status) {
      case "COMPLETED":
      case "SUCCESSFUL":
        console.log(`✅ Processing successful payment: ${request_id}`);
        await handleSuccessfulPayment({
          request_id,
          transaction_id,
          phone_number,
          amount,
          currency,
          email,
          metadata,
        });
        break;

      case "FAILED":
      case "CANCELLED":
        console.log(`❌ Processing failed payment: ${request_id}`);
        await handleFailedPayment({
          request_id,
          phone_number,
          amount,
          email,
          reason: body.reason || "Payment failed",
          metadata,
        });
        break;

      case "PENDING":
        console.log(`⏳ Payment ${request_id} still pending`);
        break;

      default:
        console.warn(`⚠️  Unknown payment status: ${status}`);
    }

    // Return success to acknowledge receipt
    console.log(`✅ Webhook processed successfully: ${request_id}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Webhook processing error:", error);
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/payments/intasend/webhook
 * IntaSend webhook status endpoint
 */
export async function GET() {
  return NextResponse.json({ status: "webhook endpoint active" });
}

/**
 * Verify the webhook signature using IntaSend's public key
 */
function verifyWebhookSignature(body: any, signature: string): boolean {
  // In development, skip signature verification for easier testing
  if (process.env.NODE_ENV === "development") {
    console.log("⚠️  Webhook signature verification skipped in development");
    return true;
  }

  try {
    const secret = process.env.INTASEND_WEBHOOK_SECRET;
    
    // If no secret is configured, warn and allow in development
    if (!secret) {
      console.warn(
        "⚠️  INTASEND_WEBHOOK_SECRET not configured. Webhook signature verification disabled."
      );
      return true;
    }

    const payload = JSON.stringify(body);
    const hash = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");
    
    const isValid = hash === signature;
    
    if (!isValid) {
      console.error("❌ Invalid webhook signature");
      console.debug(`Expected: ${hash}, Received: ${signature}`);
    }
    
    return isValid;
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
}

/**
 * Handle successful payment
 */
async function handleSuccessfulPayment(paymentData: {
  request_id: string;
  transaction_id: string;
  phone_number: string;
  amount: number;
  currency: string;
  email?: string;
  metadata?: any;
}) {
  const {
    request_id,
    transaction_id,
    phone_number,
    amount,
    currency,
    email,
    metadata,
  } = paymentData;

  try {
    // Check if database is configured
    if (!process.env.DATABASE_URL) {
      console.warn("DATABASE_URL not configured, skipping payment storage");
      // Still send emails even if no database
      if (email) {
        await sendPaymentConfirmation(email, {
          orderId: request_id,
          transactionId: transaction_id,
          amount,
          phoneNumber: phone_number,
          customerName: metadata?.customer_name,
          deliveryAddress: metadata?.delivery_address,
          provider: "IntaSend M-Pesa",
        });
        console.log(`📧 Confirmation email sent to ${email}`);
      }
      return;
    }

    try {
      // Dynamically import PrismaClient only when needed
      // @ts-ignore - Prisma may not be installed in some deployments
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient({ log: ["error"] });

      // 1. Create or update Payment record
      const payment = await (prisma as any).payment.upsert({
        where: { requestId: request_id },
        update: {
          status: "COMPLETED",
          transactionId: transaction_id,
          completedAt: new Date(),
        },
        create: {
          requestId: request_id,
          provider: "INTASEND",
          status: "COMPLETED",
          amount,
          currency,
          phoneNumber: phone_number,
          email,
          transactionId: transaction_id,
          narrative: metadata?.narrative || "Order Payment",
          metadata,
          completedAt: new Date(),
        },
      });

      console.log(`✅ Payment saved: ${transaction_id}`);

      // 2. Update Order status if linked
      if (payment.orderId) {
        await prisma.order.update({
          where: { id: payment.orderId },
          data: {
            status: "PROCESSING",
          },
        });

        console.log(`✅ Order updated: ${payment.orderId}`);
      }

      await prisma.$disconnect();
    } catch (prismaError) {
      console.warn("Prisma error - database not available:", prismaError);
    }

    // 3. Send confirmation email to customer
    if (email) {
      await sendPaymentConfirmation(email, {
        orderId: request_id,
        transactionId: transaction_id,
        amount,
        phoneNumber: phone_number,
        customerName: metadata?.customer_name,
        deliveryAddress: metadata?.delivery_address,
        provider: "IntaSend M-Pesa",
      });

      console.log(`📧 Confirmation email sent to ${email}`);
    }

    // 4. Send admin notification
    const adminEmail = process.env.ADMIN_EMAIL || "admin@delamerefarm.co.ke";
    if (adminEmail) {
      await sendAdminPaymentNotification(adminEmail, {
        orderId: request_id,
        transactionId: transaction_id,
        amount,
        status: "COMPLETED",
        customerName: metadata?.customer_name,
        phoneNumber: phone_number,
        provider: "IntaSend",
      });

      console.log(`📊 Admin notification sent to ${adminEmail}`);
    }
  } catch (error) {
    console.error("Error handling successful payment:", error);
  }
}

/**
 * Handle failed payment
 */
async function handleFailedPayment(failureData: {
  request_id: string;
  phone_number: string;
  amount: number;
  email?: string;
  reason: string;
  metadata?: any;
}) {
  const { request_id, phone_number, amount, email, reason, metadata } =
    failureData;

  try {
    // Check if database is configured
    if (!process.env.DATABASE_URL) {
      console.warn("DATABASE_URL not configured, skipping payment storage");
      // Still send emails even if no database
      if (email) {
        await sendPaymentFailureNotification(email, {
          orderId: "N/A",
          amount,
          reason,
          phoneNumber: phone_number,
          customerName: metadata?.customer_name,
        });
        console.log(`📧 Failure notification sent to ${email}`);
      }
      return;
    }

    try {
      // Dynamically import PrismaClient only when needed
      // @ts-ignore - Prisma may not be installed in some deployments
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient({ log: ["error"] });

      // 1. Create or update Payment record with failure status
      const payment = await (prisma as any).payment.upsert({
        where: { requestId: request_id },
        update: {
          status: "FAILED",
          errorMessage: reason,
          updatedAt: new Date(),
        },
        create: {
          requestId: request_id,
          provider: "INTASEND",
          status: "FAILED",
          amount,
          currency: "KES",
          phoneNumber: phone_number,
          email,
          errorMessage: reason,
          narrative: metadata?.narrative || "Order Payment",
          metadata,
        },
      });

      console.log(`❌ Payment failed: ${request_id} - ${reason}`);

      await prisma.$disconnect();
    } catch (prismaError) {
      console.warn("Prisma error - database not available:", prismaError);
    }

    // 2. Send failure notification to customer
    if (email) {
      await sendPaymentFailureNotification(email, {
        orderId: "N/A",
        amount,
        reason,
        phoneNumber: phone_number,
        customerName: metadata?.customer_name,
      });

      console.log(`📧 Failure notification sent to ${email}`);
    }

    // 3. Send admin notification
    const adminEmail = process.env.ADMIN_EMAIL || "admin@delamerefarm.co.ke";
    if (adminEmail) {
      await sendAdminPaymentNotification(adminEmail, {
        orderId: request_id,
        transactionId: request_id,
        amount,
        status: "FAILED",
        customerName: metadata?.customer_name,
        phoneNumber: phone_number,
        provider: "IntaSend",
      });

      console.log(`📊 Admin failure notification sent to ${adminEmail}`);
    }
  } catch (error) {
    console.error("Error handling failed payment:", error);
  }
}
