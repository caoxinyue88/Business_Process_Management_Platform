import { NextResponse } from 'next/server';

// Mock data storage since we don't have a real database connection yet
const processFlows: any[] = [];

// GET all process flows or a specific one by ID
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const flowId = url.searchParams.get('flowId');
    const businessFlowId = url.searchParams.get('businessFlowId');
    
    if (flowId) {
      // Get a specific flow by ID
      const flow = processFlows.find(f => f.metadata?.id === flowId);
      if (!flow) {
        return NextResponse.json({ error: 'Process flow not found' }, { status: 404 });
      }
      return NextResponse.json(flow);
    } 
    
    if (businessFlowId) {
      // Get all flows belonging to a specific business flow
      const flows = processFlows.filter(f => f.metadata?.businessFlowId === businessFlowId);
      return NextResponse.json({ flows });
    }
    
    // Get all flows
    return NextResponse.json({ flows: processFlows });
  } catch (error) {
    console.error('Error getting process flows:', error);
    return NextResponse.json(
      { error: 'Failed to get process flows', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST to create a new process flow
export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    // Validate required fields
    if (!data.metadata?.name || !data.metadata?.type) {
      return NextResponse.json({ error: 'Missing required fields (name or type)' }, { status: 400 });
    }
    
    // Ensure the flow has an ID
    if (!data.metadata?.id) {
      data.metadata.id = `flow_${Date.now()}`;
    }
    
    // Add creation timestamp
    data.metadata.createdAt = new Date().toISOString();
    data.metadata.updatedAt = new Date().toISOString();
    
    // Store the flow
    processFlows.push(data);
    
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating process flow:', error);
    return NextResponse.json(
      { error: 'Failed to create process flow', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PUT to update an existing process flow
export async function PUT(req: Request) {
  try {
    const data = await req.json();
    
    // Validate required fields
    if (!data.metadata?.id) {
      return NextResponse.json({ error: 'Missing required field (id)' }, { status: 400 });
    }
    
    // Find the flow to update
    const index = processFlows.findIndex(f => f.metadata?.id === data.metadata.id);
    if (index === -1) {
      return NextResponse.json({ error: 'Process flow not found' }, { status: 404 });
    }
    
    // Update timestamp
    data.metadata.updatedAt = new Date().toISOString();
    
    // Update the flow
    processFlows[index] = data;
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating process flow:', error);
    return NextResponse.json(
      { error: 'Failed to update process flow', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE a process flow
export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const flowId = url.searchParams.get('flowId');
    
    if (!flowId) {
      return NextResponse.json({ error: 'Missing required parameter (flowId)' }, { status: 400 });
    }
    
    // Find the flow to delete
    const index = processFlows.findIndex(f => f.metadata?.id === flowId);
    if (index === -1) {
      return NextResponse.json({ error: 'Process flow not found' }, { status: 404 });
    }
    
    // Delete the flow
    processFlows.splice(index, 1);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting process flow:', error);
    return NextResponse.json(
      { error: 'Failed to delete process flow', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 