/**
 * ==============================================================================
 * CURATED PERSON-LIKE VECTOR AVATARS (`AvatarPicker`)
 * ==============================================================================
 * Distinct illustrated vector human personas:
 * 1. `avatar-1` (Alex - Corporate Executive / Super Admin)
 * 2. `avatar-2` (Priya - Operations Manager)
 * 3. `avatar-3` (David - Front Desk Concierge)
 * 4. `avatar-4` (Sarah - Leisure Traveler)
 * 5. `avatar-5` (Marcus - Modern Guest)
 * 6. `avatar-6` (Elena - VIP Luxury Guest)
 */

import React from 'react';

export interface AvatarOption {
  id: string;
  name?: string;
  bgColor: string;
  renderSvg: (className?: string) => React.ReactNode;
}

export const AVATAR_PRESETS: AvatarOption[] = [
  {
    id: 'avatar-1',
    bgColor: 'bg-indigo-100',
    renderSvg: (className = 'w-full h-full') => (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <circle cx="50" cy="50" r="50" fill="#E0E7FF" />
        {/* Suit & Shirt */}
        <path d="M20 95 C20 75, 35 68, 50 68 C65 68, 80 75, 80 95 Z" fill="#1E1B4B" />
        <path d="M42 68 L50 82 L58 68 Z" fill="#FFFFFF" />
        <path d="M47 73 L53 73 L51 90 L49 90 Z" fill="#4F46E5" />
        {/* Neck */}
        <rect x="44" y="52" width="12" height="18" rx="4" fill="#FCD34D" />
        {/* Head */}
        <ellipse cx="50" cy="42" rx="18" ry="21" fill="#FDE68A" />
        {/* Hair */}
        <path d="M32 38 C32 24, 40 18, 50 18 C60 18, 68 24, 68 38 C68 28, 62 23, 50 23 C38 23, 32 28, 32 38 Z" fill="#1F2937" />
        <path d="M30 38 Q32 22 50 20 Q68 22 70 38 C68 33 60 26 50 26 C38 26 33 33 30 38 Z" fill="#111827" />
        {/* Eyes & Eyebrows */}
        <circle cx="43" cy="40" r="2" fill="#1F2937" />
        <circle cx="57" cy="40" r="2" fill="#1F2937" />
        <path d="M40 35 Q43 33 46 35" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M54 35 Q57 33 60 35" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round" />
        {/* Smile */}
        <path d="M44 49 Q50 54 56 49" stroke="#92400E" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      </svg>
    ),
  },
  {
    id: 'avatar-2',
    bgColor: 'bg-rose-100',
    renderSvg: (className = 'w-full h-full') => (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <circle cx="50" cy="50" r="50" fill="#FFE4E6" />
        {/* Hair Back */}
        <circle cx="50" cy="42" r="26" fill="#18181B" />
        {/* Clothes */}
        <path d="M22 95 C22 76, 35 68, 50 68 C65 68, 78 76, 78 95 Z" fill="#BE123C" />
        <path d="M42 68 L50 80 L58 68 Z" fill="#FFF1F2" />
        {/* Neck */}
        <rect x="44" y="52" width="12" height="18" rx="4" fill="#FBBF24" />
        {/* Head */}
        <ellipse cx="50" cy="44" rx="17" ry="20" fill="#FDE68A" />
        {/* Front Hair */}
        <path d="M33 38 C33 24, 42 20, 50 20 C58 20, 67 24, 67 38 C62 30, 56 26, 50 26 C44 26, 38 30, 33 38 Z" fill="#18181B" />
        {/* Spectacles / Glasses */}
        <rect x="36" y="38" width="11" height="8" rx="3" stroke="#881337" strokeWidth="1.5" fill="none" />
        <rect x="53" y="38" width="11" height="8" rx="3" stroke="#881337" strokeWidth="1.5" fill="none" />
        <line x1="47" y1="42" x2="53" y2="42" stroke="#881337" strokeWidth="1.5" />
        {/* Eyes */}
        <circle cx="41.5" cy="42" r="1.5" fill="#18181B" />
        <circle cx="58.5" cy="42" r="1.5" fill="#18181B" />
        {/* Smile */}
        <path d="M45 52 Q50 56 55 52" stroke="#B45309" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      </svg>
    ),
  },
  {
    id: 'avatar-3',
    bgColor: 'bg-emerald-100',
    renderSvg: (className = 'w-full h-full') => (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <circle cx="50" cy="50" r="50" fill="#D1FAE5" />
        {/* Uniform Jacket */}
        <path d="M20 95 C20 74, 35 66, 50 66 C65 66, 80 74, 80 95 Z" fill="#065F46" />
        <path d="M44 66 L50 78 L56 66 Z" fill="#FFFFFF" />
        <path d="M48 70 L52 70 L51 86 L49 86 Z" fill="#F59E0B" />
        {/* Name Badge */}
        <rect x="60" y="76" width="10" height="5" rx="1.5" fill="#F59E0B" />
        {/* Neck */}
        <rect x="44" y="50" width="12" height="18" rx="4" fill="#FCD34D" />
        {/* Head */}
        <ellipse cx="50" cy="40" rx="17" ry="20" fill="#FDE68A" />
        {/* Short Groomed Hair */}
        <path d="M33 34 C33 22, 42 16, 50 16 C58 16, 67 22, 67 34 C64 26, 58 22, 50 22 C42 22, 36 26, 33 34 Z" fill="#78350F" />
        {/* Eyes & Smile */}
        <circle cx="43" cy="38" r="2" fill="#1F2937" />
        <circle cx="57" cy="38" r="2" fill="#1F2937" />
        <path d="M43 48 Q50 54 57 48" stroke="#92400E" strokeWidth="2" strokeLinecap="round" fill="none" />
      </svg>
    ),
  },
  {
    id: 'avatar-4',
    bgColor: 'bg-amber-100',
    renderSvg: (className = 'w-full h-full') => (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <circle cx="50" cy="50" r="50" fill="#FEF3C7" />
        {/* Wavy Blonde Hair */}
        <path d="M26 48 C24 64, 30 78, 36 82 C34 68, 32 50, 36 38 C38 20, 62 20, 64 38 C68 50, 66 68, 64 82 C70 78, 76 64, 74 48 C74 24, 63 15, 50 15 C37 15, 26 24, 26 48 Z" fill="#D97706" />
        {/* Clothes */}
        <path d="M22 95 C22 78, 35 70, 50 70 C65 70, 78 78, 78 95 Z" fill="#0D9488" />
        {/* Neck */}
        <rect x="44" y="54" width="12" height="18" rx="4" fill="#FDE68A" />
        {/* Head */}
        <ellipse cx="50" cy="44" rx="16" ry="19" fill="#FEF08A" />
        {/* Eyes & Lashes */}
        <circle cx="43" cy="42" r="2" fill="#1F2937" />
        <circle cx="57" cy="42" r="2" fill="#1F2937" />
        <path d="M41 39 L38 37" stroke="#1F2937" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M59 39 L62 37" stroke="#1F2937" strokeWidth="1.2" strokeLinecap="round" />
        {/* Warm Smile */}
        <path d="M44 52 Q50 58 56 52" stroke="#B45309" strokeWidth="2" strokeLinecap="round" fill="none" />
      </svg>
    ),
  },
  {
    id: 'avatar-5',
    bgColor: 'bg-sky-100',
    renderSvg: (className = 'w-full h-full') => (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <circle cx="50" cy="50" r="50" fill="#E0F2FE" />
        {/* Clothes */}
        <path d="M20 95 C20 76, 35 68, 50 68 C65 68, 80 76, 80 95 Z" fill="#0284C7" />
        <path d="M40 68 L50 82 L60 68 Z" fill="#F8FAFC" />
        {/* Neck */}
        <rect x="44" y="52" width="12" height="18" rx="4" fill="#D97706" />
        {/* Head (Tan skin) */}
        <ellipse cx="50" cy="42" rx="17" ry="20" fill="#F59E0B" />
        {/* Curly Modern Fade Hair */}
        <path d="M32 34 C31 22, 40 15, 50 15 C60 15, 69 22, 68 34 C64 26, 58 20, 50 20 C42 20, 36 26, 32 34 Z" fill="#1C1917" />
        <circle cx="37" cy="22" r="5" fill="#1C1917" />
        <circle cx="50" cy="18" r="6" fill="#1C1917" />
        <circle cx="63" cy="22" r="5" fill="#1C1917" />
        {/* Eyes & Smile */}
        <circle cx="43" cy="40" r="2" fill="#1C1917" />
        <circle cx="57" cy="40" r="2" fill="#1C1917" />
        <path d="M43 50 Q50 56 57 50" stroke="#78350F" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      </svg>
    ),
  },
  {
    id: 'avatar-6',
    bgColor: 'bg-purple-100',
    renderSvg: (className = 'w-full h-full') => (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <circle cx="50" cy="50" r="50" fill="#F3E8FF" />
        {/* Chic Dark Bob Hair */}
        <path d="M30 45 C28 62, 34 68, 36 70 C32 55, 30 40, 36 30 C40 18, 60 18, 64 30 C70 40, 68 55, 64 70 C66 68, 72 62, 70 45 C70 20, 60 14, 50 14 C40 14, 30 20, 30 45 Z" fill="#2E1065" />
        {/* Clothes */}
        <path d="M22 95 C22 78, 35 70, 50 70 C65 70, 78 78, 78 95 Z" fill="#7E22CE" />
        {/* Gold Necklace */}
        <path d="M42 72 Q50 78 58 72" stroke="#F59E0B" strokeWidth="2" fill="none" />
        {/* Neck */}
        <rect x="44" y="54" width="12" height="18" rx="4" fill="#FDE68A" />
        {/* Head */}
        <ellipse cx="50" cy="44" rx="16" ry="19" fill="#FEF08A" />
        {/* Gold Earrings */}
        <circle cx="33" cy="46" r="3" fill="#F59E0B" />
        <circle cx="67" cy="46" r="3" fill="#F59E0B" />
        {/* Eyes */}
        <circle cx="43" cy="42" r="2" fill="#1F2937" />
        <circle cx="57" cy="42" r="2" fill="#1F2937" />
        {/* Elegant Smile */}
        <path d="M45 52 Q50 57 55 52" stroke="#92400E" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      </svg>
    ),
  },
];

interface AvatarIconProps {
  avatarId?: string | null;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const UserAvatar: React.FC<AvatarIconProps> = ({ avatarId = 'avatar-1', className = '', size = 'md' }) => {
  const selected = AVATAR_PRESETS.find((a) => a.id === avatarId) || AVATAR_PRESETS[0];

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  return (
    <div
      className={`rounded-full overflow-hidden flex items-center justify-center shadow-xs border border-white/60 shrink-0 ${sizeClasses[size]} ${className}`}
      title={selected.name || selected.id}
    >
      {selected.renderSvg('w-full h-full')}
    </div>
  );
};

interface AvatarPickerProps {
  selectedId: string;
  onSelect: (id: string) => void;
}

export const AvatarPicker: React.FC<AvatarPickerProps> = ({ selectedId, onSelect }) => {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-700">Choose Your Persona Avatar</label>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {AVATAR_PRESETS.map((avatar) => {
          const isSelected = selectedId === avatar.id;
          return (
            <button
              key={avatar.id}
              type="button"
              onClick={() => onSelect(avatar.id)}
              className={`flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-all border text-center ${
                isSelected
                  ? 'border-primary ring-2 ring-primary/20 bg-primary/5 shadow-xs scale-105'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="w-12 h-12 rounded-full overflow-hidden shadow-xs border border-white">
                {avatar.renderSvg('w-full h-full')}
              </div>
              {avatar.name && (
                <span className="text-xs font-bold text-slate-900 leading-tight truncate w-full">
                  {avatar.name}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
