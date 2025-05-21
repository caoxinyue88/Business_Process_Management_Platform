"use client";

import { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation'; 
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Upload, Download, Search, Filter, X, AlertTriangle } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';

// 网站数据结构定义
interface Website {
  id: string;
  category: string;
  name: string;
  description: string;
  url: string;
  subcategory?: string;
}

// 初始网站数据 - Will be replaced with data from Feishu
const initialWebsites: Website[] = [
  // 抖音调研工具
  { id: '1', category: '抖音调研工具', name: '巨量力', description: '巨量引擎旗下营销平台', url: 'https://www.chanmofang.com/category/face/market/base' },
  { id: '2', category: '抖音调研工具', name: '巨量引擎方舟', description: '数据分析平台', url: 'https://agent.oceanengine.com/admin/homepage' },
  { id: '3', category: '抖音调研工具', name: '巨量云图', description: '数据可视化平台', url: 'https://yuntu.oceanengine.com/yuntu_brand/ecom/brand/live?gadv-id=1734331316623374' },
  { id: '4', category: '抖音调研工具', name: '罗盘策略', description: '数据分析工具', url: 'https://compassbrand.jinritemai.com/trade/monitor/mall?begin_date=1746057600&content_type=3&date_type=21&end_date=1746576000' },
  { id: '5', category: '抖音调研工具', name: '巨量算数', description: '数据分析平台', url: 'https://trendinsight.oceanengine.com/' },
  { id: '6', category: '抖音调研工具', name: '蝉妈妈', description: '电商数据分析平台', url: 'https://www.chanmama.com/login.html' },
  { id: '7', category: '抖音调研工具', name: '巨量百应', description: '数据洞察平台', url: 'https://buyin.jinritemai.com/mpa/account/login?log_out=1&type=24%3%80#1' },

  // 宏观资讯
  { id: '8', category: '宏观资讯', name: '国家统计局', description: '官方统计数据', url: 'https://data.stats.gov.cn/index.htm' },
  { id: '9', category: '宏观资讯', name: '财政部', description: '财政政策和数据', url: 'http://www.mof.gov.cn/gkml/' },
  { id: '10', category: '宏观资讯', name: '中商产业研究院', description: '行业研究报告', url: 'http://www.askci.com/' },
  { id: '11', category: '宏观资讯', name: '行行查-行业研究数据', description: '行业数据库', url: 'https://www.hanghangcha.com/?mer=basic&id_vid=11140651508190381149' },

  // 企业资讯
  { id: '12', category: '企业资讯', name: '天眼查', description: '企业信息查询', url: 'https://www.tianyancha.com/company/5134100354/gongsi' },
  { id: '13', category: '企业资讯', name: '企业预警通', description: '企业风险监控', url: 'https://www.qyyjt.cn/' },
  { id: '14', category: '企业资讯', name: '巨潮资讯', description: '上市公司信息', url: 'https://www.cninfo.com.cn/new/index' },

  // 热点资讯
  { id: '15', category: '热点资讯', name: '企业预警通快报', description: '企业风险快讯', url: 'https://www.qyyjt.cn/publicOpinions/newFlash' },
  { id: '16', category: '热点资讯', name: '36氪', description: '科技创业资讯', url: 'https://36kr.com/information/AI/' },
  { id: '17', category: '热点资讯', name: '知微舆情', description: '舆情监测分析', url: 'https://ef.zhiweidata.com/search/searchAll?pci=ai' },
  { id: '18', category: '热点资讯', name: '真男财经', description: '财经资讯', url: 'https://www.douyin.com/user/MS4wLjABAAAADUObyc_aoKXnXn1EDlJfcZMvkUJ0_ZFnFVQAU-wzt0gIjUbFCQhmi1aDbCOnt1aDASh?tab_name=main' },
  { id: '19', category: '热点资讯', name: '今日热榜', description: '热门资讯聚合', url: 'https://tophub.today/' },

  // 排行榜单
  { id: '20', category: '排行榜单', name: '果汁排行榜', description: '综合排行数据', url: 'http://guozhivip.com/rank/qi.html' },
  { id: '21', category: '排行榜单', name: '脉脉排行榜', description: '职场排行榜', url: 'https://www.maimai.com/' },

  // 常用报告
  { id: '22', category: '常用报告', name: '发现数据', description: '数据报告平台', url: 'https://www.fxbaogao.com/rp?keywords=%E6%8A%96%E9%9F%B3&order=2&nops=1' },
  { id: '23', category: '常用报告', name: '艾瑞咨询', description: '行业研究报告', url: 'https://www.djyanbao.com/report/search' },
  { id: '24', category: '常用报告', name: '镝数聚', description: '数据可视化报告', url: 'https://www.dydata.io/supply/demand/search/' },
  { id: '25', category: '常用报告', name: '三个身度区', description: '市场研究报告', url: 'https://www.sgpips.com/?plan=shanbaoci&unit=001-sangepingbaogao&tag=1&bid_vid=80937368534074723616&sdkid=AU1G19t_bSD6A6DsAo' },

  // ** CHANGED CATEGORY: Formerly "AI工具", now "常用AI工具" **
  { id: '26', category: '常用AI工具', name: 'AI工具集', description: 'AI工具合集', url: 'https://ai-bot.cn/' },
  { id: '27', category: '常用AI工具', name: 'AIGC导航', description: 'AI生成内容工具导航', url: 'https://www.aigc.cn/' },
  { id: '28', category: '常用AI工具', name: '提示词图书馆', description: '提示词资源', url: '提示词图书馆' },
  { id: '29', category: '常用AI工具', name: '通义', description: 'AI助手', url: 'https://tongyi.aliyun.com/qianwen' },
  { id: '30', category: '常用AI工具', name: '灵犀', description: '智能助手', url: 'https://copilot.wps.cn/chat?id=784236526764083' },
  { id: '31', category: '常用AI工具', name: '多维度对话', description: 'AI对话工具', url: 'https://p1.api.pro/#!/chat/0066985506' },

  // 对话AI大模型-国内
  { id: '32', category: '对话AI大模型国内', name: 'deepseek', description: '深度学习模型', url: 'https://chat.deepseek.com/' },
  { id: '33', category: '对话AI大模型国内', name: '豆包', description: '百度AI助手', url: 'https://www.doubao.com/chat/?channel=bing_sem&source=dbweb_bing_sem_xhs_cpc_ping_hexin_bsapt_05&keyworldid=77103638570967&medkid=49bf0fb826a11e2ffc3b57a499c4f683' },
  { id: '34', category: '对话AI大模型国内', name: '秘塔', description: 'AI对话工具', url: 'https://metaso.cn/' },
  { id: '35', category: '对话AI大模型国内', name: '腾讯混元', description: '腾讯AI助手', url: 'https://hunyuan.tencent.com/chat/naQixTimsDa/426a65d4-18a7-4f20-81a6-60145102e6f2' },

  // 对话AI大模型-国外
  { id: '36', category: '对话AI大模型国外', name: 'ChatGPT', description: 'OpenAI的对话模型', url: 'https://chatgpt.com/?model=auto' },
  { id: '37', category: '对话AI大模型国外', name: 'Gemini', description: 'Google的AI助手', url: 'https://gemini.google.com/app' },
  { id: '38', category: '对话AI大模型国外', name: 'Claude', description: 'Anthropic的AI助手', url: 'https://claude.ai/new' },
  { id: '39', category: '对话AI大模型国外', name: 'grok', description: 'xAI的AI助手', url: 'https://grok.com/' },
];

// Define mapping for sidebar categories to their original constituent categories
const parentCategoryMapping: { [key: string]: string[] } = {
  '资讯类网站': ['宏观资讯', '企业资讯', '热点资讯'],
  'AI工具': ['常用AI工具', '对话AI大模型国内', '对话AI大模型国外'],
};

// Helper function to get all unique leaf categories from initialWebsites for the modal dropdown
const getAllLeafCategories = (websites: Website[]): string[] => {
  const categories = websites.map(site => site.category);
  return Array.from(new Set(categories)).sort(); // Unique and sorted
};

// Loading component
function WebsitesPageLoading() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="mt-2 text-gray-500">正在加载网站页面...</p>
      </div>
    </div>
  );
}

function WebsitesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const categoryParam = searchParams?.get('category');
  const subcategoryParam = searchParams?.get('subcategory');
  
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newWebsite, setNewWebsite] = useState<Partial<Website>>({
    category: '', name: '', description: '', url: ''
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Batch processing state
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [batchFile, setBatchFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Fetch website data from the API
  useEffect(() => {
    const fetchWebsites = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch('/api/feishu/websites');
        if (!response.ok) {
          throw new Error('Failed to fetch websites');
        }
        
        const data = await response.json();
        if (data.websites && Array.isArray(data.websites)) {
          setWebsites(data.websites);
        } else {
          // Fall back to initial data if API returns unexpected format
          setWebsites(initialWebsites);
          setError('API returned unexpected data format');
        }
      } catch (err) {
        console.error('Error fetching websites:', err);
        setError('Failed to load websites from Feishu. Using default data instead.');
        setWebsites(initialWebsites);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWebsites();
  }, []);

  // Function to download the CSV template
  const downloadTemplate = () => {
    // Create the CSV content with header row
    const csvContent = [
      "功能名称,功能模块,功能连接节点,产品介绍",
      "天眼查,企业资讯,https://www.tianyancha.com,企业信息查询平台",
      "巨量云图,抖音调研工具,https://yuntu.oceanengine.com,数据可视化分析平台"
    ].join("\n");

    // Create Blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', '常用功能批量导入模板.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const leafCategoriesForModal = useMemo(() => getAllLeafCategories(websites), [websites]);

  useEffect(() => {
    let defaultCategoryForModal = leafCategoriesForModal[0] || '';
    if (categoryParam) {
      if (parentCategoryMapping[categoryParam] && parentCategoryMapping[categoryParam].length > 0) {
        // If current category is a parent, default modal to its first child
        defaultCategoryForModal = parentCategoryMapping[categoryParam][0];
      } else if (leafCategoriesForModal.includes(categoryParam)) {
        // If current category is a leaf, default modal to it
        defaultCategoryForModal = categoryParam;
      }
    }
    setNewWebsite(prev => ({ ...prev, category: defaultCategoryForModal }));
  }, [categoryParam, leafCategoriesForModal]);

  const handleSaveWebsite = async () => {
    if (!newWebsite.category) {
      alert('请填写功能模块。');
      return;
    }
    
    try {
      if (editingId) {
        // TODO: Implement API call to update website in Feishu
        // For now, just update the UI state
        setWebsites(websites.map(site => 
          site.id === editingId 
            ? { ...site, ...newWebsite, id: editingId } as Website
            : site
        ));
      } else {
        // Call API to create a new website
        const response = await fetch('/api/feishu/websites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: newWebsite.name,
            category: newWebsite.category,
            subcategory: newWebsite.subcategory,
            description: newWebsite.description,
            url: newWebsite.url
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to create website');
        }
        
        const createdWebsite = await response.json();
        setWebsites([...websites, createdWebsite]);
      }
      
      // Reset form and close modal
      const currentCategoryForModal = newWebsite.category || categoryParam || (parentCategoryMapping[categoryParam || '']?.[0]) || leafCategoriesForModal[0] || '';
      setNewWebsite({ category: currentCategoryForModal, name: '', description: '', url: '' });
      setIsAddModalOpen(false);
      setEditingId(null);
    } catch (error) {
      console.error('Error saving website:', error);
      alert('保存网站失败，请稍后重试');
    }
  };

  const handleEdit = (site: Website) => {
    setEditingId(site.id);
    setNewWebsite({ ...site });
    setIsAddModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('确定要删除这个网站吗？')) {
      try {
        // TODO: Implement API call to delete website in Feishu
        // For now, just update the UI state
        setWebsites(websites.filter(site => site.id !== id));
      } catch (error) {
        console.error('Error deleting website:', error);
        alert('删除网站失败，请稍后重试');
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
      // For demonstration, we'll mock parsing the file
      // In a real implementation, you would use a library to parse CSV/Excel
      
      // Mock parsed data
      const mockParsedData: Omit<Website, 'id'>[] = [
        {
          category: '宏观资讯',
          name: '数据分析平台',
          description: '提供详细的数据分析服务',
          url: 'https://example.com/data-analysis'
        },
        {
          category: '企业资讯',
          name: '企业监控系统',
          description: '实时监控企业动态',
          url: 'https://example.com/company-monitor'
        }
      ];
      
      // Send to the batch API endpoint
      const response = await fetch('/api/feishu/websites/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockParsedData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to process batch upload');
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to process batch upload');
      }
      
      // Update websites list with new data
      setWebsites(prev => [...prev, ...result.websites]);
      
      setUploadStatus('success');
      setUploadMessage(`成功添加 ${result.count} 个网站`);
      
      // After a delay, close the modal
      setTimeout(() => {
        handleBatchModalToggle(false);
      }, 2000);
      
    } catch (error) {
      console.error('Error processing batch upload:', error);
      setUploadStatus('error');
      setUploadMessage('上传处理失败，请稍后重试');
    }
  };

  return (
    <>
      <PageHeader title="常用网站" />
      <div className="p-6 lg:p-8">
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          {/* 操作栏 */}
          <div className="p-4 border-b border-gray-200 bg-gray-50/80 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                className="btn btn-primary flex items-center"
                onClick={() => {
                  setNewWebsite({ category: '', name: '', description: '', url: '' });
                  setIsAddModalOpen(true);
                  setEditingId(null);
                }}
              >
                <Plus className="w-4 h-4 mr-1.5" />
                添加网站
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
                  <th>功能连接节点</th>
                  <th>产品介绍</th>
                  <th className="w-20 text-center">操作</th>
                </tr>
              </thead>
              <tbody>
                {websites.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-gray-500">
                      <span className="font-medium">暂无常用网站</span>
                      <p className="text-sm">点击&quot;添加网站&quot;来管理您的常用链接。</p>
                    </td>
                  </tr>
                ) : (
                  websites.map((site, index) => (
                    <tr key={site.id}>
                      <td className="text-center text-gray-500">{index + 1}</td>
                      <td className="font-medium">{site.name}</td>
                      <td>{site.subcategory || site.category}</td>
                      <td>
                        <a href={site.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 break-all">
                          {site.url}
                        </a>
                      </td>
                      <td>{site.description}</td>
                      <td>
                        <div className="flex justify-center space-x-2">
                          <button onClick={() => handleEdit(site)} className="text-xs text-blue-500 hover:text-blue-700">编辑</button>
                          <button onClick={() => handleDelete(site.id)} className="text-xs text-red-500 hover:text-red-700">删除</button>
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
              共 {websites.length} 条记录
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
      {/* 添加/编辑网站模态框 */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">{editingId ? '编辑功能' : '添加网站'}</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="siteName" className="block text-sm font-medium text-gray-700 mb-1">功能名称 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  id="siteName"
                  value={newWebsite.name || ''}
                  onChange={e => setNewWebsite({ ...newWebsite, name: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="例如：天眼查、企业预警通"
                  required
                />
              </div>
              <div>
                <label htmlFor="siteDescription" className="block text-sm font-medium text-gray-700 mb-1">产品介绍 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  id="siteDescription"
                  value={newWebsite.description || ''}
                  onChange={e => setNewWebsite({ ...newWebsite, description: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="简要描述系统的主要功能，例如：企业信息查询、数据分析平台"
                  required
                />
              </div>
              <div>
                <label htmlFor="siteUrl" className="block text-sm font-medium text-gray-700 mb-1">功能连接节点 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  id="siteUrl"
                  value={newWebsite.url || ''}
                  onChange={e => setNewWebsite({ ...newWebsite, url: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="完整访问地址，例如：https://www.tianyancha.com"
                  required
                />
              </div>
              <div>
                <label htmlFor="siteCategory" className="block text-sm font-medium text-gray-700 mb-1">功能模块 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  id="siteCategory"
                  value={newWebsite.category || ''}
                  onChange={e => setNewWebsite({ ...newWebsite, category: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="请输入功能模块"
                  required
                />
              </div>
              {subcategoryParam && (
                <div>
                  <label htmlFor="siteSubcategory" className="block text-sm font-medium text-gray-700 mb-1">子分类</label>
                  <input
                    type="text"
                    id="siteSubcategory"
                    value={newWebsite.subcategory || subcategoryParam}
                    readOnly
                    className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
                  />
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  const resetCategory = categoryParam && leafCategoriesForModal.includes(categoryParam)
                    ? categoryParam
                    : (leafCategoriesForModal[0] || '');
                  setNewWebsite({ category: resetCategory, name: '', description: '', url: '' });
                  setEditingId(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                取消
              </button>
              <button
                onClick={handleSaveWebsite}
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
                请上传包含功能信息的CSV或Excel文件。文件应包含以下列：功能名称、功能模块、产品介绍和功能连接节点。
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
                    // In a real implementation, provide a template download link
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

export default function WebsitesPage() {
  return (
    <Suspense fallback={<WebsitesPageLoading />}>
      <WebsitesPageContent />
    </Suspense>
  );
} 