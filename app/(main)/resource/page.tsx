'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { 
  Plus, Search, Filter, Download, MoreHorizontal, 
  Edit, Trash, Copy, Eye, Clock, Upload, X, AlertTriangle
} from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import { Resource } from '@/types/resource';

// Create a loading component
function ResourcePageLoading() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="mt-2 text-gray-500">正在加载资源页面...</p>
      </div>
    </div>
  );
}

function ResourcePageContent() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [batchFile, setBatchFile] = useState<File | null>(null);
  const [batchUploadStatus, setBatchUploadStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [batchUploadMessage, setBatchUploadMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newResource, setNewResource] = useState<Omit<Resource, 'id'>>({
    name: '',
    type: '',
    category: '',
    status: 'active',
    owner: '',
    lastUpdated: new Date().toISOString().split('T')[0],
    expiryDate: ''
  });

  // Fetch resources on component mount
  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/feishu/resources');
      if (!response.ok) {
        throw new Error('Failed to fetch resources');
      }
      
      const data = await response.json();
      if (data.resources && Array.isArray(data.resources)) {
        setResources(data.resources);
      } else {
        setError('API returned unexpected data format');
      }
    } catch (err) {
      console.error('Error fetching resources:', err);
      setError('Failed to load resources. Please try again later.');
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
      "资源名称,资源类型,所属项目,状态,负责人,最后更新日期,过期日期",
      "资源示例,数据库,知识库,active,张三,2024-06-15,2025-12-31",
      "资源示例2,媒体库,设计资源,pending,李四,2024-06-20,2025-08-15"
    ].join("\n");

    // Create Blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', '资源库批量导入模板.csv');
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
        const parsedItems: Omit<Resource, 'id'>[] = [];

        // 定义中文列标题到资源字段的映射
        const chineseHeaderMap: { [key: string]: string } = {
          '资源名称': 'name',
          '资源类型': 'type',
          '所属项目': 'category',
          '状态': 'status',
          '负责人': 'owner',
          '最后更新日期': 'lastupdated',
          '过期日期': 'expirydate',
          '资源描述': 'description'
        };
        
        // 同时兼容英文标题
        const englishHeaders = ['name', 'type', 'category', 'status', 'owner', 'lastupdated', 'expirydate', 'description'];
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
        if (!('name' in headerMap) || !('type' in headerMap) || !('category' in headerMap)) {
            setBatchUploadStatus('error');
            setBatchUploadMessage('CSV文件缺少必要的列标题 (资源名称, 资源类型, 所属项目)。请参照模板文件。');
            return;
        }

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (line) {
            const values = line.split(',').map(value => value.trim());
            
            const csvStatus = values[headerMap['status']]?.toLowerCase();
            let status: 'active' | 'deprecated' | 'pending' = 'active'; // Default status
            if (csvStatus === 'active' || csvStatus === 'deprecated' || csvStatus === 'pending') {
              status = csvStatus;
            }

            const item: Omit<Resource, 'id'> = {
              name: values[headerMap['name']] || '',
              type: values[headerMap['type']] || '',
              category: values[headerMap['category']] || '',
              status: status,
              owner: values[headerMap['owner']] || '',
              lastUpdated: values[headerMap['lastupdated']] || new Date().toISOString().split('T')[0], // Default to today
              expiryDate: values[headerMap['expirydate']] || '', // Default to empty string if not provided
            };

            // Ensure essential fields are present
            if (item.name && item.type && item.category) {
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
        const response = await fetch('/api/feishu/resources/batch', {
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
          throw new Error(`Failed to batch create resources: ${response.status} ${errorText}`);
        }
        
        const result = await response.json();
        console.log('API response data:', result);
        
        if (!result.success) {
          console.error('API returned error:', result.error);
          throw new Error(result.error || 'Failed to batch create resources');
        }
        
        // Update the resources list with the newly added resources
        setResources(prev => [...prev, ...result.resources]);
        
        setBatchUploadStatus('success');
        setBatchUploadMessage(`成功添加了 ${result.count} 个资源`);
        
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
      console.error('Error batch uploading resources:', err);
      setBatchUploadStatus('error');
      setBatchUploadMessage(`批量添加失败: ${err instanceof Error ? err.message : '请确保文件格式正确并重试'}`);
    }
  };

  // Function to handle add/edit modal
  const handleAddModalOpen = () => {
    setNewResource({
      name: '',
      type: '',
      category: '',
      status: 'active',
      owner: '',
      lastUpdated: new Date().toISOString().split('T')[0],
      expiryDate: ''
    });
    setEditingId(null);
    setIsAddModalOpen(true);
  };

  const handleAddModalClose = () => {
    setIsAddModalOpen(false);
  };

  const handleEdit = (resource: Resource) => {
    setEditingId(resource.id);
    setNewResource({
      name: resource.name,
      type: resource.type,
      category: resource.category,
      status: resource.status,
      owner: resource.owner,
      lastUpdated: resource.lastUpdated,
      expiryDate: resource.expiryDate
    });
    setIsAddModalOpen(true);
  };

  const handleSaveResource = async () => {
    try {
      if (!newResource.name || !newResource.type || !newResource.category) {
        alert('请填写所有必填字段');
        return;
      }

      if (editingId) {
        // Edit existing resource - send as expected JSON body
        const response = await fetch('/api/feishu/resources', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingId,
            ...newResource
          })
        });

        if (!response.ok) {
          throw new Error('Failed to update resource');
        }

        const updatedResource = await response.json();
        setResources(prev => prev.map(r => r.id === editingId ? updatedResource : r));
      } else {
        // Add new resource
        const response = await fetch('/api/feishu/resources', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newResource)
        });

        if (!response.ok) {
          throw new Error('Failed to create resource');
        }

        const createdResource = await response.json();
        setResources(prev => [...prev, createdResource]);
      }

      // Reset new resource form and close modal
      setNewResource({
        name: '',
        type: '',
        category: '',
        status: 'active',
        owner: '',
        lastUpdated: new Date().toISOString().split('T')[0],
        expiryDate: ''
      });
      setEditingId(null);
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Error saving resource:', error);
      alert('保存资源失败，请稍后重试');
    }
  };

  return (
    <>
      <PageHeader title="资源库" />
      
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
                添加资源
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
                导出资源
              </button>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="搜索资源..." 
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
                  <p className="mt-4 text-gray-500">正在加载资源数据...</p>
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
                    <th>资源名称</th>
                    <th>类型</th>
                    <th>所属项目</th>
                    <th>状态</th>
                    <th>负责人</th>
                    <th>最后更新</th>
                    <th>到期日期</th>
                    <th className="w-24 text-center">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {resources.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-8 text-gray-500">
                        暂无资源数据
                      </td>
                    </tr>
                  ) : (
                    resources.map((resource, index) => (
                      <tr key={resource.id} className="data-row">
                        <td className="text-center text-gray-500">{index + 1}</td>
                        <td className="font-medium">{resource.name}</td>
                        <td>{resource.type}</td>
                        <td>{resource.category}</td>
                        <td>
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                            resource.status === 'active' ? 'bg-green-100 text-green-800' : 
                            resource.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'
                          }`}>
                            {resource.status === 'active' ? '正常' : 
                             resource.status === 'pending' ? '待审核' : '已废弃'}
                          </span>
                        </td>
                        <td>{resource.owner}</td>
                        <td>{resource.lastUpdated}</td>
                        <td>
                          <div className="flex items-center">
                            {new Date(resource.expiryDate) < new Date() ? (
                              <span className="text-red-600 flex items-center text-xs">
                                <Clock className="w-3 h-3 mr-1" />已过期
                              </span>
                            ) : (
                              resource.expiryDate
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="flex justify-center space-x-1 action-buttons">
                            <button title="查看" className="text-gray-500 hover:text-blue-600">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button 
                              title="编辑" 
                              className="text-gray-500 hover:text-blue-600"
                              onClick={() => handleEdit(resource)}
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
              共 {resources.length} 条记录
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

      {/* 批量添加资源模态框 */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
            <div className="flex items-start justify-between mb-5">
              <h3 className="text-xl font-semibold text-gray-900">批量添加资源库节点</h3>
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
                  <p className="text-sm text-gray-600 mb-2">请上传CSV或Excel文件。确保文件包含以下列：资源名称, 类型, 所属项目, 状态, 负责人, 创建时间, 过期时间, 描述。</p>
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
                    id="batchResourceFile"
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

      {/* 添加/编辑资源模态框 */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">{editingId ? '编辑资源' : '添加资源'}</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="resourceName" className="block text-sm font-medium text-gray-700 mb-1">资源名称 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  id="resourceName"
                  value={newResource.name}
                  onChange={e => setNewResource({ ...newResource, name: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="例如：客户知识库、产品手册、开发文档"
                  required
                />
              </div>
              <div>
                <label htmlFor="resourceType" className="block text-sm font-medium text-gray-700 mb-1">资源类型 <span className="text-red-500">*</span></label>
                <select
                  id="resourceType"
                  value={newResource.type}
                  onChange={e => setNewResource({ ...newResource, type: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">请选择资源类型</option>
                  <option value="数据库">数据库</option>
                  <option value="知识库">知识库</option>
                  <option value="媒体库">媒体库</option>
                  <option value="文档">文档</option>
                  <option value="API">API</option>
                  <option value="模型">模型</option>
                  <option value="工具">工具</option>
                  <option value="其他">其他</option>
                </select>
              </div>
              <div>
                <label htmlFor="resourceCategory" className="block text-sm font-medium text-gray-700 mb-1">所属项目 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  id="resourceCategory"
                  value={newResource.category}
                  onChange={e => setNewResource({ ...newResource, category: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="例如：智能客服项目、数据分析平台、业务流程自动化"
                  required
                />
              </div>
              <div>
                <label htmlFor="resourceStatus" className="block text-sm font-medium text-gray-700 mb-1">状态 <span className="text-red-500">*</span></label>
                <select
                  id="resourceStatus"
                  value={newResource.status}
                  onChange={e => setNewResource({ ...newResource, status: e.target.value as 'active' | 'deprecated' | 'pending' })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="active">正常使用</option>
                  <option value="pending">待审核</option>
                  <option value="deprecated">已废弃</option>
                </select>
              </div>
              <div>
                <label htmlFor="resourceOwner" className="block text-sm font-medium text-gray-700 mb-1">负责人 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  id="resourceOwner"
                  value={newResource.owner}
                  onChange={e => setNewResource({ ...newResource, owner: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="资源维护负责人姓名"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="resourceLastUpdated" className="block text-sm font-medium text-gray-700 mb-1">最后更新日期 <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    id="resourceLastUpdated"
                    value={newResource.lastUpdated}
                    onChange={e => setNewResource({ ...newResource, lastUpdated: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="resourceExpiryDate" className="block text-sm font-medium text-gray-700 mb-1">过期日期</label>
                  <input
                    type="date"
                    id="resourceExpiryDate"
                    value={newResource.expiryDate || ''}
                    onChange={e => setNewResource({ ...newResource, expiryDate: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="若资源无过期时间可不填"
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
                onClick={handleSaveResource}
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

export default function ResourcePage() {
  return (
    <Suspense fallback={<ResourcePageLoading />}>
      <ResourcePageContent />
    </Suspense>
  );
} 