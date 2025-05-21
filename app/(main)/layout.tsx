'use client';import { useState, useEffect } from 'react';import { initializeLocalStorage } from '../lib/localStorageService';
import Sidebar from '../components/layout/Sidebar';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className='flex h-screen overflow-hidden'>
      <Sidebar />
      <div 
        className={`main-content flex-1 ml-[260px] overflow-y-auto`}
      >
        {children}
      </div>
    </div>
  );
} 