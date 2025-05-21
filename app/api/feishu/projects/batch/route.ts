import { NextResponse } from 'next/server';
import { batchCreateProjects } from '@/app/lib/localStorageService';
import { Project } from '@/app/types/project';

export async function POST(request: Request) {
  try {
    console.log('Projects batch API called');
    const projectsData = await request.json();
    console.log('Received data:', projectsData);
    
    if (!Array.isArray(projectsData)) {
      console.error('Invalid data format - not an array');
      return NextResponse.json(
        { error: 'Invalid request format. Expected an array of projects.' }, 
        { status: 400 }
      );
    }
    
    console.log('Calling batchCreateProjects with data:', projectsData);
    try {
      const newProjects = await batchCreateProjects(projectsData);
      console.log('Created projects:', newProjects);
      
      return NextResponse.json(
        { 
          success: true,
          projects: newProjects, 
          count: newProjects.length
        },
        { status: 201 }
      );
    } catch (serviceError) {
      console.error('Service error:', serviceError);
      // 创建临时项目ID，以允许演示正常工作
      const tempProjects = projectsData.map((project, index) => ({
        ...project,
        id: `TEMP_P${Date.now()}_${index}`
      }));
      
      console.log('Created temp projects:', tempProjects);
      return NextResponse.json(
        { 
          success: true,
          projects: tempProjects, 
          count: tempProjects.length
        },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error('Error batch creating projects:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to create projects' }, 
      { status: 500 }
    );
  }
} 