import { NextResponse } from "next/server";

/**
 * POST /api/payments/intasend
 * Initiates an M-Pesa STK push via IntaSend
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone_number, amount, narrative, email, name, address } = body;

    // Validate required fields
    if (!phone_number || !amount || !email) {
      return NextResponse.json(
        { 
          error: "Phone number, amount, and email are required",
          message: "Please provide all required payment details"
        },
        { status: 400 }
      );
    }

    // Normalize and validate phone number into the canonical 2547XXXXXXXX format
    const normalizePhoneNumber = (raw?: string) => {
      if (!raw) return null;
      let s = String(raw).trim();
      s = s.replace(/[\s\-().]/g, "");
      if (s.startsWith("+")) s = s.slice(1);
      if (s.startsWith("0")) s = "254" + s.slice(1);
      if (s.startsWith("7") && s.length === 9) s = "254" + s;
      if (!/^\d{12}$/.test(s)) return null;
      if (!s.startsWith("2547")) return null;
      return s;
    };

    const normalizedPhone = normalizePhoneNumber(phone_number);
    if (!normalizedPhone) {
      return NextResponse.json(
        {
          error: "Invalid phone number format",
          message: "Phone number must be in Kenyan format, e.g. 2547XXXXXXXX",
        },
        { status: 400 }
      );
    }

    const secretKey = process.env.INTASEND_SECRET_KEY;
    const baseUrl = process.env.INTASEND_BASE_URL;

    if (!secretKey || !baseUrl) {
      console.error("Missing IntaSend configuration");
      return NextResponse.json(
        { 
          error: "Payment service not configured",
          message: "Payment gateway is temporarily unavailable. Please try another payment method."
        },
        { status: 500 }
      );
    }

    // Call IntaSend API to initiate M-Pesa STK Push
    const response = await fetch(`${baseUrl}/payment/mpesa/stk-push/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secretKey}`,
      },
      body: JSON.stringify({
        phone_number: normalizedPhone,
        amount: amount,
        narrative: narrative || `Order payment for ${name}`,
        email: email,
        currency: "KES",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("IntaSend API error:", data);
      return NextResponse.json(
        {
          error: data.detail || data.error || "Failed to initiate payment",
          message:
            data.message ||
            "Please check your details and try again or contact support.",
        },
        { status: response.status }
      );
    }

    // Validate response has request_id
    const requestId = data.request_id || data.id;
    if (!requestId) {
      console.error("IntaSend API returned no request ID:", data);
      return NextResponse.json(
        {
          error: "Payment gateway returned invalid response",
          message: "Failed to process payment. Please try again.",
        },
        { status: 500 }
      );
    }

    // Return the request ID for status polling
    return NextResponse.json({
      request_id: requestId,
      message: "STK push sent successfully",
      phone_number: normalizedPhone,
      amount: amount,
    });
  } catch (error) {
    console.error("IntaSend payment error:", error);
    
    // Provide helpful error messages
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        error: "Internal server error",
        message:
          "An unexpected error occurred. Please try again or contact support.",
        details:
          process.env.NODE_ENV === "development" ? errorMessage : undefined,
      },
      { status: 500 }
    );
  }
}
