"use client";

import Image from 'next/image';

export interface FashionPromptCardProps {
  imageUrl: string;
  designer: string;
  brand: string;
  styleDescription: string;
  title?: string;
}

export default function FashionPromptCard({ imageUrl, designer, brand, styleDescription, title }: FashionPromptCardProps) {
  return (
    <div className="relative w-full max-w-xs bg-white rounded-2xl shadow-2xl overflow-hidden border-4 border-pink-200 magazine-card">
      {/* Magazine-style header */}
      <div className="absolute top-0 left-0 w-full flex justify-between items-center px-4 py-2 z-10 bg-gradient-to-r from-pink-100/80 to-purple-100/80">
        <span className="uppercase tracking-widest text-xs font-bold text-pink-600">Fashion Prompt</span>
        {title && <span className="text-xs font-bold text-purple-700 italic">{title}</span>}
      </div>
      {/* Main Image */}
      <div className="w-full h-64 relative">
        <Image
          src={imageUrl}
          alt={title || 'Fashion Prompt'}
          fill
          className="object-cover object-center"
          sizes="(max-width: 400px) 100vw, 400px"
        />
        {/* Magazine overlay effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>
      {/* Card Content */}
      <div className="p-5 flex flex-col gap-2 relative z-10">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-gray-500 uppercase">Designer:</span>
          <span className="text-sm font-bold text-pink-700">{designer}</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-gray-500 uppercase">Brand:</span>
          <span className="text-sm font-bold text-purple-700">{brand}</span>
        </div>
        <div className="mt-2 text-base text-gray-800 font-serif italic border-l-4 border-pink-400 pl-3">
          {styleDescription}
        </div>
      </div>
      {/* Magazine-style footer */}
      <div className="absolute bottom-0 left-0 w-full px-4 py-2 bg-gradient-to-r from-pink-100/80 to-purple-100/80 flex justify-between items-center z-10">
        <span className="text-xs text-gray-500 font-semibold tracking-widest">BRILLIANT STYLIST</span>
        <span className="text-xs text-pink-600 font-bold italic">#StyleCard</span>
      </div>
      {/* Decorative border effect */}
      <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-pink-300 rounded-2xl" />
    </div>
  );
} 