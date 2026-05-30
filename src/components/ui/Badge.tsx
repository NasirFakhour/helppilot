import React from 'react';
import { cn } from '@/lib/utils';

export default function Badge({ children, variant = 'neutral', className = '' }: { children: React.ReactNode; variant?: string; className?: string }) {
  return (
    <span className={cn('badge', `badge-${variant}`, className)}>
      {children}
    </span>
  );
}
