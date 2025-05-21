import { Website } from '../types/website';
import { BusinessFlow } from '../types/businessFlow';
import { AssistantItem } from '../types/assistant';
import { Project } from '../types/project';
import { Resource } from '../types/resource';

// Constants for localStorage keys
const WEBSITES_KEY = 'websites';
const ASSISTANT_ITEMS_KEY = 'assistantItems';
const PROJECTS_KEY = 'projects';
const RESOURCES_KEY = 'resources';
const BUSINESS_FLOWS_KEY = 'businessFlows';
const DASHBOARD_KEY = 'dashboard';
const INITIALIZATION_KEY = 'storageInitialized';

// Storage initialization function
export const initializeLocalStorage = (): void => {
  if (typeof window === 'undefined') return;
  
  try {
    // Check if localStorage is already initialized
    const isInitialized = localStorage.getItem(INITIALIZATION_KEY);
    if (isInitialized === 'true') return;
    
    // Initialize each feature with empty arrays if they don't exist
    if (!localStorage.getItem(WEBSITES_KEY)) {
      localStorage.setItem(WEBSITES_KEY, JSON.stringify([]));
    }
    
    if (!localStorage.getItem(ASSISTANT_ITEMS_KEY)) {
      localStorage.setItem(ASSISTANT_ITEMS_KEY, JSON.stringify([]));
    }
    
    if (!localStorage.getItem(PROJECTS_KEY)) {
      localStorage.setItem(PROJECTS_KEY, JSON.stringify([]));
    }
    
    if (!localStorage.getItem(RESOURCES_KEY)) {
      localStorage.setItem(RESOURCES_KEY, JSON.stringify([]));
    }
    
    if (!localStorage.getItem(BUSINESS_FLOWS_KEY)) {
      localStorage.setItem(BUSINESS_FLOWS_KEY, JSON.stringify([]));
    }
    
    if (!localStorage.getItem(DASHBOARD_KEY)) {
      localStorage.setItem(DASHBOARD_KEY, JSON.stringify({
        // Default dashboard data
        stats: {
          businessFlows: 0,
          projects: 0,
          resources: 0
        }
      }));
    }
    
    // Mark storage as initialized
    localStorage.setItem(INITIALIZATION_KEY, 'true');
    console.log('LocalStorage initialized successfully');
  } catch (error) {
    console.error('Error initializing localStorage:', error);
  }
};

// Website service functions
export const getWebsites = async (): Promise<Website[]> => {
  if (typeof window === 'undefined') return [];
  
  initializeLocalStorage(); // Ensure storage is initialized
  
  try {
    const websitesJson = localStorage.getItem(WEBSITES_KEY);
    return websitesJson ? JSON.parse(websitesJson) : [];
  } catch (error) {
    console.error('Error getting websites from localStorage:', error);
    return [];
  }
};

export const createWebsite = async (website: Omit<Website, 'id'>): Promise<Website> => {
  if (typeof window === 'undefined') {
    return { ...website, id: `server-mock-${Date.now()}` };
  }
  
  initializeLocalStorage(); // Ensure storage is initialized
  
  const websites = await getWebsites();
  const newWebsite: Website = {
    ...website,
    id: `web-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  };
  localStorage.setItem(WEBSITES_KEY, JSON.stringify([...websites, newWebsite]));
  return newWebsite;
};

export const updateWebsite = async (id: string, website: Partial<Website>): Promise<Website> => {
  if (typeof window === 'undefined') {
    return { id, ...website } as Website;
  }
  
  initializeLocalStorage(); // Ensure storage is initialized
  
  const websites = await getWebsites();
  const websiteIndex = websites.findIndex(w => w.id === id);
  if (websiteIndex === -1) throw new Error(`Website with ID ${id} not found`);
  const updatedWebsite = { ...websites[websiteIndex], ...website };
  websites[websiteIndex] = updatedWebsite;
  localStorage.setItem(WEBSITES_KEY, JSON.stringify(websites));
  return updatedWebsite;
};

export const deleteWebsite = async (id: string): Promise<void> => {
  if (typeof window === 'undefined') return;
  
  initializeLocalStorage(); // Ensure storage is initialized
  
  const websites = await getWebsites();
  const filteredWebsites = websites.filter(w => w.id !== id);
  localStorage.setItem(WEBSITES_KEY, JSON.stringify(filteredWebsites));
};

export const batchCreateWebsites = async (websiteItems: Omit<Website, 'id'>[]): Promise<Website[]> => {
  if (typeof window === 'undefined') {
    const timestamp = Date.now();
    return websiteItems.map((item, index) => ({ ...item, id: `server-mock-web-${timestamp}-${index}` }));
  }
  // ensureLocalStorageInitialized(); // No longer needed here
  const websites = await getWebsites();
  const newWebsites: Website[] = websiteItems.map(item => ({
    ...item,
    id: `web-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }));
  localStorage.setItem('websites', JSON.stringify([...websites, ...newWebsites]));
  return newWebsites;
};

// Business Flow service functions
export const getBusinessFlows = async (): Promise<BusinessFlow[]> => {
  if (typeof window === 'undefined') return [];
  
  initializeLocalStorage(); // Ensure storage is initialized
  
  try {
    const businessFlowsJson = localStorage.getItem(BUSINESS_FLOWS_KEY);
    return businessFlowsJson ? JSON.parse(businessFlowsJson) : [];
  } catch (error) {
    console.error('Error getting business flows from localStorage:', error);
    return [];
  }
};

export const createBusinessFlow = async (
  businessFlowData: Pick<BusinessFlow, 'name' | 'description'> & { parentId?: string }
): Promise<BusinessFlow> => {
    if (typeof window === 'undefined') {
      return { 
        id: `server-mock-bf-${Date.now()}`,
        name: businessFlowData.name,
        description: businessFlowData.description || '',
        detailPageId: `bf_detail_server_mock`,
        parentId: businessFlowData.parentId,
        projects: 0,
        resources: 0,
        lastAccessed: new Date().toISOString(),
        children: []
      };
    }
    
    initializeLocalStorage(); // Ensure storage is initialized
    
    const businessFlows = await getBusinessFlows();
    const newId = `bf-${Date.now()}${Math.floor(Math.random() * 10000)}`.substring(0, 12);

    const newBusinessFlow: BusinessFlow = {
      id: newId,
      name: businessFlowData.name,
      description: businessFlowData.description || '',
      detailPageId: `bf_detail_${newId}`,
      parentId: businessFlowData.parentId,
      projects: 0,
      resources: 0,
      lastAccessed: new Date().toISOString(),
      children: []
    };

    let updatedFlows;
    if (!businessFlowData.parentId) {
      updatedFlows = [...businessFlows, newBusinessFlow];
    } else {
      let parentFound = false;
      const addRecursive = (flows: BusinessFlow[]): BusinessFlow[] => {
        return flows.map(flow => {
          if (flow.id === businessFlowData.parentId) {
            parentFound = true;
            return { ...flow, children: [...(flow.children || []), newBusinessFlow] };
          }
          if (flow.children) {
            return { ...flow, children: addRecursive(flow.children) };
          }
          return flow;
        });
      };
      updatedFlows = addRecursive(businessFlows);
      if (!parentFound) {
          console.warn(`Parent ID ${businessFlowData.parentId} not found for BusinessFlow. Adding to root level.`);
          updatedFlows = [...businessFlows, newBusinessFlow]; 
      }
    }
    localStorage.setItem(BUSINESS_FLOWS_KEY, JSON.stringify(updatedFlows));
    return newBusinessFlow;
};

export const batchCreateBusinessFlows = async (
  flowItems: (Pick<BusinessFlow, 'name' | 'description'> & { parentId?: string })[]
): Promise<BusinessFlow[]> => {
  if (typeof window === 'undefined') {
    const timestamp = Date.now();
    return flowItems.map((item, index) => ({ 
      id: `server-mock-bf-batch-${timestamp}-${index}`,
      name: item.name,
      description: item.description || '',
      detailPageId: `bf_detail_batch_server_mock_${index}`,
      parentId: item.parentId,
      projects: 0,
      resources: 0,
      lastAccessed: new Date().toISOString(),
      children: []
    }));
  }
  
  initializeLocalStorage(); // Ensure storage is initialized
  
  let allFlows = await getBusinessFlows();
  const createdFlows: BusinessFlow[] = [];

  for (const item of flowItems) {
    const newId = `bf-batch-${Date.now()}-${createdFlows.length}-${Math.random().toString(36).substr(2, 9)}`;
    const newFlow: BusinessFlow = {
      id: newId,
      name: item.name,
      description: item.description || '',
      detailPageId: `bf_detail_batch_${newId}`,
      parentId: item.parentId,
      projects: 0,
      resources: 0,
      lastAccessed: new Date().toISOString(),
      children: []
    };

    if (!item.parentId) {
      allFlows.push(newFlow);
    } else {
      let parentFound = false;
      const addAsChildRecursive = (flows: BusinessFlow[], parentId: string, child: BusinessFlow): void => {
        for (let i = 0; i < flows.length; i++) {
          if (flows[i].id === parentId) {
            flows[i].children = [...(flows[i].children || []), child];
            parentFound = true;
            return;
          }
          if (flows[i].children && flows[i].children!.length > 0) {
            addAsChildRecursive(flows[i].children!, parentId, child);
            if (parentFound) return;
          }
        }
      };
      addAsChildRecursive(allFlows, item.parentId, newFlow);
      if (!parentFound) {
        console.warn(`Parent ID ${item.parentId} not found for batch BusinessFlow ${newFlow.name}. Adding to root.`);
        allFlows.push(newFlow);
      }
    }
    createdFlows.push(newFlow);
  }

  localStorage.setItem(BUSINESS_FLOWS_KEY, JSON.stringify(allFlows));
  return createdFlows;
};

// Assistant service functions
export const getAssistantItems = async (): Promise<AssistantItem[]> => {
  if (typeof window === 'undefined') return [];
  
  initializeLocalStorage(); // Ensure storage is initialized
  
  try {
    const assistantItemsJson = localStorage.getItem(ASSISTANT_ITEMS_KEY);
    return assistantItemsJson ? JSON.parse(assistantItemsJson) : [];
  } catch (error) {
    console.error('Error getting assistantItems from localStorage:', error);
    return [];
  }
};

export const createAssistantItem = async (item: Omit<AssistantItem, 'id'>): Promise<AssistantItem> => {
  if (typeof window === 'undefined') {
    return { ...item, id: `server-mock-${Date.now()}` };
  }
  // ensureLocalStorageInitialized(); // No longer needed here
  const items = await getAssistantItems();
  const newItem: AssistantItem = { ...item, id: Date.now().toString() };
  localStorage.setItem('assistantItems', JSON.stringify([...items, newItem]));
  return newItem;
};

export const batchCreateAssistantItems = async (assistantItemsData: Omit<AssistantItem, 'id'>[]): Promise<AssistantItem[]> => {
  if (typeof window === 'undefined') {
    const timestamp = Date.now();
    return assistantItemsData.map((item, index) => ({ ...item, id: `server-mock-${timestamp}-${index}` }));
  }
  // ensureLocalStorageInitialized(); // No longer needed here
  const items = await getAssistantItems();
  const timestamp = Date.now();
  const newItems: AssistantItem[] = assistantItemsData.map((item, index) => ({ ...item, id: `${timestamp + index}` }));
  localStorage.setItem('assistantItems', JSON.stringify([...items, ...newItems]));
  return newItems;
};

// Project service functions
export const getProjects = async (): Promise<Project[]> => {
  if (typeof window === 'undefined') {
    return [];
  }
  // ensureLocalStorageInitialized(); // No longer needed here
  try {
    const projectsJson = localStorage.getItem('projects');
    if (!projectsJson) {
      console.log('No projects found in localStorage during getProjects call.');
      return [];
    }
    const parsedProjects = JSON.parse(projectsJson);
    return Array.isArray(parsedProjects) ? parsedProjects : [];
  } catch (error) {
    console.error('Error getting projects from localStorage:', error);
    return [];
  }
};

export const createProject = async (project: Omit<Project, 'id'>): Promise<Project> => {
  if (typeof window === 'undefined') {
    return { ...project, id: `server-mock-P${Date.now()}` };
  }
  // ensureLocalStorageInitialized(); // No longer needed here
  try {
    const projects = await getProjects();
    const newId = `P${Date.now()}${Math.floor(Math.random() * 1000)}`.substring(0, 8).padStart(4, '0'); // Ensure some length
    const newProject: Project = { ...project, id: newId };
    const updatedProjects = [...projects, newProject];
    localStorage.setItem('projects', JSON.stringify(updatedProjects));
    console.log(`Project created via createProject with ID ${newId}, total projects: ${updatedProjects.length}`);
    return newProject;
  } catch (error) {
    console.error('Error creating project in localStorageService:', error);
    throw new Error('Failed to create project in localStorageService');
  }
};

export const updateProject = async (id: string, project: Partial<Project>): Promise<Project> => {
  if (typeof window === 'undefined') {
    return { id, ...project } as Project;
  }
  // ensureLocalStorageInitialized(); // No longer needed here
  try {
    const projects = await getProjects();
    const projectIndex = projects.findIndex(p => p.id === id);
    if (projectIndex === -1) throw new Error(`Project with ID ${id} not found for update.`);
    const updatedProject = { ...projects[projectIndex], ...project };
    projects[projectIndex] = updatedProject;
    localStorage.setItem('projects', JSON.stringify(projects));
    console.log(`Project updated: ${id}`);
    return updatedProject;
  } catch (error) {
    console.error('Error updating project in localStorageService:', error);
    throw error;
  }
};

export const deleteProject = async (id: string): Promise<void> => {
  if (typeof window === 'undefined') return;
  // ensureLocalStorageInitialized(); // No longer needed here
  try {
    const projects = await getProjects();
    const filteredProjects = projects.filter(p => p.id !== id);
    localStorage.setItem('projects', JSON.stringify(filteredProjects));
    console.log(`Project deleted: ${id}`);
  } catch (error) {
    console.error('Error deleting project in localStorageService:', error);
    throw error;
  }
};

export const batchCreateProjects = async (projectItems: Omit<Project, 'id'>[]): Promise<Project[]> => {
  if (typeof window === 'undefined') {
    const timestamp = Date.now();
    return projectItems.map((item, index) => ({ ...item, id: `server-mock-P${timestamp}-${index}` }));
  }
  // ensureLocalStorageInitialized(); // No longer needed here
  const projects = await getProjects();
  const startIdx = projects.length > 0 ? Math.max(...projects.map(p => parseInt(p.id.substring(1), 10) || 0)) + 1 : 1;

  const newProjects: Project[] = projectItems.map((item, index) => ({
    ...item,
    id: `P${(startIdx + index).toString().padStart(3, '0')}`
  }));
  localStorage.setItem('projects', JSON.stringify([...projects, ...newProjects]));
  return newProjects;
};

// Resource service functions
export const getResources = async (): Promise<Resource[]> => {
  if (typeof window === 'undefined') return [];
  // ensureLocalStorageInitialized(); // No longer needed here
  try {
    const resourcesJson = localStorage.getItem('resources');
    return resourcesJson ? JSON.parse(resourcesJson) : [];
  } catch (error) {
    console.error('Error getting resources from localStorage:', error);
    return [];
  }
};

export const createResource = async (resource: Omit<Resource, 'id'>): Promise<Resource> => {
  if (typeof window === 'undefined') {
    return { ...resource, id: `server-mock-R${Date.now()}` };
  }
  // ensureLocalStorageInitialized(); // No longer needed here
  const resources = await getResources();
  const newId = `R${Date.now()}${Math.floor(Math.random() * 1000)}`.substring(0, 8).padStart(4, '0');
  const newResource: Resource = { ...resource, id: newId };
  localStorage.setItem('resources', JSON.stringify([...resources, newResource]));
  return newResource;
};

export const updateResource = async (id: string, resource: Partial<Resource>): Promise<Resource> => {
  if (typeof window === 'undefined') {
    return { id, ...resource } as Resource;
  }
  // ensureLocalStorageInitialized(); // No longer needed here
  const resources = await getResources();
  const resourceIndex = resources.findIndex(r => r.id === id);
  if (resourceIndex === -1) throw new Error(`Resource with ID ${id} not found for update.`);
  const updatedResource = { ...resources[resourceIndex], ...resource };
  resources[resourceIndex] = updatedResource;
  localStorage.setItem('resources', JSON.stringify(resources));
  return updatedResource;
};

export const deleteResource = async (id: string): Promise<void> => {
  if (typeof window === 'undefined') return;
  // ensureLocalStorageInitialized(); // No longer needed here
  const resources = await getResources();
  const filteredResources = resources.filter(r => r.id !== id);
  localStorage.setItem('resources', JSON.stringify(filteredResources));
};

export const batchCreateResources = async (resourceItems: Omit<Resource, 'id'>[]): Promise<Resource[]> => {
  if (typeof window === 'undefined') {
    const timestamp = Date.now();
    return resourceItems.map((item, index) => ({ ...item, id: `server-mock-R${timestamp}-${index}` }));
  }
  // ensureLocalStorageInitialized(); // No longer needed here
  const resources = await getResources();
  const startIdx = resources.length > 0 ? Math.max(...resources.map(r => parseInt(r.id.substring(1), 10) || 0)) + 1 : 1;
  const newResources: Resource[] = resourceItems.map((item, index) => ({
    ...item,
    id: `R${(startIdx + index).toString().padStart(3, '0')}`
  }));
  localStorage.setItem('resources', JSON.stringify([...resources, ...newResources]));
  return newResources;
}; 