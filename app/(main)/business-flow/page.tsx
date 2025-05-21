'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function BusinessFlowsPage() {
  const router = useRouter();
  const [businessFlows, setBusinessFlows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch business flows
  useEffect(() => {
    const fetchBusinessFlows = async () => {
      try {
        const response = await fetch('/api/feishu/business-flows');
        if (response.ok) {
          const data = await response.json();
          setBusinessFlows(data.businessFlows || []);
        } else {
          console.error('Failed to fetch business flows');
        }
      } catch (error) {
        console.error('Error fetching business flows:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessFlows();
  }, []);

  const handleAddProcessToFlow = (businessFlowId: string) => {
    router.push(`/business-flow/process?businessFlowId=${businessFlowId}`);
  };

  const handleViewBusinessFlow = (id: string) => {
    router.push(`/business-flow/${id}`);
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-2 text-gray-500">正在加载业务流...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">业务流管理</h1>
      </div>

      {businessFlows.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">暂无业务流</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {businessFlows.map((flow) => (
            <div key={flow.id} className="border rounded-lg overflow-hidden bg-white">
              <div className="p-4 border-b">
                <h3 className="font-medium text-lg mb-1 truncate">{flow.name}</h3>
                <p className="text-sm text-gray-500 truncate">{flow.description || '无描述'}</p>
              </div>
              <div className="p-4 flex flex-col space-y-2">
                <p className="text-sm text-gray-500">
                  流程数量: {flow.processFlows?.length || 0}
                </p>
                <div className="flex space-x-2 mt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleViewBusinessFlow(flow.id)}
                  >
                    查看详情
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleAddProcessToFlow(flow.id)}
                  >
                    添加流程
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 