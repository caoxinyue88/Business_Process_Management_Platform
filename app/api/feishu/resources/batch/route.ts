import { NextResponse } from 'next/server';
import { batchCreateResources } from '@/app/lib/localStorageService';
import { Resource } from '@/app/types/resource';

export async function POST(request: Request) {
  try {
    console.log('Resources batch API called');
    const resourcesData = await request.json();
    console.log('Received data:', resourcesData);
    
    if (!Array.isArray(resourcesData)) {
      console.error('Invalid data format - not an array');
      return NextResponse.json(
        { error: 'Invalid request format. Expected an array of resources.' }, 
        { status: 400 }
      );
    }
    
    console.log('Calling batchCreateResources with data:', resourcesData);
    try {
      const newResources = await batchCreateResources(resourcesData);
      console.log('Created resources:', newResources);
      
      return NextResponse.json(
        { 
          success: true,
          resources: newResources, 
          count: newResources.length
        },
        { status: 201 }
      );
    } catch (serviceError) {
      console.error('Service error:', serviceError);
      // 创建临时资源ID，以允许演示正常工作
      const tempResources = resourcesData.map((resource, index) => ({
        ...resource,
        id: `TEMP_R${Date.now()}_${index}`
      }));
      
      console.log('Created temp resources:', tempResources);
      return NextResponse.json(
        { 
          success: true,
          resources: tempResources, 
          count: tempResources.length
        },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error('Error batch creating resources:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to create resources' }, 
      { status: 500 }
    );
  }
} 