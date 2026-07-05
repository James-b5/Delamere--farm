"use client";
import React, { useEffect, useState } from 'react';
import Image from 'next/image';

interface MediaItem {
  id: number;
  type: 'IMAGE' | 'VIDEO';
  url: string;
  title?: string;
  description?: string;
}

export default function MediaCarousel() {
  const [media, setMedia] = useState<MediaItem[]>([]);

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const res = await fetch('/api/admin/media');
        if (!res.ok) throw new Error('Failed to fetch media');
        const data = await res.json();
        setMedia(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMedia();
  }, []);

  if (media.length === 0) return null;

  return (
    <section className="py-12 bg-gray-50">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Featured Media</h2>
      <div className="flex overflow-x-auto space-x-4 px-4 hide-scrollbar">
        {media.map((item) => (
          <div key={item.id} className="shrink-0 w-80 h-48 relative rounded-lg overflow-hidden shadow-lg">
            {item.type === 'IMAGE' ? (
              <Image src={item.url} alt={item.title ?? 'Media'} fill className="object-cover" />
            ) : (
              <video src={item.url} controls className="w-full h-full object-cover" />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
