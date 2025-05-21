'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Workflow, FileCheck } from 'lucide-react';

interface ProcessTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: 'project' | 'approval') => void;
}

export default function ProcessTypeModal({ isOpen, onClose, onSelect }: ProcessTypeModalProps) {
  const [selectedType, setSelectedType] = useState<'project' | 'approval' | null>(null);

  const handleSelect = () => {
    if (selectedType) {
      onSelect(selectedType);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-xl">选择流程类型</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4 py-6">
          <div 
            className={`border rounded-lg p-6 cursor-pointer hover:border-blue-500 transition-colors ${
              selectedType === 'project' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            }`}
            onClick={() => setSelectedType('project')}
          >
            <div className="flex flex-col items-center text-center">
              <Workflow className="w-16 h-16 text-blue-500 mb-4" />
              <h3 className="text-lg font-medium mb-2">项目流</h3>
              <p className="text-sm text-gray-600">
                适用于项目管理场景，包含任务分解、依赖关系、资源分配等功能。
              </p>
            </div>
          </div>
          
          <div 
            className={`border rounded-lg p-6 cursor-pointer hover:border-blue-500 transition-colors ${
              selectedType === 'approval' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            }`}
            onClick={() => setSelectedType('approval')}
          >
            <div className="flex flex-col items-center text-center">
              <FileCheck className="w-16 h-16 text-blue-500 mb-4" />
              <h3 className="text-lg font-medium mb-2">审批流</h3>
              <p className="text-sm text-gray-600">
                适用于各类审批场景，支持多级审批、条件判断、自动通知等功能。
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>取消</Button>
          <Button onClick={handleSelect} disabled={!selectedType}>下一步</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 