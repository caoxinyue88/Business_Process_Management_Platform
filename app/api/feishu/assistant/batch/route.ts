import { NextResponse } from 'next/server';
import { batchCreateAssistantItems } from '../../../../../app/lib/localStorageService';
import { AssistantItem } from '../../../../../app/types/assistant';

export async function POST(request: Request) {
  try {
    // Parse the request body
    const data = await request.json();
    
    // Validate that the data is an array
    if (!Array.isArray(data)) {
      return NextResponse.json(
        { error: 'Invalid request format. Expected an array of assistant items.' },
        { status: 400 }
      );
    }
    
    // Call the batch create function
    const newAssistantItems = await batchCreateAssistantItems(data);
    
    // Return the newly created assistant items
    return NextResponse.json(
      { 
        success: true, 
        assistantItems: newAssistantItems,
        count: newAssistantItems.length
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating assistant items in batch:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create assistant items' },
      { status: 500 }
    );
  }
} 