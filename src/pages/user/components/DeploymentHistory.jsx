import React, { useState, useEffect } from 'react';
import { 
  GitCommit, 
  GitBranch, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Loader2, 
  ExternalLink, 
  RotateCw, 
  Trash2, 
  ChevronDown, 
  ChevronUp,
  Terminal,
  Copy
} from 'lucide-react';
import { projectAPI } from '@/api/api';

const DeploymentHistory = ({ 
  deployments, 
  selectedDeployment, 
  onSelectDeployment, 
  onDeleteDeployment,
  deploymentStatuses,
  projectId,
  onRedeploy
}) => {
  const [expanded, setExpanded] = useState({});
  const [redeployingId, setRedeployingId] = useState(null);

  const getStatusIcon = (status, isRunning) => {
    const baseClasses = "p-2 rounded-full ring-4 ring-background";
    const runningClasses = isRunning ? "animate-pulse ring-blue-500/50" : "";
    
    switch (status) {
      case 'DEPLOYED':
      case 'READY':
        return <div className={`bg-emerald-500/10 text-emerald-500 ${baseClasses} ${runningClasses}`}><CheckCircle2 size={16} /></div>;
      case 'FAILED':
        return <div className={`bg-red-500/10 text-red-500 ${baseClasses} ${runningClasses}`}><XCircle size={16} /></div>;
      case 'DEPLOYING':
      case 'QUEUED':
        return <div className={`bg-blue-500/10 text-blue-500 ${baseClasses} ${runningClasses}`}><Loader2 size={16} className="animate-spin" /></div>;
      default:
        return <div className={`bg-zinc-500/10 text-zinc-500 ${baseClasses} ${runningClasses}`}><Clock size={16} /></div>;
    }
  };

  const getStatusChip = (status) => {
    const styles = {
      DEPLOYED: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      READY: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      FAILED: 'text-red-400 bg-red-500/10 border-red-500/20',
      DEPLOYING: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      QUEUED: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      NOT_STARTED: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20',
    };

    return (
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${styles[status] || styles.NOT_STARTED} uppercase tracking-wider`}>
        {status}
      </span>
    );
  };

  const formatTimeAgo = (date) => {
    if (!date) return 'Just now';
    const now = new Date();
    const diff = now - new Date(date);
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const handleRedeploy = async (deployment, e) => {
    e.stopPropagation();
    if (!projectId) return;
    
    try {
      setRedeployingId(deployment.id);
      const response = await projectAPI.redeployProject(projectId);
      if (response.success && onRedeploy) {
        await onRedeploy();
      }
    } catch (error) {
      console.error('Failed to redeploy:', error);
    } finally {
      setRedeployingId(null);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const toggleExpanded = (deploymentId) => {
    setExpanded(prev => ({
      ...prev,
      [deploymentId]: !prev[deploymentId]
    }));
  };

  // Auto-expand building deployments
  useEffect(() => {
    if (!deployments) return;
    
    const buildingDeployments = deployments.filter(deployment => {
      const status = deploymentStatuses[deployment.id]?.status || deployment.status;
      return status === 'DEPLOYING' || status === 'QUEUED';
    });

    if (buildingDeployments.length > 0) {
      setExpanded(prev => {
        const newExpanded = { ...prev };
        buildingDeployments.forEach(deployment => {
          newExpanded[deployment.id] = true;
        });
        return newExpanded;
      });
    }
  }, [deployments, deploymentStatuses]);

  if (!deployments || deployments.length === 0) {
    return (
      <div className="mb-8 bg-background border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold text-foreground mb-2">Deployment History</h2>
        <div className="text-center py-8 text-muted-foreground">
          No deployments yet
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      {/* Header */}
      <div className="flex items-end justify-between mb-6 px-2">
        <h2 className="text-lg font-semibold text-foreground">Deployment History</h2>
      </div>

      {/* Timeline List */}
      <div className="relative">
        <div className="space-y-0">
          {deployments.map((deployment, index) => {
            const currentStatus = deploymentStatuses[deployment.id]?.status || deployment.status;
            const isExpanded = expanded[deployment.id];
            const isBuilding = currentStatus === 'DEPLOYING' || currentStatus === 'QUEUED';
            const isRunning = isBuilding; // Currently running deployment
            const isLast = index === deployments.length - 1;
            const isSelected = selectedDeployment?.id === deployment.id;

            return (
              <div key={deployment.id} className="flex group">
                {/* Left Timeline Column */}
                <div className="flex flex-col items-center mr-4 pt-1">
                  <div className="relative z-10">
                    {getStatusIcon(currentStatus, isRunning)}
                  </div>
                  {!isLast && (
                    <div className={`w-[2px] flex-1 bg-border group-hover:bg-border/80 transition-colors duration-300 -my-2 rounded-full ${isRunning ? 'bg-blue-500/30' : ''}`}></div>
                  )}
                </div>

                {/* Right Content Column */}
                <div className="flex-1 pb-8">
                  <div 
                    className={`
                      relative overflow-hidden
                      bg-transparent border-b border-border hover:bg-muted/40
                      rounded-lg transition-all duration-200 cursor-pointer
                      ${isExpanded ? 'bg-muted/60 border-border' : ''}
                      ${isRunning ? 'border-l-4 border-l-blue-500 bg-blue-500/5 animate-pulse' : ''}
                    `}
                    onClick={() => {
                      toggleExpanded(deployment.id);
                      onSelectDeployment(deployment);
                    }}
                  >
                    {/* Main Summary Row */}
                    <div className="p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        {/* Main Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-sm font-medium text-foreground truncate pr-4">
                              Deployment #{deployments.length - index}
                            </h3>
                            <div className="hidden sm:block">
                              {getStatusChip(currentStatus)}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1 font-mono bg-muted px-1.5 py-0.5 rounded text-foreground/70">
                              <GitCommit size={10} />
                              {deployment.id.slice(0, 7)}
                            </span>
                            {isRunning && (
                              <span className="flex items-center gap-1 text-blue-500 font-semibold animate-pulse">
                                <Loader2 size={10} className="animate-spin" />
                                {currentStatus === 'QUEUED' ? 'Queued' : 'Building...'}
                                <span className="ml-1 text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-full">RUNNING</span>
                              </span>
                            )}
                            {isSelected && (
                              <span className="flex items-center gap-1 text-primary">
                                Selected
                              </span>
                            )}
                          </div>
                          
                          {/* Mobile Status Chip */}
                          <div className="sm:hidden mt-2">
                            {getStatusChip(currentStatus)}
                          </div>
                        </div>

                        {/* Action / Arrow */}
                        <div className="flex items-center gap-4 text-muted-foreground">
                          <div className="text-muted-foreground group-hover:text-foreground transition-colors">
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details Section */}
                    <div 
                      className={`
                        grid transition-[grid-template-rows] duration-300 ease-in-out
                        ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}
                      `}
                    >
                      <div className="overflow-hidden">
                        <div className="px-4 pb-4 pt-2 flex flex-col gap-4">
                          {/* Deployment Meta Details */}
                          <div className="grid gap-2 text-sm text-muted-foreground pl-1">
                            <div className="flex items-center gap-2 group/id">
                              <span className="w-28 shrink-0 text-muted-foreground">Deployment ID</span>
                              <span className="font-mono text-foreground select-all truncate">{deployment.id}</span>
                              <button 
                                className="text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover/id:opacity-100" 
                                onClick={(e) => { e.stopPropagation(); copyToClipboard(deployment.id); }}
                                title="Copy ID"
                              >
                                <Copy size={12} />
                              </button>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-28 shrink-0 text-muted-foreground">Status</span>
                              {getStatusChip(currentStatus)}
                            </div>
                          </div>

                          {/* Footer Actions */}
                          <div className="flex justify-end items-center gap-2 pt-1">
                            {(currentStatus === 'DEPLOYED' || currentStatus === 'READY' || currentStatus === 'FAILED') && (
                              <button 
                                className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRedeploy(deployment, e);
                                }}
                                disabled={redeployingId === deployment.id}
                              >
                                {redeployingId === deployment.id ? (
                                  <>
                                    <Loader2 size={12} className="animate-spin" />
                                    Redeploying...
                                  </>
                                ) : (
                                  <>
                                    <RotateCw size={12} />
                                    Redeploy
                                  </>
                                )}
                              </button>
                            )}
                            <button 
                              className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteDeployment(deployment, e);
                              }}
                            >
                              <Trash2 size={12} />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DeploymentHistory;
