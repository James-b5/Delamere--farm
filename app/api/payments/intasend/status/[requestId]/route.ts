import { NextResponse } from "next/server";

/**
 * GET /api/payments/intasend/status/[requestId]
 * Check payment status with IntaSend
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const { requestId } = await params;

    if (!requestId) {
      console.warn("⚠️  Payment status check: Missing request ID");
      return NextResponse.json(
        { error: "Request ID is required" },
        { status: 400 }
      );
    }

    const secretKey = process.env.INTASEND_SECRET_KEY;
    const baseUrl = process.env.INTASEND_BASE_URL;

    if (!secretKey || !baseUrl) {
      console.error("❌ Payment service not configured");
      return NextResponse.json(
        {
          error: "Payment service not configured",
          status: "UNKNOWN",
        },
        { status: 500 }
      );
    }

    console.log(`🔍 Checking payment status: ${requestId}`);

    // Call IntaSend API to get payment status
    const response = await fetch(`${baseUrl}/payment/status/${requestId}/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secretKey}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`❌ IntaSend status check error for ${requestId}:`, data);
      return NextResponse.json(
        {
          status: "UNKNOWN",
          error: data.detail || data.error || "Failed to check status",
          request_id: requestId,
        },
        { status: response.status }
      );
    }

    const normalizedStatus = normalizeStatus(data.status);
    console.log(
      `📊 Payment status: ${requestId} → ${normalizedStatus} (IntaSend: ${data.status})`
    );

    // Return normalized status
    return NextResponse.json({
      request_id: requestId,
      status: normalizedStatus,
      intasend_status: data.status,
      amount: data.amount,
      phone_number: data.phone_number,
      transaction_id: data.transaction_id || null,
      created_at: data.created_at,
      completed_at: data.completed_at || null,
      metadata: data.metadata || {},
    });
  } catch (error) {
    console.error("❌ Payment status check error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        status: "UNKNOWN",
        details:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.message
              : "Unknown error"
            : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * Normalize IntaSend status to standard statuses
 */
function normalizeStatus(intasendStatus: string): string {
  const statusMap: { [key: string]: string } = {
    PENDING: "PENDING",
    PROCESSING: "PENDING",
    COMPLETED: "COMPLETED",
    SUCCESSFUL: "COMPLETED",
    PAID: "COMPLETED",
    FAILED: "FAILED",
    CANCELLED: "FAILED",
    EXPIRED: "FAILED",
  };

  return statusMap[intasendStatus] || "UNKNOWN";
}
