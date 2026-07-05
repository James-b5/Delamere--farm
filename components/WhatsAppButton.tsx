import React from "react";
import { buildWhatsAppLink } from "@/lib/whatsapp";

const PRESET_MESSAGE = "Hello, I'd like to inquire about your products and proceed to checkout";

export const WhatsAppButton: React.FC = () => {
  const link = buildWhatsAppLink(PRESET_MESSAGE);
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="whatsapp-btn flex items-center gap-2 rounded-xl px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-lg transition-transform hover:scale-105 backdrop-blur-sm bg-opacity-30 border border-white/20"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 448 512"
        className="h-5 w-5 fill-current"
        aria-hidden="true"
      >
        <path d="M380.9 97.1C339 55.2 283.5 32 224 32 100.3 32 0 132.3 0 256c0 45.5 12.5 89.7 36.1 128L0 480l99.5-32.6c36.4 20 77.5 30.6 119.5 30.6 123.7 0 224-100.3 224-224 0-59.5-23.2-115-65.1-156.9zM224 426c-36.3 0-71.8-9.8-102.5-28.3l-7.3-4.4-59.1 19.4 19.6-58.1-4.6-7.5C73.3 306.5 64 282.5 64 256c0-88.2 71.8-160 160-160s160 71.8 160 160-71.8 160-160 160zm92.1-110.5l-22.6-11.4c-3.1-1.5-6.6-2.3-10.2-2.3-10.9 0-19.8 8.9-19.8 19.8 0 5.5 2.2 10.6 5.9 14.4l9.9 10c-30.5 23.5-71.5 33.7-112 24.8-13.4-2.9-27.1-8.2-39.1-15.3l-30.4 30.2c-2.9 2.9-7.5 2.9-10.4 0l-32.7-32.7c-2.9-2.9-2.9-7.5 0-10.4l30.2-30.4c-7.1-12-12.5-25.6-15.4-39-8.9-40.5 1.4-81.7 24.9-112.2l10 9.9c3.8 3.7 8.9 5.9 14.4 5.9 10.9 0 19.8-8.9 19.8-19.8 0-3.6-.8-7.1-2.2-10.2l-11.4-22.6c-1.9-3.8-5.9-6.3-10.1-6.3H140c-5.2 0-9.9 3.2-11.8 8.1-13.9 35.5-15.1 75.3-3.4 111.7 22.9 68.3 82.6 119.5 155.9 131.5 38.1 6.2 77.8 2.2 111.7-12 4.9-1.9 8.1-6.6 8.1-11.8v-39c0-4.2-2.5-8.2-6.3-10.1z" />
      </svg>
      <span>Chat on WhatsApp</span>
    </a>
  );
};
