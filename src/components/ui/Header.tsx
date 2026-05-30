import Link from 'next/link';
import { cn } from '@/lib/utils';
import React from 'react';

export default function Header({ children }: { children?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-surface/95 backdrop-blur">
      <div className="container flex h-14 items-center justify-between mx-auto px-4">
        {/* Logo */}
        <Link href="/" className="text-lg font-bold text-primary">
          TechniSuivi
        </Link>
        {/* Navigation */}
        <nav className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm hover:underline">
            Tableau de bord
          </Link>
          <Link href="/planning" className="text-sm hover:underline">
            Planning
          </Link>
          <Link href="/relances" className="text-sm hover:underline">
            Relances
          </Link>
          <Link href="/documents" className="text-sm hover:underline">
            Documents
          </Link>
        </nav>
      </div>
      {children && <div className="container mx-auto px-4 py-4">{children}</div>}
    </header>
  );
}
