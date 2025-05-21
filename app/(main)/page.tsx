'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PageHeader from '../components/layout/PageHeader';
import { 
  Users2, LayoutGrid, Package, 
  ArrowRightCircle, Workflow, FolderKanban, Library 
} from 'lucide-react';

// 定义业务流类型
interface BusinessFlow {
  id: string;
  name: string;
  detailPageId: string;
  description: string;
  projects: number;
  resources: number;
  lastAccessed: string;
}

export default function DashboardPage() {
  // 模拟业务流数据
  const [businessFlows, setBusinessFlows] = useState<BusinessFlow[]>([
    { 
      id: 'Beta', 
      name: '客服机器人Beta', 
      detailPageId: 'digitalEmployeeDetailPage_Beta', 
      description: '职责：处理客户常见问题，提供7x24小时支持。', 
      projects: 1, 
      resources: 1, 
      lastAccessed: '昨天' 
    }
  ]);

  return (
    <>
      <PageHeader title="仪表盘" />
      
      <main className="p-6 lg:p-8 space-y-8">
        {/* 统计卡片 */}
        <section id="statsCards">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-sky-500 to-blue-600 text-white p-6 rounded-xl shadow-lg hover:shadow-blue-500/30 transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-lg font-medium">业务流总数</h3>
                <Users2 className="opacity-80" />
              </div>
              <p className="text-4xl font-bold">{businessFlows.length}</p>
            </div>
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-6 rounded-xl shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-lg font-medium">项目开发节点总数</h3>
                <LayoutGrid className="opacity-80" />
              </div>
              <p className="text-4xl font-bold">860</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-500 to-green-600 text-white p-6 rounded-xl shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-lg font-medium">资源库节点总数</h3>
                <Package className="opacity-80" />
              </div>
              <p className="text-4xl font-bold">1,230</p>
            </div>
          </div>
        </section>

        {/* 最近访问的业务流和血缘关系 */}
        <div className="grid grid-cols-1 gap-6">
          {/* 最近访问的业务流 */}
          <section className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-5">最近访问的业务流</h3>
            <ul className="space-y-3.5">
              {businessFlows.length === 0 ? (
                <li className="text-sm text-gray-500">暂无最近访问的业务流。</li>
              ) : (
                businessFlows.slice(-2).reverse().map(flow => (
                  <li 
                    key={flow.id}
                    className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-lg transition-colors group border border-transparent hover:border-slate-200"
                  >
                    <div>
                      <Link 
                        href={`/business-flow/${flow.id.toLowerCase()}`} 
                        className="font-semibold text-blue-600 hover:text-blue-700 group-hover:underline text-base"
                      >
                        {flow.name}
                      </Link>
                      <p className="text-sm text-gray-500 mt-1">上次访问: {flow.lastAccessed}</p>
                    </div>
                    <Link
                      href={`/business-flow/${flow.id.toLowerCase()}`}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium py-2 px-4 rounded-md border border-blue-500 hover:bg-blue-50 transition-all opacity-0 group-hover:opacity-100 transform group-hover:scale-100 scale-95"
                    >
                      <ArrowRightCircle className="w-4 h-4 inline-block mr-1.5" />
                      查看
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </section>

          {/* 业务流血缘关系速览 */}
          <section className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-5">业务流血缘关系速览</h3>
            <div className="mindmap-container space-y-5 max-h-[350px] pr-2">
              {businessFlows.length === 0 ? (
                <p className="text-sm text-gray-500">暂无业务流可展示血缘关系。</p>
              ) : (
                businessFlows.slice(0, 2).map(flow => (
                  <div key={flow.id} className="mindmap-employee">
                    <Link href={`/business-flow/${flow.id.toLowerCase()}`} className="mindmap-node level-1">
                      <Workflow /> 
                      <span>{flow.name}</span>
                    </Link>
                    <div className="mindmap-employee-details">
                      <div className="mindmap-project-group">
                        <div className="mindmap-node level-2">
                          <FolderKanban />
                          <span>示例项目</span>
                        </div>
                        <div className="mindmap-project-details">
                          <div className="mindmap-resource-item">
                            <div className="mindmap-node level-3">
                              <Library />
                              <span>示例资源</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </main>
    </>
  );
} 