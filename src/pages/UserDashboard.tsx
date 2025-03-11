
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getProjects, applyToProject, Project } from '@/services/projectService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const UserDashboard = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setProjects(getProjects());
  }, []);

  const handleApply = (projectId: string) => {
    if (user) {
      const success = applyToProject(projectId, user.id);
      if (success) {
        navigate(`/project/${projectId}`);
      }
      // Update the projects list after application
      setProjects(getProjects());
    }
  };

  const formatDeadline = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Hackathon Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">
              Welcome, {user?.name}
            </span>
            <Button variant="outline" onClick={logout}>Logout</Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Available Projects</h2>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card key={project.id} className="flex flex-col h-full">
                <CardHeader>
                  <CardTitle>{project.title}</CardTitle>
                  <CardDescription>
                    Deadline: {formatDeadline(project.deadline)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-gray-700">{project.description}</p>
                </CardContent>
                <CardFooter>
                  {project.applicants.includes(user?.id || '') ? (
                    <Button 
                      onClick={() => navigate(`/project/${project.id}`)}
                      className="w-full"
                    >
                      View Project
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => handleApply(project.id)}
                      className="w-full"
                      disabled={project.status === 'closed'}
                    >
                      Apply Now
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;
