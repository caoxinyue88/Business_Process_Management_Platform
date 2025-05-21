import { NextResponse } from 'next/server';
import { getAssistantItemsFromFile, saveAssistantItemsToFile } from '../../../lib/fileSystemService';

// Add debug logging helper
const log = (message: string, data?: any) => {
  console.log(`[Assistant API] ${message}`, data ? JSON.stringify(data) : '');
};

export async function GET() {
  try {
    log('Fetching all assistant items');
    const items = await getAssistantItemsFromFile();
    log(`Retrieved ${items.length} assistant items`);
    return NextResponse.json({ items });
  } catch (error) {
    console.error('Error fetching assistant items:', error);
    return NextResponse.json({ error: 'Failed to fetch assistant items' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    log('Creating assistant item with data:', data);
    
    // Validate required fields
    if (!data.name) {
      return NextResponse.json({ error: 'Name is a required field' }, { status: 400 });
    }
    
    // Generate ID
    const newId = `AI${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const newItem = { 
      ...data, 
      id: newId 
    };
    
    // Save to file
    const items = await getAssistantItemsFromFile();
    items.push(newItem);
    await saveAssistantItemsToFile(items);
    
    log('Created assistant item:', newItem);
    return NextResponse.json(newItem);
  } catch (error) {
    console.error('Error creating assistant item:', error);
    return NextResponse.json({ error: 'Failed to create assistant item' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, ...data } = await request.json();
    log(`Updating assistant item ID: ${id}`);
    
    if (!id) {
      return NextResponse.json({ error: 'Assistant item ID is required' }, { status: 400 });
    }
    
    // Get existing items
    const items = await getAssistantItemsFromFile();
    const itemIndex = items.findIndex((item: any) => item.id === id);
    
    if (itemIndex === -1) {
      return NextResponse.json({ error: `Assistant item with ID ${id} not found` }, { status: 404 });
    }
    
    // Update the item
    const existingItem = items[itemIndex];
    const updatedItem = Object.assign({}, existingItem, data);
    items[itemIndex] = updatedItem;
    await saveAssistantItemsToFile(items);
    
    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('Error updating assistant item:', error);
    return NextResponse.json({ error: 'Failed to update assistant item' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    log(`Deleting assistant item ID: ${id}`);
    
    if (!id) {
      return NextResponse.json({ error: 'Assistant item ID is required' }, { status: 400 });
    }
    
    // Get existing items and filter out the one to delete
    const items = await getAssistantItemsFromFile();
    const filteredItems = items.filter((item: any) => item.id !== id);
    
    if (items.length === filteredItems.length) {
      return NextResponse.json({ error: `Assistant item with ID ${id} not found` }, { status: 404 });
    }
    
    await saveAssistantItemsToFile(filteredItems);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting assistant item:', error);
    return NextResponse.json({ error: 'Failed to delete assistant item' }, { status: 500 });
  }
} 