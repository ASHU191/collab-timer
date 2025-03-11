
import { toast } from "@/hooks/use-toast";

export interface Project {
  id: string;
  title: string;
  description: string;
  deadline: Date;
  applicants: string[];
  submissions: Submission[];
  status: 'open' | 'closed';
}

export interface Submission {
  userId: string;
  projectId: string;
  description: string;
  links: string[];
  submittedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  feedback?: string;
}

// Initialize dummy projects in localStorage if they don't exist
const initializeProjects = () => {
  if (!localStorage.getItem('projects')) {
    const dummyProjects: Project[] = [
      {
        id: '1',
        title: 'AI-Powered Task Management',
        description: 'Build a task management application that uses AI to prioritize and categorize tasks based on user behavior and deadlines.',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        applicants: [],
        submissions: [],
        status: 'open'
      },
      {
        id: '2',
        title: 'Real-time Collaborative Code Editor',
        description: 'Create a web-based code editor that allows multiple users to edit code simultaneously with syntax highlighting and version control.',
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        applicants: [],
        submissions: [],
        status: 'open'
      },
      {
        id: '3',
        title: 'NFT Marketplace with Social Features',
        description: 'Develop an NFT marketplace that includes social features like following creators, commenting on NFTs, and sharing collections.',
        deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        applicants: [],
        submissions: [],
        status: 'open'
      }
    ];
    localStorage.setItem('projects', JSON.stringify(dummyProjects));
  }
};

// Get all projects
export const getProjects = (): Project[] => {
  initializeProjects();
  return JSON.parse(localStorage.getItem('projects') || '[]');
};

// Get a specific project by ID
export const getProjectById = (id: string): Project | undefined => {
  const projects = getProjects();
  return projects.find(project => project.id === id);
};

// Apply to a project
export const applyToProject = (projectId: string, userId: string): boolean => {
  try {
    const projects = getProjects();
    const projectIndex = projects.findIndex(p => p.id === projectId);
    
    if (projectIndex === -1) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Project not found.",
      });
      return false;
    }
    
    if (projects[projectIndex].status === 'closed') {
      toast({
        variant: "destructive",
        title: "Error",
        description: "This project is no longer accepting applications.",
      });
      return false;
    }
    
    if (projects[projectIndex].applicants.includes(userId)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You have already applied to this project.",
      });
      return false;
    }
    
    projects[projectIndex].applicants.push(userId);
    localStorage.setItem('projects', JSON.stringify(projects));
    
    toast({
      title: "Success",
      description: "Successfully applied to the project!",
    });
    return true;
  } catch (error) {
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to apply to the project.",
    });
    return false;
  }
};

// Submit project work
export const submitProject = (
  projectId: string, 
  userId: string, 
  submission: { description: string, links: string[] }
): boolean => {
  try {
    const projects = getProjects();
    const projectIndex = projects.findIndex(p => p.id === projectId);
    
    if (projectIndex === -1) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Project not found.",
      });
      return false;
    }
    
    const newSubmission: Submission = {
      userId,
      projectId,
      description: submission.description,
      links: submission.links,
      submittedAt: new Date(),
      status: 'pending'
    };
    
    projects[projectIndex].submissions.push(newSubmission);
    localStorage.setItem('projects', JSON.stringify(projects));
    
    toast({
      title: "Success",
      description: "Project submitted successfully!",
    });
    return true;
  } catch (error) {
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to submit project.",
    });
    return false;
  }
};

// Review submission (admin only)
export const reviewSubmission = (
  projectId: string,
  userId: string,
  status: 'approved' | 'rejected',
  feedback?: string
): boolean => {
  try {
    const projects = getProjects();
    const projectIndex = projects.findIndex(p => p.id === projectId);
    
    if (projectIndex === -1) return false;
    
    const submissionIndex = projects[projectIndex].submissions.findIndex(
      s => s.userId === userId
    );
    
    if (submissionIndex === -1) return false;
    
    projects[projectIndex].submissions[submissionIndex].status = status;
    
    if (feedback) {
      projects[projectIndex].submissions[submissionIndex].feedback = feedback;
    }
    
    localStorage.setItem('projects', JSON.stringify(projects));
    return true;
  } catch (error) {
    return false;
  }
};

// Admin: Manually add user to project
export const addUserToProject = (projectId: string, userId: string): boolean => {
  try {
    const projects = getProjects();
    const projectIndex = projects.findIndex(p => p.id === projectId);
    
    if (projectIndex === -1) return false;
    
    if (!projects[projectIndex].applicants.includes(userId)) {
      projects[projectIndex].applicants.push(userId);
      localStorage.setItem('projects', JSON.stringify(projects));
      return true;
    }
    
    return false;
  } catch (error) {
    return false;
  }
};
