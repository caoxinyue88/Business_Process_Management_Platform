"use client";

import { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Upload, Download, Search, Filter, X, AlertTriangle } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';

// Assistant item data structure definition
interface AssistantItem {
  id: string;
  category: string;
  name: string;
  description: string;
  url: string;
  subcategory?: string;
}

// Initial assistant items data - will be replaced with Feishu data
const initialAssistantItems: AssistantItem[] = [
  { id: 'asst_init_1', name: '飞书主页', category: '快捷方式-创建文档', url: 'https://ka04d9j6pk.feishu.cn/drive/me/', description: '', subcategory: undefined },
  { id: 'asst_init_2', name: '创建飞书文档', category: '快捷方式-创建文档', url: '', description: '', subcategory: undefined },
  { id: 'asst_init_3', name: '创建飞书表格', category: '快捷方式-创建文档', url: '', description: '', subcategory: undefined },
  { id: 'asst_init_4', name: '数据策略-表单记录', category: '项目记录', url: '', description: '', subcategory: 'AI工具库' },
  { id: 'asst_init_5', name: '数据策略-仪表盘', category: '项目记录', url: '', description: '主要展示了进行中的项目及', subcategory: 'AI工具库' },
  { id: 'asst_init_6', name: '数据策略-文档底表', category: '项目记录', url: '', description: '以分析报告为主体记录的表', subcategory: 'AI工具库' },
  { id: 'asst_init_7', name: '直播运营-项目表', category: '项目记录', url: '', description: '以项目为主体记录的直播间大表', subcategory: undefined },
  { id: 'asst_init_8', name: '创建飞书多维表格', category: '快捷方式-创建文档', url: '', description: '', subcategory: undefined },
  { id: 'asst_init_9', name: '数字员工管理平台记录说明', category: '开发项目记录', url: '', description: '', subcategory: 'AI工具库' },
];

// Helper function to get all unique leaf categories from assistantItems for the modal dropdown
const getAllLeafCategories = (items: AssistantItem[]): string[] => {
  const categories = items.map(item => item.category);
  return Array.from(new Set(categories)).sort(); // Unique and sorted
};

// Loading component
function AssistantPageLoading() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="mt-2 text-gray-500">正在加载助理页面...</p>
      </div>
    </div>
  );
}

function AssistantPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams?.get('category');
  const subcategoryParam = searchParams?.get('subcategory');

  const [assistantItems, setAssistantItems] = useState<AssistantItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<Partial<AssistantItem>>({
    category: '', name: '', description: '', url: ''
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  // Batch processing state
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [batchFile, setBatchFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch data from the API
  useEffect(() => {
    const fetchAssistantItems = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch('/api/feishu/assistant');
        if (!response.ok) {
          throw new Error('Failed to fetch assistant items');
        }
        
        const data = await response.json();
        if (data.assistantItems && Array.isArray(data.assistantItems)) {
          setAssistantItems(data.assistantItems);
        } else {
          // Fall back to initial data if API returns unexpected format
          setAssistantItems(initialAssistantItems);
          setError('API returned unexpected data format');
        }
      } catch (err) {
        console.error('Error fetching assistant items:', err);
        setError('Failed to load data from Feishu. Using default data instead.');
        setAssistantItems(initialAssistantItems);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAssistantItems();
  }, []);

  // Function to download the CSV template
  const downloadTemplate = () => {
    // Create the CSV content with header row
    const csvContent = [
      "功能名称,功能模块,功能节点链接,产品介绍",
      "飞书主页,快捷方式-创建文档,https://ka04d9j6pk.feishu.cn/drive/me/,访问飞书云文档主页",
      "数据策略-表单记录,项目记录,,AI工具库相关表单记录"
    ].join("\n");

    // Create Blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', '功能资源批量导入模板.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const leafCategoriesForModal = useMemo(() => getAllLeafCategories(assistantItems), [assistantItems]);

  useEffect(() => {
    // Set default category for modal if a category is selected
    if (categoryParam && leafCategoriesForModal.includes(categoryParam)) {
      setCurrentItem(prev => ({ ...prev, category: categoryParam }));
    } else if (leafCategoriesForModal.length > 0) {
      setCurrentItem(prev => ({ ...prev, category: leafCategoriesForModal[0] }));
    }
  }, [categoryParam, leafCategoriesForModal]);

  const handleSaveItem = async () => {
    if (!currentItem.category) {
      alert('请填写功能模块。');
      return;
    }
    
    try {
      if (editingId) {
        // TODO: Implement API call to update item in Feishu
        // For now, just update the UI state
        setAssistantItems(assistantItems.map(item => 
          item.id === editingId 
            ? { ...item, ...currentItem, id: editingId } as AssistantItem
            : item
        ));
      } else {
        // Call API to create a new assistant item
        const response = await fetch('/api/feishu/assistant', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: currentItem.name,
            category: currentItem.category,
            subcategory: currentItem.subcategory,
            description: currentItem.description,
            url: currentItem.url
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to create assistant item');
        }
        
        const createdItem = await response.json();
        setAssistantItems([...assistantItems, createdItem]);
      }
      
      // Reset form and close modal
      const resetCategory = categoryParam && leafCategoriesForModal.includes(categoryParam) 
                          ? categoryParam 
                          : (leafCategoriesForModal[0] || '');
      setCurrentItem({ category: resetCategory, name: '', description: '', url: '' });
      setIsEditModalOpen(false);
      setEditingId(null);
    } catch (error) {
      console.error('Error saving assistant item:', error);
      alert('保存项目失败，请稍后重试');
    }
  };

  const handleEdit = (item: AssistantItem) => {
    setEditingId(item.id);
    setCurrentItem({ ...item });
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('确定要删除这个项目吗？')) {
      try {
        // TODO: Implement API call to delete item in Feishu
        // For now, just update the UI state
        setAssistantItems(assistantItems.filter(item => item.id !== id));
      } catch (error) {
        console.error('Error deleting assistant item:', error);
        alert('删除项目失败，请稍后重试');
      }
    }
  };

  // Function to handle batch modal open/close
  const handleBatchModalToggle = (isOpen: boolean) => {
    setIsBatchModalOpen(isOpen);
    if (!isOpen) {
      setBatchFile(null);
      setUploadStatus('idle');
      setUploadMessage('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  // Function to handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setBatchFile(file);
    setUploadStatus('idle');
    setUploadMessage('');
  };
  
  // Function to handle batch upload
  const handleBatchUpload = async () => {
    if (!batchFile) {
      setUploadStatus('error');
      setUploadMessage('请先选择文件');
      return;
    }
    
    setUploadStatus('uploading');
    setUploadMessage('正在上传...');
    
    try {
      const fileReader = new FileReader();
      fileReader.onload = async (event) => {
        const csvData = event.target?.result as string;
        if (!csvData) {
          setUploadStatus('error');
          setUploadMessage('无法读取文件内容');
          return;
        }

        const lines = csvData.split('\n');
        const rawHeaders = lines[0].split(',');
        const headers = rawHeaders.map((header, idx) => {
            let currentHeader = header.trim();
            if (idx === 0 && currentHeader.startsWith('\uFEFF')) {
                currentHeader = currentHeader.substring(1);
            }
            return currentHeader;
        });
        const parsedItems: Omit<AssistantItem, 'id'>[] = [];

        // 定义中文列标题到资源字段的映射
        const chineseHeaderMap: { [key: string]: string } = {
          '功能名称': 'name',
          '功能模块': 'category',
          '子分类': 'subcategory',
          '产品介绍': 'description',
          '功能节点链接': 'url'
        };
        
        // 同时兼容英文标题
        const englishHeaders = ['name', 'category', 'subcategory', 'description', 'url'];
        const headerMap: { [key: string]: number } = {};
        
        headers.forEach((header, index) => {
          // 检查是否是中文标题
          if (chineseHeaderMap[header]) {
            headerMap[chineseHeaderMap[header]] = index;
          } 
          // 兼容英文标题（原样比较）
          else if (englishHeaders.includes(header)) {
            headerMap[header] = index;
          }
        });

        // 验证必要的列标题是否存在 (name, category, url, description are required)
        if (!('name' in headerMap) || !('category' in headerMap) || !('url' in headerMap) || !('description' in headerMap)) {
            setUploadStatus('error');
            setUploadMessage('CSV文件缺少必要的列标题 (功能名称, 功能模块, 功能节点链接, 产品介绍)。请参照模板文件。');
            return;
        }

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (line) {
            const values = line.split(',').map(value => value.trim());
            const item: Omit<AssistantItem, 'id'> = {
              name: values[headerMap['name']] || '',
              category: values[headerMap['category']] || '',
              description: values[headerMap['description']] || '',
              url: values[headerMap['url']] || '',
              subcategory: headerMap.hasOwnProperty('subcategory') ? (values[headerMap['subcategory']] || undefined) : undefined
            };
            
            // Ensure essential fields (name and category) have actual values after parsing
            // URL and Description can be empty strings
            if (item.name && item.category) {
              parsedItems.push(item);
            } else {
              console.warn('Skipping CSV line due to missing required values for name or category:', line);
            }
          }
        }

        if (parsedItems.length === 0) {
          setUploadStatus('error');
          setUploadMessage('未在文件中找到有效数据，或数据格式不正确。');
          return;
        }
        
        // Send to the batch API endpoint
        const response = await fetch('/api/feishu/assistant/batch', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(parsedItems),
        });
        
        if (!response.ok) {
          throw new Error('Failed to process batch upload');
        }
        
        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to process batch upload');
        }
        
        // Update assistant items list with new data
        setAssistantItems(prev => [...prev, ...result.assistantItems]);
        
        setUploadStatus('success');
        setUploadMessage(`成功添加 ${result.count} 个功能助手项目`);
        
        // After a delay, close the modal
        setTimeout(() => {
          handleBatchModalToggle(false);
        }, 2000);
        
      };
      fileReader.onerror = () => {
        setUploadStatus('error');
        setUploadMessage('读取文件失败');
      };
      fileReader.readAsText(batchFile);
      
    } catch (error) {
      console.error('Error processing batch upload:', error);
      setUploadStatus('error');
      setUploadMessage('上传处理失败，请稍后重试');
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-500">正在从飞书加载功能助手数据...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-4 border border-red-300 bg-red-50 rounded-md">
          <h1 className="text-2xl font-bold mb-2">数据加载错误</h1>
          <p className="text-red-500">{error}</p>
        </div>
      );
    }
    
    let pageTitle = '功能助手'; // Default title
    let itemsToDisplay: AssistantItem[] = [];
    
    if (!categoryParam) {
      return (
        <div>
          <h1 className="text-2xl font-bold mb-6">功能助手</h1>
          <p>请从左侧选择一个分类查看项目。</p>
        </div>
      );
    }
    
    // Handle subcategory if present
    if (subcategoryParam) {
      pageTitle = `${categoryParam} - ${subcategoryParam}`;
      itemsToDisplay = assistantItems.filter(item => 
        item.category === categoryParam && 
        item.subcategory === subcategoryParam
      );
      
      return (
        <>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">
              {pageTitle}
              <span className="text-sm text-gray-500 ml-3">
                ({itemsToDisplay.length} 个项目)
              </span>
            </h1>
            <button 
              onClick={() => {
                setCurrentItem(prev => ({ 
                  ...prev, 
                  category: categoryParam,
                  subcategory: subcategoryParam
                }));
                setIsEditModalOpen(true);
                setEditingId(null);
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-150 ease-in-out"
            >
              添加项目
            </button>
          </div>
          {itemsToDisplay.length === 0 ? (
            <p>此分类下暂无项目。</p> 
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {itemsToDisplay.map(item => (
                <Card key={item.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle>{item.name}</CardTitle>
                      <div className="flex space-x-2">
                        <button onClick={() => handleEdit(item)} className="text-xs text-blue-500 hover:text-blue-700">编辑</button>
                        <button onClick={() => handleDelete(item.id)} className="text-xs text-red-500 hover:text-red-700">删除</button>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{item.subcategory || item.category}</div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3 h-12 overflow-hidden text-ellipsis">
                      {item.description}
                    </p>
                    {item.url ? (
                      <a 
                        href={item.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-blue-500 hover:text-blue-600 break-all"
                      >
                        {item.url}
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400 italic">（无功能节点链接）</span>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      );
    }
    
    // Regular category view
    pageTitle = categoryParam;
    itemsToDisplay = assistantItems.filter(item => item.category === categoryParam);

    return (
      <>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            {pageTitle}
            <span className="text-sm text-gray-500 ml-3">
              ({itemsToDisplay.length} 个项目)
            </span>
          </h1>
          <button 
            onClick={() => {
              setCurrentItem(prev => ({ ...prev, category: categoryParam }));
              setIsEditModalOpen(true);
              setEditingId(null);
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-150 ease-in-out"
          >
            添加功能
          </button>
        </div>
        {itemsToDisplay.length === 0 ? (
          <p>此分类下暂无项目。</p> 
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {itemsToDisplay.map(item => (
              <Card key={item.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle>{item.name}</CardTitle>
                    <div className="flex space-x-2">
                      <button onClick={() => handleEdit(item)} className="text-xs text-blue-500 hover:text-blue-700">编辑</button>
                      <button onClick={() => handleDelete(item.id)} className="text-xs text-red-500 hover:text-red-700">删除</button>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{item.subcategory || item.category}</div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3 h-12 overflow-hidden text-ellipsis">
                    {item.description}
                  </p>
                  {item.url ? (
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 hover:text-blue-600 break-all"
                    >
                      {item.url}
                    </a>
                  ) : (
                    <span className="text-xs text-gray-400 italic">（无功能节点链接）</span>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </>
    );
  };

  return (
    <>
      <PageHeader title={categoryParam || "功能助手"} />
      <div className="p-6 lg:p-8">
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          {/* 操作栏 */}
          <div className="p-4 border-b border-gray-200 bg-gray-50/80 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                className="btn btn-primary flex items-center"
                onClick={() => {
                  const defaultCategory = categoryParam && leafCategoriesForModal.includes(categoryParam)
                                      ? categoryParam
                                      : (leafCategoriesForModal[0] || '');
                  setCurrentItem({ category: defaultCategory, name: '', description: '', url: '' });
                  setIsEditModalOpen(true);
                  setEditingId(null);
                }}
              >
                <Plus className="w-4 h-4 mr-1.5" />
                添加功能
              </button>
              <button 
                className="btn btn-outline flex items-center"
                onClick={() => handleBatchModalToggle(true)}
              >
                <Upload className="w-4 h-4 mr-1.5" />
                批量添加
              </button>
              <button className="btn btn-outline flex items-center" disabled>
                <Download className="w-4 h-4 mr-1.5" />
                导出功能
              </button>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索功能..."
                  className="form-input pl-9 py-2 w-64"
                  // TODO: 实现搜索功能
                  disabled
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="btn btn-outline flex items-center text-sm" disabled>
                <Filter className="w-4 h-4 mr-1.5" />
                筛选
              </button>
              <button className="btn btn-outline flex items-center text-sm" disabled>
                <Download className="w-4 h-4 mr-1.5" />
                导出
              </button>
            </div>
          </div>
          {/* 表格 */}
          <div className="overflow-x-auto">
            <table className="table min-w-full">
              <thead>
                <tr>
                  <th className="w-16 text-center">#</th>
                  <th>功能名称</th>
                  <th>功能模块</th>
                  <th>功能节点链接</th>
                  <th>产品介绍</th>
                  <th className="w-20 text-center">操作</th>
                </tr>
              </thead>
              <tbody>
                {assistantItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-gray-500">
                      <span className="font-medium">暂无功能助手功能</span>
                      <p className="text-sm">点击&quot;添加功能&quot;来管理您的功能内容。</p>
                    </td>
                  </tr>
                ) : (
                  assistantItems.map((item, index) => (
                    <tr key={item.id}>
                      <td className="text-center text-gray-500">{index + 1}</td>
                      <td className="font-medium">{item.name}</td>
                      <td>{item.subcategory || item.category}</td>
                      <td>
                        {item.url ? (
                          <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 break-all">
                            {item.url}
                          </a>
                        ) : (
                          <span className="text-xs text-gray-400 italic">（无功能节点链接）</span>
                        )}
                      </td>
                      <td>{item.description}</td>
                      <td>
                        <div className="flex justify-center space-x-2">
                          <button onClick={() => handleEdit(item)} className="text-xs text-blue-500 hover:text-blue-700">编辑</button>
                          <button onClick={() => handleDelete(item.id)} className="text-xs text-red-500 hover:text-red-700">删除</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* 分页 */}
          <div className="p-4 border-t border-gray-200 bg-gray-50/80 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              共 {assistantItems.length} 条记录
            </div>
            <div className="flex items-center space-x-1">
              <button className="px-2.5 py-1.5 rounded border border-gray-300 bg-white text-sm text-gray-600 hover:bg-gray-50" disabled>
                上一页
              </button>
              <button className="px-3 py-1.5 rounded border border-blue-500 bg-blue-50 text-sm font-medium text-blue-600" disabled>
                1
              </button>
              <button className="px-2.5 py-1.5 rounded border border-gray-300 bg-white text-sm text-gray-600 hover:bg-gray-50" disabled>
                下一页
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* 添加/编辑文件模态框 */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">{editingId ? '编辑功能' : '添加功能'}</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="itemName" className="block text-sm font-medium text-gray-700 mb-1">功能名称 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  id="itemName"
                  value={currentItem.name || ''}
                  onChange={e => setCurrentItem({ ...currentItem, name: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="例如：项目总结报告、产品技术文档"
                  required
                />
              </div>
              <div>
                <label htmlFor="itemDescription" className="block text-sm font-medium text-gray-700 mb-1">产品介绍</label>
                <textarea
                  id="itemDescription"
                  value={currentItem.description || ''}
                  onChange={e => setCurrentItem({ ...currentItem, description: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="简要描述功能内容和用途"
                />
              </div>
              <div>
                <label htmlFor="itemUrl" className="block text-sm font-medium text-gray-700 mb-1">功能节点链接</label>
                <input
                  type="text"
                  id="itemUrl"
                  value={currentItem.url || ''}
                  onChange={e => setCurrentItem({ ...currentItem, url: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="例如：https://ka04d9j6pk.feishu.cn/docx/123456（可选）"
                />
              </div>
              <div>
                <label htmlFor="itemCategory" className="block text-sm font-medium text-gray-700 mb-1">功能模块 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  id="itemCategory"
                  value={currentItem.category || ''}
                  onChange={e => setCurrentItem({ ...currentItem, category: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="请输入功能模块"
                  required
                />
              </div>
              {subcategoryParam && (
                <div>
                  <label htmlFor="itemSubcategory" className="block text-sm font-medium text-gray-700 mb-1">子分类</label>
                  <input
                    type="text"
                    id="itemSubcategory"
                    value={currentItem.subcategory || subcategoryParam}
                    readOnly
                    className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
                  />
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  const resetCategory = categoryParam && leafCategoriesForModal.includes(categoryParam)
                    ? categoryParam
                    : (leafCategoriesForModal[0] || '');
                  setCurrentItem({ category: resetCategory, name: '', description: '', url: '' });
                  setEditingId(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                取消
              </button>
              <button
                onClick={handleSaveItem}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-md"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 批量添加模态框 */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">批量添加功能</h3>
            
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-4">
                请上传包含功能信息的CSV或Excel文件。文件应包含以下列：功能名称、功能模块、产品介绍和功能节点链接。
              </p>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".csv,.xlsx,.xls"
                  className="hidden"
                  id="batchFileInput"
                />
                
                <label 
                  htmlFor="batchFileInput" 
                  className="cursor-pointer flex flex-col items-center justify-center"
                >
                  <Upload className="w-10 h-10 text-gray-400 mb-2" />
                  <span className="text-sm font-medium text-gray-700">
                    {batchFile ? batchFile.name : '点击选择文件或拖拽文件到此处'}
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    支持 .csv, .xlsx, .xls 格式
                  </span>
                </label>
                
                {batchFile && (
                  <button 
                    onClick={() => {
                      setBatchFile(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                    className="mt-2 text-sm text-red-500 hover:text-red-700"
                  >
                    移除文件
                  </button>
                )}
              </div>
              
              <div className="mt-3">
                <a 
                  href="#" 
                  className="text-sm text-blue-500 hover:text-blue-700"
                  onClick={(e) => {
                    e.preventDefault();
                    downloadTemplate();
                  }}
                >
                  下载导入模板
                </a>
              </div>
              
              {uploadStatus === 'error' && (
                <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md flex items-start">
                  <AlertTriangle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{uploadMessage}</span>
                </div>
              )}
              
              {uploadStatus === 'success' && (
                <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md">
                  {uploadMessage}
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => handleBatchModalToggle(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                disabled={uploadStatus === 'uploading'}
              >
                取消
              </button>
              <button
                onClick={handleBatchUpload}
                disabled={!batchFile || uploadStatus === 'uploading'}
                className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                  !batchFile || uploadStatus === 'uploading'
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {uploadStatus === 'uploading' ? '上传中...' : '上传'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function AssistantPage() {
  return (
    <Suspense fallback={<AssistantPageLoading />}>
      <AssistantPageContent />
    </Suspense>
  );
} 