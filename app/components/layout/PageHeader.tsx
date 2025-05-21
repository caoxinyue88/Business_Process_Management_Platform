'use client';

interface PageHeaderProps {
  title: string;
  breadcrumb?: {
    label: string;
    path?: string;
  }[];
}

export default function PageHeader({ title, breadcrumb = [] }: PageHeaderProps) {
  return (
    <header className='bg-white/80 backdrop-blur-md shadow-sm p-4 sticky top-0 z-20 border-b border-gray-200'>
      <div>
        {breadcrumb.length > 0 && (
          <div className='text-sm text-gray-600 mb-1 flex items-center'>
            {breadcrumb.map((item, index) => (
              <span key={index} className='flex items-center'>
                {index > 0 && <span className='mx-1.5 text-gray-400'>/</span>}
                {item.path ? (
                  <a 
                    href={item.path} 
                    className='text-blue-600 hover:underline'
                  >
                    {item.label}
                  </a>
                ) : (
                  <span className='text-gray-500'>{item.label}</span>
                )}
              </span>
            ))}
          </div>
        )}
        <h2 className='text-2xl font-semibold text-gray-800'>{title}</h2>
      </div>
    </header>
  );
} 