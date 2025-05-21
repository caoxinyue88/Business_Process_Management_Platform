import fs from 'fs';
import path from 'path';

// Data file paths
const DATA_DIR = path.join(process.cwd(), 'data');
const WEBSITES_FILE = path.join(DATA_DIR, 'frequentWebsites.json');
const BUSINESS_FLOW_FILE = path.join(DATA_DIR, 'businessFlow.json');
const ASSISTANT_FILE = path.join(DATA_DIR, 'documentAssistant.json');
const PROJECT_FILE = path.join(DATA_DIR, 'projectDevelopment.json');
const RESOURCE_FILE = path.join(DATA_DIR, 'resourceLibrary.json');
const DASHBOARD_FILE = path.join(DATA_DIR, 'dashboard.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize files if they don't exist
function initializeDataFiles() {
  const files = {
    [WEBSITES_FILE]: '[]',
    [BUSINESS_FLOW_FILE]: '[]',
    [ASSISTANT_FILE]: '[]',
    [PROJECT_FILE]: '[]',
    [RESOURCE_FILE]: '[]',
    [DASHBOARD_FILE]: '{}'
  };

  Object.entries(files).forEach(([file, initialContent]) => {
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, initialContent, 'utf8');
      console.log(`Initialized ${file}`);
    }
  });
}

// Call initialization
initializeDataFiles();

// Generic read function
export async function readData<T>(filePath: string): Promise<T[]> {
  try {
    const fileExists = fs.existsSync(filePath);
    
    if (!fileExists) {
      console.log(`File not found: ${filePath}, creating empty file`);
      fs.writeFileSync(filePath, '[]', 'utf8');
      return [];
    }
    
    const data = fs.readFileSync(filePath, 'utf8');
    
    // Handle empty files
    if (!data.trim()) {
      return [];
    }
    
    return JSON.parse(data) as T[];
  } catch (error) {
    console.error(`Error reading data from ${filePath}:`, error);
    return [];
  }
}

// Generic write function
export async function writeData<T>(filePath: string, data: T[]): Promise<void> {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error(`Error writing data to ${filePath}:`, error);
    throw error;
  }
}

// Website data functions
export async function getWebsitesFromFile() {
  return readData(WEBSITES_FILE);
}

export async function saveWebsitesToFile(websites: any[]) {
  return writeData(WEBSITES_FILE, websites);
}

// Business flow data functions
export async function getBusinessFlowsFromFile() {
  return readData(BUSINESS_FLOW_FILE);
}

export async function saveBusinessFlowsToFile(flows: any[]) {
  return writeData(BUSINESS_FLOW_FILE, flows);
}

// Assistant data functions
export async function getAssistantItemsFromFile() {
  return readData(ASSISTANT_FILE);
}

export async function saveAssistantItemsToFile(items: any[]) {
  return writeData(ASSISTANT_FILE, items);
}

// Project data functions
export async function getProjectsFromFile(): Promise<any[]> {
  return readData(PROJECT_FILE);
}

export async function saveProjectsToFile(projects: any[]): Promise<void> {
  return writeData(PROJECT_FILE, projects);
}

// Resource data functions
export async function getResourcesFromFile() {
  return readData(RESOURCE_FILE);
}

export async function saveResourcesToFile(resources: any[]) {
  return writeData(RESOURCE_FILE, resources);
}

// Dashboard data functions
export async function getDashboardFromFile() {
  try {
    const fileExists = fs.existsSync(DASHBOARD_FILE);
    
    if (!fileExists) {
      console.log(`Dashboard file not found, creating default`);
      const defaultDashboard = {
        stats: {
          businessFlows: 0,
          projects: 0,
          resources: 0
        }
      };
      fs.writeFileSync(DASHBOARD_FILE, JSON.stringify(defaultDashboard, null, 2), 'utf8');
      return defaultDashboard;
    }
    
    const data = fs.readFileSync(DASHBOARD_FILE, 'utf8');
    
    // Handle empty files
    if (!data.trim()) {
      return {
        stats: {
          businessFlows: 0,
          projects: 0,
          resources: 0
        }
      };
    }
    
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading dashboard data:`, error);
    return {
      stats: {
        businessFlows: 0,
        projects: 0,
        resources: 0
      }
    };
  }
}

export async function saveDashboardToFile(dashboard: any) {
  try {
    fs.writeFileSync(DASHBOARD_FILE, JSON.stringify(dashboard, null, 2), 'utf8');
  } catch (error) {
    console.error(`Error writing dashboard data:`, error);
    throw error;
  }
} 