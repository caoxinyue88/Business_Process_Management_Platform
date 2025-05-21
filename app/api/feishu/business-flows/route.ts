import { NextResponse } from 'next/server';
import { getBusinessFlows, createBusinessFlow } from '../../../lib/localStorageService';

export async function GET() {
  try {
    const businessFlows = await getBusinessFlows();
    return NextResponse.json(businessFlows);
  } catch (error) {
    console.error('Error fetching business flows:', error);
    return NextResponse.json({ error: 'Failed to fetch business flows' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const businessFlowData = await request.json();
    const newBusinessFlow = await createBusinessFlow(businessFlowData);
    return NextResponse.json(newBusinessFlow);
  } catch (error) {
    console.error('Error creating business flow:', error);
    return NextResponse.json({ error: 'Failed to create business flow' }, { status: 500 });
  }
} 