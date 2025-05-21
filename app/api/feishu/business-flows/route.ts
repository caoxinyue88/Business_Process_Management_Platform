import { NextResponse } from 'next/server';
import { getBusinessFlowsFromFile, saveBusinessFlowsToFile } from '../../../lib/fileSystemService';

export async function GET() {
  try {
    const businessFlows = await getBusinessFlowsFromFile();
    return NextResponse.json(businessFlows);
  } catch (error) {
    console.error('Error fetching business flows:', error);
    return NextResponse.json({ error: 'Failed to fetch business flows' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const businessFlowData = await request.json();
    
    // Validate required fields
    if (!businessFlowData.name) {
      return NextResponse.json({ error: 'Name is a required field' }, { status: 400 });
    }
    
    // Generate ID and create new business flow
    const newId = `BF${Date.now()}${Math.floor(Math.random() * 10000)}`;
    const newBusinessFlow = {
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
    
    // Save to file
    const businessFlows = await getBusinessFlowsFromFile();
    
    // Handle parent-child relationships if needed
    if (businessFlowData.parentId) {
      let parentFound = false;
      const findAndAddToParent = (flows: any[]): any[] => {
        return flows.map(flow => {
          if (flow.id === businessFlowData.parentId) {
            parentFound = true;
            return { 
              ...flow, 
              children: [...(flow.children || []), newBusinessFlow] 
            };
          }
          if (flow.children && flow.children.length > 0) {
            return { 
              ...flow, 
              children: findAndAddToParent(flow.children) 
            };
          }
          return flow;
        });
      };
      
      const updatedFlows = findAndAddToParent(businessFlows);
      
      if (parentFound) {
        await saveBusinessFlowsToFile(updatedFlows);
      } else {
        console.warn(`Parent ID ${businessFlowData.parentId} not found. Adding to root level.`);
        await saveBusinessFlowsToFile([...businessFlows, newBusinessFlow]);
      }
    } else {
      // Add to root level
      await saveBusinessFlowsToFile([...businessFlows, newBusinessFlow]);
    }
    
    return NextResponse.json(newBusinessFlow);
  } catch (error) {
    console.error('Error creating business flow:', error);
    return NextResponse.json({ error: 'Failed to create business flow' }, { status: 500 });
  }
} 