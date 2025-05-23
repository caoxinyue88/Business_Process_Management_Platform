import { NextResponse } from "next/server";
import { getDashboardFromFile, saveDashboardToFile } from '../../../lib/fileSystemService';

// Add debug logging helper
const log = (message: string, data?: any) => {
  console.log(`[Dashboard API] ${message}`, data ? JSON.stringify(data) : '');
};

export async function GET() {
  try {
    log('Fetching dashboard data');
    const dashboard = await getDashboardFromFile();
    return NextResponse.json(dashboard);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    log('Updating dashboard with data:', data);
    
    // Save to file
    await saveDashboardToFile(data);
    
    log('Updated dashboard');
    return NextResponse.json({ success: true, dashboard: data });
  } catch (error) {
    console.error('Error updating dashboard:', error);
    return NextResponse.json({ error: 'Failed to update dashboard' }, { status: 500 });
  }
} 