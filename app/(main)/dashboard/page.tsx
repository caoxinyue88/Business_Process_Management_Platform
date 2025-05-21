'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Workflow, Database, Settings, Activity, Clock, BarChart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AreaChart, BarChart as Chart } from '@/components/ui/chart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// 示例数据
const businessFlows = [
  { id: 1, name: '内容种草业务流', status: '活跃', count: 120, performanceScore: 85 },
  { id: 2, name: '直播业务流', status: '活跃', count: 75, performanceScore: 92 },
  { id: 3, name: '数据分析业务流', status: '维护中', count: 45, performanceScore: 78 },
  { id: 4, name: '用户增长业务流', status: '活跃', count: 60, performanceScore: 88 },
];

const projects = [
  { id: 1, name: '数据分析', type: '数据处理', usedIn: ['内容种草业务流', '数据分析业务流'], responseTime: 120, accuracy: 96 },
  { id: 2, name: '内容生成', type: '内容管理', usedIn: ['内容种草业务流', '直播业务流'], responseTime: 250, accuracy: 88 },
  { id: 3, name: '审核流程', type: '内容管理', usedIn: ['内容种草业务流', '直播业务流'], responseTime: 180, accuracy: 94 },
  { id: 4, name: '内容发布', type: '内容管理', usedIn: ['内容种草业务流', '直播业务流'], responseTime: 150, accuracy: 99 },
  { id: 5, name: '数据采集', type: '数据处理', usedIn: ['数据分析业务流', '用户增长业务流'], responseTime: 200, accuracy: 92 },
  { id: 6, name: '用户分析', type: '数据处理', usedIn: ['数据分析业务流', '用户增长业务流'], responseTime: 160, accuracy: 90 },
];

const resources = [
  { id: 1, name: '结构化数据库', type: 'SQL数据库', usedIn: ['数据分析', '用户分析'], status: '正常', usage: 68 },
  { id: 2, name: '内容知识库', type: '非结构化数据', usedIn: ['内容生成', '审核流程'], status: '正常', usage: 73 },
  { id: 3, name: '业务规则引擎', type: '规则库', usedIn: ['审核流程', '内容发布'], status: '正常', usage: 52 },
  { id: 4, name: '用户画像系统', type: '图数据库', usedIn: ['用户分析', '内容生成'], status: '维护中', usage: 81 },
  { id: 5, name: '内容标签系统', type: '标签库', usedIn: ['内容生成', '审核流程', '内容发布'], status: '正常', usage: 65 },
];

export default function DashboardPage() {
  const [selectedBusinessFlow, setSelectedBusinessFlow] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('overview');

  // 根据选择的业务流筛选项目
  const filteredProjects = selectedBusinessFlow === 'all' 
    ? projects 
    : projects.filter(project => 
        project.usedIn.includes(businessFlows.find(flow => flow.id.toString() === selectedBusinessFlow)?.name || ''));

  // 根据筛选后的项目筛选资源
  const filteredResources = selectedBusinessFlow === 'all'
    ? resources
    : resources.filter(resource => 
        resource.usedIn.some(project => 
          filteredProjects.map(p => p.name).includes(project)));

  // 计算平均响应时间
  const avgResponseTime = filteredProjects.reduce((acc, project) => acc + project.responseTime, 0) / 
                         (filteredProjects.length || 1);
  
  // 计算平均准确率
  const avgAccuracy = filteredProjects.reduce((acc, project) => acc + project.accuracy, 0) / 
                     (filteredProjects.length || 1);

  // 资源使用率
  const avgResourceUsage = filteredResources.reduce((acc, resource) => acc + resource.usage, 0) / 
                          (filteredResources.length || 1);

  // 图表数据
  const performanceData = {
    categories: filteredProjects.map(p => p.name),
    series: [
      {
        name: '响应时间 (ms)',
        data: filteredProjects.map(p => p.responseTime),
      },
      {
        name: '准确率 (%)',
        data: filteredProjects.map(p => p.accuracy),
      },
    ],
  };

  const resourceUsageData = {
    categories: filteredResources.map(r => r.name),
    series: [
      {
        name: '使用率 (%)',
        data: filteredResources.map(r => r.usage),
      },
    ],
  };

  return (
    <div className='container mx-auto py-6'>
      <div className="flex items-center justify-between mb-6">
        <h1 className='text-2xl font-bold'>业务流程仪表盘</h1>
        <div className="flex gap-4">
          <Select 
            value={selectedBusinessFlow} 
            onValueChange={setSelectedBusinessFlow}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="选择业务流" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有业务流</SelectItem>
              {businessFlows.map(flow => (
                <SelectItem key={flow.id} value={flow.id.toString()}>
                  {flow.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">业务流程</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {selectedBusinessFlow === 'all' ? businessFlows.length : 1}
            </div>
            <p className="text-xs text-muted-foreground">
              总计业务流程数量
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">平均响应时间</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {avgResponseTime.toFixed(0)} ms
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              流程节点平均响应时间
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">平均准确率</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {avgAccuracy.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Activity className="h-3 w-3" />
              流程节点平均准确率
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">资源使用率</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {avgResourceUsage.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <BarChart className="h-3 w-3" />
              资源平均使用率
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">
            <Workflow className="h-4 w-4 mr-2" />
            概览
          </TabsTrigger>
          <TabsTrigger value="projects">
            <Settings className="h-4 w-4 mr-2" />
            项目开发层
          </TabsTrigger>
          <TabsTrigger value="resources">
            <Database className="h-4 w-4 mr-2" />
            资源库层
          </TabsTrigger>
        </TabsList>

        {/* 概览 Tab */}
        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>业务流程数据血缘关系图</CardTitle>
              </CardHeader>
              <CardContent className="h-96 flex items-center justify-center">
                <p className="text-muted-foreground">
                  业务流程血缘关系图显示了业务流、项目和资源之间的关系和依赖性。
                  {/* 实际项目中这里应该有一个可视化图表 */}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>项目性能指标</CardTitle>
              </CardHeader>
              <CardContent>
                <Chart 
                  type="bar"
                  height={300}
                  options={{
                    xaxis: {
                      categories: performanceData.categories,
                    },
                  }}
                  series={performanceData.series}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>资源使用情况</CardTitle>
              </CardHeader>
              <CardContent>
                <Chart
                  type="bar"
                  height={300}
                  options={{
                    xaxis: {
                      categories: resourceUsageData.categories,
                    },
                  }}
                  series={resourceUsageData.series}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 项目开发层 Tab */}
        <TabsContent value="projects">
          <Card>
            <CardHeader>
              <CardTitle>项目开发层</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>项目名称</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>使用的业务流</TableHead>
                    <TableHead>响应时间</TableHead>
                    <TableHead>准确率</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">{project.name}</TableCell>
                      <TableCell>{project.type}</TableCell>
                      <TableCell>
                        {project.usedIn.map((flow, index) => (
                          <Badge 
                            key={index} 
                            variant="outline" 
                            className="mr-1"
                          >
                            {flow}
                          </Badge>
                        ))}
                      </TableCell>
                      <TableCell>{project.responseTime} ms</TableCell>
                      <TableCell>{project.accuracy}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 资源库层 Tab */}
        <TabsContent value="resources">
          <Card>
            <CardHeader>
              <CardTitle>资源库层</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>资源名称</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>应用的项目</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>使用率</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResources.map((resource) => (
                    <TableRow key={resource.id}>
                      <TableCell className="font-medium">{resource.name}</TableCell>
                      <TableCell>{resource.type}</TableCell>
                      <TableCell>
                        {resource.usedIn.map((project, index) => (
                          <Badge 
                            key={index} 
                            variant="outline" 
                            className="mr-1"
                          >
                            {project}
                          </Badge>
                        ))}
                      </TableCell>
                      <TableCell>
                        <Badge variant={resource.status === '正常' ? 'success' : 'warning'}>
                          {resource.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-primary h-2.5 rounded-full" 
                            style={{ width: `${resource.usage}%` }}
                          ></div>
                        </div>
                        <span className="text-xs">{resource.usage}%</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 