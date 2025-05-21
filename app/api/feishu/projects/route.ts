import { NextResponse } from 'next/server';
import { getProjectsFromFile, saveProjectsToFile } from '../../../lib/fileSystemService';

// Define Project interface
interface Project {
  id: string;
  name: string;
  type: string;
  status?: string;
  department?: string;
  owner?: string;
  startDate?: string;
  // Add other fields that might be in your project objects
}

// Add debug logging helper
const log = (message: string, data?: any) => {
  console.log(`[Projects API] ${message}`, data ? JSON.stringify(data) : '');
};

export async function GET() {
  try {
    log('Fetching all projects');
    const projects = await getProjectsFromFile();
    log(`Retrieved ${projects.length} projects`);
    return NextResponse.json({ projects, timestamp: Date.now() });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ error: 'Failed to fetch projects', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    log('Creating new project');
    const projectData = await request.json();
    log('Project data received:', projectData);
    
    // Validate the required fields
    if (!projectData.name || !projectData.type) {
      log('Validation failed: Missing required fields');
      return NextResponse.json({ 
        error: 'Missing required fields', 
        details: 'Name and type are required' 
      }, { status: 400 });
    }

    // Generate a new ID for the project
    const newId = `P${Date.now()}${Math.floor(Math.random() * 1000)}`;
    
    // Since we've already validated name and type, we can safely cast this
    const newProject = { 
      id: newId,
      name: projectData.name,
      type: projectData.type,
      ...projectData 
    };
    
    // Get existing projects and add the new one
    const projects = await getProjectsFromFile();
    projects.push(newProject);
    await saveProjectsToFile(projects);
    
    log('New project created:', newProject);
    return NextResponse.json(newProject);
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({ 
      error: 'Failed to create project', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    log('Updating project');
    const { id, ...projectData } = await request.json();
    log(`Updating project ID: ${id}`, projectData);
    
    if (!id) {
      log('Validation failed: Project ID is required');
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }
    
    // Get existing projects
    const projects = await getProjectsFromFile();
    const projectIndex = projects.findIndex((p: any) => p.id === id);
    
    if (projectIndex === -1) {
      log(`Project with ID ${id} not found`);
      return NextResponse.json({ error: `Project with ID ${id} not found` }, { status: 404 });
    }
    
    // Update the project
    const updatedProject = { ...projects[projectIndex], ...projectData };
    projects[projectIndex] = updatedProject;
    await saveProjectsToFile(projects);
    
    log('Project updated successfully:', updatedProject);
    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json({ 
      error: 'Failed to update project', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    log('Deleting project');
    const { id } = await request.json();
    log(`Deleting project ID: ${id}`);
    
    if (!id) {
      log('Validation failed: Project ID is required');
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }
    
    // Get existing projects and filter out the one to delete
    const projects = await getProjectsFromFile();
    const filteredProjects = projects.filter((p: any) => p.id !== id);
    
    if (projects.length === filteredProjects.length) {
      log(`Project with ID ${id} not found`);
      return NextResponse.json({ error: `Project with ID ${id} not found` }, { status: 404 });
    }
    
    await saveProjectsToFile(filteredProjects);
    log(`Project deleted: ${id}`);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json({ 
      error: 'Failed to delete project', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
} 