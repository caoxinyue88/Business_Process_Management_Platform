import { ReactNode } from 'react';

export default function WebsitesLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
} 