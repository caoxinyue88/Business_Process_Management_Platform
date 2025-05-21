'use client';

import { useState } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import { Workflow, RotateCcw, Save, ArrowRight, Plus, X, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// 示例项目数据
const availableProjects = [
  { id: 1, name: '数据分析', type: '数据处理', description: '用于分析和处理数据的项目' },
  { id: 2, name: '内容生成', type: '内容管理', description: '用于生成内容的项目' },
  { id: 3, name: '审核流程', type: '内容管理', description: '用于审核内容的项目' },
  { id: 4, name: '内容发布', type: '内容管理', description: '用于发布内容的项目' },
  { id: 5, name: '数据采集', type: '数据处理', description: '用于采集数据的项目' },
  { id: 6, name: '用户分析', type: '数据处理', description: '用于分析用户行为的项目' },
  { id: 7, name: '内容营销', type: '营销', description: '用于内容营销的项目' },
];

export default function NewBusinessFlowPage() {
  const [flowName, setFlowName] = useState('新建业务流');
  const [flowDescription, setFlowDescription] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedProjects, setSelectedProjects] = useState<any[]>([]);
  const [newProjectDialogOpen, setNewProjectDialogOpen] = useState(false);
  const [currentEditIndex, setCurrentEditIndex] = useState<number | null>(null);

  // 根据搜索和类型筛选项目
  const filteredProjects = availableProjects.filter(project => {
    const matchesSearch = project.name.includes(searchTerm) || 
                          project.description.includes(searchTerm);
    const matchesType = selectedType === 'all' || project.type === selectedType;
    return matchesSearch && matchesType;
  });

  // 项目类型列表
  const projectTypes = ['all', ...new Set(availableProjects.map(p => p.type))];
  
  // 添加项目到流程
  const addProjectToFlow = (project: any) => {
    if (currentEditIndex !== null) {
      const newProjects = [...selectedProjects];
      newProjects[currentEditIndex] = project;
      setSelectedProjects(newProjects);
      setCurrentEditIndex(null);
    } else {
      setSelectedProjects([...selectedProjects, project]);
    }
    setNewProjectDialogOpen(false);
  };

  // 移除项目
  const removeProject = (index: number) => {
    const newProjects = selectedProjects.filter((_, i) => i !== index);
    setSelectedProjects(newProjects);
  };

  // 编辑项目
  const editProject = (index: number) => {
    setCurrentEditIndex(index);
    setNewProjectDialogOpen(true);
  };

  // 保存业务流
  const saveBusinessFlow = () => {
    // 实际应用中应该将数据提交到API
    console.log('保存业务流:', {
      name: flowName,
      description: flowDescription,
      projects: selectedProjects
    });
    alert('业务流保存成功！');
  };

  return (
    <>
      <PageHeader 
        title={`流程设计: ${flowName}`} 
        breadcrumb={[
          { label: '业务流', path: '/business-flow' },
          { label: flowName }
        ]}
      />
      
      <div className="p-6 lg:p-8">
        <div className="flex mb-4 justify-between">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowSettings(!showSettings)}>
              <Settings className="w-4 h-4 mr-1" /> 流程设置
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <RotateCcw className="w-4 h-4 mr-1" /> 重置
            </Button>
            <Button variant="default" size="sm" onClick={saveBusinessFlow}>
              <Save className="w-4 h-4 mr-1" /> 保存
            </Button>
          </div>
        </div>

        {showSettings && (
          <Card className="mb-4">
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="flow-name">业务流名称</Label>
                  <Input 
                    id="flow-name" 
                    value={flowName} 
                    onChange={(e) => setFlowName(e.target.value)} 
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="flow-description">业务流描述</Label>
                  <Textarea 
                    id="flow-description" 
                    value={flowDescription} 
                    onChange={(e) => setFlowDescription(e.target.value)} 
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex h-[calc(100vh-16rem)] bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          {/* 左侧组件库 */}
          <aside className="w-72 bg-slate-50 p-5 border-r border-gray-200 overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">可用项目</h3>
            <div className="space-y-3 mb-4">
              <Input 
                type="search" 
                placeholder="搜索可用项目..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="选择项目类型" />
                </SelectTrigger>
                <SelectContent>
                  {projectTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type === 'all' ? '所有类型' : type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="overflow-y-auto max-h-[calc(100vh-25rem)]">
              <ul className="space-y-2">
                {filteredProjects.map((project) => (
                  <li 
                    key={project.id} 
                    className="p-2 border rounded-md hover:bg-slate-100 transition-colors cursor-pointer flex items-center"
                    onClick={() => addProjectToFlow(project)}
                  >
                    <Workflow className="text-blue-500 mr-2 flex-shrink-0" />
                    <div>
                      <div className="font-medium">{project.name}</div>
                      <div className="text-xs text-gray-500">{project.type}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* 右侧设计区域 */}
          <section className="flex-1 flex flex-col">
            <div className="p-4 border-b border-gray-200 bg-slate-50/50">
              <h3 className="text-xl font-semibold text-gray-800">流程设计: {flowName}</h3>
              <p className="text-sm text-gray-500">{flowDescription || '暂无描述'}</p>
            </div>
            <div 
              className="flex-1 bg-slate-100 relative p-5 overflow-auto" 
              style={{ backgroundImage: 'radial-gradient(circle, #e0e0e0 1px, transparent 1.5px)', backgroundSize: '25px 25px' }}
            >
              {selectedProjects.length === 0 ? (
                <div className="text-center text-gray-400 absolute inset-0 flex flex-col items-center justify-center text-base">
                  <p className="mb-3">从左侧选择项目或添加自定义项目来构建流程</p>
                  <Dialog open={newProjectDialogOpen} onOpenChange={setNewProjectDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Plus className="w-4 h-4 mr-1" /> 添加自定义项目
                      </Button>
                    </DialogTrigger>
                    <AddProjectDialog 
                      onAdd={addProjectToFlow} 
                      onCancel={() => setNewProjectDialogOpen(false)}
                      editProject={currentEditIndex !== null ? selectedProjects[currentEditIndex] : null}
                    />
                  </Dialog>
                </div>
              ) : (
                <div className="flex flex-col items-center w-full">
                  {selectedProjects.map((project, index) => (
                    <div key={index} className="flex flex-col items-center w-full">
                      <div className="bg-white p-4 rounded-lg shadow border border-gray-200 w-full max-w-md relative group">
                        <div className="absolute -right-2 -top-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-6 w-6 rounded-full bg-white" 
                            onClick={() => editProject(index)}
                          >
                            <Settings className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-6 w-6 rounded-full bg-white" 
                            onClick={() => removeProject(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="font-semibold">{index + 1}. {project.name}</div>
                        <div className="text-sm text-gray-500 mt-1">{project.type}</div>
                        <div className="text-xs text-gray-600 mt-2">{project.description}</div>
                      </div>
                      
                      {index < selectedProjects.length - 1 && (
                        <div className="my-2">
                          <ArrowRight className="text-gray-400" />
                        </div>
                      )}
                    </div>
                  ))}
                  
                  <Dialog open={newProjectDialogOpen} onOpenChange={setNewProjectDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="mt-6">
                        <Plus className="w-4 h-4 mr-1" /> 添加项目
                      </Button>
                    </DialogTrigger>
                    <AddProjectDialog 
                      onAdd={addProjectToFlow} 
                      onCancel={() => setNewProjectDialogOpen(false)}
                      editProject={currentEditIndex !== null ? selectedProjects[currentEditIndex] : null}
                    />
                  </Dialog>
                </div>
              )}
            </div>
          </section>
        </div>
        <p className="text-xs text-gray-500 mt-3 p-2 bg-slate-100 rounded-md border border-slate-200">
          提示：此处的项目节点来源于&quot;项目开发&quot;模块，可以根据实际需求选择适合的项目组合形成完整的业务流。
        </p>
      </div>
    </>
  );
} 

// 添加项目对话框组件
function AddProjectDialog({ onAdd, onCancel, editProject }: { 
  onAdd: (project: any) => void, 
  onCancel: () => void,
  editProject: any | null
}) {
  const [name, setName] = useState(editProject ? editProject.name : '');
  const [type, setType] = useState(editProject ? editProject.type : '');
  const [description, setDescription] = useState(editProject ? editProject.description : '');

  const handleSubmit = () => {
    const newProject = {
      id: editProject ? editProject.id : Date.now(),
      name,
      type,
      description
    };
    onAdd(newProject);
  };

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{editProject ? '编辑项目' : '添加新项目'}</DialogTitle>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="project-name">项目名称</Label>
          <Input
            id="project-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="project-type">项目类型</Label>
          <Input
            id="project-type"
            value={type}
            onChange={(e) => setType(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="project-description">项目描述</Label>
          <Textarea
            id="project-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>取消</Button>
        <Button onClick={handleSubmit}>{editProject ? '保存' : '添加'}</Button>
      </DialogFooter>
    </DialogContent>
  );
} 