'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children,
  maxWidth = 'md' 
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // 关闭模态框当点击背景
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  // 添加ESC键盘监听
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  // 阻止滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl'
  };

  return (
    <div 
      className='modal active fixed inset-0 bg-gray-900 bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50'
      onClick={handleBackdropClick}
    >
      <div 
        ref={modalRef}
        className={`modal-content bg-white rounded-xl shadow-xl p-6 w-full ${maxWidthClasses[maxWidth]}`}
      >
        <div className='flex items-start justify-between mb-5'>
          <h3 className='text-xl font-semibold text-gray-900'>{title}</h3>
          <button 
            type='button'
            onClick={onClose}
            className='text-gray-400 hover:text-gray-600 p-1 -mr-1 -mt-1'
          >
            <X className='w-6 h-6' />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
} 