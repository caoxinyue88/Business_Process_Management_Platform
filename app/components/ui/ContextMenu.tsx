'use client';

import { useEffect, useRef } from 'react';

interface ContextMenuItem {
  label: string;
  action: () => void;
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
  isVisible: boolean;
}

export default function ContextMenu({ x, y, items, onClose, isVisible }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible, onClose]);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      ref={menuRef}
      className='fixed bg-white border border-gray-300 rounded-md shadow-lg z-50 text-sm'
      style={{ top: y, left: x }}
      onClick={(e) => e.stopPropagation()} // Prevent click on menu from closing it immediately
    >
      <ul className='py-1'>
        {items.map((item, index) => (
          <li key={index}>
            <button
              onClick={() => {
                item.action();
                onClose(); // Close menu after action
              }}
              className='w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700'
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
} 