import { NextResponse } from 'next/server';
import { getAssistantItemsFromFile, saveAssistantItemsToFile } from '../../../../lib/fileSystemService';
import { AssistantItem } from '../../../../types/assistant';

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
    
    // Get existing assistant items
    const items = await getAssistantItemsFromFile();
    
    // Generate IDs for new assistant items
    const newAssistantItems = data.map(item => ({
      ...item,
      id: `AI${Date.now()}${Math.floor(Math.random() * 1000)}`
    }));
    
    // Save all assistant items (existing + new)
    await saveAssistantItemsToFile([...items, ...newAssistantItems]);
    
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