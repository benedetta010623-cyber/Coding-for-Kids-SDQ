import React, { useState } from 'react';
import { Gamepad2, FileText, ImageIcon, Code2, Palette } from 'lucide-react';
import { formatImageUrl } from '../lib/utils';

interface ProjectThumbnailProps {
  imageUrl?: string;
  title?: string;
  type?: string;
  category?: string;
  className?: string;
  imgClassName?: string;
  badge?: React.ReactNode;
}

export default function ProjectThumbnail({
  imageUrl,
  title = '',
  type = '',
  category = '',
  className = 'w-full h-full',
  imgClassName = 'w-full h-full object-cover',
  badge
}: ProjectThumbnailProps) {
  const [imgError, setImgError] = useState(false);

  const formattedUrl = formatImageUrl(imageUrl);

  if (formattedUrl && !imgError) {
    return (
      <div className={`relative overflow-hidden bg-gray-100 ${className}`}>
        <img
          src={formattedUrl}
          alt={title || 'Project thumbnail'}
          onError={() => setImgError(true)}
          referrerPolicy="no-referrer"
          loading="lazy"
          decoding="async"
          className={imgClassName}
        />
        {badge}
      </div>
    );
  }

  // Fallback card when no imageUrl or when image fails to load
  const lowerType = (type || '').toLowerCase();
  const lowerCat = (category || '').toLowerCase();
  const lowerTitle = (title || '').toLowerCase();

  let icon = <Code2 className="w-10 h-10 md:w-12 md:h-12 text-black stroke-[2.5]" />;
  let bgClass = 'bg-gradient-to-br from-[#A855F7] via-[#C084FC] to-[#E9D5FF]';
  let typeLabel = 'PROJECT';

  if (
    lowerType === 'scratch' || 
    lowerCat.includes('scratch') || 
    lowerCat.includes('game') || 
    lowerCat.includes('permainan') ||
    lowerTitle.includes('scratch')
  ) {
    icon = <Gamepad2 className="w-10 h-10 md:w-12 md:h-12 text-black stroke-[2.5]" />;
    bgClass = 'bg-gradient-to-br from-[#FFE66D] via-[#FFD93D] to-[#FF9F43]';
    typeLabel = 'SCRATCH GAME';
  } else if (
    lowerType === 'document' || 
    lowerType === 'doc' || 
    lowerCat.includes('doc') || 
    lowerCat.includes('pdf') || 
    lowerCat.includes('laporan') || 
    lowerCat.includes('tugas') ||
    lowerCat.includes('makalah') ||
    lowerCat.includes('dokumen')
  ) {
    icon = <FileText className="w-10 h-10 md:w-12 md:h-12 text-black stroke-[2.5]" />;
    bgClass = 'bg-gradient-to-br from-[#4ECDC4] via-[#45B7D1] to-[#2AB7CA]';
    typeLabel = 'DOKUMEN';
  } else if (
    lowerType === 'image' || 
    lowerType === 'art' || 
    lowerCat.includes('desain') || 
    lowerCat.includes('gambar') || 
    lowerCat.includes('art') || 
    lowerCat.includes('foto') ||
    lowerCat.includes('grafis') ||
    lowerCat.includes('paint')
  ) {
    icon = <Palette className="w-10 h-10 md:w-12 md:h-12 text-black stroke-[2.5]" />;
    bgClass = 'bg-gradient-to-br from-[#FF6B6B] via-[#FF8E8E] to-[#FFA0A0]';
    typeLabel = 'DESAIN / ART';
  }

  return (
    <div className={`relative overflow-hidden ${bgClass} flex flex-col items-center justify-center p-4 text-center select-none ${className}`}>
      {/* Decorative pattern */}
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:10px_10px]" />
      
      <div className="relative z-10 p-3 bg-white border-3 md:border-4 border-black rounded-2xl shadow-[4px_4px_0px_black] transform -rotate-2 hover:rotate-0 transition-transform">
        {icon}
      </div>
      
      <span className="relative z-10 mt-2 font-['Fredoka_One'] text-[10px] md:text-xs uppercase tracking-wider bg-black text-white px-2.5 py-0.5 rounded-md shadow-[2px_2px_0px_white]">
        {typeLabel}
      </span>

      {badge}
    </div>
  );
}
