// Form submission handler utility

type FormData = Record<string, unknown>;

interface ApiResponse {
  message?: string;
  error?: string;
  bookingId?: string;
}

export async function submitContactForm(data: FormData): Promise<ApiResponse> {
  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return await response.json();
  } catch (error) {
    console.error('Contact form submission error:', error);
    return { error: 'Failed to submit form. Please try again.' };
  }
}

export async function submitBookingForm(data: FormData): Promise<ApiResponse> {
  try {
    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return await response.json();
  } catch (error) {
    console.error('Booking form submission error:', error);
    return { error: 'Failed to submit booking. Please try again.' };
  }
}

/**
 * Alternative: Using Formspree (no backend required)
 * 
 * To use Formspree:
 * 1. Register at https://formspree.io
 * 2. Create a new form and get your form ID
 * 3. Replace the form action in your component
 * 
 * Example:
 * <form action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
 */

// Formspree configuration (replace with your actual form ID)
export const FORMSPREE_CONFIG = {
  contactFormId: 'YOUR_CONTACT_FORM_ID', // Replace with actual Formspree form ID
  bookingFormId: 'YOUR_BOOKING_FORM_ID', // Replace with actual Formspree form ID
};

export async function submitToFormspree(formId: string, data: FormData): Promise<ApiResponse> {
  try {
    const response = await fetch(`https://formspree.io/f/${formId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      return { message: 'Thank you! We will get back to you soon.' };
    }
    
    return { error: 'Failed to submit form. Please try again.' };
  } catch (error) {
    console.error('Formspree submission error:', error);
    return { error: 'Failed to submit form. Please try again.' };
  }
}

/**
 * Alternative: Using EmailJS (no backend required)
 * 
 * To use EmailJS:
 * 1. Register at https://www.emailjs.com/
 * 2. Create an email service and template
 * 3. Install: npm install @emailjs/browser
 * 4. Use the EmailJS SDK in your component
 * 
 * Example:
 * import emailjs from '@emailjs/browser';
 * 
 * await emailjs.send(
 *   'YOUR_SERVICE_ID',
 *   'YOUR_TEMPLATE_ID',
 *   { name, email, message },
 *   'YOUR_PUBLIC_KEY'
 * );
 */

export const EMAILJS_CONFIG = {
  serviceId: 'YOUR_SERVICE_ID', // Replace with actual EmailJS service ID
  templateId: 'YOUR_TEMPLATE_ID', // Replace with actual EmailJS template ID
  publicKey: 'YOUR_PUBLIC_KEY', // Replace with actual EmailJS public key
};
