import { memo } from 'react';
import { stringToHsl } from '@/lib/utils';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md';
}

export const Avatar = memo(function Avatar({ name, size = 'md' }: AvatarProps) {
  const sizeClass = size === 'sm' ? 'w-7 h-7 text-[10px]' : 'w-8 h-8 text-xs';
  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 bg-gradient-to-br from-indigo-400 to-purple-500`}
      style={{ background: `linear-gradient(135deg, ${stringToHsl(name)}, ${stringToHsl(name + name)})` }}
    >
      {name?.charAt(0).toUpperCase() ?? '?'}
    </div>
  );
});
