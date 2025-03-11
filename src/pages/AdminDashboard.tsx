
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getProjects, Project, reviewSubmission, addUserToProject, Submission } from '@/services/projectService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

const AdminDashboard = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { user, logout } = useAuth();

  useEffect(() => {
    // Load projects and users
    setProjects(getProjects());
    const mockUsers = JSON.parse(localStorage.getItem('users') || '[]');
    setUsers(mockUsers);
  }, []);

  const handleAddUserToProject = () => {
    if (selectedUser && selectedProject) {
      const success = addUserToProject(selectedProject, selectedUser);
      
      if (success) {
        toast({
          title: "Success",
          description: "User added to project successfully!",
        });
        // Refresh projects data
        setProjects(getProjects());
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to add user to project. User may already be applied.",
        });
      }
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select both a user and a project.",
      });
    }
  };

  const handleReviewSubmission = (
    projectId: string,
    userId: string,
    status: 'approved' | 'rejected'
  ) => {
    const success = reviewSubmission(projectId, userId, status, feedbackText);
    
    if (success) {
      toast({
        title: "Success",
        description: `Submission ${status} successfully!`,
      });
      setFeedbackText('');
      // Refresh projects data
      setProjects(getProjects());
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to review submission.",
      });
    }
  };

  const filteredUsers = searchQuery
    ? users.filter(u => 
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : users;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">
              Admin: {user?.name}
            </span>
            <Button variant="outline" onClick={logout}>Logout</Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="submissions">Submissions</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>
          
          <TabsContent value="projects" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Management</CardTitle>
                <CardDescription>View and manage all hackathon projects</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projects.map(project => (
                    <Card key={project.id}>
                      <CardHeader>
                        <CardTitle>{project.title}</CardTitle>
                        <CardDescription>
                          Deadline: {new Date(project.deadline).toLocaleDateString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 mb-4">{project.description}</p>
                        <div className="text-sm text-gray-500">
                          <p>Status: {project.status}</p>
                          <p>Applicants: {project.applicants.length}</p>
                          <p>Submissions: {project.submissions.length}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="submissions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Review Submissions</CardTitle>
                <CardDescription>Review and provide feedback on project submissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {projects.map(project => (
                    <div key={project.id} className="space-y-4">
                      <h3 className="text-lg font-medium">{project.title}</h3>
                      
                      {project.submissions.length === 0 ? (
                        <p className="text-gray-500">No submissions yet</p>
                      ) : (
                        project.submissions.map((submission, index) => {
                          const submitter = users.find(u => u.id === submission.userId);
                          return (
                            <Card key={index} className="border-l-4 border-primary">
                              <CardHeader>
                                <div className="flex justify-between items-start">
                                  <div>
                                    <CardTitle className="flex items-center gap-2">
                                      Submission by {submitter?.name || 'Unknown User'}
                                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        submission.status === 'approved' 
                                          ? 'bg-green-100 text-green-800' 
                                          : submission.status === 'rejected'
                                          ? 'bg-red-100 text-red-800'
                                          : 'bg-yellow-100 text-yellow-800'
                                      }`}>
                                        {submission.status}
                                      </span>
                                    </CardTitle>
                                    <CardDescription>
                                      Submitted on {new Date(submission.submittedAt).toLocaleString()}
                                    </CardDescription>
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent className="space-y-3">
                                <div>
                                  <h4 className="text-sm font-medium text-gray-700">Description:</h4>
                                  <p className="mt-1 text-gray-600">{submission.description}</p>
                                </div>
                                
                                {submission.links && submission.links.length > 0 && (
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-700">Links:</h4>
                                    <ul className="mt-1 list-disc list-inside">
                                      {submission.links.map((link, linkIndex) => (
                                        <li key={linkIndex} className="text-blue-600">
                                          <a href={link} target="_blank" rel="noopener noreferrer">{link}</a>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {submission.feedback && (
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-700">Feedback:</h4>
                                    <p className="mt-1 text-gray-600">{submission.feedback}</p>
                                  </div>
                                )}
                                
                                {submission.status === 'pending' && (
                                  <div className="space-y-3">
                                    <Textarea
                                      placeholder="Provide feedback..."
                                      value={feedbackText}
                                      onChange={(e) => setFeedbackText(e.target.value)}
                                      className="w-full"
                                    />
                                    <div className="flex justify-end space-x-2">
                                      <Button
                                        variant="destructive"
                                        onClick={() => handleReviewSubmission(project.id, submission.userId, 'rejected')}
                                      >
                                        Reject
                                      </Button>
                                      <Button
                                        variant="default"
                                        onClick={() => handleReviewSubmission(project.id, submission.userId, 'approved')}
                                      >
                                        Approve
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          );
                        })
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Manage Users</CardTitle>
                <CardDescription>Add users to projects and manage their accounts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-3">
                    <h3 className="text-lg font-medium">Add User to Project</h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Select Project
                        </label>
                        <select
                          className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                          value={selectedProject}
                          onChange={(e) => setSelectedProject(e.target.value)}
                        >
                          <option value="">Select a project</option>
                          {projects.map(project => (
                            <option key={project.id} value={project.id}>
                              {project.title}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Select User
                        </label>
                        <select
                          className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                          value={selectedUser}
                          onChange={(e) => setSelectedUser(e.target.value)}
                        >
                          <option value="">Select a user</option>
                          {users.map(user => (
                            <option key={user.id} value={user.id}>
                              {user.name} ({user.email})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button onClick={handleAddUserToProject}>
                        Add to Project
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-lg font-medium">User List</h3>
                    <div className="mb-4">
                      <Input
                        type="text"
                        placeholder="Search users by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      {filteredUsers.map(user => (
                        <Card key={user.id}>
                          <CardContent className="py-4 flex justify-between items-center">
                            <div>
                              <h4 className="font-medium">{user.name}</h4>
                              <p className="text-sm text-gray-500">{user.email}</p>
                              <p className="text-xs text-gray-400">Role: {user.role}</p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      
                      {filteredUsers.length === 0 && (
                        <p className="text-center text-gray-500 py-4">No users found</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
