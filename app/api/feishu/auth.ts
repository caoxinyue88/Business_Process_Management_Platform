import { Client } from '@larksuiteoapi/node-sdk';

// 飞书表格配置 - 特定ID
export const FEISHU_TABLE_IDS = {
  WEBSITES_TABLE: 'tblIm6eHQfxLhJ5z'  // 常用网站表格ID
};

// For development: mock client when real credentials aren't available
class MockFeishuClient {
  auth = {
    tenantAccessToken: {
      internal: async () => ({ data: { tenant_access_token: 'mock-token' } })
    }
  };
  
  fetch = async ({ url, method, data }: { url: string; method: string; data?: any }) => {
    console.log(`[Mock Feishu] ${method} ${url}`, data ? 'with data' : '');
    
    // Return mock data based on the URL pattern
    if (url.includes('/tables')) {
      return {
        data: {
          items: [
            { table_id: 'mock-business-flow-table', name: '业务流' },
            { table_id: FEISHU_TABLE_IDS.WEBSITES_TABLE, name: '常用网站' },
            { table_id: 'mock-assistant-table', name: '文档助手' }
          ]
        }
      };
    } else if (url.includes('/records')) {
      // Return empty records list (apps will fall back to initial data)
      return { data: { items: [] } };
    } else if (url.includes('/fields')) {
      return { data: { items: [] } };
    }
    
    return { data: {} };
  };
}

// Flag to indicate if we're using mock client
let usingMockClient = false;

// Initialize Feishu API client
export function getFeishuClient() {
  const appId = process.env.FEISHU_APP_ID;
  const appSecret = process.env.FEISHU_APP_SECRET;
  
  if (!appId || !appSecret) {
    console.warn('Feishu API credentials not configured - using mock client for development');
    usingMockClient = true;
    return new MockFeishuClient();
  }
  
  return new Client({
    appId,
    appSecret,
    disableTokenCache: false,
  });
}

// Get tenant access token (needed for most API calls)
export async function getAccessToken() {
  const client = getFeishuClient();
  
  try {
    const response = await client.auth.tenantAccessToken.internal({
      data: {
        app_id: process.env.FEISHU_APP_ID || '',
        app_secret: process.env.FEISHU_APP_SECRET || ''
      }
    });
    // Ensure we have the correct type
    if (response.data && 'tenant_access_token' in response.data) {
      return response.data.tenant_access_token;
    }
    return '';
  } catch (error) {
    console.error('Error getting Feishu access token:', error);
    throw error;
  }
}

// Helper to check if we're using the mock client (for front-end awareness)
export function isUsingMockClient() {
  return usingMockClient;
} 