'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProcessTypeModal from '@/app/components/modals/ProcessTypeModal';
import ProcessDesigner from '@/app/components/flow/ProcessDesigner';

export default function ProcessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const flowId = searchParams.get('flowId');
  const businessFlowId = searchParams.get('businessFlowId') || '';
  const defaultType = searchParams.get('defaultType') as 'project' | 'approval' | null;
  const [processType, setProcessType] = useState<'project' | 'approval' | null>(defaultType);
  const [showTypeModal, setShowTypeModal] = useState(!flowId && !defaultType);
  const [loading, setLoading] = useState(false);
  
  // If flowId is provided, fetch the existing flow data
  useEffect(() => {
    if (flowId) {
      setLoading(true);
      // Fetch flow data and set processType based on it
      // For now, we'll just simulate this with a timeout
      const timer = setTimeout(() => {
        // Mock data - in a real app, this would come from an API call
        setProcessType('project'); // or 'approval' based on fetched data
        setLoading(false);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [flowId]);
  
  const handleProcessTypeSelection = (type: 'project' | 'approval') => {
    setProcessType(type);
    setShowTypeModal(false);
  };
  
  const handleCancel = () => {
    if (window.confirm('确定要取消吗？未保存的更改将会丢失。')) {
      router.back();
    }
  };
  
  const handleSave = async (data: any) => {
    try {
      setLoading(true);
      console.log('Saving process flow data:', data);
      
      // In a real app, you would send this data to your API
      // const response = await fetch('/api/feishu/process-flows', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data),
      // });
      
      // For now, just simulate an API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('流程保存成功');
      setLoading(false);
      
      // Navigate back to the business flow detail page
      if (businessFlowId) {
        router.push(`/business-flow/${businessFlowId}`);
      } else {
        router.push('/business-flow');
      }
    } catch (error) {
      console.error('Error saving process flow:', error);
      alert('保存失败，请重试');
      setLoading(false);
    }
  };
  
  const handlePublish = async () => {
    // Similar to handleSave, but would also mark the flow as published/active
    alert('发布功能尚未实现');
  };
  
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-2 text-gray-500">正在加载...</p>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <ProcessTypeModal 
        isOpen={showTypeModal} 
        onClose={handleCancel}
        onSelect={handleProcessTypeSelection}
      />
      
      {processType && (
        <div className="h-full flex flex-col">
          <ProcessDesigner 
            processType={processType}
            flowId={flowId || undefined}
            businessFlowId={businessFlowId || undefined}
            onSave={handleSave}
            onPublish={handlePublish}
            onCancel={handleCancel}
          />
        </div>
      )}
    </>
  );
} 