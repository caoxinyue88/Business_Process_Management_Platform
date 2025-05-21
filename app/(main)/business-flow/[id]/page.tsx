'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Tab } from '@headlessui/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface BusinessFlowDetailProps {
  params: {
    id: string;
  };
}

export default function BusinessFlowDetail({ params }: BusinessFlowDetailProps) {
  const { id } = params;
  const router = useRouter();
  const [businessFlow, setBusinessFlow] = useState<any>(null);
  const [processes, setProcesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch business flow and processes data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch business flow data
        const flowResponse = await fetch(`/api/feishu/business-flows/${id}`);
        if (!flowResponse.ok) {
          throw new Error('Failed to fetch business flow data');
        }
        const flowData = await flowResponse.json();
        setBusinessFlow(flowData);
        
        // Fetch processes for this business flow
        const processesResponse = await fetch(`/api/feishu/process-flows?businessFlowId=${id}`);
        if (processesResponse.ok) {
          const processesData = await processesResponse.json();
          setProcesses(processesData.flows || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        // Use mock data if the API fails
        setBusinessFlow({
          id,
          name: `业务流 ${id}`,
          description: '这是一个业务流程的详情页',
          // other properties...
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);
  
  const handleAddProcess = () => {
    router.push(`/business-flow/process?businessFlowId=${id}`);
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
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{businessFlow?.name || `业务流 ${id}`}</h1>
        <Button onClick={() => router.back()}>返回</Button>
      </div>
      
      <div className="mb-8">
        <p className="text-gray-600">{businessFlow?.description || '暂无描述'}</p>
      </div>
      
      <Tab.Group>
        <Tab.List className="flex border-b">
          <Tab className={({ selected }: { selected: boolean }) => 
            `py-2 px-4 text-sm font-medium ${
              selected 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`
          }>
            表单设计
          </Tab>
          <Tab className={({ selected }: { selected: boolean }) => 
            `py-2 px-4 text-sm font-medium ${
              selected 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`
          }>
            添加流程
          </Tab>
          <Tab className={({ selected }: { selected: boolean }) => 
            `py-2 px-4 text-sm font-medium ${
              selected 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`
          }>
            拓展设置
          </Tab>
          <Tab className={({ selected }: { selected: boolean }) => 
            `py-2 px-4 text-sm font-medium ${
              selected 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`
          }>
            应用发布
          </Tab>
        </Tab.List>
        
        <Tab.Panels className="mt-4">
          {/* 表单设计 */}
          <Tab.Panel>
            <div className="p-4 bg-gray-50 rounded-md">
              <p className="text-gray-500">表单设计功能正在开发中...</p>
            </div>
          </Tab.Panel>
          
          {/* 添加流程 */}
          <Tab.Panel>
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium">流程列表</h2>
                <Button 
                  onClick={handleAddProcess}
                  className="flex items-center"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  添加流程
                </Button>
              </div>
              
              {processes.length === 0 ? (
                <div className="bg-gray-50 rounded-md p-8 text-center">
                  <p className="text-gray-500 mb-4">暂无流程，点击"添加流程"开始创建</p>
                  <Button 
                    onClick={handleAddProcess}
                    className="flex items-center mx-auto"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    添加流程
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {processes.map((process) => (
                    <Card key={process.metadata?.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <CardTitle>{process.metadata?.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-500 mb-2">
                          {process.metadata?.type === 'project' ? '项目流' : '审批流'}
                        </p>
                        <p className="text-sm line-clamp-2">
                          {process.metadata?.description || '暂无描述'}
                        </p>
                        <div className="flex mt-4 justify-end">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => router.push(`/business-flow/process?flowId=${process.metadata?.id}&businessFlowId=${id}`)}
                          >
                            编辑
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </Tab.Panel>
          
          {/* 拓展设置 */}
          <Tab.Panel>
            <div className="p-4 bg-gray-50 rounded-md">
              <p className="text-gray-500">拓展设置功能正在开发中...</p>
            </div>
          </Tab.Panel>
          
          {/* 应用发布 */}
          <Tab.Panel>
            <div className="p-4 bg-gray-50 rounded-md">
              <p className="text-gray-500">应用发布功能正在开发中...</p>
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
} 