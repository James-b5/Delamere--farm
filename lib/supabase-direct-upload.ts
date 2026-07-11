import { authenticatedFetch } from '@/lib/fetch-helper';

export type SupabaseUploadSignature = {
  signedUrl: string;
  publicUrl: string;
};

export async function getSupabaseUploadSignature(folder: string, originalName: string, contentType: string): Promise<SupabaseUploadSignature> {
  const response = await authenticatedFetch('/api/admin/supabase-upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ folder, originalName, contentType }),
  });

  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(`Failed to generate Supabase upload signature: ${message}`);
  }

  return response.json();
}

export async function directUploadToSupabase(file: File, folder: string): Promise<string> {
  const { signedUrl, publicUrl } = await getSupabaseUploadSignature(folder, file.name, file.type || 'application/octet-stream');

  const uploadResponse = await fetch(signedUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
    },
    body: file,
  });

  if (!uploadResponse.ok) {
    const message = await uploadResponse.text().catch(() => uploadResponse.statusText);
    throw new Error(`Supabase direct upload failed: ${uploadResponse.status} ${message}`);
  }

  return publicUrl;
}
