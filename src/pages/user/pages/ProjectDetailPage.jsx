import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Rocket, Terminal, Database, Globe, Settings, GitBranch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { projectAPI } from '@/api/api';
import OverviewTab from '../components/OverviewTab';
import EnvironmentVariablesTab from '../components/EnvironmentVariablesTab';
import CustomDomainsTab from '../components/CustomDomainsTab';
import SettingsTab from '../components/SettingsTab';
import { Trash2, Loader2 } from 'lucide-react';

const ProjectDetailPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deploying, setDeploying] = useState(false);
  const [selectedDeployment, setSelectedDeployment] = useState(null);
  const [deploymentStatuses, setDeploymentStatuses] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [deploymentPage, setDeploymentPage] = useState(1);
  const [deploymentPagination, setDeploymentPagination] = useState(null);
  const selectedDeploymentRef = React.useRef(selectedDeployment);
  
  // Keep ref in sync with state
  useEffect(() => {
    selectedDeploymentRef.current = selectedDeployment;
  }, [selectedDeployment]);

  useEffect(() => {
    fetchProject(false, deploymentPage);
  }, [projectId, deploymentPage]);

  // Poll deployment status every 3 seconds for active deployments
  useEffect(() => {
    if (!project?.deployments) return;

    let isMounted = true;

    const pollStatus = async () => {
      if (!isMounted) return;

      // Get current active deployments from project state
      const allDeployments = project.deployments || [];
      const activeDeployments = allDeployments.filter((d) => {
        const currentStatus = deploymentStatuses[d.id]?.status || d.status;
        return currentStatus === 'QUEUED' || currentStatus === 'DEPLOYING';
      });

      if (activeDeployments.length === 0) return;

      let hasStatusChange = false;
      
      for (const deployment of activeDeployments) {
        if (!isMounted) break;
        
        try {
          const response = await projectAPI.getDeploymentStatus(deployment.id);
          if (response.success && isMounted) {
            const currentStatus = deploymentStatuses[deployment.id]?.status || deployment.status;
            const newStatus = response.data.status;
            
            // Only update if status actually changed
            if (newStatus !== currentStatus) {
              hasStatusChange = true;
              setDeploymentStatuses((prev) => ({
                ...prev,
                [deployment.id]: response.data,
              }));
            } else {
              // Update status object even if status didn't change (for other fields like ecsStatus)
              setDeploymentStatuses((prev) => ({
                ...prev,
                [deployment.id]: response.data,
              }));
            }
          }
        } catch (error) {
          console.error(`Failed to fetch status for deployment ${deployment.id}:`, error);
        }
      }

      // Only fetch project if status changed (to get updated deployments list)
      // Use skipLoading to prevent loading state during polling
      if (hasStatusChange && isMounted) {
        const updatedProject = await projectAPI.getProjectById(projectId, deploymentPage, 10);
        if (updatedProject.success && isMounted) {
          const newProject = updatedProject.data;
          setProject(newProject);
          setDeploymentPagination(newProject.deploymentsPagination);
          
          // Update selected deployment if it exists (using ref to avoid dependency)
          const currentSelected = selectedDeploymentRef.current;
          if (currentSelected && newProject.deployments) {
            const updatedDeployment = newProject.deployments.find(
              d => d.id === currentSelected.id
            );
            if (updatedDeployment) {
              setSelectedDeployment(updatedDeployment);
            }
          }
        }
      }
    };

    // Poll immediately, then every 3 seconds
    pollStatus();
    const interval = setInterval(pollStatus, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [project?.deployments, projectId]);

  const fetchProject = async (skipLoading = false, page = 1) => {
    try {
      if (!skipLoading) {
        setLoading(true);
      }
      const response = await projectAPI.getProjectById(projectId, page, 10);
      if (response.success) {
        const newProject = response.data;
        setProject(newProject);
        
        // Update selectedDeployment intelligently
        if (newProject.deployments && newProject.deployments.length > 0) {
          setSelectedDeployment(prevSelected => {
            // If no deployment is selected, select the first one (newest)
            if (!prevSelected) {
              return newProject.deployments[0];
            }
            
            // Update selected deployment if it still exists
            const updatedDeployment = newProject.deployments.find(
              d => d.id === prevSelected.id
            );
            if (updatedDeployment) {
              return updatedDeployment;
            }
            
            // If selected deployment was deleted, select the first one (newest)
            return newProject.deployments[0];
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch project:', error);
    } finally {
      if (!skipLoading) {
        setLoading(false);
      }
    }
  };

  const handleDeploy = async () => {
    try {
      setDeploying(true);
      const response = await projectAPI.deployProject(projectId);
      if (response.success) {
        // Refresh project data to get new deployment (skip loading state)
        const updatedProject = await projectAPI.getProjectById(projectId, deploymentPage, 10);
        if (updatedProject.success) {
          setProject(updatedProject.data);
          setDeploymentPagination(updatedProject.data.deploymentsPagination);
          
          // Set the new deployment as selected
          if (response.data.deploymentId && updatedProject.data.deployments) {
            const newDeployment = updatedProject.data.deployments.find(
              d => d.id === response.data.deploymentId
            );
            if (newDeployment) {
              setSelectedDeployment(newDeployment);
              setDeploymentStatuses((prev) => ({
                ...prev,
                [response.data.deploymentId]: { status: 'QUEUED' },
              }));
            } else if (updatedProject.data.deployments.length > 0) {
              // If new deployment not found, select the first one (should be the latest)
              setSelectedDeployment(updatedProject.data.deployments[0]);
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to deploy:', error);
    } finally {
      setDeploying(false);
    }
  };


  const handleDeleteDeployment = (deployment, e) => {
    e.stopPropagation();
    setSelectedDeployment(deployment);
    setDeleteConfirmText('');
    setDeleteDialogOpen(true);
  };

  const handleDeleteSubmit = async () => {
    if (deleteConfirmText !== 'permanently delete' || !selectedDeployment) return;
    
    try {
      setDeleting(true);
      const response = await projectAPI.deleteDeployment(selectedDeployment.id);
      if (response.success) {
        await fetchProject();
        setDeleteDialogOpen(false);
        setDeleteConfirmText('');
        setSelectedDeployment(null);
      }
    } catch (error) {
      console.error('Failed to delete deployment:', error);
    } finally {
      setDeleting(false);
    }
  };

  const handleReplayDeployment = async () => {
    if (!selectedDeployment) {
      await handleDeploy();
    } else {
      await handleDeploy();
    }
  };

  const handleUpdateProject = async (data) => {
    const response = await projectAPI.updateProject(projectId, data);
    if (response.success) {
      await fetchProject();
    }
  };

  const handleDeleteProject = async () => {
    const response = await projectAPI.deleteProject(projectId);
    if (response.success) {
      navigate('/workspace/projects');
    }
  };

  const TabButton = ({ id, label, icon: Icon, active, onClick }) => (
    <button 
      onClick={() => onClick(id)}
      className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${
        active 
          ? 'bg-primary text-primary-foreground shadow-lg' 
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      }`}
    >
      <Icon size={18} strokeWidth={active ? 2.5 : 2} />
      <span className="hidden md:inline">{label}</span>
    </button>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold mb-2">Project not found</h2>
        <Button
          onClick={() => navigate('/workspace/projects')}
          className="rounded-full mt-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Projects
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 h-16 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/workspace/projects')}
              className="rounded-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            {project.frameworkPreset?.images?.urls?.[0] && (
              <div className="flex-shrink-0">
                <img 
                  src={project.frameworkPreset.images.urls[0]} 
                  alt={project.frameworkPreset?.name || 'Framework'} 
                  className="w-10 h-10 rounded-lg object-cover border border-border"
                />
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold">{project.name}</h1>
              <p className="text-xs text-muted-foreground">
                {project.frameworkPreset?.name || 'Unknown'} • {project.frameworkPreset?.type || 'Unknown'}
              </p>
            </div>
          </div>
          <Button
            onClick={handleDeploy}
            disabled={deploying}
            className="rounded-full h-9 px-4 cursor-pointer"
          >
            {deploying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deploying...
              </>
            ) : (
              <>
                <Rocket className="mr-2 h-4 w-4" />
                Deploy
              </>
            )}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
          <TabButton 
            id="overview" 
            label="Overview" 
            icon={GitBranch} 
            active={activeTab === 'overview'} 
            onClick={setActiveTab} 
          />
          <TabButton 
            id="env" 
            label="Environment Variables" 
            icon={Database} 
            active={activeTab === 'env'} 
            onClick={setActiveTab} 
          />
          <TabButton 
            id="domains" 
            label="Custom Domains" 
            icon={Globe} 
            active={activeTab === 'domains'} 
            onClick={setActiveTab} 
          />
          <TabButton 
            id="settings" 
            label="Settings" 
            icon={Settings} 
            active={activeTab === 'settings'} 
            onClick={setActiveTab} 
          />
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === 'overview' && (
            <OverviewTab
              project={project}
              selectedDeployment={selectedDeployment}
              onSelectDeployment={setSelectedDeployment}
              onDeleteDeployment={handleDeleteDeployment}
              deploymentStatuses={deploymentStatuses}
              onRedeploy={() => fetchProject(false, deploymentPage)}
              deploymentPage={deploymentPage}
              setDeploymentPage={setDeploymentPage}
              deploymentPagination={deploymentPagination}
            />
          )}
          {activeTab === 'env' && (
            <EnvironmentVariablesTab 
              projectId={projectId} 
              onReplay={handleReplayDeployment}
            />
          )}
          {activeTab === 'domains' && (
            <CustomDomainsTab project={project} />
          )}
          {activeTab === 'settings' && (
            <SettingsTab 
              project={project}
              onUpdate={handleUpdateProject}
              onDelete={handleDeleteProject}
            />
          )}
        </div>
      </main>

      {/* Delete Deployment Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle>Delete Deployment</DialogTitle>
            <DialogDescription>
              This will permanently delete this deployment and its logs. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="confirm">
                Type <span className="font-mono font-bold">permanently delete</span> to confirm
              </Label>
              <Input
                id="confirm"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="permanently delete"
                className="rounded-full"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setDeleteConfirmText('');
              }}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteSubmit}
              disabled={deleteConfirmText !== 'permanently delete' || deleting}
              variant="destructive"
              className="rounded-full cursor-pointer"
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Deployment
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectDetailPage;

