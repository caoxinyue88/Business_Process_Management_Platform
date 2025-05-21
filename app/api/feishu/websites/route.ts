import { NextResponse } from 'next/server';
import { getWebsitesFromFile, saveWebsitesToFile } from '../../../lib/fileSystemService';

// Add debug logging helper
const log = (message: string, data?: any) => {
  console.log(`[Websites API] ${message}`, data ? JSON.stringify(data) : '');
};

export async function GET() {
  try {
    log('Fetching all websites');
    const websites = await getWebsitesFromFile();
    log(`Retrieved ${websites.length} websites`);
    return NextResponse.json({ websites });
  } catch (error) {
    console.error('Error fetching websites:', error);
    return NextResponse.json({ error: 'Failed to fetch websites' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    log('Creating website with data:', data);
    
    // Validate required fields
    if (!data.name || !data.url) {
      return NextResponse.json({ error: 'Name and URL are required fields' }, { status: 400 });
    }
    
    // Generate ID
    const newId = `web-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const newWebsite = { 
      ...data, 
      id: newId 
    };
    
    // Save to file
    const websites = await getWebsitesFromFile();
    websites.push(newWebsite);
    await saveWebsitesToFile(websites);
    
    log('Created website:', newWebsite);
    return NextResponse.json(newWebsite);
  } catch (error) {
    console.error('Error creating website:', error);
    return NextResponse.json({ error: 'Failed to create website' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, ...data } = await request.json();
    log(`Updating website ID: ${id}`);
    
    if (!id) {
      return NextResponse.json({ error: 'Website ID is required' }, { status: 400 });
    }
    
    // Get existing websites
    const websites = await getWebsitesFromFile();
    const websiteIndex = websites.findIndex((site: any) => site.id === id);
    
    if (websiteIndex === -1) {
      return NextResponse.json({ error: `Website with ID ${id} not found` }, { status: 404 });
    }
    
    // Update the website
    const existingWebsite = websites[websiteIndex];
    const updatedWebsite = Object.assign({}, existingWebsite, data);
    websites[websiteIndex] = updatedWebsite;
    await saveWebsitesToFile(websites);
    
    return NextResponse.json(updatedWebsite);
  } catch (error) {
    console.error('Error updating website:', error);
    return NextResponse.json({ error: 'Failed to update website' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    log(`Deleting website ID: ${id}`);
    
    if (!id) {
      return NextResponse.json({ error: 'Website ID is required' }, { status: 400 });
    }
    
    // Get existing websites and filter out the one to delete
    const websites = await getWebsitesFromFile();
    const filteredWebsites = websites.filter((site: any) => site.id !== id);
    
    if (websites.length === filteredWebsites.length) {
      return NextResponse.json({ error: `Website with ID ${id} not found` }, { status: 404 });
    }
    
    await saveWebsitesToFile(filteredWebsites);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting website:', error);
    return NextResponse.json({ error: 'Failed to delete website' }, { status: 500 });
  }
} 