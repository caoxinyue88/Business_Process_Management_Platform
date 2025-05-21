'use client';

import { useState, useEffect, MouseEvent as ReactMouseEvent, createRef, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { 
  Workflow, LayoutDashboard, UsersRound, FolderKanban, Library, 
  BookMarked, Globe2, LifeBuoy, Settings2, ChevronDown, ChevronUp, Menu, FileText, Tag, List, CornerDownRight, PlusCircle
} from 'lucide-react';
import ContextMenu from '../ui/ContextMenu';
import BusinessFlowModal from '../modals/BusinessFlowModal';
import { useRouter } from 'next/navigation';

// Interfaces
interface BusinessFlowItem {
  id: string;
  name: string;
  parentId?: string;
  children?: BusinessFlowItem[];
  detailPageId?: string;
  description?: string;
  projects?: number;
  resources?: number;
  lastAccessed?: string;
}

interface NavLinkItem {
  name: string;
  icon: React.ElementType;
  path?: string;
  queryParam?: string;
  children?: NavLinkItem[];
  parentId?: string;
  id: string;
}

interface ContextMenuState {
  isVisible: boolean;
  x: number;
  y: number;
  targetId: string | null;
  targetType: 'businessFlow' | 'websiteCategory' | 'assistantCategory' | null;
}

interface ModalState {
  isOpen: boolean;
  mode: 'add' | 'edit' | 'addSub';
  parentId?: string | null;
  initialName?: string;
  initialDescription?: string;
  flowId?: string;
  title?: string;
}

// Default data
const defaultBusinessFlows: BusinessFlowItem[] = [
  { 
    id: 'bf-Beta',
    name: '客服机器人Beta', 
    detailPageId: 'digitalEmployeeDetailPage_Beta', 
    description: '职责：处理客户常见问题，提供7x24小时支持。', 
    projects: 1, 
    resources: 1, 
    lastAccessed: '昨天',
    children: []
  }
];

const defaultSidebarWebsiteLinks: NavLinkItem[] = [];
const defaultSidebarAssistantLinks: NavLinkItem[] = [];

// Helper function
const getIconComponent = (iconName: string): React.ElementType => {
  switch (iconName) {
    case 'List': return List;
    case 'Tag': return Tag;
    case 'FileText': return FileText;
    default: return Tag;
  }
};

// Loading component
function SidebarLoading() {
  return (
    <div className="sidebar text-gray-300 p-4 space-y-6 flex flex-col fixed h-full z-30 shadow-lg animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-8 w-32 bg-gray-600 rounded"></div>
      </div>
      <div className="flex-grow space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-8 bg-gray-600 rounded w-full"></div>
        ))}
      </div>
    </div>
  );
}

// This component uses hooks that require client components
function SidebarWithParams() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const categoryParam = searchParams?.get('category');
  const subcategoryParam = searchParams?.get('subcategory');
  
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State with default values
  const [businessFlows, setBusinessFlows] = useState<BusinessFlowItem[]>(defaultBusinessFlows);
  const [sidebarWebsiteLinks, setSidebarWebsiteLinks] = useState<NavLinkItem[]>(defaultSidebarWebsiteLinks);
  const [sidebarAssistantLinks, setSidebarAssistantLinks] = useState<NavLinkItem[]>(defaultSidebarAssistantLinks);

  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>(() => ({
    businessFlow: true, dataDictionary: false, websites: true, assistant: true,
  }));

  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    isVisible: false, x: 0, y: 0, targetId: null, targetType: null,
  });

  const [businessFlowModalState, setBusinessFlowModalState] = useState<ModalState>({
    isOpen: false, mode: 'add', parentId: null,
  });

  // Add back the useEffect hook
  useEffect(() => {
    fetchData();
  }, []);

  // Change the fetchData function to use simpler error handling now that we have localStorage backup
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Try to fetch data, but don't throw/catch each individually
      // Default values will be used when APIs fail
      const [businessFlowResponse, websitesResponse, assistantResponse] = await Promise.allSettled([
        fetch('/api/feishu/business-flows'),
        fetch('/api/feishu/websites'),
        fetch('/api/feishu/assistant')
      ]);
      
      // Handle business flow data
      if (businessFlowResponse.status === 'fulfilled' && businessFlowResponse.value.ok) {
        const businessFlowData = await businessFlowResponse.value.json();
        if (Array.isArray(businessFlowData)) {
          setBusinessFlows(businessFlowData);
        } else {
          setBusinessFlows(defaultBusinessFlows); // Fallback
          console.warn('Fetched business flows was not an array:', businessFlowData);
        }
      } else {
        console.error('Failed to fetch business flows:', businessFlowResponse.status === 'rejected' ? businessFlowResponse.reason : 'Request not ok');
        setBusinessFlows(defaultBusinessFlows); // Fallback
      }
      
      // Handle website data
      if (websitesResponse.status === 'fulfilled' && websitesResponse.value.ok) {
        const websitesData = await websitesResponse.value.json();
        if (websitesData && websitesData.websites) {
          // Use the raw website data
          // Website hierarchy is defined directly in the component now
        }
      }
      
      // Handle assistant data
      if (assistantResponse.status === 'fulfilled' && assistantResponse.value.ok) {
        const assistantData = await assistantResponse.value.json();
        if (assistantData && assistantData.assistantItems) {
          // Use assistant data if needed
        }
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Using default values.');
      setBusinessFlows(defaultBusinessFlows);
    } finally {
      setLoading(false);
    }
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const toggleSection = (sectionKey: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  // Updated context menu handler
  const handleContextMenu = (event: ReactMouseEvent, itemId: string, itemType: 'businessFlow' | 'websiteCategory' | 'assistantCategory') => {
    event.preventDefault();
    setContextMenu({
      isVisible: true,
      x: event.clientX,
      y: event.clientY,
      targetId: itemId,
      targetType: itemType,
    });
  };

  const closeContextMenu = () => {
    setContextMenu({ isVisible: false, x: 0, y: 0, targetId: null, targetType: null });
  };

  // Function to open modal for adding a new TOP-LEVEL business flow
  const openAddNewBusinessFlowModal = () => {
    closeContextMenu();
    setBusinessFlowModalState({
      isOpen: true,
      mode: 'add',
      parentId: null,
      initialName: '',
      initialDescription: '',
      title: '添加新业务流'
    });
  };

  // Function to open modal for adding a SUB-LEVEL business flow
  const openAddSubBusinessFlowModal = (parentId: string) => {
    closeContextMenu();
    const parentFlow = findNestedFlow(businessFlows, parentId);
    setBusinessFlowModalState({
      isOpen: true,
      mode: 'addSub',
      parentId: parentId,
      initialName: '',
      initialDescription: '',
      title: `添加子业务流到 "${parentFlow?.name || parentId}"`,
    });
  };

  const findNestedFlow = (flows: BusinessFlowItem[], id: string): BusinessFlowItem | undefined => {
    for (const flow of flows) {
      if (flow.id === id) return flow;
      if (flow.children) {
        const foundInChild = findNestedFlow(flow.children, id);
        if (foundInChild) return foundInChild;
      }
    }
    return undefined;
  };

  // Handles saving from the modal (both new and sub-items)
  const handleSaveBusinessFlow = async (name: string, description: string) => {
    const { parentId, mode } = businessFlowModalState;
    try {
      const response = await fetch('/api/feishu/business-flows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name,
          description: description,
          parentId: parentId, // Will be null for top-level, or string for sub-item
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save business flow');
      }
      
      const newOrUpdatedFlow = await response.json();

      // Optimistically update UI or re-fetch
      // For simplicity now, re-fetching the entire list after any add/edit.
      // More optimal would be to splice it into the correct place in the local state.
      fetchData(); // Re-fetch all data to reflect changes

      setBusinessFlowModalState({ isOpen: false, mode: 'add', parentId: null }); // Close and reset modal

    } catch (error) {
      console.error('Error saving business flow:', error);
      alert(`保存业务流失败: ${error instanceof Error ? error.message : '请稍后重试'}`);
    }
  };

  const handleAddWebsiteSubItem = async (parentId: string) => {
    const subItemName = prompt('请输入子网站分类的名称 (placeholder):');
    if (subItemName) console.log('Adding website sub-item:', parentId, subItemName);
    closeContextMenu();
  };

  const handleAddAssistantSubItem = async (parentId: string) => {
    const subItemName = prompt('请输入子文档助手项的名称 (placeholder):');
    if (subItemName) console.log('Adding assistant sub-item:', parentId, subItemName);
    closeContextMenu();
  };

  const contextMenuItems = () => {
    if (!contextMenu.targetId || !contextMenu.targetType) return [];

    switch (contextMenu.targetType) {
      case 'businessFlow':
        return [
          { label: '添加子业务流', action: () => openAddSubBusinessFlowModal(contextMenu.targetId!) },
        ];
      case 'websiteCategory':
        return [
          { label: '添加子网站分类', action: () => handleAddWebsiteSubItem(contextMenu.targetId!) },
        ];
      case 'assistantCategory':
        return [
          { label: '添加子文档助手项', action: () => handleAddAssistantSubItem(contextMenu.targetId!) },
        ];
      default:
        return [];
    }
  };

  const renderBusinessFlowItems = (items: BusinessFlowItem[], level: number = 0) => {
    return items.map(flow => {
      const itemKey = `bf_children_${flow.id}`;
      const isExpanded = !!expandedSections[itemKey];
      const hasChildren = flow.children && flow.children.length > 0;

      let pathSuffix = '';
      if (level > 0 && flow.parentId) {
          const current = flow;
          let path = current.id.substring(current.parentId!.length + 1);
          let parent = findNestedFlow(businessFlows, current.parentId!)
          while(parent && parent.parentId) {
            path = `${parent.id.substring(parent.parentId!.length + 1)}/${path}`;
            parent = findNestedFlow(businessFlows, parent.parentId!)
          }
          if (parent) {
             pathSuffix = `/${parent.id.toLowerCase().substring(3)}/${path}`
          } else {
             pathSuffix = `/${flow.id.toLowerCase().substring(3)}`
          }
      } else {
          pathSuffix = `/${flow.id.toLowerCase().substring(3)}`;
      }
      const flowPath = `/business-flow${pathSuffix}`;

      return (
      <li key={flow.id} className={`${level > 0 ? 'ml-4' : ''}`}>
        <div
          className={`nav-link nav-item-container flex justify-between items-center py-2 px-3 rounded-md hover:bg-slate-700 hover:text-white text-sm ${
            pathname === flowPath && !hasChildren ? 'bg-slate-700 text-white' : ''
          }`}
          onContextMenu={(e) => handleContextMenu(e, flow.id, 'businessFlow')}
        >
          <Link
            href={hasChildren ? '#' : flowPath}
            className='flex-grow flex items-center space-x-2'
            onClick={(e) => {
              if (hasChildren) {
                e.preventDefault();
                toggleSection(itemKey);
              }
            }}
          >
            {level > 0 && <CornerDownRight className='inline mr-1 w-3 h-3 opacity-70' />}
            <Workflow className='inline mr-1 w-4 h-4 opacity-80' />
            <span className='sidebar-text'>{flow.name}</span>
          </Link>
          {level === 0 && hasChildren && (
             <button onClick={(e) => {
                e.stopPropagation();
                toggleSection(itemKey);
             }} className="p-1">
                {isExpanded ? <ChevronUp className='w-3 h-3' /> : <ChevronDown className='w-3 h-3' />}
             </button>
          )}
        </div>
        {hasChildren && isExpanded && (
          <ul className='ml-4 mt-1 space-y-1 border-l border-slate-600 pl-3'>
            {renderBusinessFlowItems(flow.children!, level + 1)}
          </ul>
        )}
      </li>
    )});
  };

  const renderNavLinks = (items: NavLinkItem[], sectionIdentifier: 'websites' | 'assistant', level: number = 0) => {
    return items.map(item => {
      const itemKey = `${sectionIdentifier}_children_${item.id}`;
      const isExpanded = !!expandedSections[itemKey];
      const hasChildren = item.children && item.children.length > 0;

      let href = '#';
      const parentNameForQuery = item.parentId ? item.parentId.replace(`${sectionIdentifier}-`, '') : item.name;
      const currentItemNameForQuery = item.name;

      if (!hasChildren) {
        if (sectionIdentifier === 'websites') {
          href = `/websites?category=${encodeURIComponent(parentNameForQuery)}`;
          if (item.parentId) {
             href += `&subcategory=${encodeURIComponent(currentItemNameForQuery)}`;
          }
        } else if (sectionIdentifier === 'assistant') {
          href = `/assistant?category=${encodeURIComponent(parentNameForQuery)}`;
          if (item.parentId) {
             href += `&subcategory=${encodeURIComponent(currentItemNameForQuery)}`;
          }
        }
      }

      let isActive = false;
      if (categoryParam && sectionIdentifier === 'websites') {
        isActive = categoryParam === parentNameForQuery &&
                   (item.parentId ? subcategoryParam === currentItemNameForQuery : !subcategoryParam);
      } else if (categoryParam && sectionIdentifier === 'assistant') {
        isActive = pathname === '/assistant' && categoryParam === parentNameForQuery &&
                   (item.parentId ? subcategoryParam === currentItemNameForQuery : !subcategoryParam);
      }

      return (
        <li key={item.id} className={`${level > 0 ? 'ml-4' : ''}`}>
          <div
            className={`nav-link nav-item-container flex justify-between items-center py-2 px-3 rounded-md hover:bg-slate-700 hover:text-white text-sm ${
              isActive && !hasChildren ? 'bg-slate-700 text-white' : ''
            }`}
            onContextMenu={(e) => {
                if (sectionIdentifier === 'websites') handleContextMenu(e, item.id, 'websiteCategory');
                else if (sectionIdentifier === 'assistant') handleContextMenu(e, item.id, 'assistantCategory');
            }}
          >
            <Link
              href={href}
              className='flex-grow flex items-center space-x-2'
              onClick={(e) => {
                if (hasChildren) {
                  e.preventDefault();
                  toggleSection(itemKey);
                }
              }}
            >
              {level > 0 && <CornerDownRight className='inline mr-1 w-3 h-3 opacity-70' />}
              <item.icon className='inline mr-1 w-4 h-4 opacity-80' />
              <span className='sidebar-text'>{item.name}</span>
            </Link>
            {level === 0 && hasChildren && (
              <button onClick={(e) => {
                  e.stopPropagation();
                  toggleSection(itemKey);
              }} className="p-1">
                  {isExpanded ? <ChevronUp className='w-3 h-3' /> : <ChevronDown className='w-3 h-3' />}
              </button>
            )}
          </div>
          {hasChildren && isExpanded && (
            <ul className='ml-4 mt-1 space-y-1 border-l border-slate-600 pl-3'>
              {renderNavLinks(item.children!, sectionIdentifier, level + 1)}
            </ul>
          )}
        </li>
      );
    });
  };

  return (
    <>
      <nav 
        className={`sidebar text-gray-300 p-4 space-y-6 flex flex-col fixed h-full z-30 shadow-lg ${
          collapsed ? 'sidebar-collapsed' : ''
        }`}
      >
        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center space-x-3'>
            <Workflow className='text-sky-400 w-8 h-8' />
            <h1 className='text-lg font-semibold text-white sidebar-logo-text'>业务流程管理平台</h1>
          </div>
          <button 
            onClick={toggleSidebar}
            className='p-1.5 rounded-md hover:bg-slate-700 text-gray-400 hover:text-white'
          >
            <Menu className='w-5 h-5' />
          </button>
        </div>

        {/* Loading indicator */}
        {loading && (
          <div className="text-center py-4">
            <div className="animate-pulse flex justify-center">
              <div className="bg-gray-500 rounded-full h-3 w-24"></div>
            </div>
            <p className="text-xs mt-2 text-gray-400">正在从飞书加载数据...</p>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="text-xs text-red-400 p-2 mb-2 bg-red-900/20 rounded-md">
            {error}
          </div>
        )}

        <ul className='space-y-1.5 flex-grow overflow-y-auto pr-1'>
          <li>
            <Link 
              href='/dashboard' 
              className={`nav-link nav-item-container flex items-center space-x-3 py-2.5 px-3 rounded-lg hover:bg-slate-700 hover:text-white ${
                pathname === '/dashboard' ? 'bg-sky-600 text-white' : ''
              }`}
            >
              <LayoutDashboard className='w-5 h-5' />
              <span className='sidebar-text font-medium'>仪表盘</span>
            </Link>
          </li>
          
          <li>
            <div className='nav-section'>
              <div 
                className='nav-section-toggle nav-item-container w-full flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-slate-700 hover:text-white cursor-pointer'
                onClick={() => toggleSection('businessFlow')}
              >
                <div className='flex items-center space-x-3'>
                  <UsersRound className='w-5 h-5' />
                  <span className='sidebar-text font-medium'>业务流</span>
                </div>
                <div className="flex items-center space-x-1">
                  <button 
                    className="p-1 hover:bg-slate-600 rounded text-gray-400 hover:text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      const selectedFlow = businessFlows.length > 0 ? businessFlows[0].id : null;
                      const url = selectedFlow ? 
                        `/business-flow/process?businessFlowId=${selectedFlow}&defaultType=project` : 
                        '/business-flow/process?defaultType=project';
                      router.push(url);
                    }}
                    title="添加流程"
                  >
                    <PlusCircle className="w-4 h-4" />
                  </button>
                  <span onClick={(e) => e.stopPropagation()}>
                    {expandedSections.businessFlow ? 
                      <ChevronUp className='sidebar-text w-4 h-4' /> : 
                      <ChevronDown className='sidebar-text w-4 h-4' />
                    }
                  </span>
                </div>
              </div>
              <ul className={`nav-section-content ml-3 mt-1 space-y-1 border-l-2 border-slate-700 pl-4 ${
                expandedSections.businessFlow ? '' : 'hidden'
              }`}>
                {renderBusinessFlowItems(businessFlows)}
              </ul>
            </div>
          </li>
          
          <li>
            <Link 
              href='/project' 
              className={`nav-link nav-item-container flex items-center space-x-3 py-2.5 px-3 rounded-lg hover:bg-slate-700 hover:text-white ${
                pathname === '/project' ? 'bg-sky-600 text-white' : ''
              }`}
            >
              <FolderKanban className='w-5 h-5' />
              <span className='sidebar-text font-medium'>项目开发/数字员工</span>
            </Link>
          </li>
          
          <li>
            <Link 
              href='/resource' 
              className={`nav-link nav-item-container flex items-center space-x-3 py-2.5 px-3 rounded-lg hover:bg-slate-700 hover:text-white ${
                pathname === '/resource' ? 'bg-sky-600 text-white' : ''
              }`}
            >
              <Library className='w-5 h-5' />
              <span className='sidebar-text font-medium'>资源库</span>
            </Link>
          </li>
          
          <li>
            <Link 
              href="/websites"
              className={`nav-link nav-item-container flex items-center space-x-3 py-2.5 px-3 rounded-lg hover:bg-slate-700 hover:text-white ${
                pathname === '/websites' ? 'bg-sky-600 text-white' : ''
              }`}
            >
              <Globe2 className='w-5 h-5' />
              <span className='sidebar-text font-medium'>常用网站</span>
            </Link>
          </li>
          <li>
            <Link 
              href='/assistant' 
              className={`nav-link nav-item-container flex items-center space-x-3 py-2.5 px-3 rounded-lg hover:bg-slate-700 hover:text-white ${
                (pathname === '/assistant' || pathname.startsWith('/assistant?')) ? 'bg-sky-600 text-white' : ''
              }`}
            >
              <LifeBuoy className='w-5 h-5' />
              <span className='sidebar-text font-medium'>文档助手</span>
            </Link>
          </li>
        </ul>
        <div className='pt-4 border-t border-slate-700 sidebar-text'>
          <Link 
            href='/settings'
            className='flex items-center space-x-3 py-2.5 px-3 rounded-lg hover:bg-slate-700 hover:text-white'
          >
            <Settings2 className='w-5 h-5' />
            <span>设置</span>
          </Link>
          <Link 
            href='/profile'
            className='flex items-center space-x-3 py-2.5 px-3 rounded-lg hover:bg-slate-700 hover:text-white'
          >
            <img 
              src='https://placehold.co/36x36/475569/E2E8F0?text=U' 
              alt='User Avatar'
              className='w-9 h-9 rounded-full border-2 border-slate-600'
            />
            <span>用户名称</span>
          </Link>
        </div>
      </nav>

      <BusinessFlowModal 
        isOpen={businessFlowModalState.isOpen}
        onClose={() => setBusinessFlowModalState({ isOpen: false, mode: 'add', parentId: null })}
        onSave={handleSaveBusinessFlow}
        initialName={businessFlowModalState.initialName}
        initialDescription={businessFlowModalState.initialDescription}
        title={businessFlowModalState.title || (businessFlowModalState.mode === 'add' ? '添加新业务流' : '编辑业务流')}
      />

      {contextMenu.isVisible && (
        <ContextMenu 
          x={contextMenu.x} 
          y={contextMenu.y} 
          items={contextMenuItems()} 
          onClose={closeContextMenu} 
          isVisible={contextMenu.isVisible}
        />
      )}
    </>
  );
}

function SidebarContent() {
  return (
    <Suspense fallback={<SidebarLoading />}>
      <SidebarWithParams />
    </Suspense>
  );
}

export default function Sidebar() {
  return <SidebarContent />;
} 