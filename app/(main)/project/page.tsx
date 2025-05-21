'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Plus, Search, Filter, Download, MoreHorizontal, 
  Edit, Trash, Copy, Eye, Upload, X, AlertTriangle
} from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import { Project } from '../../types/project';

export default function ProjectPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [batchFile, setBatchFile] = useState<File | null>(null);
  const [batchUploadStatus, setBatchUploadStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [batchUploadMessage, setBatchUploadMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newProject, setNewProject] = useState<Omit<Project, 'id'>>({
    name: '',
    type: '',
    status: 'pending',
    department: '',
    owner: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: undefined
  });

  // Fetch projects on component mount
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/feishu/projects');
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      
      const data = await response.json();
      if (data.projects && Array.isArray(data.projects)) {
        setProjects(data.projects);
      } else {
        setError('API returned unexpected data format');
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to load projects. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleBatchModalOpen = () => {
    setIsBatchModalOpen(true);
    setBatchUploadStatus('idle');
    setBatchUploadMessage('');
    setBatchFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleBatchModalClose = () => {
    setIsBatchModalOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setBatchFile(e.target.files[0]);
      setBatchUploadStatus('idle');
      setBatchUploadMessage('');
    }
  };

  // Function to download the CSV template
  const downloadTemplate = () => {
    // Create the CSV content with header row
    const csvContent = [
      "项目名称,项目类型,项目状态,所属业务流,负责人,开始日期,结束日期",
      "项目示例,数字员工,active,产品部,张三,2024-07-01,2024-12-31",
      "项目示例2,数据分析,pending,研发部,李四,2024-08-15,",
    ].join("\n");

    // Create Blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', '项目批量导入模板.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBatchSubmit = async () => {
    if (!batchFile) {
      setBatchUploadStatus('error');
      setBatchUploadMessage('请选择要上传的文件');
      return;
    }

    setBatchUploadStatus('loading');
    setBatchUploadMessage('正在处理文件...');

    try {
      const fileReader = new FileReader();
      fileReader.onload = async (event) => {
        const csvData = event.target?.result as string;
        if (!csvData) {
          setBatchUploadStatus('error');
          setBatchUploadMessage('无法读取文件内容');
          return;
        }

        const lines = csvData.split('\n');
        const headerLine = lines[0].trim();
        const headers = headerLine.split(',').map(header => header.trim()); // 保留原始大小写
        const parsedItems: Omit<Project, 'id'>[] = [];

        // 定义中文列标题到项目字段的映射
        const chineseHeaderMap: { [key: string]: string } = {
          '项目名称': 'name',
          '项目类型': 'type',
          '项目状态': 'status',
          '所属业务流': 'department',
          '负责人': 'owner',
          '开始日期': 'startdate',
          '结束日期': 'enddate',
        };
        
        // 同时兼容英文标题
        const englishHeaders = ['name', 'type', 'status', 'department', 'owner', 'startdate', 'enddate'];
        const headerMap: { [key: string]: number } = {};

        headers.forEach((header, index) => {
          // 检查是否是中文标题
          if (chineseHeaderMap[header]) {
            headerMap[chineseHeaderMap[header]] = index;
          } 
          // 兼容英文标题（转小写比较）
          else if (englishHeaders.includes(header.toLowerCase())) {
            headerMap[header.toLowerCase()] = index;
          }
        });

        // 验证必要的列标题是否存在
        if (!('name' in headerMap) || !('type' in headerMap) || !('status' in headerMap) || 
            !('department' in headerMap) || !('owner' in headerMap) || !('startdate' in headerMap)) {
            setBatchUploadStatus('error');
            setBatchUploadMessage('CSV文件缺少必要的列标题 (项目名称, 项目类型, 项目状态, 所属业务流, 负责人, 开始日期)。请参照模板文件。');
            return;
        }

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (line) {
            const values = line.split(',').map(value => value.trim());
            
            const csvStatus = values[headerMap['status']]?.toLowerCase();
            let status: 'active' | 'completed' | 'pending' = 'pending'; // Default status
            if (csvStatus === 'active' || csvStatus === 'completed' || csvStatus === 'pending') {
              status = csvStatus;
            }

            const item: Omit<Project, 'id'> = {
              name: values[headerMap['name']] || '',
              type: values[headerMap['type']] || '',
              status: status,
              department: values[headerMap['department']] || '',
              owner: values[headerMap['owner']] || '',
              startDate: values[headerMap['startdate']] || new Date().toISOString().split('T')[0], // Default to today
              endDate: values[headerMap['enddate']] || undefined, // Optional
            };

            // Ensure essential fields are present
            if (item.name && item.type && item.status && item.department && item.owner && item.startDate) {
              parsedItems.push(item);
            }
          }
        }

        if (parsedItems.length === 0) {
          setBatchUploadStatus('error');
          setBatchUploadMessage('未在文件中找到有效数据，或数据格式不正确。');
          return;
        }
        
        console.log('Sending batch data to API:', parsedItems); // Keep this for debugging

        // Send the parsed data to the batch API
        const response = await fetch('/api/feishu/projects/batch', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(parsedItems),
        });
        
        console.log('API response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('API error response:', errorText);
          throw new Error(`Failed to batch create projects: ${response.status} ${errorText}`);
        }
        
        const result = await response.json();
        console.log('API response data:', result);
        
        if (!result.success) {
          console.error('API returned error:', result.error);
          throw new Error(result.error || 'Failed to batch create projects');
        }
        
        // Update the projects list with the newly added projects
        setProjects(prev => [...prev, ...result.projects]);
        
        setBatchUploadStatus('success');
        setBatchUploadMessage(`成功添加了 ${result.count} 个项目`);
        
        // Close modal after short delay
        setTimeout(() => {
          handleBatchModalClose();
        }, 2000);
        
      };
      fileReader.onerror = () => {
        setBatchUploadStatus('error');
        setBatchUploadMessage('读取文件失败');
      };
      fileReader.readAsText(batchFile);
      
    } catch (err) {
      console.error('Error batch uploading projects:', err);
      setBatchUploadStatus('error');
      setBatchUploadMessage(`批量添加失败: ${err instanceof Error ? err.message : '请确保文件格式正确并重试'}`);
    }
  };

  // Function to handle add/edit modal
  const handleAddModalOpen = () => {
    setNewProject({
      name: '',
      type: '',
      status: 'pending',
      department: '',
      owner: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: undefined
    });
    setEditingId(null);
    setIsAddModalOpen(true);
  };

  const handleAddModalClose = () => {
    setIsAddModalOpen(false);
  };

  const handleEdit = (project: Project) => {
    setEditingId(project.id);
    setNewProject({
      name: project.name,
      type: project.type,
      status: project.status,
      department: project.department,
      owner: project.owner,
      startDate: project.startDate,
      endDate: project.endDate
    });
    setIsAddModalOpen(true);
  };

  const handleSaveProject = async () => {
    try {
      if (!newProject.name || !newProject.type || !newProject.department || !newProject.owner || !newProject.startDate) {
        alert('请填写所有必填字段');
        return;
      }
      
      console.log('Attempting to save project:', editingId ? 'Update' : 'Create', newProject);
      
      let savedProject: Project | null = null;

      if (editingId) {
        // Edit existing project
        const response = await fetch(`/api/feishu/projects/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newProject)
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('API Error (PUT):', errorData);
          throw new Error(`Failed to update project: ${errorData.details || errorData.error || response.statusText}`);
        }
        savedProject = await response.json();
        console.log('Project updated successfully via API:', savedProject);
      } else {
        // Add new project
        const response = await fetch('/api/feishu/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newProject) 
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('API Error (POST):', errorData);
          throw new Error(`Failed to create project: ${errorData.details || errorData.error || response.statusText}`);
        }
        savedProject = await response.json();
        console.log('Project created successfully via API:', savedProject);
      }

      setIsAddModalOpen(false);
      
      // Re-fetch the projects from the server to ensure UI consistency and reflect changes.
      // This is preferred over manipulating local state directly after API call for robustness.
      console.log('Re-fetching projects after save operation...');
      await fetchProjects(); // Ensure fetchProjects is awaited if it's async
      console.log('Projects re-fetched.');
      
    } catch (error) {
      console.error('Error saving project in handleSaveProject:', error);
      alert(`保存项目失败: ${error instanceof Error ? error.message : '请稍后重试'}`);
    }
  };

  return (
    <>
      <PageHeader title="项目开发/数字员工" />
      
      <div className="p-6 lg:p-8">
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          {/* 操作栏 */}
          <div className="p-4 border-b border-gray-200 bg-gray-50/80 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button 
                className="btn btn-primary flex items-center"
                onClick={handleAddModalOpen}
              >
                <Plus className="w-4 h-4 mr-1.5" />
                添加项目
              </button>
              <button 
                className="btn btn-outline flex items-center"
                onClick={handleBatchModalOpen}
              >
                <Upload className="w-4 h-4 mr-1.5" />
                批量添加
              </button>
              <button className="btn btn-outline flex items-center">
                <Download className="w-4 h-4 mr-1.5" />
                导出项目
              </button>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="搜索项目..." 
                  className="form-input pl-9 py-2 w-64"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="btn btn-outline flex items-center text-sm">
                <Filter className="w-4 h-4 mr-1.5" />
                筛选
              </button>
              <button className="btn btn-outline flex items-center text-sm">
                <Download className="w-4 h-4 mr-1.5" />
                导出
              </button>
            </div>
          </div>

          {/* 表格 */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-4 text-gray-500">正在加载项目数据...</p>
                </div>
              </div>
            ) : error ? (
              <div className="p-4 border border-red-300 bg-red-50 rounded-md m-4">
                <h1 className="text-lg font-semibold mb-2 text-red-700">数据加载错误</h1>
                <p className="text-red-600">{error}</p>
              </div>
            ) : (
              <table className="table w-full">
                <thead>
                  <tr>
                    <th className="w-16 text-center">#</th>
                    <th>项目名称</th>
                    <th>类型</th>
                    <th>状态</th>
                    <th>所属业务流</th>
                    <th>负责人</th>
                    <th>开始日期</th>
                    <th>结束日期</th>
                    <th className="w-24 text-center">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-8 text-gray-500">
                        暂无项目数据
                      </td>
                    </tr>
                  ) : (
                    projects.map((project, index) => (
                      <tr key={project.id} className="data-row">
                        <td className="text-center text-gray-500">{index + 1}</td>
                        <td className="font-medium">{project.name}</td>
                        <td>{project.type}</td>
                        <td>
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                            project.status === 'active' ? 'bg-green-100 text-green-800' : 
                            project.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {project.status === 'active' ? '进行中' : 
                             project.status === 'pending' ? '待启动' : '已完成'}
                          </span>
                        </td>
                        <td>{project.department}</td>
                        <td>{project.owner}</td>
                        <td>{project.startDate}</td>
                        <td>{project.endDate || '-'}</td>
                        <td>
                          <div className="flex justify-center space-x-1 action-buttons">
                            <button title="查看" className="text-gray-500 hover:text-blue-600">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button 
                              title="编辑" 
                              className="text-gray-500 hover:text-blue-600"
                              onClick={() => handleEdit(project)}
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button title="更多操作" className="text-gray-500 hover:text-blue-600">
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
          
          {/* 分页 */}
          <div className="p-4 border-t border-gray-200 bg-gray-50/80 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              共 {projects.length} 条记录
            </div>
            <div className="flex items-center space-x-1">
              <button className="px-2.5 py-1.5 rounded border border-gray-300 bg-white text-sm text-gray-600 hover:bg-gray-50">
                上一页
              </button>
              <button className="px-3 py-1.5 rounded border border-blue-500 bg-blue-50 text-sm font-medium text-blue-600">
                1
              </button>
              <button className="px-2.5 py-1.5 rounded border border-gray-300 bg-white text-sm text-gray-600 hover:bg-gray-50">
                下一页
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 批量添加项目模态框 */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg"> 
            <div className="flex items-start justify-between mb-5">
              <h3 className="text-xl font-semibold text-gray-900">批量添加项目</h3>
              <button 
                onClick={handleBatchModalClose}
                className="text-gray-400 hover:text-gray-600 p-1 -mr-1 -mt-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {batchUploadStatus === 'loading' ? (
              <div className="py-6 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">{batchUploadMessage}</p>
              </div>
            ) : batchUploadStatus === 'success' ? (
              <div className="py-6 text-center">
                <div className="w-12 h-12 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="mt-4 text-gray-600">{batchUploadMessage}</p>
              </div>
            ) : (
              <>
                <div className="mt-5">
                  <p className="text-sm text-gray-600 mb-2">请上传CSV或Excel文件。确保文件包含以下列：项目名称, 类型, 状态, 所属业务流, 负责人, 开始日期, 结束日期。</p>
                  <a 
                    href="#" 
                    className="text-sm text-blue-600 hover:underline mb-4 block font-medium"
                    onClick={(e) => {
                      e.preventDefault();
                      downloadTemplate();
                    }}
                  >
                    下载模板文件 <Download className="w-3.5 h-3.5 inline-block ml-1" />
                  </a>
                  
                  {batchUploadStatus === 'error' && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start">
                      <AlertTriangle className="w-5 h-5 text-red-500 mr-2 mt-0.5" />
                      <p className="text-sm text-red-600">{batchUploadMessage}</p>
                    </div>
                  )}
                  
                  <input 
                    type="file" 
                    id="batchProjectFile"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  />
                </div>
                <div className="flex justify-end space-x-3 mt-8">
                  <button 
                    onClick={handleBatchModalClose}
                    className="btn btn-secondary text-sm"
                  >
                    取消
                  </button>
                  <button 
                    onClick={handleBatchSubmit}
                    className="btn btn-primary text-sm"
                  >
                    上传并添加
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 添加/编辑项目模态框 */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">{editingId ? '编辑项目' : '添加项目'}</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-1">项目名称 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  id="projectName"
                  value={newProject.name}
                  onChange={e => setNewProject({ ...newProject, name: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="例如：智能客服优化项目"
                  required
                />
              </div>
              <div>
                <label htmlFor="projectType" className="block text-sm font-medium text-gray-700 mb-1">项目类型 <span className="text-red-500">*</span></label>
                <select
                  id="projectType"
                  value={newProject.type}
                  onChange={e => setNewProject({ ...newProject, type: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">请选择项目类型</option>
                  <option value="数字员工">数字员工</option>
                  <option value="智能助手">智能助手</option>
                  <option value="数据分析">数据分析</option>
                  <option value="系统开发">系统开发</option>
                  <option value="流程优化">流程优化</option>
                  <option value="产品设计">产品设计</option>
                  <option value="其他">其他</option>
                </select>
              </div>
              <div>
                <label htmlFor="projectStatus" className="block text-sm font-medium text-gray-700 mb-1">项目状态 <span className="text-red-500">*</span></label>
                <select
                  id="projectStatus"
                  value={newProject.status}
                  onChange={e => setNewProject({ ...newProject, status: e.target.value as 'active' | 'pending' | 'completed' })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="pending">待启动</option>
                  <option value="active">进行中</option>
                  <option value="completed">已完成</option>
                </select>
              </div>
              <div>
                <label htmlFor="projectDepartment" className="block text-sm font-medium text-gray-700 mb-1">所属业务流 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  id="projectDepartment"
                  value={newProject.department}
                  onChange={e => setNewProject({ ...newProject, department: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="例如：客户服务流程、销售流程、采购流程"
                  required
                />
              </div>
              <div>
                <label htmlFor="projectOwner" className="block text-sm font-medium text-gray-700 mb-1">负责人 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  id="projectOwner"
                  value={newProject.owner}
                  onChange={e => setNewProject({ ...newProject, owner: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="项目负责人姓名"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="projectStartDate" className="block text-sm font-medium text-gray-700 mb-1">开始日期 <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    id="projectStartDate"
                    value={newProject.startDate}
                    onChange={e => setNewProject({ ...newProject, startDate: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="projectEndDate" className="block text-sm font-medium text-gray-700 mb-1">预计结束日期</label>
                  <input
                    type="date"
                    id="projectEndDate"
                    value={newProject.endDate || ''}
                    onChange={e => setNewProject({ ...newProject, endDate: e.target.value || undefined })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={handleAddModalClose}
                className="btn btn-secondary"
              >
                取消
              </button>
              <button
                onClick={handleSaveProject}
                className="btn btn-primary"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 