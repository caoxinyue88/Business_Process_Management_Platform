import { NextResponse } from 'next/server';
import { batchCreateWebsites } from '../../../../../app/lib/localStorageService';
import { Website } from '../../../../../app/types/website';

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
    
    // Call the batch create function
    const newWebsites = await batchCreateWebsites(data);
    
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