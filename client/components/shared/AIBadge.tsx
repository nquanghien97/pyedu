'use client';

import { SparklesIcon } from 'lucide-react';

interface AIBadgeProps {
  size?: 'sm' | 'md';
  className?: string;
}

export default function AIBadge({ size = 'sm', className = '' }: AIBadgeProps) {
  const sizeClasses = size === 'sm'
    ? 'text-xs px-1.5 py-0.5 gap-0.5'
    : 'text-xs px-2 py-1 gap-1';

  const iconSize = size === 'sm' ? 10 : 12;

  return (
    <span
      className={`inline-flex items-center font-bold rounded-md bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 ${sizeClasses} ${className}`}
    >
      <SparklesIcon className="flex-shrink-0" size={iconSize} />
      AI
    </span>
  );
}
