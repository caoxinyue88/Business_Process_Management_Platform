import React from 'react';
import Link from 'next/link';

type BreadcrumbItem = {
  label: string;
  path?: string;
};

interface PageHeaderProps {
  title: string;
  breadcrumb?: BreadcrumbItem[];
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, breadcrumb = [] }) => {
  return (
    <div className="p-6 border-b bg-white">
      {breadcrumb.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          {breadcrumb.map((item, index) => (
            <React.Fragment key={index}>
              {index > 0 && <span className="text-gray-400">/</span>}
              {item.path ? (
                <Link href={item.path} className="hover:text-blue-600 transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span>{item.label}</span>
              )}
            </React.Fragment>
          ))}
        </div>
      )}
      <h1 className="text-2xl font-semibold">{title}</h1>
    </div>
  );
};

export default PageHeader; 