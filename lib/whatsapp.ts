export function buildWhatsAppLink(message?: string) {
  const direct = process.env.NEXT_PUBLIC_WHATSAPP_LINK;
  const qr = process.env.NEXT_PUBLIC_WHATSAPP_QR;
  const num = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

  if (direct && direct.trim() !== "") {
    return message ? `${direct}${direct.includes('?') ? '&' : '?'}text=${encodeURIComponent(message)}` : direct;
  }

  if (qr && qr.trim() !== "") {
    return `https://wa.me/qr/${qr}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
  }

  if (num && num.trim() !== "") {
    const digits = num.replace(/[^0-9]/g, "");
    return `https://wa.me/${digits}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
  }

  return `https://www.whatsapp.com/`;
}
