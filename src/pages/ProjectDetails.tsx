
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProjectById, submitProject, Project, Submission } from '@/services/projectService';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

const ProjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [description, setDescription] = useState('');
  const [links, setLinks] = useState<string[]>(['']);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [userSubmission, setUserSubmission] = useState<Submission | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      const projectData = getProjectById(id);
      if (projectData) {
        setProject(projectData);

        // Check if user has already submitted
        if (user) {
          const submission = projectData.submissions.find(s => s.userId === user.id);
          if (submission) {
            setUserSubmission(submission);
          }
        }
      } else {
        navigate('/dashboard');
      }
    }
  }, [id, user, navigate]);

  useEffect(() => {
    // Calculate time left
    if (project) {
      const interval = setInterval(() => {
        const now = new Date();
        const deadline = new Date(project.deadline);
        const diff = deadline.getTime() - now.getTime();
        
        if (diff <= 0) {
          setTimeLeft('Deadline passed');
          clearInterval(interval);
        } else {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          
          setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        }
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [project]);

  const handleAddLink = () => {
    setLinks([...links, '']);
  };

  const handleLinkChange = (index: number, value: string) => {
    const newLinks = [...links];
    newLinks[index] = value;
    setLinks(newLinks);
  };

  const handleRemoveLink = (index: number) => {
    const newLinks = [...links];
    newLinks.splice(index, 1);
    setLinks(newLinks);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Project description is required.",
      });
      return;
    }
    
    // Filter out empty links
    const filteredLinks = links.filter(link => link.trim() !== '');
    
    if (user && id) {
      const success = submitProject(id, user.id, {
        description,
        links: filteredLinks
      });
      
      if (success) {
        // Refresh project data
        const updatedProject = getProjectById(id);
        if (updatedProject) {
          setProject(updatedProject);
          const submission = updatedProject.submissions.find(s => s.userId === user.id);
          if (submission) {
            setUserSubmission(submission);
          }
        }
      }
    }
  };

  if (!project) {
    return <div className="min-h-screen flex items-center justify-center">Loading project...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>{project.title}</CardTitle>
                  <CardDescription>Project Details</CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-500">Time Remaining</div>
                  <div className="text-lg font-bold text-primary">{timeLeft}</div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Description</h3>
                  <p className="mt-1 text-gray-700">{project.description}</p>
                </div>

                {userSubmission ? (
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-md p-4">
                      <h3 className="text-lg font-medium text-green-800">Submission Status: {userSubmission.status}</h3>
                      <p className="mt-1 text-green-700">
                        You have successfully submitted your project on {new Date(userSubmission.submittedAt).toLocaleString()}.
                      </p>
                      {userSubmission.feedback && (
                        <div className="mt-3">
                          <h4 className="font-medium text-green-800">Feedback:</h4>
                          <p className="text-green-700">{userSubmission.feedback}</p>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Your Submission</h3>
                      <div className="mt-2 space-y-4">
                        <div>
                          <h4 className="font-medium text-gray-700">Description:</h4>
                          <p className="mt-1 text-gray-600">{userSubmission.description}</p>
                        </div>
                        
                        {userSubmission.links.length > 0 && (
                          <div>
                            <h4 className="font-medium text-gray-700">Links:</h4>
                            <ul className="mt-1 list-disc list-inside space-y-1">
                              {userSubmission.links.map((link, index) => (
                                <li key={index} className="text-blue-600">
                                  <a href={link} target="_blank" rel="noopener noreferrer">{link}</a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Submit Your Project</h3>
                      <div className="mt-4 space-y-4">
                        <div>
                          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                            Project Description
                          </label>
                          <Textarea
                            id="description"
                            placeholder="Describe your implementation..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="mt-1"
                            rows={5}
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Project Links (GitHub, Demo, etc.)
                          </label>
                          <div className="mt-1 space-y-2">
                            {links.map((link, index) => (
                              <div key={index} className="flex gap-2">
                                <Input
                                  type="url"
                                  placeholder="https://..."
                                  value={link}
                                  onChange={(e) => handleLinkChange(index, e.target.value)}
                                  className="flex-1"
                                />
                                {links.length > 1 && (
                                  <Button 
                                    type="button"
                                    variant="destructive"
                                    onClick={() => handleRemoveLink(index)}
                                  >
                                    Remove
                                  </Button>
                                )}
                              </div>
                            ))}
                            <Button
                              type="button"
                              variant="outline"
                              onClick={handleAddLink}
                              className="w-full"
                            >
                              Add Link
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button type="submit">
                        Submit Project
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ProjectDetails;
