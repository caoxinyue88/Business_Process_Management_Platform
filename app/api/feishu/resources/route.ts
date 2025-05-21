import { NextResponse } from 'next/server';
import { getResourcesFromFile, saveResourcesToFile } from '../../../lib/fileSystemService';

// Add debug logging helper
const log = (message: string, data?: any) => {
  console.log(`[Resources API] ${message}`, data ? JSON.stringify(data) : '');
};

export async function GET() {
  try {
    log('Fetching all resources');
    const resources = await getResourcesFromFile();
    log(`Retrieved ${resources.length} resources`);
    return NextResponse.json({ resources });
  } catch (error) {
    console.error('Error fetching resources:', error);
    return NextResponse.json({ error: 'Failed to fetch resources' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log('Creating resource with data:', data);
    
    // Validate required fields
    if (!data.name || !data.type) {
      return NextResponse.json({ error: 'Name and type are required fields' }, { status: 400 });
    }
    
    // Generate ID
    const newId = `R${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const newResource = { 
      ...data, 
      id: newId 
    };
    
    // Save to file
    const resources = await getResourcesFromFile();
    resources.push(newResource);
    await saveResourcesToFile(resources);
    
    console.log('Created resource:', newResource);
    return NextResponse.json(newResource);
  } catch (error) {
    console.error('Error creating resource:', error);
    return NextResponse.json({ error: 'Failed to create resource' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, ...data } = await request.json();
    log(`Updating resource ID: ${id}`);
    
    if (!id) {
      return NextResponse.json({ error: 'Resource ID is required' }, { status: 400 });
    }
    
    // Get existing resources
    const resources = await getResourcesFromFile();
    const resourceIndex = resources.findIndex((r: any) => r.id === id);
    
    if (resourceIndex === -1) {
      return NextResponse.json({ error: `Resource with ID ${id} not found` }, { status: 404 });
    }
    
    // Update the resource
    // Using a clean way to merge objects avoiding TypeScript spread error
    const existingResource = resources[resourceIndex];
    const updatedResource = Object.assign({}, existingResource, data);
    resources[resourceIndex] = updatedResource;
    await saveResourcesToFile(resources);
    
    return NextResponse.json(updatedResource);
  } catch (error) {
    console.error('Error updating resource:', error);
    return NextResponse.json({ error: 'Failed to update resource' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    log(`Deleting resource ID: ${id}`);
    
    if (!id) {
      return NextResponse.json({ error: 'Resource ID is required' }, { status: 400 });
    }
    
    // Get existing resources and filter out the one to delete
    const resources = await getResourcesFromFile();
    const filteredResources = resources.filter((r: any) => r.id !== id);
    
    if (resources.length === filteredResources.length) {
      return NextResponse.json({ error: `Resource with ID ${id} not found` }, { status: 404 });
    }
    
    await saveResourcesToFile(filteredResources);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting resource:', error);
    return NextResponse.json({ error: 'Failed to delete resource' }, { status: 500 });
  }
} 