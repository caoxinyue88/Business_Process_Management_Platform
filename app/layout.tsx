import './globals.css';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: '业务流程管理平台',
  description: '用于创建、管理和监控企业业务流程的综合性平台',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className={inter.variable}>
      <body className="bg-gray-100 antialiased">
        <script dangerouslySetInnerHTML={{ __html: `
          // Initialize localStorage if needed
          (function() {
            const INIT_KEY = 'storageInitialized';
            const keys = ['websites', 'assistantItems', 'projects', 'resources', 'businessFlows'];
            
            // Check if localStorage is already initialized
            const isInitialized = localStorage.getItem(INIT_KEY);
            if (isInitialized === 'true') return;
            
            // Initialize each feature with empty arrays
            for (const key of keys) {
              if (!localStorage.getItem(key)) {
                localStorage.setItem(key, JSON.stringify([]));
              }
            }
            
            // Initialize dashboard
            if (!localStorage.getItem('dashboard')) {
              localStorage.setItem('dashboard', JSON.stringify({
                stats: {
                  businessFlows: 0,
                  projects: 0,
                  resources: 0
                }
              }));
            }
            
            // Mark storage as initialized
            localStorage.setItem(INIT_KEY, 'true');
            console.log('LocalStorage manually initialized');
          })();
        `}} />
        {children}
      </body>
    </html>
  );
} 