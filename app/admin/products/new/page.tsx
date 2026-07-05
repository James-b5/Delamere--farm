"use client";

import ProductUploadForm from "@/components/ProductUploadForm";
import { WhatsAppButton } from "@/components/WhatsAppButton";

export default function NewProductPage() {
  return (
    <div className="max-w-4xl mx-auto py-12">
      <ProductUploadForm />
      <WhatsAppButton />
    </div>
  );
}
