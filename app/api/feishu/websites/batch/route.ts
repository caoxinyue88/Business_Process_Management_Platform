import { NextResponse } from 'next/server';
import { getWebsitesFromFile, saveWebsitesToFile } from '../../../../lib/fileSystemService';
import { Website } from '../../../../types/website';

export async function POST(request: Request) {
  try {
    // Parse the request body
    const data = await request.json();
    
    // Validate that the data is an array
    if (!Array.isArray(data)) {
      return NextResponse.json(
        { error: 'Invalid request format. Expected an array of websites.' }, 
        { status: 400 }
      );
    }
    
    // Get existing websites
    const websites = await getWebsitesFromFile();
    
    // Generate IDs for new websites
    const newWebsites = data.map(item => ({
      ...item,
      id: `web-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    }));
    
    // Save all websites (existing + new)
    await saveWebsitesToFile([...websites, ...newWebsites]);
    
    // Return the newly created websites
    return NextResponse.json(
      { 
        success: true, 
        websites: newWebsites, 
        count: newWebsites.length 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating websites in batch:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create websites' }, 
      { status: 500 }
    );
  }
} 