import { NextRequest, NextResponse } from "next/server";

interface NewsletterEmail {
  email: string;
  name?: string;
  phone?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: NewsletterEmail = await request.json();
    const { email, name, phone } = body;

    // Validate email
    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Please provide a valid email address" },
        { status: 400 }
      );
    }

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Here you would typically:
    // 1. Save to a database
    // 2. Add to an email service like Mailchimp, SendGrid, etc.
    // 3. Send confirmation email

    // For now, we'll simulate a successful subscription
    // In production, replace this with actual integration
    
    // Example: Save to database (pseudo-code)
    // await db.newsletter_subscribers.create({ email, name, phone, createdAt: new Date() });

    // Example: Add to Mailchimp (pseudo-code)
    // await mailchimp.lists.addListMember(listId, { email_address: email, status: 'subscribed' });

    console.log(`Newsletter subscription: ${email}`, { name, phone });

    return NextResponse.json(
      { 
        success: true, 
        message: "Successfully subscribed to our newsletter!" 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return NextResponse.json(
      { error: "Failed to subscribe. Please try again later." },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: "Newsletter API is running. Use POST to subscribe." },
    { status: 200 }
  );
}
